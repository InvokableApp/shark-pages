/* _shared/calculator/v1/calc.js — the CALCULATOR mechanism, shared by every system.
 *
 * A calculator is a quiz whose payoff is a NUMBER (references/campaign-archetypes/calculator.md).
 * That SOP's rule is "one shell, presets swap inputs/copy/colors only. A preset is NOT a new
 * campaign build." So this file is the shell and knows nothing about any system: every question,
 * constant, band and string arrives as JSON from the block.
 *
 * A block supplies:
 *   <script type="application/json" class="sk-calc-config">{ ... }</script>
 * and an empty <div class="sk-calc-mount"></div>.
 *
 * WHY THIS IS NOT A SERVER. The whole computation is arithmetic over the visitor's own inputs.
 * Hosting it as a static block means it travels inside the snapshot and one git push updates
 * every buyer account, with no uptime to babysit. A server would make every buyer's funnel
 * depend on it being awake, and could not travel in a snapshot at all. Move to a service only
 * if a calculator ever needs to READ something we cannot ship (live pricing, an account lookup).
 *
 * ⚠️ FORMULAS ARE NAMED, NEVER EVALUATED FROM A STRING. `eval`/`new Function` over config would
 * make every block a code-injection surface and would let a preset ship arithmetic nobody
 * reviewed. To add a formula, add a named function to FORMULAS below and reference it by name.
 *
 * Scope class: .sk-calc (mandatory single root, HOSTED-BLOCKS-SOP §1).
 */
(function () {
  "use strict";

  /* ---------------- named formulas ---------------- */
  const FORMULAS = {
    /**
     * Holliday-Segar maintenance fluid, the standard paediatric estimate:
     * 100 mL/kg for the first 10 kg, 50 mL/kg for the next 10, 20 mL/kg thereafter.
     * Plus a declared allowance per hour of activity and a declared heat multiplier.
     *
     * ⚠️ CLINICAL CONSTANTS LIVE IN THE CONFIG, NOT HERE, so they can be reviewed and changed
     * without touching code. This is a general estimate of FLUID, not an assessment of any
     * child. The block is responsible for saying so on the page.
     */
    "paediatric-fluid": function (v, c) {
      const kg = v.weightKg;
      let base = 0;
      if (kg <= 10) base = kg * 100;
      else if (kg <= 20) base = 1000 + (kg - 10) * 50;
      else base = 1500 + (kg - 20) * 20;

      // ⚠️ Holliday-Segar estimates TOTAL daily fluid, and a meaningful share of that arrives in
      // food and milk rather than in a cup. Comparing the total against a "cups of water"
      // answer inflates every gap. `foodFraction` removes the part that is not drunk, so the
      // comparison is drinks against drinks. Without it this returned 17 cups for a 12 year old.
      const fromDrinks = base * (1 - (c.foodFraction || 0));

      // Heat scales the ACTIVITY term only. Applied to the whole total it compounds with the
      // activity allowance and runs away at the top of the range.
      const heat = (c.heatMultiplier && c.heatMultiplier[v.heat]) || 1;
      return fromDrinks + (v.activityHours || 0) * (c.activityMlPerHour || 0) * heat;
    },
    /**
     * First-order exponential decay of one or more timed caffeine doses, summed at bedtime.
     *
     *   remaining = SUM over doses of  n * mgPerDrink * 0.5 ^ (hoursBeforeBed / halfLife)
     *
     * That is the standard first-order elimination model. Caffeine follows it closely enough at
     * ordinary intakes for an estimate, which is all this is.
     *
     * ⚠️ EVERY NUMBER A REVIEWER WOULD ARGUE WITH IS IN THE CONFIG, NOT HERE: the half-life, the
     * milligrams per drink, and the clock hour each window is placed at. The only thing this
     * function decides is the shape of the curve.
     *
     * ⚠️ THE HALF-LIFE IS A POPULATION AVERAGE AND THE SPREAD BETWEEN PEOPLE IS LARGE. Drake 2013
     * (J Clin Sleep Med) puts it plainly: "due to the high variability in the elimination
     * half-life of caffeine administered to healthy adults, specific recommendations on what time
     * of day to discontinue caffeine use vary widely from 4 to 11 hours prior to bedtime." The
     * block is responsible for saying on the page that this is an estimate and not a measurement.
     *
     * A dose taken AFTER the stated bedtime is not decayed at all rather than being amplified:
     * a negative elapsed time would make 0.5^negative a multiplier greater than one, which would
     * silently invent caffeine the visitor never drank.
     */
    "caffeine-decay": function (v, c) {
      const mg = (c.mgPerDrink && c.mgPerDrink[v.drink]) || 0;
      const half = c.halfLifeHours || 5;
      const bed = Number(v.bedtimeHour);
      const at = function (hour, n) {
        const count = Number(n) || 0;
        if (!count || hour == null) return 0;
        const elapsed = bed - Number(hour);
        if (elapsed <= 0) return count * mg;          // drunk at or after bedtime: no decay yet
        return count * mg * Math.pow(0.5, elapsed / half);
      };
      const w = c.windowHour || {};
      // The last dose of the day dominates what is left at bedtime, so it is placed at the time
      // the visitor actually gave rather than at a window midpoint. The earlier two use midpoints
      // because being an hour out on a dose that has already run three half-lives changes little.
      const lateHour = v.lastDrinkHour != null ? v.lastDrinkHour : w.afternoon;
      return Math.round(at(w.morning, v.nMorning) + at(w.midday, v.nMidday) + at(lateHour, v.nAfternoon));
    },
    /** Straight weighted sum, for score-style calculators. */
    "weighted-sum": function (v, c) {
      return Object.keys(c.weights || {}).reduce(function (t, k) {
        return t + (Number(v[k]) || 0) * c.weights[k];
      }, 0);
    },
  };

  const esc = (s) => String(s == null ? "" : s).replace(/[&<>"']/g, (m) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[m]));

  function init(root) {
    const cfgEl = root.querySelector(".sk-calc-config");
    const mount = root.querySelector(".sk-calc-mount");
    if (!cfgEl || !mount) return;
    let cfg;
    try { cfg = JSON.parse(cfgEl.textContent); }
    catch (e) { mount.innerHTML = '<p class="sk-calc-err">This calculator could not load.</p>'; return; }

    const steps = cfg.steps || [];
    const answers = {};
    let i = 0;

    /* ---------- render one step ---------- */
    function draw() {
      if (i >= steps.length) return compute();
      const s = steps[i];
      const pct = Math.round((i / steps.length) * 100);
      mount.innerHTML =
        '<div class="sk-calc-prog" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow="' + pct +
          '" aria-label="Progress"><span style="width:' + pct + '%"></span></div>' +
        '<fieldset class="sk-calc-step">' +
          '<legend class="sk-calc-q">' + esc(s.question) + "</legend>" +
          (s.help ? '<p class="sk-calc-help">' + esc(s.help) + "</p>" : "") +
          (s.type === "number"
            ? '<div class="sk-calc-num"><input class="sk-calc-input" type="number" inputmode="decimal" ' +
                'min="' + (s.min ?? 0) + '" max="' + (s.max ?? 999) + '" step="' + (s.step || 1) + '" ' +
                'aria-label="' + esc(s.question) + '"' + (s.placeholder ? ' placeholder="' + esc(s.placeholder) + '"' : "") + ">" +
                (s.unit ? '<span class="sk-calc-unit">' + esc(s.unit) + "</span>" : "") +
              "</div>" +
              '<button type="button" class="sk-calc-next">' + esc(s.nextLabel || cfg.nextLabel || "Continue") + "</button>" +
              (s.skipLabel ? '<button type="button" class="sk-calc-skip">' + esc(s.skipLabel) + "</button>" : "")
            : '<div class="sk-calc-opts">' + (s.options || []).map((o, n) =>
                '<button type="button" class="sk-calc-opt" data-n="' + n + '">' +
                  '<span class="sk-calc-opt-l">' + esc(o.label) + "</span>" +
                  (o.note ? '<span class="sk-calc-opt-n">' + esc(o.note) + "</span>" : "") +
                "</button>").join("") + "</div>") +
        "</fieldset>" +
        (i > 0 ? '<button type="button" class="sk-calc-back">' + esc(cfg.backLabel || "Back") + "</button>" : "");

      const step = mount.querySelector(".sk-calc-step");
      step.querySelectorAll(".sk-calc-opt").forEach((b) =>
        b.addEventListener("click", () => { take(s, (s.options[+b.dataset.n] || {}).value); }));
      const input = step.querySelector(".sk-calc-input");
      if (input) {
        const go = () => {
          const raw = input.value.trim();
          if (raw === "" || isNaN(Number(raw))) { input.classList.add("sk-calc-input--bad"); input.focus(); return; }
          take(s, Number(raw));
        };
        step.querySelector(".sk-calc-next").addEventListener("click", go);
        input.addEventListener("keydown", (e) => { if (e.key === "Enter") { e.preventDefault(); go(); } });
        input.addEventListener("input", () => input.classList.remove("sk-calc-input--bad"));
        const skip = step.querySelector(".sk-calc-skip");
        if (skip) skip.addEventListener("click", () => take(s, null));
        setTimeout(() => input.focus(), 60);
      }
      const back = mount.querySelector(".sk-calc-back");
      if (back) back.addEventListener("click", () => { i = Math.max(0, i - 1); draw(); });
      // move focus to the question so a screen reader announces the new step
      const lg = mount.querySelector(".sk-calc-q");
      if (lg) { lg.setAttribute("tabindex", "-1"); if (i > 0) lg.focus(); }
    }

    function take(s, value) { answers[s.key] = value; i++; draw(); }

    /* ---------- derive, compute, render ---------- */
    function compute() {
      const d = Object.assign({}, answers);
      // declared derivations: fill a missing value from a lookup on another answer
      (cfg.derive || []).forEach((r) => {
        if (d[r.key] == null || d[r.key] === "") {
          const from = d[r.from];
          d[r.key] = (r.table && Object.prototype.hasOwnProperty.call(r.table, from)) ? r.table[from] : r.fallback;
        }
      });

      const fn = FORMULAS[cfg.formula];
      if (!fn) { mount.innerHTML = '<p class="sk-calc-err">This calculator is misconfigured.</p>'; return; }
      const need = fn(d, cfg.constants || {});
      const intake = (cfg.intake && d[cfg.intake.key] != null) ? d[cfg.intake.key] * (cfg.intake.unitMl || 1) : null;

      const unit = cfg.output && cfg.output.unitMl ? cfg.output.unitMl : 1;
      const round = (ml) => Math.round((ml / unit) * 2) / 2;   // nearest half unit
      const needOut = round(need);
      const gotOut = intake == null ? null : round(intake);
      const gapOut = gotOut == null ? null : Math.round((needOut - gotOut) * 2) / 2;

      // pick the band by the GAP where there is one, else by the need
      const bands = cfg.bands || [];
      const metric = gapOut == null ? needOut : gapOut;
      const band = bands.find((b) => metric >= (b.min ?? -Infinity) && metric < (b.max ?? Infinity)) || bands[bands.length - 1] || {};

      const fill = (t) => String(t || "")
        .replace(/\{need\}/g, needOut)
        .replace(/\{got\}/g, gotOut == null ? "" : gotOut)
        .replace(/\{gap\}/g, gapOut == null ? "" : Math.abs(gapOut))
        .replace(/\{unit\}/g, cfg.output && cfg.output.unitLabel ? cfg.output.unitLabel : "")
        .replace(/\{unitOne\}/g, cfg.output && cfg.output.unitLabelOne ? cfg.output.unitLabelOne : "")
        // {unit} is the headline label ("cups on a day like that") and reads wrong mid-sentence.
        // {unit_short} is the bare noun ("cups") for use inside a line of copy.
        .replace(/\{unit_short\}/g, cfg.output && cfg.output.unitShort ? cfg.output.unitShort : "");

      mount.innerHTML = '<div class="sk-calc-calcing" aria-hidden="true"><span></span><span></span><span></span></div>';
      setTimeout(function () {
        mount.innerHTML =
          '<div class="sk-calc-res" role="status" aria-live="polite">' +
            (cfg.output && cfg.output.eyebrow ? '<p class="sk-calc-eyebrow">' + esc(cfg.output.eyebrow) + "</p>" : "") +
            '<p class="sk-calc-big"><strong>' + esc(needOut) + "</strong> " +
              esc(cfg.output && cfg.output.unitLabel ? cfg.output.unitLabel : "") + "</p>" +
            (cfg.output && cfg.output.needLine ? '<p class="sk-calc-sub">' + esc(fill(cfg.output.needLine)) + "</p>" : "") +
            (gotOut != null && cfg.output && cfg.output.gotLine ? '<p class="sk-calc-sub">' + esc(fill(cfg.output.gotLine)) + "</p>" : "") +
            (band.headline ? '<h3 class="sk-calc-band">' + esc(fill(band.headline)) + "</h3>" : "") +
            (band.body ? '<p class="sk-calc-body">' + esc(fill(band.body)) + "</p>" : "") +
            (cfg.cta ? '<button type="button" class="sk-calc-cta">' + esc(cfg.cta.label) + "</button>" : "") +
            (cfg.cta && cfg.cta.note ? '<p class="sk-calc-ctanote">' + esc(cfg.cta.note) + "</p>" : "") +
            '<button type="button" class="sk-calc-restart">' + esc(cfg.restartLabel || "Start over") + "</button>" +
            (cfg.disclaimer ? '<p class="sk-calc-disc">' + esc(cfg.disclaimer) + "</p>" : "") +
          "</div>";

        const cta = mount.querySelector(".sk-calc-cta");
        if (cta) cta.addEventListener("click", function () {
          // GHL ships window events for custom widgets, so a hosted block can open the page's
          // OWN popup without knowing its id. Popup ids are minted per page and must never be
          // hardcoded. (NOTES §Custom-code block -> open the page POPUP.)
          if (cfg.cta.action === "popup" && typeof window.customWidgetOpenPopup === "function") return window.customWidgetOpenPopup();
          if (cfg.cta.action === "nextStep" && typeof window.customWidgetGoToNextStep === "function") return window.customWidgetGoToNextStep();
          if (cfg.cta.href) window.location.href = cfg.cta.href;
        });
        mount.querySelector(".sk-calc-restart").addEventListener("click", function () {
          Object.keys(answers).forEach((k) => delete answers[k]); i = 0; draw();
        });
      }, cfg.calculatingMs == null ? 900 : cfg.calculatingMs);
    }

    draw();
  }

  function boot() { document.querySelectorAll(".sk-calc").forEach(init); }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
})();

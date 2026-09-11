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
     * Teen athlete fluid need on a training day, in US FLUID OUNCES.
     *
     * Same Holliday-Segar baseline as `paediatric-fluid` above, because it is defined by weight
     * and does not stop applying at thirteen: 1500 mL for the first 20 kg plus 20 mL for every kg
     * after. What changes for an adolescent is the ACTIVITY term. Children sweat considerably
     * less than adults; a teenager training hard is much closer to the adult range, which is why
     * `activityMlPerHour` is a config value and the teen preset sets it far above the kids one.
     *
     * ⚠️ IT ANSWERS IN OUNCES AND BOTTLES, NOT MILLILITRES. The audience is a US parent holding a
     * water bottle, and "about seven bottles" is a thing they can picture and act on where
     * "3200 mL" is not. Millilitres stay inside the maths.
     *
     * ⚠️ IT ESTIMATES FLUID. IT DOES NOT ASSESS A CHILD. There is no deficiency here, no symptom,
     * and no recommendation to take anything: it compares what a body that size doing that much
     * on a day like that would use, against what the parent said they drink. The page is
     * responsible for keeping it in those terms. → NUEVASHARK/_assets/product/SOURCE.md
     */
    "teen-fluid-oz": function (v, c) {
      const ML_PER_OZ = 29.5735;
      const kg = (v.weightLb || 0) / 2.20462;
      let base = 0;
      if (kg <= 10) base = kg * 100;
      else if (kg <= 20) base = 1000 + (kg - 10) * 50;
      else base = 1500 + (kg - 20) * 20;

      // the share that arrives in food rather than in a bottle, removed so the comparison is
      // drinks against drinks (same reasoning as paediatric-fluid above)
      const fromDrinks = base * (1 - (c.foodFraction || 0));
      const heat = (c.heatMultiplier && c.heatMultiplier[v.heat]) || 1;
      const sweatMl = (v.activityHours || 0) * (c.activityMlPerHour || 0) * heat;

      const needOz = (fromDrinks + sweatMl) / ML_PER_OZ;
      const bottleOz = c.bottleOz || 16;
      const intakeOz = (v.bottles || 0) * bottleOz;
      const gapOz = needOz - intakeOz;
      const pct = needOz > 0 ? intakeOz / needOz : 1;

      // Bands describe the GAP, never the child. "Short by about three bottles" is arithmetic.
      let band = "onTrack";
      if (pct < 0.6) band = "wellShort";
      else if (pct < 0.85) band = "short";
      else if (pct < 1) band = "close";

      return {
        value: Math.round(needOz),
        extra: {
          needOz: Math.round(needOz),
          needBottles: Math.round((needOz / bottleOz) * 10) / 10,
          intakeOz: Math.round(intakeOz),
          intakeBottles: v.bottles || 0,
          gapOz: Math.round(Math.max(gapOz, 0)),
          gapBottles: Math.round((Math.max(gapOz, 0) / bottleOz) * 10) / 10,
          sweatOz: Math.round(sweatMl / ML_PER_OZ),
          baselineOz: Math.round(fromDrinks / ML_PER_OZ),
          pct: Math.round(pct * 100),
          band: band,
          bottleOz: bottleOz,
        },
      };
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
    /**
     * Caffeine still circulating at bedtime, plus the two things she can act on.
     *
     * ⚠️ SERVING SIZE IS A MULTIPLIER, AND LEAVING IT OUT WAS THE BIGGEST ERROR IN THIS MODEL.
     * The FDA figures are per 12 fl oz. A 20oz travel mug is 1.7x that and a small cup is half, so
     * without asking, two large coffees read the same as two small ones and the answer can be out
     * by a factor of two before any of the half-life modelling matters. Jeff, 2026-09-10: "how
     * could you know also without measuring the size of the drink". He is right, and it dominated
     * every other source of error here.
     *
     * ⚠️ BODY WEIGHT IS DELIBERATELY NOT ASKED, and that is not the same as forgetting it. Weight
     * barely changes how many MILLIGRAMS are left; it changes the CONCENTRATION and therefore the
     * effect. The between-person spread that actually matters is CYP1A2 clearance, which ranges
     * roughly 1.5 to 9.5 hours of half-life and is genetic, not a function of mass. Asking weight
     * would add a question, add friction, and buy false precision. What honesty requires instead
     * is saying the spread out loud, which the disclaimer does.
     *
     * Returns {value, extra} rather than a number:
     *   cutoffHour   the latest she could have had the last dose and still be under `clearMg`
     *   clearsHour   when she finally drops under `clearMg` (may be after bedtime, which is the point)
     *   series       hourly mg from first drink to two hours past bedtime, for the curve
     *   shifted      the same series with the last dose moved to cutoffHour, for the second curve
     */
    "caffeine-decay": function (v, c) {
      const half = c.halfLifeHours || 5;
      const bed = Number(v.bedtimeHour);
      const clearMg = c.clearMg == null ? 30 : c.clearMg;
      // Serving size scales the per-drink figure. Absent (an older config) it is 1, so nothing
      // that shipped before this change moves.
      const sizeMul = (c.sizeMultiplier && c.sizeMultiplier[v.size]) || 1;
      const mg = ((c.mgPerDrink && c.mgPerDrink[v.drink]) || 0) * sizeMul;
      const w = c.windowHour || {};
      // The last dose dominates what is left at bedtime, so it sits at the hour she actually gave.
      // The earlier two use window midpoints: being an hour out on a dose that has already run
      // three half-lives changes almost nothing.
      const lateHour = v.lastDrinkHour != null ? Number(v.lastDrinkHour) : w.afternoon;
      const doses = [
        { hour: Number(w.morning), n: Number(v.nMorning) || 0 },
        { hour: Number(w.midday),  n: Number(v.nMidday)  || 0 },
        { hour: lateHour,          n: Number(v.nAfternoon) || 0 },
      ].filter(function (d) { return d.n > 0 && !isNaN(d.hour); });

      const level = function (t, list) {
        return list.reduce(function (sum, d) {
          if (t < d.hour) return sum;                       // not drunk yet
          return sum + d.n * mg * Math.pow(0.5, (t - d.hour) / half);
        }, 0);
      };
      const value = Math.round(level(bed, doses));

      /* ⚠️ THE CUTOFF IS ABOUT ONE DRINK, ON PURPOSE, and the first version of it was useless.
         It originally solved for "the latest the last dose could sit so that the TOTAL at bedtime
         is under clearMg", and on any realistic day that has no answer: two morning coffees alone
         leave more than 30 mg at an 11pm bedtime, so no amount of moving the afternoon one helps
         and it returned null exactly when someone most needed it.

         So it answers the question people actually ask: for YOUR drink at YOUR size, how late can
         you have one and still be clear by bed. That is always defined, it is a single memorable
         time, and it is usually earlier than anyone guesses, which is the whole point.

         The total is not forgotten: `earlierAlone` carries what her morning and midday leave
         behind on their own, so the page can be honest when timing is not the only lever, instead
         of implying that moving one drink fixes everything. */
      const lastN = Math.max(doses.length ? doses[doses.length - 1].n : 0, 1);
      let cutoffHour = null;
      for (let t = bed; t >= bed - 24; t -= 0.25) {
        if (lastN * mg * Math.pow(0.5, (bed - t) / half) < clearMg) { cutoffHour = t; break; }
      }
      const earlierAlone = Math.round(level(bed, doses.slice(0, -1)));
      // When she is finally under clearMg, which is often after she is asleep.
      let clearsHour = null;
      for (let t = (doses.length ? doses[doses.length - 1].hour : bed); t <= bed + 24; t += 0.25) {
        if (level(t, doses) < clearMg) { clearsHour = t; break; }
      }

      const first = doses.length ? Math.floor(doses[0].hour) : Math.floor(bed) - 12;
      const series = [];
      const shifted = [];
      const moved = doses.length && cutoffHour != null
        ? doses.slice(0, -1).concat([{ hour: cutoffHour, n: doses[doses.length - 1].n }])
        : doses;
      for (let t = first; t <= bed + 2; t += 0.5) {
        series.push(Math.round(level(t, doses)));
        shifted.push(Math.round(level(t, moved)));
      }
      return { value, extra: {
        cutoffHour: cutoffHour, clearsHour: clearsHour, bedHour: bed, earlierAlone: earlierAlone,
        lastDoseCount: lastN, perDrinkMg: Math.round(mg),
        startHour: first, stepHours: 0.5, clearMg: clearMg,
        series: series.join(","), shifted: shifted.join(","),
      } };
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

    /* ---------- carry an earlier answer into a later question ----------
       ⚠️ ADDED 2026-09-10, ADDITIVE. A question with no {a:...} token is untouched, so the one
       other calculator on v1 is unaffected.

       WHY. A calculator asks "what do you drink" and then "how many before 10am?", and by the
       second question the noun is gone. Read cold, "how many do you have?" does not say how many
       OF WHAT, and a reader supplies their own noun: on review, Jeff read one of these as asking
       about alcohol. Repeating "caffeinated drinks" in all three would fix the ambiguity and read
       like a form. Carrying the answer reads like a conversation and is exactly as precise.

       `{a:drink}` resolves to the chosen option's `countLabel` if it has one, otherwise its label.
       countLabel exists because the label is singular and titled for a button ("Brewed coffee")
       and the question needs a plural, lowercase noun ("coffees"). Getting that wrong ships
       "How many Brewed coffee do you have before 10am?", which is worse than the vague version. */
    function answerLabel(key) {
      const st = steps.filter((x) => x.key === key)[0];
      if (!st) return "";
      const v = answers[key];
      if (st.options) {
        const o = st.options.filter((x) => String(x.value) === String(v))[0];
        return o ? (o.countLabel || o.label) : "";
      }
      return v == null ? "" : String(v);
    }
    const fillQ = (t) => String(t || "").replace(/\{a:([a-zA-Z0-9_]+)\}/g, (m, k) => answerLabel(k) || "drinks");

    /* ---------- render one step ---------- */
    function draw() {
      if (i >= steps.length) return compute();
      const s0 = steps[i];
      const s = Object.assign({}, s0, {
        question: fillQ(s0.question),
        help: fillQ(s0.help),
      });
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
      /* ⚠️ A FORMULA MAY RETURN A NUMBER OR {value, extra} — additive 2026-09-10.
         A bare number is all a "how much do you need" calculator needs. A DIAGNOSTIC one has more
         to say than its headline figure: the caffeine curve knows the hour her last drink stops
         mattering and the hour she would have had to stop, and both are more useful to her than
         the milligrams. `extra` is where a formula returns that, and `payload` reaches it with
         `$extra.key`. A formula that returns a number behaves exactly as before. */
      const rawOut = fn(d, cfg.constants || {});
      const need = (rawOut && typeof rawOut === "object" && "value" in rawOut) ? rawOut.value : rawOut;
      const extra = (rawOut && typeof rawOut === "object" && rawOut.extra) ? rawOut.extra : {};
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

      /* ── the handoff payload ────────────────────────────────────────────────────────────
         ⚠️ ADDED 2026-09-10, ADDITIVE. A config with no `gate` behaves exactly as before; the
         only calculator live on v1 besides this one (nueva/n-kids-hydration-check) has none and
         is unaffected. Verified by querying its rendered page for `.sk-calc-gate`: zero matches.

         WHY IT EXISTS. A calculator that computes a number and then asks for an email has to get
         that number onto the CONTACT, and the only wire GHL gives you is a query parameter on the
         URL the form loads with, matched to each field's `hiddenFieldQueryKey`. A form wired into
         the page POPUP loads with the page, long before anyone has answered a question, so its
         hidden fields are empty by the time she submits. Building the iframe HERE, after the
         answer exists, is the whole trick. (Measured on the Beneve Water Report, 2026-09-09.) */
      var payload = {};
      if (cfg.payload) Object.keys(cfg.payload).forEach(function (k) {
        var src = cfg.payload[k];
        var v = src === "$result" ? needOut
              : src === "$band"   ? (band.key || band.headline || "")
              : src.indexOf("$extra.") === 0 ? extra[src.slice(7)]
              : answers[src];
        // A select stores the option's value; the human-readable label is what a rep needs to read
        // on a contact card, so prefer the label when the step declared options.
        var st = (cfg.steps || []).filter(function (x) { return x.key === src; })[0];
        if (st && st.options) {
          var o = st.options.filter(function (x) { return String(x.value) === String(v); })[0];
          if (o) v = o.label;
        }
        if (v !== undefined && v !== null && v !== "") payload[k] = String(v);
      });
      // Same origin, so the result STEP can read this without depending on GHL forwarding params.
      // Belt and braces: the form redirect forward-appends the iframe's query string too, and
      // either path alone is enough. (NOTES §A form redirect navigates the TOP window.)
      try { sessionStorage.setItem("sk-calc:" + (cfg.key || "calc"), JSON.stringify(payload)); } catch (e) {}

      mount.innerHTML = '<div class="sk-calc-calcing" aria-hidden="true"><span></span><span></span><span></span></div>';
      setTimeout(function () {
        /* ── GATED: the number lives on the result step, behind the opt in ────────────────── */
        if (cfg.gate && cfg.gate.formHost && cfg.gate.formId) {
          var q = Object.keys(payload).map(function (k) { return k + "=" + encodeURIComponent(payload[k]); });
          var src = cfg.gate.formHost + "/" + cfg.gate.formId + (q.length ? "?" + q.join("&") : "");
          mount.innerHTML =
            '<div class="sk-calc-gate">' +
              (cfg.gate.eyebrow  ? '<p class="sk-calc-eyebrow">' + esc(cfg.gate.eyebrow) + "</p>" : "") +
              (cfg.gate.headline ? '<h3 class="sk-calc-gatehead">' + esc(fill(cfg.gate.headline)) + "</h3>" : "") +
              (cfg.gate.body     ? '<p class="sk-calc-body">' + esc(fill(cfg.gate.body)) + "</p>" : "") +
              '<iframe class="sk-calc-form" src="' + src + '" title="' + esc(cfg.gate.formTitle || "Get your result") + '" scrolling="no"></iframe>' +
              '<button type="button" class="sk-calc-restart">' + esc(cfg.restartLabel || "Start over") + "</button>" +
              (cfg.disclaimer ? '<p class="sk-calc-disc">' + esc(cfg.disclaimer) + "</p>" : "") +
            "</div>";
          mount.querySelector(".sk-calc-restart").addEventListener("click", function () {
            Object.keys(answers).forEach(function (k) { delete answers[k]; }); i = 0; draw();
          });
          return;
        }
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

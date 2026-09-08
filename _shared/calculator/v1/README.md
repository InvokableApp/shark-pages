# `calculator/v1` — the contract

A calculator is a quiz whose payoff is a NUMBER
([campaign-archetypes/calculator.md](../../../../references/campaign-archetypes/calculator.md)).
That SOP's rule is **one shell, presets swap inputs, copy and colours only. A preset is NOT a new
campaign build.** This is the shell. It knows nothing about any system.

Same rules as every shared component: **declare the full token set on your scope class**, and
nothing here fails loudly when you do not.

## Why this is a static block and not a service

The whole computation is arithmetic over the visitor's own inputs. As a hosted block it travels
inside the snapshot and one `git push` updates every buyer account. As a service it would be a
live dependency every buyer's funnel needs awake, and could not travel in a snapshot at all.
Reach for a service only if a calculator must READ something we cannot ship: live pricing, an
account lookup, a real-time quote.

## Markup the block supplies

```html
<div class="sk-calc sk-calc-{system}-{preset}">
  <script type="application/json" class="sk-calc-config">{ ... }</script>
  <div class="sk-calc-mount"></div>
</div>
```

## Config

| Key | Meaning |
|---|---|
| `steps[]` | `{key, question, help?, type:"choice"\|"number", options[{label,note?,value}] \| min/max/step/unit/placeholder/skipLabel}` |
| `derive[]` | `{key, from, table, fallback}` — fill a value the visitor skipped, from another answer |
| `formula` | the NAME of a formula in `calc.js` |
| `constants` | that formula's constants. **Put every reviewable number here, never in code.** |
| `intake` | `{key, unitMl}` — the answer to compare the result against, if any |
| `output` | `{eyebrow, unitMl, unitLabel, unitLabelOne, needLine, gotLine}`; `{need} {got} {gap} {unit}` interpolate |
| `bands[]` | `{min, max, headline, body}` chosen by the GAP when there is one, else by the result |
| `cta` | `{label, note?, action:"popup"\|"nextStep", href?}` |
| `disclaimer` | fine print, rendered under a rule |

## ⚠️ Formulas are NAMED, never evaluated from a string

`eval` / `new Function` over config would make every block a code-injection surface and let a
preset ship arithmetic nobody reviewed. To add one, add a named function to `FORMULAS` in
`calc.js`. Shipping: `paediatric-fluid`, `weighted-sum`.

## ⚠️ Clinical or financial constants belong in `constants`, not in code

So a subject-matter reviewer can change them without a developer, and so a diff shows exactly
what changed. `paediatric-fluid` implements Holliday-Segar (100/50/20 mL per kg) because that is
the standard maintenance-fluid estimate; the activity allowance and heat multipliers are the
block's, and are the numbers most likely to need review.

## The CTA opens the page's OWN popup

`action:"popup"` calls `window.customWidgetOpenPopup()`, the event GHL ships for custom widgets.
Popup ids are minted per page and must NEVER be hardcoded (NOTES §Custom-code block). Falls back
to `href` when the event is absent, so the block still works in preview and on a static host.

## Accessibility

Steps are a `fieldset`/`legend`; the legend takes focus on each advance so a screen reader
announces it; the result is `role="status" aria-live="polite"`; the progress bar carries real
`aria-valuenow`; every control has a visible focus ring; motion respects
`prefers-reduced-motion`. Keep all of that if you fork to v2.

## Health, money and any other regulated number

The shell renders whatever you configure. It cannot tell you whether you are allowed to say it.
**A calculator that outputs a health or income figure needs a human reviewer before it ships**,
and the block must carry a `disclaimer`. Say what the number IS (an estimate, from stated general
guidance) and what it is NOT (an assessment of this person).

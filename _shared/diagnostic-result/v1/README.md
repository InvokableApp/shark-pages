# `diagnostic-result/v1` — the contract

Same rules as [`../../diagnostic-capture/v1/README.md`](../../diagnostic-capture/v1/README.md):
declare the FULL token set on your scope class, and assert that every referenced asset exists.
Nothing here errors when it is wrong, it just paints something else.

## Tokens

Identical list to `diagnostic-capture/v1`. `--sk-ink-d` is used by any full-bleed dark section a
block adds, and `--sk-warm` by the alternate light bands.

## Useful classes this component already ships

- `.sk-dres-loader` — a pure-CSS "calculating" curtain, `z-index:999`. It runs on arrival, which
  is why the **survey does not need a processing slide** (removed from the Disruptor Diagnostic,
  2026-09-05: the loader is on the result page).
- `.sk-dres-shot` — a centred product shot, `max-height:190px`.
- `.sk-dres-btn--gold`, `.sk-dres-btn-ghost`, `.sk-dres-card--lead`, `.sk-dres-cards--2/3`.

## No CTA bar

This component ships none. HOSTED-BLOCKS-SOP §8b wants a fixed header bar on pages long enough
that the CTA scrolls away, so build it in the block (see `beneve/beneve-disruptor-quiz` results,
`.sk-prog-bar`) and give the header matching top padding: the bar is fixed and nothing else
reserves the space.

## Dark section, dark artwork

A transparent PNG only works over a ground it contrasts with. The guide mockup is a dark green
cover, and dropped onto the moss `--sk-ink-d` section it loaded, painted, and was invisible. It
needs a glow or a plinth behind it. No gate can see this. Only a screenshot can.

# `_shared/` — versioned page components

Every shared component lives at **`_shared/<name>/v<N>/`** and every block imports a
**pinned version**. There is no unversioned path, on purpose.

```
_shared/confirm/v1/confirm.css     ← a page imports THIS
_shared/confirm/confirm.css        ← does not exist, and must not
```

## Why versions exist

These files are fetched from GitHub Pages **at request time**. A block in GHL holds only a
~370-byte socket; the markup, CSS and behaviour load from here on every page view. That is the
feature (one `git push` updates every account) and it is also the whole risk: editing a shared
file reaches **every already-shipped page in every system and every buyer account** on its next
load.

Without versions, "fix the Conectiv confirmation page" and "change every Beneve and buyer
confirmation page" are the same action, and nothing tells you which one you did.

## The rules

1. **Never edit a published version in a way that changes existing behaviour.** `v1` is
   immutable in effect: pages are pinned to it and you cannot see who is looking.
2. **Additive-only changes to a published version are allowed** — a NEW class that no existing
   markup references. Verify it: query the new selectors against the sibling pages and confirm
   zero matches before pushing. If any existing rule's meaning changes, it is a new version.
3. **A redesign is a new version.** Copy `v1/` to `v2/`, edit there, and repoint pages one at a
   time. Old systems stay on `v1` until deliberately moved.
4. **The gate enforces it.** `push-block.mjs` hard-fails a block that imports an unversioned
   `_shared/` path. Pinning that is not enforced is not pinning.

## Components

| Component | Scope class | What it is |
|---|---|---|
| `capture/` | `.sk-cap` | lead-magnet capture page |
| `confirm/` | `.sk-conf` | confirmation page (post opt-in) |
| `diagnostic-capture/` | `.sk-dcap` | lander of a diagnostic funnel: full-bleed material photography, one CTA, no lead magnet to picture |
| `diagnostic-result/` | `.sk-dres` | result page of a diagnostic funnel: meters, a free plan, a what-to-skip list, then a ranked product stack |
| `howto/` | `.sk-howto` | "how to use this funnel" pages |
| `links-hub/` | `.sk-hub` | the rep marketing-links hub. **Beneve only so far**: Vital, GLP and Conectiv are still forked copies and move onto it one at a time, each verified against a live rep account. |
| `product/` | `.sk-prod` | product / sales page |
| `training/` | `.sk-train` | rep-facing training portal |
| `shark-reveal/` | n/a | scroll-reveal behaviour only, no styling |

A page's own `block.css` declares **only its palette tokens** and `@import`s the component. A
per-page override means the component needs a variant, not that the page is special.

⚠️ **A component forked out of one system arrives full of that system's colour.**
`links-hub/v1` shipped with 19 colour literals nobody noticed, because under the sage palette
they were forked from they looked correct: a green footer-gradient stop, warm off-whites, warm
shadow ink, and six `rgba()` tints for icon tiles and focus rings. Beneve's navy rebrand set
every hex token and still rendered olive tiles over a green footer.

Two rules came out of it:

1. **Hex tokens are not enough.** CSS cannot take an alpha off a hex token, so every
   translucent surface needs an RGB-triplet token beside it (`--sk-brand-rgb`, `--sk-ink-rgb`,
   …). Ship them together or the alpha surfaces keep the old hue.
2. **Verify a reskin by rendering it, not by grepping.** Walk every element under the scope
   class and read the computed `backgroundColor` / `backgroundImage` / `borderColor`. A
   literal inside a shorthand or a gradient stop survives a source grep intact.

When forking the next component out of a system, do this sweep first, on the copy, before any
second system adopts it.


## A note on the forked components

`links-hub/` exists because four systems were carrying four copies of the same
page. Measured 2026-08-28 before splitting it out: remove each system's config
block and normalise the names, and the engines differed by **6 to 8 lines out of
~530** — and every one of those was config nobody had extracted (scope class, app
title, theme colour). There was no behavioural difference to preserve.

That is the shape to watch for. If you are about to copy a block folder to start a
new system, the thing you are copying is almost certainly a component that has not
been extracted yet. Extracting it later costs one careful migration per already
installed system; extracting it now costs nothing.

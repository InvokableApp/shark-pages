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
| `brief/` | `.sk-brf` | private-briefing opt-in page: an opportunity/recruiting lander with a
video briefing instead of a downloadable magnet, so it carries editorial serif type and hairline
rules rather than product imagery. Form lives in the page popup. |
| `capture/` | `.sk-cap` | lead-magnet capture page |
| `confirm/` | `.sk-conf` | confirmation page (post opt-in) |
| `diagnostic-capture/` | `.sk-dcap` | lander of a diagnostic funnel: full-bleed material photography, one CTA, no lead magnet to picture |
| `diagnostic-result/` | `.sk-dres` | result page of a diagnostic funnel: meters, a free plan, a what-to-skip list, then a ranked product stack |
| `howto/` | `.sk-howto` | "how to use this funnel" pages |
| `links-hub/` | `.sk-hub` | the rep marketing-links hub. **Beneve and both Nueva hubs only** (measured 2026-09-23): Vital, GLP and Conectiv are still forked copies, v1 and v2 alike, and move onto it one at a time, each verified against a live rep account. See the consumer table below before assuming a change reaches a system. |
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


## Finding every consumer of a shared component

**Grep all three block files, not just `block.html`.** A page can import a shared component from
`block.css` (`@import`), from `block.js` (the loader array), or name its classes in `block.html`,
and pages differ in which they use. On 2026-09-09 a `diagnostic-capture/v1` change was cleared
with a `--include=block.html` grep that reported ONE consumer. There were three, and one of them
was in a different system:

```
grep -rl "<component-name>" --include="*.css" --include="*.js" --include="*.html" shark-pages/
```

### ⚠️ That grep finds COMMENTS too. A path match is not a consumer. (2026-09-23)

A forked block often carries a comment like *"transplanted from
`_shared/links-hub/v1/hub.css`"*, and the grep above matches it. Read as a consumer list,
that says the fork is on the component. It is not, and the difference decides whether a
change reaches it.

Establish a consumer by the **mechanism**, not the string:

```
grep -rn "@import.*<component>" --include="*.css" shark-pages/   # CSS consumers
grep -rn "<component>"          --include="*.js"  shark-pages/   # loader consumers
```

Measured for `links-hub/v1` on 2026-09-23 — nine files match the path, **three are
actually on it**:

| Block | On the component? |
|---|---|
| `beneve/beneve-marketing-links` | yes, `@import` |
| `nueva/n-marketing-links` | yes, `@import` |
| `nueva/nueva-marketing-links` | yes, `@import` |
| `glp/marketing-links-v2` | no, comment only |
| `glp/marketing-links` (v1) | no, comment only |
| `conectiv/c-user-links-page-v2` | no, comment only |
| `conectiv/c-user-links-page` (v1) | no, comment only |
| `vital/vital-user-links` | no, comment only |

**Consequence, and it is the whole reason this matters:** a styling change pushed to
`hub.css` reaches Beneve and the two Nueva hubs and **nobody else**. The four forks each
need the same edit by hand, so a round of client revisions on one hub is a round of
hand-porting to all of them. There is nothing to de-duplicate here — the forks hold no
shadowing copies of shared rules, they hold their own complete stylesheets. The only
route to "change it once" is the migration this README already prescribes.

**Proving it costs one minute, so prove it.** Reasoning about specificity gets this wrong.
Inject an absurd value into the shared file (`font-size: 99px`), render each candidate,
read the computed style, and revert. On 2026-09-23 that returned 14.8px on GLP while the
shared file said 99px, which settles it in a way that reading two stylesheets does not.

Then actually measure the siblings after the change, which is what the versioning rule already
says: *"additive-only edits to a published version are allowed but must be verified against
sibling pages."* For a sticky bar that is
`node web/scripts/shark-pages/check-bar.mjs <sibling>` plus `check-fold.mjs`.

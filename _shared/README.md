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
| `howto/` | `.sk-howto` | "how to use this funnel" pages |
| `product/` | `.sk-prod` | product / sales page |
| `training/` | `.sk-train` | rep-facing training portal |
| `shark-reveal/` | n/a | scroll-reveal behaviour only, no styling |

A page's own `block.css` declares **only its palette tokens** and `@import`s the component. A
per-page override means the component needs a variant, not that the page is special.

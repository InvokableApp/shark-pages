# shark-pages

Public, versioned HTML/CSS/JS blocks that get embedded into GoHighLevel funnel pages
via **Custom Code** elements.

This repo is **public on purpose** so GitHub Pages can serve shared assets. Nothing
sensitive belongs here: no `.env`, no API tokens, no GHL location IDs in committed
source, no SOPs, no client-internal copy. The factory itself lives in the private
`shark-replicator` repo.

---

## Two ways a block reaches GHL

**Pattern B (default) — git is the source of truth, HTML is compiled in.**
The push script reads `<slot>.html` + `<slot>.css`, inlines the CSS into a scoped
`<style>` tag, and writes the result into the Custom Code element's
`extra.customCode.value.rawCustomCode`. GHL renders custom code **inline**, so
`{{custom_values.x}}` merge fields resolve normally and the block is fully
self-contained — nothing to 404 on a buyer's sub-account after a snapshot install.
Edit the file, re-run the push script.

**Pattern A (opt-in) — git is the live host.**
The block in GHL is a thin stub carrying the merge fields as `data-*` attributes,
plus `<link>`/`<script>` tags pointing at this repo's GitHub Pages URL. Push to
`main` and every page using it updates without touching GHL. Use for heavy shared
CSS/JS and for images, which **must** be externally hosted when baked into a
custom-code string (a `assets.cdn.filesafe.space/{locationId}/...` URL is
location-scoped and 404s on the buyer's account).

Merge fields never survive an `<iframe>` — GHL substitutes them while rendering its
own page and never touches an external document. If a block needs custom values, its
markup has to be inline in GHL. That is why Pattern B is the default.

---

## Layout and naming

**The folder path IS the address.** It mirrors where the block lives in GoHighLevel,
so a live page reads back to a folder and a folder reads forward to a page.

```
{system}/{funnel}/{page}/block.html
                         block.css
                         block.js      (optional)
                         assets/
```

| Segment | Is | Rule |
|---|---|---|
| `{system}` | `conectiv`, `glp`, `vital`, ... | lowercase, no `shark` suffix |
| `{funnel}` | the funnel's real URL path in GHL | copy it, never invent one |
| `{page}` | the step's real URL path in GHL | same |

Every block folder holds the **same three filenames**, so nothing is ever guessed and
the path alone identifies the block:

```
conectiv/c-investment-options-guide/results/block.html
         ^ system  ^ funnel                 ^ page
```

That string is exactly what goes in the GHL socket:

```html
<div data-shark-block="conectiv/c-investment-options-guide/results" ...></div>
```

**More than one block on a page?** Add a folder below the page and name it for the
slot: `.../results/hero/block.html`. Same three filenames, one level deeper.

**Shared files:**

```
_loader/shark-embed.js   the universal loader every socket points at
_shared/                 cross-system CSS/JS
_brand/{system}/         brand tokens (tokens.css), logos, shared imagery
```

`.nojekyll` at the repo root is **required** — GitHub Pages runs Jekyll by default and
silently 404s every path beginning with an underscore, which would kill `_loader/`,
`_brand/` and `_shared/`.

### manifest.json

Each system has `{system}/manifest.json` mapping every block path to the GHL objects it
targets, so one script can sync any subset without hardcoded IDs.

```json
{
  "system": "conectiv",
  "blocks": [
    { "path": "c-investment-options-guide/results",
      "funnelId": "...", "pageId": "...", "elementId": "...",
      "elementTitle": "results", "pattern": "A" }
  ]
}
```

`locationId` is **not** stored here; it comes from the pusher's environment.

**The manifest is authoritative, not the folder name.** GHL derives a funnel's URL slug
from its NAME and ignores the `url` you pass on create, so a real slug can drift from
what you expected. Name matching is only the fallback.

**Buyer accounts re-mint every ID.** After a snapshot install the `funnelId` / `pageId` /
`elementId` above are valid only for the source account. Fleet updates must resolve by
NAME: funnel name, then step name, then the custom-code element's title.

## Rules for block markup

1. **Scope every selector.** Custom code renders inline and shares one page scope, so
   bare selectors and `@keyframes` names collide across embeds on the same page.
   Wrap in `.sk-{system}-{step}-{slot}` and prefix keyframes the same way.
2. **Link custom values hold a bare domain.** Always write
   `href="https://{{custom_values.x}}"`. A bare `href="{{custom_values.x}}"` is
   classified relative *before* substitution and gets rewritten against the page
   domain, producing a dead link.
3. **No em-dashes** in any user-facing copy. Client directive, applies everywhere.
4. **No GHL CDN image URLs** inside block markup. Use `_brand/` or `_shared/` here and
   reference the Pages URL.
5. **Every merge field must exist.** A `{{custom_values.x}}` with no custom value
   behind it is a real defect on a snapshot: the buyer has nothing to fill.

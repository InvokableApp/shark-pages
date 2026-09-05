# `diagnostic-capture/v1` — the contract

A block that imports this stylesheet is signing up to the things below. **None of them fail
loudly.** A missing token silently serves the component's default (another campaign's brand); a
missing image silently serves an empty box; the wrong wrapper silently collapses a section. Both
Beneve Disruptor redesigns were caused by breaking this contract without knowing it existed.

## 1. Tokens you MUST declare on your scope class

Declare all of them. There is no partial mode.

| Token | Role | If you omit it |
|---|---|---|
| `--sk-brand` | buttons, marks | falls back to the component's gold |
| `--sk-brand-d` | gradient end | same |
| `--sk-accent` | eyebrows, ornament | same |
| `--sk-tint` | pills, chips | same |
| `--sk-ink` | primary text | same |
| **`--sk-ink-d`** | **the HERO GROUND** | **hero renders near-black `#17140f` and the page reads as a tech page** |
| **`--sk-warm`** | **alternate light section** | **section 2 renders on the default warm** |
| `--sk-paper` | page ground | default paper |
| `--sk-card` | cards | `#fff` |
| `--sk-body` `--sk-faint` `--sk-line` | text + rules | defaults |
| `--sk-serif` `--sk-sans` | type | defaults |

## 2. Markup this component REQUIRES

**The hero is photographic.** `.sk-dcap-hero-bg` ships its own linear + radial scrims and expects
an `<img>` inside it. With no image it is a flat dark rectangle, and no amount of palette work
rescues it.

```html
<div class="sk-dcap-hero-bg" aria-hidden="true"><img src="…/hero.jpg" alt="" loading="eager"></div>
```

**A lane's numeral goes INSIDE its `<figure>`.** `.sk-dcap-lane-n` is absolutely positioned and the
`<figure>` is its positioned ancestor. As a sibling it anchors to the whole card and lands on the
last line of body copy.

```html
<article class="sk-dcap-lane">
  <figure><img …><span class="sk-dcap-lane-n">01</span></figure>
  <div class="sk-dcap-lane-body">…</div>
</article>
```

**`.sk-dcap-pain` is a THREE-COLUMN GRID whose children are cells.** It is not a prose section.
Using it for a headline-and-image pair collapses the layout. For two columns, write your own.

## 3. Known drift from the SOP, fix it in YOUR block

`.sk-dcap-bar` is `bottom:0` and hidden above 900px. HOSTED-BLOCKS-SOP §8b says the CTA bar is a
**header** (`top:0`) and is the standard on every opt-in lander at every width. Until this
component forks to v2, override it in the block's own CSS (see `beneve/beneve-disruptor-quiz`).

## 4. Assets

Every `src` must exist. Add the assertion to your generator:

```js
for (const m of html.matchAll(/src="([^"]+)"/g)) { /* resolve against the block dir, assert exists */ }
```

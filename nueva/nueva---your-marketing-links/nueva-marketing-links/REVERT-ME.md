# ⚠️ This page has a HARDCODED rep name. Revert it.

**Set 2026-08-28 for Joe's NUEVA sales demo. Not a design decision, not permanent.**

`block.html` carries a literal instead of a merge field:

```html
data-cv-beneve_rep_first_name="John"
```

It should be:

```html
data-cv-beneve_rep_first_name="{{custom_values.beneve_rep_first_name}}"
```

## Why

The page renders "WHAT WOULD YOU LIKE TO DO, {name}?" from that attribute. It resolved
to **Maria** (the value of `beneve_rep_first_name` in Shark Lead Gen, because this demo
lives in the Beneve funnel and deliberately reuses Beneve's live values). Joe asked for
**John** for a prospect call. One name, one attribute, no other field touched.

## Revert

Restore the merge field above, then:

```
node web/scripts/shark-pages/push-block.mjs \
  nueva/nueva---your-marketing-links/nueva-marketing-links \
  --loc ucXosnBgZ6FxqeEBuApn \
  --funnel "Beneve - Your Marketing Links" \
  --step "Nueva Marketing Links" \
  --slot-title "Custom Code" --live
```

The git push alone is NOT enough. The `data-cv-*` attributes live in the socket inside
GHL, because GHL substitutes merge fields only in its own HTML, so the block has to be
re-pushed to the account as well.

## Scope

**Only this page.** The Beneve hub at `/beneve-marketing-links` still merges the real
value and was not touched. Confirm with:

```
grep -c 'data-cv-beneve_rep_first_name="{{' \
  shark-pages/beneve/beneve---your-marketing-links/beneve-marketing-links/block.html   # expect 1
```

## When

Whenever Joe is done pitching, and **definitely before NUEVASHARK is built for real**
(planned the week of 2026-09-01). This whole folder is a throwaway demo skin over the
Beneve campaign shapes; the real NUEVA system should not inherit any of it.

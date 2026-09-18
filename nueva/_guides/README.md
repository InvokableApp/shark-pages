# Hosted guide PDFs

⚠️ **PUBLISH THE `-lite` BUILD, NEVER THE PLAIN ONE.** Both guides render twice: `what-to-take.pdf`
off full PNGs for print, and `what-to-take-lite.pdf` off the JPG pack. The full companion build is
**8.7 MB** and this is a document a rep sends to someone on a phone. The lite build is 1.8 MB and
is the one that goes here.
`node NUEVASHARK/campaigns/no-crash-plan/make-lite.mjs companion` then
`LITE=1 node .../companion/build/render-pdf.mjs`.

## Why they live here and not in a GHL media library

`POST /medias/upload-file` is **location-PIT-only**, and the Nueva snapshot account has no PIT,
so the agency JWT is rejected (422 `ALT_ID_REQUIRED`). The crash guide was therefore uploaded to
the **Shark Sales** media library, which works but means every buyer's funnel serves the PDF out
of our own account.

GitHub Pages has none of that: no auth, no per-account media library, it travels with a snapshot
for free because the URL is absolute, and it updates on `git push` like every other asset in this
system.

⚠️ **The two guides in this campaign are currently hosted in two different places** (the crash
guide in Shark Sales media, the companion here). That is a seam worth closing, and closing it
means moving the crash guide here and re-pointing `nueva_no_crash_plan_guide_pdf_url`. Flagged
for Jeff rather than done unilaterally, because the old URL dies the moment the file moves and
it is already referenced by live emails.

⚠️ **These are public URLs with no gate.** So is a `filesafe.space` CDN link. The DM gate on the
companion guide is a QUALIFIER, not a lock: it selects the people willing to ask, and Jeff,
2026-09-18, on reps sharing it anyway: *"rep can put it wherever they want ultimately. How would
we stop them?"* Nothing here is written on the assumption that the file is secret.

# hub-art / v1

The marketing-links hub's screenshots. **System-agnostic on purpose** — every one is a
generic HighLevel UI shot with no system branding, so one copy serves GLP, Beneve,
Conectiv and Nueva and the hub markup stays byte-identical across systems.

| file | shows |
|---|---|
| `leads-app.jpg` | the phone app, Apps tab then Contacts, both circled |
| `leads-computer.jpg` | the Contacts screen on desktop, tab highlighted |
| `ads-training-sidebar.jpg` | the left sidebar, ADS TRAINING and TEMPLATES highlighted |

⚠️ **THE CROP ON `ads-training-sidebar.jpg` IS LOAD-BEARING.** The supplied original was a
full-frame screenshot of a live buyer account and carried that buyer's name and town in the
sidebar chip. It is cropped to the menu band so there is nothing identifying left. "Let's show
a bit more context" is a one-line change that puts a real person's name on every rep's page.
→ CLAUDE.md §a screenshot of a live account gets cropped before it ships.

`leads-app.jpg` shows the agency's own "Shark Sales" account, which is deliberate: the agency
is not a client, so no buyer identity is exposed.

Versioned like every other shared component: pages pin `v1`. A reshoot that changes what the
images *say* forks `v2` rather than overwriting, because these are fetched at request time and
overwriting reaches every shipped page in every account on its next load.

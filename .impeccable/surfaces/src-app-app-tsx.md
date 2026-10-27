---
version: 1
slug: "src-app-app-tsx"
primary_target: "src/app/App.tsx"
related_targets: ["src/features/home/Home.tsx"]
---

# Landing page

Mode: Operate. Visitor priority: explore public information.
Approved comp: `.impeccable/proposals/landing/c-community-atlas.webp`.
Seed: `fac849ac`.

## Direction contract

### THESIS
Community Atlas makes the place visible, then opens an editorial public-information index. It replaces the search-and-quick-links split hero, not the portal's underlying navigation or evidence model.

### OWN-WORLD
Retain the existing blue-and-white Kapwa palette and sans-serif stack. Flat rectangular photography, navy oversized type, divided blue text links, and a full-width cobalt shortcut band define the page.

### STORY
Recognize Cavinti, search or take a direct shortcut, browse public information, understand the town’s history, find published service-office contacts, explore its geographic context, then inspect coverage or report a data issue. Missing records remain distinct from zero activity.

### FIRST VIEWPORT
Existing global navigation remains. The place-name masthead scales at 12cqw to fill the fluid hero width. A 49:20:31 photo strip has only 8px desktop / 4px mobile outer insets. Below: the existing records-and-source message and explicitly labelled search. No invented metrics or announcements.

### FORM
Seed `fac849ac`. The cobalt four-link shortcut band sits immediately below search, before the browsing index. History uses a centered heading, a wide left-hand vertical timeline and a narrow right-hand stack of sourced notes. Services use four icon-led office links without a visible introductory heading; they become two columns and then one on smaller screens. The map has a visible localized heading, cobalt land and pale-blue water, with accessible labels and attribution retained. Source transparency closes the page. Body gutters are 8vw capped at 128px, reduced to 20px on mobile. Native disclosures, service links and cooperative map navigation provide interaction without decorative animation.

### HONEST RISK
The mockup's scenery is generated and cannot ship. The user explicitly required real Cavinti photos: use sourced Caliraya Lake, Cavinti Falls, and Cavinti Bridge II images, with credits and licenses. This replaces the mockup's forest image. Preserve current header functions and bilingual content even where the mockup simplified them.

## User-directed changes after mockup approval

- “DO. NOT. AI GENERATE FOR THE IMPLEMMENTATION COPY. GET REAL IMAGES FOR CAVINTI.”
- “you're using the wrong width, so theres a fat horizontal padding present”
- “except for the hero, add more horizontal padding.”
- “and increase typography size to fit the full page width”
- “i need more horizontal padding”
- “add a tiny amount of horizontal padding on the image atlas (?)”

These instructions supersede the comp's image content, fixed content width, masthead scale and gutter geometry. Existing global navigation functions remain preserved rather than reduced to the mockup's simplified header.

## Approved landing extensions

- Add a sourced Cavinti history section, highlight actual public-service offices, and embed a MapLibre GL map using OpenFreeMap.
- History copies the supplied timeline-plus-sidebar composition, not the reference’s rounded/shadow styling. NHCP evidence and Acts No. 1240 / 1712 support the narrative.
- “nvm, move it under the searchbar section” supersedes the earlier request to place shortcuts directly below the hero.
- “as for the map, remove the eyebrows, then style it to be bluer according to our color palette”
- “relayout the services, add icons for user experience, remove eyebrows”
- Services remain derived from captured office records, not an invented service catalogue. Map data is geographic context, not an official legal boundary.
- Map resources load near the viewport. Provider requests and their IP-address exposure are disclosed in both privacy translations.

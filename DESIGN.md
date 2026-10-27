---
name: BetterLGU civic portal
description: Restrained Kapwa-style public information interface with Tailwind
colors:
  primary: "#1d4ed8"
  link: "#1747ab"
  foreground: "#172b4d"
  muted: "#4c5e78"
  background: "#ffffff"
  border: "#d6deeb"
  selected: "#eaf1ff"
  warning-background: "#fffaeb"
  warning-foreground: "#5c420b"
typography:
  body:
    fontFamily: "Inter, Segoe UI, system-ui, sans-serif"
    fontSize: "1rem"
    lineHeight: 1.65
  headline:
    fontSize: "clamp(1.75rem, 3vw, 2.6rem)"
    fontWeight: 730
    lineHeight: 1.2
    letterSpacing: "-0.025em"
rounded:
  panel: "0.65rem"
  notice: "0.5rem"
  input: "0.35rem"
spacing:
  panel: "1.25rem"
  homepage-column-gap: "5rem"
---

# Design System: Civic portal

## Overview

The portal uses restrained Kapwa styling with Tailwind. Following the user's BetterLB navigation reference, the global shell uses a compact utility strip and grouped horizontal navigation instead of a documentation-style sidebar. The homepage prioritizes search and quick access; detailed source limits remain on the affected pages and source routes.

## Colors

Primary blue identifies actions and navigation; dark foreground and muted evidence labels sit on white. Pale blue indicates the active topic. The homepage sources section uses the map's primary blue with light text, followed by a dark navy footer. Amber notices identify coverage or verification limits, not live emergency alerts. Palette values are recorded in frontmatter; `src/index.css` and Kapwa are the implementation authorities.

## Typography

Use the body stack and responsive headline scale above. No font is downloaded by the portal. Long original legal titles must wrap rather than truncate the source wording. Supporting prose is limited to readable measures where appropriate; tables retain tabular numbers.

## Layout

The header has a maximum width of 1440px; content has a maximum width of 1320px with no global sidebar. The utility strip includes the independent/nonofficial notice, BetterLGU initiative link, project information, official municipal site, public contacts and language switch. Primary navigation groups Services, Government, Statistics, OpenLGU and Transparency. At 1150px and below, a Menu button reveals stacked disclosure groups. The homepage pairs search and introductory content with quick-access links; at 700px and below these stack, as do topic and filter grids. Detailed coverage warnings stay on the affected routes; a compact homepage summary links to sources. Source tables scroll within their own region.

## Elevation & Depth

Flat surfaces with subtle borders and tonal notices. No decorative shadows, gradients or hero metrics.

## Shapes

Lightly rounded panels, inputs and notices use the frontmatter radii. Record lists use dividing rules instead of repeating dashboard cards.

## Components

Use installed Kapwa `Button` variants for actions and explicitly labeled native inputs/selects. Grouped navigation uses native exclusive disclosures with click-outside and Escape dismissal; mobile Escape returns focus to the Menu button. Keyboard focus is a visible 3px outline with a 4px offset. Source citations expose publisher routes, direct evidence URLs, independent status dimensions and last checks. Status chips are informational, not actions. The first focusable link skips to main content.

## Do's and Don'ts

- Do preserve source-original strings and visibly label missing translations.
- Do expose coverage gaps and last checks next to the affected content.
- Do keep native keyboard interactions and visible focus.
- Don't display an unavailable dataset as a zero-value metric.
- Don't add branding, animation or decorative visual systems beyond the approved restrained interface.

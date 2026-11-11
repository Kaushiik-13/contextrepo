# ContextOps UI guidelines

The GitHub setup screens are the visual reference for the product. Keep the application calm, clear, and deliberate rather than turning every item into a separate card.

## Visual direction

- Use the setup page's warm off-white canvas (`stone-100` / `stone-50`) with clean white working surfaces.
- Use stone tones for text, borders, and secondary actions. Use near-black for the main action button.
- Use violet sparingly for product identity, selected navigation, and small labels. Use green, amber, and rose only to communicate status.
- Keep borders thin and low contrast. Prefer generous spacing, clear typography, and a few strong sections over many nested boxes.
- Use medium rounded corners for primary panels and controls. Avoid large shadows, gradients, decorative color blocks, and repeated card-on-card layouts.
- Use shadcn/ui primitives already installed in the project for buttons, inputs, badges, and navigation controls. Tailor their classes to the shared ContextOps palette instead of leaving default styles inconsistent.

## Page structure

- Keep the app navigation stable while the page content scrolls. Selected navigation should be more visible than hover; hover is only a subtle temporary cue.
- Put the page title and short explanation first. Use a small uppercase violet eyebrow only when it adds context.
- Group related details in a single white surface with thin stone border and a restrained shadow. Break sections with spacing and divider lines instead of wrapping every subsection in its own card.
- Keep the selected repository visible in the workspace navigation. Put account and settings actions in the bottom area, aligned on one row where space allows.
- Make important primary actions dark and unmistakable. Secondary actions use white backgrounds and stone borders.
- Show loading, empty, error, connected, and disconnected states in plain language. Include a next action for recoverable errors.

## Accessibility and responsive behavior

- Use semantic headings, buttons, links, labels, and status alerts. Icon-only actions need an accessible label or tooltip.
- Preserve keyboard focus indicators and visible selected states; do not rely on color alone.
- On narrow screens, allow navigation to collapse using the existing shadcn sidebar behavior and stack page actions. Avoid horizontal overflow.
- Keep text readable and status contrast clear across the light palette.

When introducing a new screen, follow these rules and reuse the existing workspace shell and shared components before adding another layout pattern.

# Confirm Transfer illustration and motion

Jason approved the popup, layered entrance and Dark arrow colors on 2026-10-19.

## Source and implementation

- Figma file: `sFoSM9QLUXjDWXy1JsmtN0`.
- Approved popup: `2622:3949`; illustration: `2631:3415`.
- Motion r03: `2643:3415`; Dark arrow fills/stroke: `2648:3421`, `2648:3422`.
- Integrated route: `/tickets/t-001` → People → Transfer to Other Agent.
- Reuses the existing ConfirmDialog, Button, project theme and transfer callbacks. Other ConfirmDialog consumers retain their default illustration background.
- Decorative CSS layers preserve the cards’ resting rotations separately from animated translations. SVG details are local assets. No new dependency or global token.
- Light follows the approved neutral artwork. Dark cards derive from project foreground/card roles. The Dark arrow uses the approved neutral gradient from 57% to 27% RGB and a 44% RGB stroke at 60% opacity; Light retains the original asset.

## Motion contract

M01 plays once when the popup opens and holds its final state. All tracks use ease-in-out. The source timeline loop is a Figma playback setting and is not repeated in the product.

| Layer | Opacity | Translation |
| --- | --- | --- |
| Ground shadow | 66.7–633.3 ms | None; SVG already contains 0.17 opacity |
| Back card | 66.7–400 ms | Rise 4 px at 66.7–500 ms |
| Front card and badge | 200–533.3 ms | Rise 6 px at 200–633.3 ms |
| Arrow | 533.4–800 ms | Slide 5 px at 533.4–1000 ms |

Cancel and Confirm remain available during the entrance. Closing and reopening restarts the entrance. OS reduced-motion shows the resting illustration immediately. The decorative badge does not indicate that a transfer has completed.

## Scope and review

The temporary review page and its controls were removed before delivery. The product flow retains the approved copy, including the reassignment consequence and workspace-permission warning. This remains the existing frontend demo flow; it does not introduce server persistence or permission enforcement.

Validation is recorded in the pull request. Browser evidence covers the actual ticket flow, Light/Dark, reduced motion, cancel/confirm and reopening. Real-device and assistive-technology review are outside this change.

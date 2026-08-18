# Playful Retail Phone-First UI Design

## Summary

This change set redesigns the inventory browser game around a more polished, phone-first "playful retail" presentation while preserving the current simulation rules, educator settings, and multilingual support.

The approved direction is a hero-first storefront layout:

1. Lead the main game screen with a colorful mission-style summary card.
2. Keep the most important performance numbers visible as compact KPI tiles.
3. Reframe the supplier, store, and customer areas as more tactile retail-style cards.
4. Move order-entry emphasis and the primary "Next day" action into an easier thumb zone on phones.

The redesign should improve visual hierarchy, responsiveness, and intuitive play without turning the game into a different product.

## Goals

- Give the game a more memorable and polished visual identity.
- Optimize the main play loop for phones before scaling upward to tablet and desktop.
- Make the player's next action obvious through stronger layout hierarchy and clearer call-to-action placement.
- Preserve quick access to inventory, demand, fill rate, cost, and order quantity.
- Keep the experience understandable for first-time players even though visual polish is the top priority.

## Non-Goals

- No changes to demand generation, lead-time behavior, scoring math, or educator settings logic.
- No new tutorial system, multi-step onboarding flow, or separate help page in this cycle.
- No account system, leaderboard, history archive, or multiplayer features.
- No rebrand of the game's core subject matter or language support model.
- No deployment pipeline changes beyond what is needed to publish the finished UI updates through the existing repository workflow.

## Existing Context

- `App.tsx` composes the game from a sticky top bar, central inventory stage, persistent action bar, result sheet, and footer utility panel.
- `TopBar.tsx` currently combines the main heading, key metrics, and compact order controls inside a single sticky card.
- `InventoryStage.tsx` renders the supplier, store, and customer areas as a horizontal supply-chain board with a chart inside the store panel.
- `ActionBar.tsx` owns the "New Game" and "Next Day" actions near the bottom of the viewport.
- `app.css` already contains strong accessibility foundations, safe-area handling, responsive breakpoints, and reduced-motion support.

The current interface is functional and responsive, but it reads more like a compact dashboard than a polished mobile game. The strongest opportunity is to improve hierarchy and emotional appeal without sacrificing clarity.

## Proposed Design

## 1. Main Screen Hierarchy

The main gameplay screen should be reorganized into four visual layers on phones:

1. A compact sticky header that keeps day progress and a utility/help entry point visible.
2. A hero mission card that summarizes the current situation in a more expressive, high-contrast retail style.
3. Secondary KPI and supply-flow cards that explain the game state at a glance.
4. A bottom-priority interaction zone where order controls and the primary "Next day" action are easiest to reach with one thumb.

This structure intentionally separates "understand the situation" from "take the action" so the screen feels calmer and more premium on small devices.

## 2. Header And Hero Card

The current top bar should be split conceptually into:

- a lighter sticky header for the game title, day number, and minimize/help affordances,
- a large non-sticky hero card just below it for the most important daily context.

The hero card should use:

- a playful gradient or tinted retail-style background,
- a short mission-style headline that frames the player's decision,
- one or two highlighted metrics such as current inventory and today's demand,
- a lightweight fill-rate badge or status chip,
- supportive copy that explains the current objective in one sentence.

The header should feel slimmer than today so it does not consume too much vertical space on phones.

## 3. KPI Cards

Below the hero card, the interface should present a compact grid of supporting metrics such as:

- total cost,
- in-transit quantity,
- fill rate when not already emphasized in the hero,
- other secondary operational indicators already available in state.

These cards should remain visually subordinate to the hero while still being easy to scan. They should use consistent card spacing, soft shadows, rounded corners, and stronger number emphasis than label emphasis.

## 4. Supply Flow Section

The supplier, store, and customer areas should remain part of the experience, but the presentation should feel more touch-friendly and retail-like than the current board.

Recommended treatment:

- render each node as its own stacked card on phones,
- keep the supplier -> store -> customer progression visually obvious,
- make the store card the most prominent of the three,
- preserve the inventory trend chart inside the store section, but integrate it into a cleaner card layout,
- keep lead time, stockout cost, demand, sold units, and fill rate accessible without forcing the user to open a modal.

On larger breakpoints, the same content can expand back toward a row or multi-column composition, but mobile should remain the primary layout model.

## 5. Order Entry And Primary Actions

The current action model is functional, but the visual emphasis should move closer to the bottom of the phone viewport.

Recommended behavior:

- keep the order quantity slider and numeric input,
- present them inside a bottom-sheet-style or strongly separated order card,
- place the primary "Next day" button in the most prominent thumb-reachable position,
- keep "New Game" available as a secondary action,
- ensure the currently selected order quantity is visually large and easy to confirm before advancing.

The player should never have to search the screen to figure out what to do next.

## 6. Visual Style System

The approved tone is "playful retail," not arcade and not minimalist dashboard. The UI should therefore lean on:

- warm and cheerful accent colors,
- polished gradients used selectively for emphasis,
- card-based surfaces with soft depth,
- rounded corners and a friendlier silhouette language,
- stronger typographic contrast between labels and decision-critical numbers,
- restrained iconography or emoji only where it adds personality without reducing clarity.

The redesign should avoid becoming overly decorative. Data readability and quick decision-making still come first.

## 7. Responsive Behavior

Phone-first rules should drive the implementation:

- prioritize single-column stacking on narrow screens,
- keep sticky elements compact so they do not crowd the viewport,
- maintain comfortable touch targets and spacing,
- keep the primary action visible without forcing long scrolling,
- avoid dense side-by-side layouts until the screen width clearly supports them.

Tablet and desktop behavior should then scale from the same component system:

- hero and KPI sections can widen into multi-column layouts,
- supply cards can move from stacked to row-based arrangements,
- the chart can grow in width and height without changing its information hierarchy.

## 8. Help, Guidance, And First-Use Clarity

Although this redesign is not primarily a tutorial project, the interface should still help players understand how to play.

Recommended improvements inside the visual redesign:

- rename or restyle the existing game-logic entry so it feels more inviting,
- use mission-style copy in the hero to explain what matters this turn,
- make labels more action-oriented where practical,
- ensure the player can infer the loop: review state -> set order -> advance day.

This should improve intuitive understanding without introducing a separate guided tour.

## 9. Accessibility And Motion

The redesign must preserve the current accessibility baseline:

- maintain keyboard operability for all controls,
- preserve visible focus states,
- keep live-region updates meaningful and not excessively noisy,
- preserve or improve chart accessibility text,
- ensure sufficient contrast even with warmer playful colors,
- retain reduced-motion behavior for users who prefer less animation.

Any decorative motion added for polish should be subtle and optional rather than essential to understanding.

## Data Flow

- No new simulation state is required for this redesign.
- Existing run data, latest-entry data, and settings data should continue to drive the interface.
- Most changes should stay within layout composition, component structure, styling, and localized copy.
- If helpful for maintainability, shared display helpers may be introduced to prevent repeated metric formatting across the hero, KPI cards, and supply cards.

## Error Handling

- If run history is empty, the hero and supply cards should fall back to the same ready-state messaging already used today.
- If the chart has insufficient data, it should continue to show a stable empty or low-data presentation rather than collapsing the layout.
- The redesign should not create new required interactions that can block gameplay if a decorative element fails to render.

## Testing

Add or update focused tests for:

- main screen layout rendering with the updated hero-first structure,
- order controls and primary actions remaining accessible and functional,
- responsive class or structural changes that materially affect the action hierarchy,
- game-logic/help access remaining available,
- result sheet and educator settings behavior continuing to work after layout refactoring.

Manual verification should include:

- phone-sized viewport checks for sticky header, hero card, supply cards, and action placement,
- tablet and desktop viewport checks for graceful scaling,
- keyboard and screen-reader smoke testing for the reworked main screen,
- multilingual checks to ensure longer translated strings still fit the redesigned cards,
- a full 30-day run to confirm the updated interface does not disrupt gameplay flow.

## Publish Readiness

Implementation should remain compatible with the existing repository and deployment workflow so the finished changes can be published from a dedicated branch without extra release-only code paths.

Branch and publication work should happen after the implementation plan is approved and the UI changes are complete, tested, and reviewed.

## Open Decisions Resolved

- Visual direction: playful retail.
- Device priority: phone first.
- Preferred layout direction: hero-first storefront.
- Primary UX emphasis: stronger visual polish while keeping the game intuitive to play.

## Implementation Boundary

This spec is scoped to a single implementation cycle focused on the main gameplay surface, supporting responsive styles, localized interface copy where needed, and targeted regression testing. It does not include new game mechanics or a broader product rewrite.

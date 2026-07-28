# 30-Day Result And Language Panel Design

## Summary

This change set updates the ice-cream inventory game in three focused ways:

1. Hide the footer utility panel on initial load while keeping English as the default language when no saved preference exists.
2. Show the complete 30-day scatter-line trend chart in the 30-day result sheet below the four summary metrics.
3. Add a save action beside "Start a New 30-Day Run" that downloads the completed 30-day result sheet as a PNG image.

The implementation should reuse existing chart and summary logic wherever possible to minimize behavior drift between the in-game chart and the final result view.

## Goals

- Make the initial play experience less cluttered by hiding the language/settings footer panel until the user explicitly opens it.
- Preserve current language persistence behavior and English fallback behavior.
- Give players a complete end-of-run visual summary by including the full trend chart in the result sheet.
- Let players save a shareable record of their 30-day performance without adding in-app history management.

## Non-Goals

- No in-app archive or leaderboard of past runs.
- No PDF export or multi-format export; PNG is sufficient.
- No redesign of educator settings, gameplay rules, or scoring formulas.
- No changes to the underlying 30-day simulation logic.

## Existing Context

- The language switcher is currently rendered inside `FooterUtilityPanel`, and `App` initializes that panel as visible.
- Default language selection currently comes from `i18n.tsx`, which falls back to English when no supported stored language is present.
- The inventory trend chart already exists in `InventoryStage.tsx` as an SVG line-plus-point chart showing inventory level, inventory position, and daily demand.
- The 30-day result sheet in `MonthResultSheet.tsx` currently renders four metrics and a single primary action button.

## Proposed Design

## 1. Initial Language Panel State

`App.tsx` should initialize the footer utility panel as hidden rather than visible. The existing footer reopen button remains the mechanism for showing the panel when needed.

`i18n.tsx` should continue to:

- use English when there is no stored language value,
- persist explicit language choices in local storage,
- restore a previously chosen supported Chinese locale if present.

No change is required to the stored language format or the language switcher button set.

## 2. Reusable Chart Rendering

The chart-building logic in `InventoryStage.tsx` should be extracted into shared helpers and a reusable rendering component so the same chart can appear in both:

- the live Store section during gameplay,
- the 30-day result sheet after the run is complete.

The shared chart module should own:

- point generation,
- tick generation,
- SVG rendering for axes, polylines, and scatter points,
- legend labels and accessible chart description inputs.

The result sheet should render the same three series:

- inventory level,
- inventory position,
- daily demand.

The result sheet version does not need the enlarge interaction. It should be displayed inline under the four metric cards as part of the saved/exported content.

## 3. Result Sheet Layout

`MonthResultSheet.tsx` should be updated to include:

- the existing evaluation title and description,
- the existing four summary metrics,
- the full trend chart below those metrics,
- an action row containing:
  - a new save button,
  - the existing "Start a New 30-Day Run" button.

The save button should be visually secondary to the new-run action so the primary progression remains obvious.

## 4. PNG Export Behavior

The save action should export the visible result sheet as a PNG file downloaded to the player's device.

Recommended behavior:

- capture the result sheet container, including metrics and chart,
- render it to a canvas-backed PNG,
- trigger a browser download with a stable filename such as `ice-cream-30-day-result.png`,
- keep export entirely client-side with no server dependency.

Implementation should avoid adding large third-party dependencies if a small local utility can handle export reliably for the current DOM structure. If a helper is needed, it should be isolated so export logic stays out of the UI component body.

## 5. Accessibility And UX

- The result chart should preserve an accessible name/description similar to the existing inventory chart.
- The save button must have a clear localized label.
- Export failures should degrade gracefully. If image generation fails, the app should avoid crashing and should surface a lightweight localized error message or disable repeated broken behavior.
- The hidden footer panel should still be reachable through the existing footer button.

## Data Flow

- No new game-state fields are required for the requested behavior.
- `App.tsx` controls initial footer utility visibility.
- `MonthResultSheet.tsx` consumes the completed `run` and `summary` data already available at run completion.
- Shared chart helpers derive chart series directly from `run.history`.
- Export utility reads the rendered result-sheet DOM node and generates a PNG download on demand.

## Error Handling

- If `run.history` is empty, the result chart should fall back to the same placeholder/empty-state behavior used by the live chart.
- If PNG generation fails because browser APIs are unavailable or canvas export throws, the save action should fail safely and keep the result sheet usable.
- Language fallback remains English for unsupported stored values.

## Testing

Add or update focused tests for:

- footer utility panel hidden by default on initial render,
- footer utility panel can still be reopened,
- 30-day result sheet renders the chart content when a completed run is present,
- save button is rendered in the result action row,
- export helper behavior, if practical to unit test without brittle DOM snapshotting.

Manual verification should include:

- switching language still persists and restores correctly,
- completing a run shows the chart under the four metrics,
- clicking save downloads a PNG containing the result sheet content.

## Open Decisions Resolved

- Export format: PNG.
- Save destination: direct browser download only.
- Chart source: reuse existing chart logic instead of building a second chart implementation.

## Implementation Boundary

This spec is scoped to a single implementation cycle touching the result sheet, chart reuse, initial utility-panel state, localization strings, and targeted tests. It does not introduce broader UI refactors beyond what is needed to share chart rendering cleanly.

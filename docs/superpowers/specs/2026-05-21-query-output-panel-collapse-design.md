# Query Output Panel Collapse Design

## Summary

Improve the query editor workspace so the output panel does not take vertical space by default. The output area stays collapsed on initial entry, automatically expands after query or explain actions, and can be manually collapsed or expanded afterward.

## Goals

- Keep the query editor focused on SQL input until the user produces output.
- Automatically reveal query results after execution so users do not need an extra click to see the outcome.
- Let users collapse the output panel after execution to reclaim editor space.
- Reuse the existing result, explain, chart, loading, and error rendering paths with minimal behavioral drift.

## Non-Goals

- Do not redesign the result toolbar, grid, explain viewer, or chart UI.
- Do not change how query execution chooses the active output view.
- Do not persist the collapsed state across app restarts.
- Do not change non-query modes such as table data, Redis, Mongo, or object browser layouts.

## Current Problem

`ContentArea.vue` always renders query mode as a vertical split with the output panel visible in the lower pane. When SQL is long, users must repeatedly scroll the editor because the result area permanently occupies a large part of the viewport even before any execution has happened.

The current layout also lacks an explicit collapse control after results appear. Once output is shown, users cannot temporarily hide it without losing the query tab or switching context.

## User Experience

In query mode, the editor starts in a collapsed-output state. The lower panel remains as a compact bar that preserves access to output controls without occupying the old full result height.

When the user executes SQL successfully, executes SQL with an error result, or requests an explain plan, the output panel expands automatically and keeps the active output view behavior that already exists today. Query execution should still switch the output view to `result`, and explain should still switch to `explain`.

After output is visible, the user can click a dedicated collapse toggle in the output header to hide the panel content and return to a compact bar. Clicking the toggle again re-expands the panel. Manual collapse affects result, explain, and chart equally; the toggle controls panel visibility, not the active output type.

Switching tabs should not automatically expand an old output panel unless a new query or explain action has just triggered output in that tab. This avoids surprising users who intentionally collapsed a busy tab to focus on editing.

## Design

Add a query-output collapsed state that is scoped to query tabs instead of the global store. The simplest fit is a local state map in the app shell keyed by tab id, passed into `ContentArea.vue` as a prop with an update event. This keeps the interaction tied to view layout concerns and avoids polluting `queryStore` with presentation-only state.

Update the query execution flow so successful execution, error execution, and explain actions all request expansion before or alongside the existing active-output selection. The current `useSqlExecution.ts` logic already sets `activeOutputView`; the new behavior should piggyback on that path by also clearing the collapsed state for the active tab.

Keep `Splitpanes` as the layout primitive. In collapsed mode, render the lower pane at a compact fixed-height header size and hide the heavy content area. In expanded mode, restore the current split behavior so resizing, multiple result sets, AI fix affordance, and `DataGrid` integration continue to work without restructuring the content stack.

Place the collapse toggle in the output header area that already contains the result, explain, and chart controls. The button should remain visible both when collapsed and expanded so users always have a predictable re-open affordance.

## State Rules

- New query tabs start collapsed.
- Existing tabs restored from persistence also start collapsed for this feature because collapse state is not stored.
- Executing SQL in a query tab expands that tab's output panel.
- Running explain in a query tab expands that tab's output panel.
- Changing `activeOutputView` by itself does not force expansion unless it comes from an explicit output-producing action.
- Manual collapse remains in effect until the user expands again or triggers a new execution/explain action in the same tab.

## Risks

- If collapsed layout is implemented by fully unmounting output content, some child components may reset transient UI state more often than before. The implementation should keep this tradeoff explicit and prefer the lightest approach that does not break existing flows.
- `Splitpanes` may behave awkwardly when one pane is reduced to a very small height, so the collapsed height should be chosen to preserve a stable drag and resize experience.
- Because the state is view-local rather than persisted, restored tabs will show collapsed output even if they previously had results visible. This is intentional for now but should be called out during review.

## Testing

- Add focused tests for the new collapse state helper or event flow if the logic is extracted into a pure utility.
- Verify query mode starts with collapsed output and no empty large result region.
- Verify execute success expands the panel and shows results.
- Verify execute error expands the panel and shows the error result plus existing AI fix affordance.
- Verify explain expands the panel and shows explain output.
- Verify manual collapse and re-expand work without breaking result tab switching, chart view, or explain view.

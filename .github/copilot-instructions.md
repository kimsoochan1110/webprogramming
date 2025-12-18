# Medicine Manager AI Guide
## Overview
- **Purpose**: Single-page medicine tracker built with static HTML, CSS, and vanilla JS stored in this folder.
- **Entry Points**: index.html wires up style.css and app.js directly; there is no bundler or framework lifecycle to hook into.
- **Persistence**: All state lives in window.localStorage, so data access must stay browser-safe and guard against unavailable storage (e.g., private mode).
- **Localization**: UI copy is Korean; if adding strings, match tone and keep UTF-8 literal text.

## DOM Contracts
- **Required IDs**: app.js assumes elements with ids datePicker, clearDay, clearAll, countInfo, recordList, newMedInput, addMedBtn, medSlotsList, consumedList exist; changing markup requires updating query selectors.
- **Med Slot Events**: Slots are rendered in renderMedSlots(). Each li click auto-logs a dose; the nested delete button must stopPropagation to avoid accidental logs.
- **Accessibility**: Buttons rely on text labels (Korean) and hover effects; preserve aria attributes and button semantics when extending UI.

## State & Data Model
- **Storage Keys**: MED_SLOTS_KEY holds an array of medicine names; per-day records live under med-records:YYYY-MM-DD.
- **Record Shape**: New entries follow `{ id, iso, note }`. loadRecords() still migrates legacy string arrays—keep that conversion until confirmed obsolete.
- **Aggregate View**: renderConsumed() groups records by note, sorts by first occurrence, and drives count animations via lastConsumedAction to apply CSS classes.
- **Date Flow**: ensureDateSelected() defaults the picker to today; all actions should call it before touching records to avoid null keys.

## UI Behavior
- **Animations**: CSS classes count--inc / count--dec and hover overlays expect badges to be re-rendered after each state change; reusing render(dateStr) ensures this.
- **Order Guarantees**: Records render newest first by reversing the array at display time only; storage stays chronological.
- **Slot Limits**: UI allows duplicate medicines only once; add logic through loadMedSlots()/saveMedSlots() to avoid divergence.

## Development Workflow
- **Serve Locally**: Open index.html in a browser or use the VS Code Live Server extension; there are no node/npm steps.
- **Reset State**: Use the “하루 초기화” and “전체 초기화” buttons or manually clear localStorage between feature tests.
- **Debugging**: Leverage browser devtools—no source maps are needed, and logging is acceptable (console already used inside catch blocks).

## Extending Safely
- **Adding Fields**: If expanding records (e.g., dosage), update saveRecords(), render(), renderConsumed(), and any migration logic together.
- **Bulk Operations**: When writing new mutators, always reload with loadRecords() just before mutation to avoid stale data and keep reverse display intact.
- **Styling**: style.css uses gradients, clamps, and shared pill-like components; extend by reusing existing classes to preserve theme.
- **Testing Changes**: Manually verify both slot interactions and aggregate list animations per date after any behavior change since there is no automated suite.

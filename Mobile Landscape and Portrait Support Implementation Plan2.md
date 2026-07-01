# Mobile Landscape and Portrait Support Implementation Plan

This plan details adjustments to handle screen rotation seamlessly on mobile devices.

## User Review Required

> [!IMPORTANT]
> - Re-arranging registration form items into a responsive 2-column layout (`xs={24} sm={12}`) in landscape orientation, preventing long form heights on wide screens.
> - Forcing modal overlays on low-height landscape mobile viewports to align to the top and enable vertical scrolling (`max-height: 90vh; overflow-y: auto`).

## Proposed Changes

### Login Component

#### [MODIFY] [Login.jsx](file:///c:/Users/Phodon/psychology-admin/src/views/Login.jsx)
- Import `Row` and `Col` from `antd`.
- Wrap the 5 student-specific metadata items (Region, School Stage, School, Group, Class Name) inside `<Row gutter={12}>` and apply dynamic column widths (`xs={24} sm={12}`) so they automatically split into 2 columns when a phone is switched to landscape mode.

### CSS Styling System

#### [MODIFY] [global.css](file:///c:/Users/Phodon/psychology-admin/src/styles/global.css)
- Add a landscape layout rule for modals: under `@media (orientation: landscape) and (max-height: 500px)`, align `.ant-modal` closer to the top and set `.ant-modal-content` scroll parameters.

## Verification Plan

### Automated Tests
- Build code using `npm run build`.

### Manual Verification
- Simulate rotation (portrait to landscape) in the DevTools mobile emulator.
- Access the register page and verify that student metadata fields cleanly dynamically split into a 2-column layout in landscape view.
- Open a modal (e.g. self-test report details) and verify that the modal content fits the screen height and is scrollable.

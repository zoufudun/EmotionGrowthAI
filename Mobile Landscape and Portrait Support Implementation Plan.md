# Mobile Landscape and Portrait Support Implementation Plan

This plan focuses on making all pages and components render perfectly when a mobile phone is rotated between portrait and landscape modes.

## User Review Required

> [!IMPORTANT]
> The main layout adjustments will ensure that the sidebar and other fixed components scroll naturally when the height of the screen is very short (which is typical for mobile landscape viewports, usually 300px - 450px).

## Proposed Changes

### Core Layout

#### [MODIFY] [AdminLayout.jsx](file:///c:/Users/Phodon/psychology-admin/src/layouts/AdminLayout.jsx)
- Set Sider CSS styles to `overflowY: 'auto'` and `overflowX: 'hidden'` so the entire sidebar remains fully scrollable on low-height landscape screens.
- Convert the Sider footer panel from absolute positioning (`position: 'absolute'; bottom: 80`) to a relative layout block (`padding: '24px 20px 40px 20px'`) in the normal flow. This prevents the footer from overlapping menu links when screen height is too small.

### CSS Styling System

#### [MODIFY] [global.css](file:///c:/Users/Phodon/psychology-admin/src/styles/global.css)
- Add a landscape media query targeting small height viewports (`@media (max-height: 580px)`).
- Reduce header height slightly, card padding, and page container spacing in landscape mode to maximize vertical content visibility.
- Make the floating role switcher switcher position compact on landscape screens.

## Verification Plan

### Manual Verification
1. Run `npm run dev`.
2. Toggle Chrome DevTools responsive emulation, rotate the device to landscape (e.g. 844x390 viewport size).
3. Verify that:
   - The console sidebar menu is fully scrollable and no items overlap or are cut off.
   - Modals fit on the screen and are scrollable if their content exceeds the screen height.
   - The page headers and cards resize compact enough to view charts and forms without extreme scrolling.

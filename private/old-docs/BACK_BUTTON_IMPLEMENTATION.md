# BackButton Implementation Guide

**Date**: October 9, 2025  
**Component**: BackButton  
**Status**: ✅ Component Created, Ready for Implementation

---

## Overview

A reusable `BackButton` component has been created to provide consistent navigation across all OFMS pages. This component allows users to easily return to the previous page or a specified fallback location.

---

## Component Location

```
/src/components/ui/BackButton/
├── BackButton.tsx          # Main component
├── BackButton.module.css   # Styles
└── index.ts               # Export
```

---

## Usage

### Basic Usage

```tsx
import { BackButton } from '@/components/ui';

export default function MyPage() {
    return (
        <div className={styles.container}>
            <BackButton />
            {/* Rest of page content */}
        </div>
    );
}
```

### With Custom Label

```tsx
<BackButton label="Back to Dashboard" />
```

### With Fallback Path

```tsx
<BackButton fallbackPath="/dashboard" />
```

### Full Example

```tsx
<BackButton 
    label="Back to Crops" 
    fallbackPath="/planning/crops"
    className={styles.customBackButton}
/>
```

---

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `label` | `string` | `"Back"` | Text to display on the button |
| `fallbackPath` | `string` | `"/dashboard"` | Path to navigate to if no browser history |
| `className` | `string` | `""` | Additional CSS classes |

---

## Implementation Status

### ✅ Completed
- [x] BackButton component created
- [x] Styles implemented with hover effects
- [x] Exported from `/components/ui/index.ts`
- [x] Added to Production Calendar page (example)

### 📋 Pages Requiring BackButton

The following pages should have BackButton added:

#### Admin Pages
- [ ] `/src/app/admin/page.tsx` → fallback: `/dashboard`
- [ ] `/src/app/admin/farms/page.tsx` → fallback: `/admin`
- [ ] `/src/app/admin/farms/[farmId]/page.tsx` → fallback: `/admin/farms`
- [ ] `/src/app/admin/feedback/page.tsx` → fallback: `/admin`
- [ ] `/src/app/admin/utilities/ai-models/page.tsx` → fallback: `/admin`
- [ ] `/src/app/admin/utilities/connected-users/page.tsx` → fallback: `/admin`

#### Analytics Pages
- [ ] `/src/app/analytics/page.tsx` → fallback: `/dashboard`
- [ ] `/src/app/analytics/financial/page.tsx` → fallback: `/analytics`
- [ ] `/src/app/analytics/market/page.tsx` → fallback: `/analytics`
- [ ] `/src/app/analytics/production/page.tsx` → fallback: `/analytics`
- [ ] `/src/app/analytics/sustainability/page.tsx` → fallback: `/analytics`
- [ ] `/src/app/analytics/yield/page.tsx` → fallback: `/analytics`

#### Compliance Pages
- [ ] `/src/app/compliance/page.tsx` → fallback: `/dashboard`
- [ ] `/src/app/compliance/fda-fsma/page.tsx` → fallback: `/compliance`
- [ ] `/src/app/compliance/usda-organic/page.tsx` → fallback: `/compliance`

#### Equipment Pages
- [ ] `/src/app/equipment/page.tsx` → fallback: `/dashboard`
- [ ] `/src/app/equipment/maintenance/page.tsx` → fallback: `/equipment`
- [ ] `/src/app/equipment/management/page.tsx` → fallback: `/equipment`
- [ ] `/src/app/equipment/sensors/page.tsx` → fallback: `/equipment`

#### Inventory Pages
- [ ] `/src/app/inventory/page.tsx` → fallback: `/dashboard`
- [ ] `/src/app/inventory/equipment/page.tsx` → fallback: `/inventory`
- [ ] `/src/app/inventory/packaging/page.tsx` → fallback: `/inventory`
- [ ] `/src/app/inventory/stock/page.tsx` → fallback: `/inventory`
- [ ] `/src/app/inventory/supplies/page.tsx` → fallback: `/inventory`

#### Planning Pages
- [ ] `/src/app/planning/page.tsx` → fallback: `/dashboard`
- [x] `/src/app/planning/calendar/page.tsx` → fallback: `/planning/crops` ✅
- [ ] `/src/app/planning/crops/page.tsx` → fallback: `/planning`
- [ ] `/src/app/planning/forecasting/page.tsx` → fallback: `/planning`
- [ ] `/src/app/planning/production/page.tsx` → fallback: `/planning`
- [ ] `/src/app/planning/resources/page.tsx` → fallback: `/planning`

#### Production Pages
- [ ] `/src/app/production/page.tsx` → fallback: `/dashboard`
- [ ] `/src/app/production/batches/page.tsx` → fallback: `/production`
- [ ] `/src/app/production/environments/page.tsx` → fallback: `/production`
- [ ] `/src/app/production/harvesting/page.tsx` → fallback: `/production`
- [ ] `/src/app/production/post-harvest/page.tsx` → fallback: `/production`
- [ ] `/src/app/production/seeds/page.tsx` → fallback: `/production`

#### Quality Pages
- [ ] `/src/app/quality/page.tsx` → fallback: `/dashboard`
- [ ] `/src/app/quality/audits/page.tsx` → fallback: `/quality`
- [ ] `/src/app/quality/certifications/page.tsx` → fallback: `/quality`
- [ ] `/src/app/quality/control/page.tsx` → fallback: `/quality`
- [ ] `/src/app/quality/food-safety/page.tsx` → fallback: `/quality`

#### Sales Pages
- [ ] `/src/app/sales/page.tsx` → fallback: `/dashboard`
- [ ] `/src/app/sales/b2b-customers/page.tsx` → fallback: `/sales`
- [ ] `/src/app/sales/b2c-customers/page.tsx` → fallback: `/sales`
- [ ] `/src/app/sales/contracts/page.tsx` → fallback: `/sales`
- [ ] `/src/app/sales/orders/page.tsx` → fallback: `/sales`
- [ ] `/src/app/sales/pricing/page.tsx` → fallback: `/sales`

#### Settings Pages
- [ ] `/src/app/settings/page.tsx` → fallback: `/dashboard`

#### Tasks Pages
- [ ] `/src/app/tasks/page.tsx` → fallback: `/dashboard`
- [ ] `/src/app/tasks/assignments/page.tsx` → fallback: `/tasks`
- [ ] `/src/app/tasks/calendar/page.tsx` → fallback: `/tasks`

#### Team Pages
- [ ] `/src/app/team/page.tsx` → fallback: `/dashboard`
- [ ] `/src/app/team/directory/page.tsx` → fallback: `/team`
- [ ] `/src/app/team/performance/page.tsx` → fallback: `/team`

#### Traceability Pages
- [ ] `/src/app/traceability/page.tsx` → fallback: `/dashboard`
- [ ] `/src/app/traceability/lots/page.tsx` → fallback: `/traceability`
- [ ] `/src/app/traceability/seed-to-sale/page.tsx` → fallback: `/traceability`

#### Other Pages
- [ ] `/src/app/ai-insights/page.tsx` → fallback: `/dashboard`
- [ ] `/src/app/feedback/page.tsx` → fallback: `/dashboard`
- [ ] `/src/app/integrations/page.tsx` → fallback: `/dashboard`

---

## Implementation Steps

For each page:

1. **Import the BackButton**:
   ```tsx
   import { BackButton } from '@/components/ui';
   ```

2. **Add to the page** (after opening container div):
   ```tsx
   return (
       <div className={styles.container}>
           <BackButton fallbackPath="/appropriate-parent-path" />
           {/* Rest of content */}
       </div>
   );
   ```

3. **Choose appropriate fallback**:
   - Sub-pages → parent section (e.g., `/analytics/yield` → `/analytics`)
   - Top-level pages → `/dashboard`

---

## Design Specifications

### Visual Style
- **Border**: 2px solid with hover effect
- **Padding**: Comfortable spacing for touch targets
- **Icon**: Left arrow (←) with animation on hover
- **Colors**: Follows OFMS design system
- **Hover**: Slides left slightly, changes to primary color

### Accessibility
- Keyboard navigable (Tab + Enter)
- ARIA label for screen readers
- Focus visible state
- Touch-friendly size on mobile

### Responsive Behavior
- Full size on desktop
- Slightly smaller on mobile
- Always visible and accessible

---

## Testing Checklist

After implementation, verify:

- [ ] Button appears on all pages
- [ ] Clicking navigates to previous page (when history exists)
- [ ] Falls back to specified path (when no history)
- [ ] Hover effect works correctly
- [ ] Keyboard navigation functional
- [ ] Mobile responsive
- [ ] Consistent styling across pages

---

## Notes

- **Do not add** to `/dashboard` or `/auth/signin` (entry points)
- **Do not add** to `/page.tsx` (landing page)
- Consider adding custom labels for better UX (e.g., "Back to Analytics")
- Ensure fallback paths are logical and tested

---

**Developed by Shared Oxygen, LLC**  
**© 2025 Shared Oxygen, LLC. All rights reserved.**

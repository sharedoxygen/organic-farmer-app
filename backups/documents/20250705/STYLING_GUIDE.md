# Styling Guide & Design System

## 🎯 Overview

This guide establishes comprehensive styling standards for Next.js applications, focusing on CSS Modules, design systems, responsive design, and theme support.

---

## 🏗️ Core Styling Philosophy

### Principles

- **CSS Modules First**: All component styling through CSS Modules for scoped, maintainable styles
- **Design System**: Centralized CSS variables for consistent themes and design tokens
- **Responsive Design**: Mobile-first approach with defined breakpoints
- **Theme Support**: Built-in support for light/dark/business themes with professional aesthetics
- **Performance**: Optimized CSS delivery and minimal runtime styling

### Architecture

```
src/
├── styles/
│   ├── globals.scss          # Global styles, CSS variables, base elements
│   ├── themes/               # Theme-specific overrides
│   └── utilities/            # Utility classes (minimal)
├── components/
│   └── ComponentName/
│       ├── ComponentName.tsx
│       └── ComponentName.module.css
```

---

## 📐 CSS Modules Standards

### **🚨 CRITICAL: CSS Modules Syntax Rules**

**NEVER use these syntaxes in `.module.css` files - they will cause build failures:**

```css
/* ❌ NEVER: Global selectors in CSS Modules files */
:global(.className) { ... }           /* INVALID SYNTAX */
:global(*) { ... }                   /* INVALID SYNTAX */
:global(body) { ... }                /* INVALID SYNTAX */
:global(html) { ... }                /* INVALID SYNTAX */

/* ❌ NEVER: Direct global element selectors */
html { ... }                         /* WRONG FILE - use globals.css */
body { ... }                         /* WRONG FILE - use globals.css */
* { ... }                           /* WRONG FILE - use globals.css */

/* ❌ NEVER: Theme selectors in modules */
html.theme-dark { ... }             /* WRONG FILE - use globals.css */
.theme-light .someClass { ... }      /* WRONG FILE - use globals.css */

/* ❌ NEVER: Complex global selectors */
:global(.theme-transitioning) * { ... }  /* INVALID SYNTAX */
```

**✅ CORRECT: Only local class names in `.module.css` files:**

```css
/* ✅ CORRECT: Local component classes only */
.container { ... }
.header { ... }
.title { ... }
.content { ... }

/* ✅ CORRECT: Pseudo-classes on local elements */
.button:hover { ... }
.input:focus { ... }
.card:nth-child(even) { ... }

/* ✅ CORRECT: Media queries with local classes */
@media (max-width: 768px) {
  .container { ... }
}

/* ✅ CORRECT: CSS variables (always allowed) */
.container {
  background-color: var(--card-bg);
  color: var(--text-dark);
}
```

### **FILE PURPOSE SEPARATION**

| File Type | Purpose | Allowed Syntax | Example |
|-----------|---------|----------------|---------|
| `globals.css` | Global styles, themes, base elements | All CSS syntax | `html.theme-dark { }`, `body { }`, `* { }` |
| `Component.module.css` | Component-specific scoped styles | Local classes only | `.container { }`, `.title { }` |
| `utilities.css` | Global utility classes | Global utilities | `.text-center { }`, `.sr-only { }` |

### **CRITICAL BUILD ERROR PREVENTION**

**Before writing any CSS, ask yourself:**

1. **Is this style global or component-specific?**
   - Global → `globals.css`
   - Component → `Component.module.css`

2. **Does it affect multiple components or the entire app?**
   - Multiple components → `globals.css`
   - Single component → `Component.module.css`

3. **Is it a theme-related style?**
   - Theme styles → `globals.css`
   - Component variants → `Component.module.css`

### File Structure

**All components MUST use CSS Modules for styling:**

```typescript
// components/UserCard/UserCard.tsx
import styles from './UserCard.module.css';

interface UserCardProps {
  user: User;
  variant?: 'default' | 'compact' | 'detailed';
  className?: string;
}

export default function UserCard({ 
  user, 
  variant = 'default', 
  className 
}: UserCardProps) {
  return (
    <div className={`${styles.container} ${styles[variant]} ${className || ''}`}>
      <div className={styles.header}>
        <h3 className={styles.title}>{user.name}</h3>
        <span className={styles.role}>{user.role}</span>
      </div>
      <div className={styles.content}>
        <p className={styles.email}>{user.email}</p>
      </div>
    </div>
  );
}
```

### CSS Module Best Practices

```css
/* components/UserCard/UserCard.module.css */

/* Base component styles */
.container {
  background-color: var(--card-bg);
  border: 1px solid var(--border-color);
  border-radius: var(--border-radius-md);
  padding: var(--spacing-md);
  box-shadow: var(--card-shadow);
  transition: all var(--transition-fast);
}

.container:hover {
  box-shadow: var(--card-shadow-hover);
  transform: translateY(-2px);
}

/* Component sections */
.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-sm);
}

.title {
  color: var(--text-dark);
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-semibold);
  margin: 0;
}

.role {
  background-color: var(--primary-color);
  color: var(--text-on-primary);
  padding: var(--spacing-xs) var(--spacing-sm);
  border-radius: var(--border-radius-sm);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
}

.content {
  margin-top: var(--spacing-md);
}

.email {
  color: var(--text-medium);
  font-size: var(--font-size-base);
  margin: 0;
}

/* Variant styles */
.compact {
  padding: var(--spacing-sm);
}

.compact .header {
  margin-bottom: var(--spacing-xs);
}

.detailed {
  padding: var(--spacing-lg);
}

/* Responsive design */
@media (max-width: 768px) {
  .container {
    padding: var(--spacing-sm);
  }

  .header {
    flex-direction: column;
    align-items: flex-start;
    gap: var(--spacing-xs);
  }

  .title {
    font-size: var(--font-size-md);
  }
}

@media (max-width: 480px) {
  .title {
    font-size: var(--font-size-base);
  }
  
  .role {
    font-size: var(--font-size-xs);
  }
}
```

---

## 🎨 Design System & CSS Variables

### Global CSS Variables

All design tokens are defined in `src/styles/globals.scss`:

```scss
// src/styles/globals.scss

:root {
  /* Colors - Primary Palette */
  --primary-color: #0d6efd;
  --primary-dark: #0a58ca;
  --primary-light: #6ea8fe;
  --primary-subtle: #cfe2ff;

  /* Colors - Semantic */
  --success-color: #198754;
  --warning-color: #ffc107;
  --danger-color: #dc3545;
  --info-color: #0dcaf0;

  /* Colors - Text */
  --text-dark: #1e2a3a;
  --text-medium: #6c757d;
  --text-light: #adb5bd;
  --text-on-primary: #ffffff;
  --text-on-dark: #ffffff;

  /* Colors - Background */
  --bg-light: #f8f9fa;
  --bg-dark: #212529;
  --card-bg: #ffffff;
  --overlay-bg: rgba(0, 0, 0, 0.5);

  /* Colors - Borders */
  --border-color: #e8ebef;
  --border-color-hover: #d0d7de;
  --border-color-focus: var(--primary-color);

  /* Typography */
  --font-family-base: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
  --font-family-mono: 'Fira Code', 'Courier New', monospace;

  --font-size-xs: 0.75rem;    /* 12px */
  --font-size-sm: 0.875rem;   /* 14px */
  --font-size-base: 1rem;     /* 16px */
  --font-size-lg: 1.125rem;   /* 18px */
  --font-size-xl: 1.25rem;    /* 20px */
  --font-size-2xl: 1.5rem;    /* 24px */
  --font-size-3xl: 1.875rem;  /* 30px */
  --font-size-4xl: 2.25rem;   /* 36px */

  --font-weight-light: 300;
  --font-weight-normal: 400;
  --font-weight-medium: 500;
  --font-weight-semibold: 600;
  --font-weight-bold: 700;

  --line-height-tight: 1.25;
  --line-height-base: 1.5;
  --line-height-relaxed: 1.75;

  /* Spacing */
  --spacing-xs: 0.25rem;   /* 4px */
  --spacing-sm: 0.5rem;    /* 8px */
  --spacing-md: 1rem;      /* 16px */
  --spacing-lg: 1.5rem;    /* 24px */
  --spacing-xl: 2rem;      /* 32px */
  --spacing-2xl: 3rem;     /* 48px */
  --spacing-3xl: 4rem;     /* 64px */

  /* Layout */
  --header-height: 60px;
  --sidebar-width: 260px;
  --content-max-width: 1200px;
  --container-padding: var(--spacing-md);

  /* Border Radius */
  --border-radius-sm: 0.25rem;  /* 4px */
  --border-radius-md: 0.5rem;   /* 8px */
  --border-radius-lg: 0.75rem;  /* 12px */
  --border-radius-xl: 1rem;     /* 16px */
  --border-radius-full: 9999px;

  /* Shadows */
  --shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
  --shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  --shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
  --shadow-xl: 0 20px 25px -5px rgba(0, 0, 0, 0.1);

  --card-shadow: var(--shadow-sm);
  --card-shadow-hover: var(--shadow-md);

  /* Transitions */
  --transition-fast: 150ms ease-in-out;
  --transition-base: 250ms ease-in-out;
  --transition-slow: 350ms ease-in-out;

  /* Z-Index Scale */
  --z-dropdown: 1000;
  --z-sticky: 1020;
  --z-fixed: 1030;
  --z-modal-backdrop: 1040;
  --z-modal: 1050;
  --z-popover: 1060;
  --z-tooltip: 1070;
}
```

### Theme Support

#### Dark Theme

```scss
/* Dark theme overrides */
html.theme-dark {
  --primary-color: #4dabf7;
  --primary-dark: #339af0;
  --primary-light: #74c0fc;

  --text-dark: #f1f3f4;
  --text-medium: #adb5bd;
  --text-light: #6c757d;

  --bg-light: #0d1117;
  --bg-dark: #010409;
  --card-bg: #161b22;

  --border-color: #30363d;
  --border-color-hover: #484f58;

  --card-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);
  --card-shadow-hover: 0 4px 12px rgba(0, 0, 0, 0.4);
}
```

#### Business Modern Theme

```scss
/* Business modern theme - Clean, professional, industry-standard */
html.theme-business {
  /* Primary palette - Dark blue for professional trust */
  --primary-color: #1e3a8a;      /* Professional dark blue */
  --primary-dark: #1e293b;       /* Darker blue-gray */
  --primary-light: #3b82f6;      /* Lighter blue accent */
  --primary-subtle: #e0f2fe;     /* Very light blue background */

  /* Success/Action - Dark green for positive actions */
  --success-color: #065f46;      /* Professional dark green */
  --success-light: #10b981;      /* Medium green */
  --success-subtle: #d1fae5;     /* Light green background */

  /* Text hierarchy - Modern contrast ratios */
  --text-dark: #111827;          /* Near black for headers */
  --text-medium: #374151;        /* Dark gray for body text */
  --text-light: #6b7280;         /* Medium gray for secondary text */
  --text-muted: #9ca3af;         /* Light gray for captions */

  /* Background system - Muted whites and grays */
  --bg-primary: #ffffff;         /* Pure white for main content */
  --bg-secondary: #f8fafc;       /* Very light gray for sections */
  --bg-tertiary: #f1f5f9;        /* Light gray for cards */
  --card-bg: #ffffff;            /* White cards with subtle shadows */

  /* Border system - Subtle and professional */
  --border-color: #e2e8f0;       /* Light gray borders */
  --border-color-hover: #cbd5e1;  /* Medium gray on hover */
  --border-color-focus: var(--primary-color); /* Blue focus states */

  /* Professional shadows - Subtle depth */
  --shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
  --shadow-md: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06);
  --shadow-lg: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  --card-shadow: var(--shadow-sm);
  --card-shadow-hover: var(--shadow-md);

  /* Status colors - Professional and accessible */
  --warning-color: #d97706;      /* Professional amber */
  --danger-color: #dc2626;       /* Professional red */
  --info-color: #0284c7;         /* Professional blue */

  /* Interactive states */
  --hover-bg: rgba(30, 58, 138, 0.04);     /* Very subtle blue hover */
  --active-bg: rgba(30, 58, 138, 0.08);    /* Subtle blue active */
  --focus-ring: 0 0 0 3px rgba(59, 130, 246, 0.1); /* Accessible focus ring */
}
```

### Business Theme Usage Examples

```css
/* Dashboard cards - Clean and professional */
.dashboardCard {
  background-color: var(--card-bg);
  border: 1px solid var(--border-color);
  border-radius: var(--border-radius-lg);
  box-shadow: var(--card-shadow);
  padding: var(--spacing-lg);
}

/* Primary action buttons - Professional blue */
.primaryButton {
  background-color: var(--primary-color);
  color: var(--text-on-primary);
  border: none;
  padding: var(--spacing-sm) var(--spacing-lg);
  border-radius: var(--border-radius-md);
  font-weight: var(--font-weight-medium);
}

.primaryButton:hover {
  background-color: var(--primary-dark);
  box-shadow: var(--shadow-md);
}

/* Success indicators - Professional green */
.successBadge {
  background-color: var(--success-subtle);
  color: var(--success-color);
  padding: var(--spacing-xs) var(--spacing-sm);
  border-radius: var(--border-radius-sm);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
}

/* Section headers - Strong hierarchy */
.sectionHeader {
  color: var(--text-dark);
  font-size: var(--font-size-2xl);
  font-weight: var(--font-weight-semibold);
  margin-bottom: var(--spacing-lg);
  border-bottom: 2px solid var(--border-color);
  padding-bottom: var(--spacing-sm);
}

/* Data tables - Clean and scannable */
.dataTable {
  background-color: var(--bg-primary);
  border: 1px solid var(--border-color);
  border-radius: var(--border-radius-lg);
}

.dataTable th {
  background-color: var(--bg-secondary);
  color: var(--text-dark);
  font-weight: var(--font-weight-semibold);
  padding: var(--spacing-md);
  border-bottom: 1px solid var(--border-color);
}

.dataTable td {
  color: var(--text-medium);
  padding: var(--spacing-md);
  border-bottom: 1px solid var(--border-color);
}

.dataTable tr:hover {
  background-color: var(--hover-bg);
}
```

---

## 📱 Responsive Design Standards

### Breakpoints

```scss
/* Responsive breakpoints */
$breakpoint-sm: 576px;
$breakpoint-md: 768px;
$breakpoint-lg: 992px;
$breakpoint-xl: 1200px;
$breakpoint-2xl: 1400px;

/* Usage in CSS Modules */
@media (max-width: 768px) {
  .container {
    padding: var(--spacing-sm);
  }
}

@media (min-width: 992px) {
  .container {
    padding: var(--spacing-xl);
  }
}
```

### Typography Scale

#### Recommended Font Sizes by Breakpoint

**Desktop (992px+)**
- **Page Titles**: `var(--font-size-4xl)` (36px)
- **Section Headings**: `var(--font-size-2xl)` (24px)
- **Card Titles**: `var(--font-size-xl)` (20px)
- **Body Text**: `var(--font-size-base)` (16px)

**Tablet (768px - 991px)**
- **Page Titles**: `var(--font-size-3xl)` (30px)
- **Section Headings**: `var(--font-size-xl)` (20px)
- **Card Titles**: `var(--font-size-lg)` (18px)
- **Body Text**: `var(--font-size-base)` (16px)

**Mobile (< 768px)**
- **Page Titles**: `var(--font-size-2xl)` (24px)
- **Section Headings**: `var(--font-size-lg)` (18px)
- **Card Titles**: `var(--font-size-base)` (16px)
- **Body Text**: `var(--font-size-sm)` (14px)

#### Implementation Example

```css
.pageTitle {
  font-size: var(--font-size-4xl);
  font-weight: var(--font-weight-bold);
  line-height: var(--line-height-tight);
}

@media (max-width: 992px) {
  .pageTitle {
    font-size: var(--font-size-3xl);
  }
}

@media (max-width: 768px) {
  .pageTitle {
    font-size: var(--font-size-2xl);
  }
}
```

---

## 🚫 Styling Restrictions & Requirements

### Prohibited Practices

```typescript
// ❌ NEVER: Inline styles (except for truly dynamic values)
<div style={{ backgroundColor: 'blue', padding: '10px' }}>
  Content
</div>

// ❌ NEVER: JSX styles
<style jsx>{`
  .component {
    background: blue;
  }
`}</style>

// ❌ NEVER: Global CSS classes for component-specific styles
<div className="my-component-style">
  Content
</div>
```

### Approved Practices

```typescript
// ✅ CORRECT: CSS Modules
import styles from './Component.module.css';

<div className={styles.container}>
  <h2 className={styles.title}>Title</h2>
</div>

// ✅ CORRECT: Dynamic values only
<div 
  className={styles.icon}
  style={{ backgroundColor: props.dynamicColor }}
>
  Icon
</div>

// ✅ CORRECT: Conditional classes
<div className={`${styles.button} ${isActive ? styles.active : ''}`}>
  Button
</div>
```

---

## 🛠️ Utility Functions & Helpers

### ClassNames Utility

```typescript
// lib/utils/classNames.ts
export function classNames(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ');
}

// Usage
import { classNames } from '@/lib/utils/classNames';

<div className={classNames(
  styles.button,
  isPrimary && styles.primary,
  isLoading && styles.loading,
  className
)}>
  Button
</div>
```

### CSS Variable Safety

```typescript
// lib/utils/styleUtils.ts
export function validateCSSVariables(): boolean {
  if (typeof window === 'undefined') return true;

  const testElement = document.createElement('div');
  testElement.style.color = 'var(--primary-color, #fallback)';
  document.body.appendChild(testElement);
  
  const computedStyle = window.getComputedStyle(testElement);
  const hasVariables = computedStyle.color !== 'rgb(35, 171, 255)'; // fallback color
  
  document.body.removeChild(testElement);
  return hasVariables;
}

export function getCSSVariable(variableName: string, fallback: string = ''): string {
  if (typeof window === 'undefined') return fallback;
  
  return getComputedStyle(document.documentElement)
    .getPropertyValue(variableName)
    .trim() || fallback;
}
```

---

## 🎭 Theme System Implementation

### Theme Provider

```typescript
// components/ThemeProvider/ThemeProvider.tsx
import { createContext, useContext, useEffect, useState } from 'react';

type Theme = 'light' | 'dark' | 'business';

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>('light');

  useEffect(() => {
    // Load theme from localStorage
    const savedTheme = localStorage.getItem('theme') as Theme;
    if (savedTheme) {
      setTheme(savedTheme);
    }
  }, []);

  useEffect(() => {
    // Apply theme to document
    document.documentElement.className = `theme-${theme}`;
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(current => current === 'light' ? 'dark' : 'light');
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
}
```

### Modern Theme Selector

```typescript
// components/ThemeSelector/ThemeSelector.tsx
import { useTheme } from '@/components/ThemeProvider/ThemeProvider';
import styles from './ThemeSelector.module.css';

const themeOptions = [
  { value: 'light', label: 'Light', icon: '☀️' },
  { value: 'dark', label: 'Dark', icon: '🌙' },
  { value: 'business', label: 'Business', icon: '💼' }
] as const;

export default function ThemeSelector() {
  const { theme, setTheme } = useTheme();

  return (
    <div className={styles.selector}>
      <label className={styles.label}>Theme</label>
      <div className={styles.options}>
        {themeOptions.map((option) => (
          <button
            key={option.value}
            onClick={() => setTheme(option.value)}
            className={`${styles.option} ${theme === option.value ? styles.active : ''}`}
            aria-label={`Switch to ${option.label} theme`}
          >
            <span className={styles.icon}>{option.icon}</span>
            <span className={styles.text}>{option.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

// Quick toggle for light/dark only
export function QuickThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <button 
      onClick={toggleTheme}
      className={styles.quickToggle}
      aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} theme`}
    >
      <span className={styles.icon}>
        {theme === 'light' ? '🌙' : '☀️'}
      </span>
    </button>
  );
}
```

```css
/* components/ThemeSelector/ThemeSelector.module.css */
.selector {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
}

.label {
  color: var(--text-medium);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
}

.options {
  display: flex;
  gap: var(--spacing-xs);
  padding: var(--spacing-xs);
  background-color: var(--bg-secondary);
  border-radius: var(--border-radius-md);
}

.option {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  padding: var(--spacing-sm);
  background: none;
  border: 1px solid transparent;
  border-radius: var(--border-radius-sm);
  cursor: pointer;
  transition: all var(--transition-fast);
  color: var(--text-medium);
}

.option:hover {
  background-color: var(--hover-bg);
  border-color: var(--border-color);
}

.option.active {
  background-color: var(--primary-color);
  color: var(--text-on-primary);
  border-color: var(--primary-color);
}

.quickToggle {
  background: none;
  border: 1px solid var(--border-color);
  border-radius: var(--border-radius-md);
  padding: var(--spacing-sm);
  cursor: pointer;
  transition: all var(--transition-fast);
}

.quickToggle:hover {
  background-color: var(--hover-bg);
  border-color: var(--border-color-hover);
}

.quickToggle .icon {
  font-size: var(--font-size-lg);
  display: block;
}
```

### Theme Usage Guidelines

**🌅 Light Theme** - Default mode
- **Use for**: General application use, daytime work
- **Best for**: High contrast reading, detailed data entry  
- **Characteristics**: Clean, bright, maximum readability

**🌙 Dark Theme** - Low-light mode
- **Use for**: Low-light environments, extended screen time
- **Best for**: Reducing eye strain, focus-intensive work
- **Characteristics**: Reduced blue light, easier on eyes

**💼 Business Theme** - Professional presentations
- **Use for**: Client presentations, executive dashboards, formal reports
- **Best for**: Professional meetings, stakeholder demos, business reviews
- **Characteristics**: Corporate aesthetics, trust-building colors, minimal distractions

```typescript
// Automatic theme suggestions based on context
export function getRecommendedTheme(context: 'presentation' | 'work' | 'evening'): Theme {
  switch (context) {
    case 'presentation':
      return 'business';
    case 'evening':
      return 'dark';
    default:
      return 'light';
  }
}

// Business theme usage patterns
export const businessThemeUsage = {
  // Executive dashboard cards
  dashboard: 'Clean cards with subtle shadows, professional blue accents',
  
  // Data presentation
  analytics: 'High contrast charts, dark blue primary, dark green success indicators',
  
  // Forms and inputs
  forms: 'Crisp borders, professional focus states, clear validation',
  
  // Navigation
  navigation: 'Muted backgrounds, clear hierarchy, professional spacing'
};
```

---

## 🧩 Component Library Standards

### Button Component

```typescript
// components/ui/Button/Button.tsx
import { ButtonHTMLAttributes } from 'react';
import styles from './Button.module.css';
import { classNames } from '@/lib/utils/classNames';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  fullWidth?: boolean;
}

export default function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  fullWidth = false,
  children,
  className,
  disabled,
  ...props
}: ButtonProps) {
  return (
    <button
      className={classNames(
        styles.button,
        styles[variant],
        styles[size],
        fullWidth && styles.fullWidth,
        loading && styles.loading,
        className
      )}
      disabled={disabled || loading}
      {...props}
    >
      {loading && <span className={styles.spinner} />}
      <span className={styles.content}>{children}</span>
    </button>
  );
}
```

```css
/* components/ui/Button/Button.module.css */
.button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-sm);
  border: 1px solid transparent;
  border-radius: var(--border-radius-md);
  font-family: var(--font-family-base);
  font-weight: var(--font-weight-medium);
  text-decoration: none;
  cursor: pointer;
  transition: all var(--transition-fast);
  position: relative;
}

.button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* Variants */
.primary {
  background-color: var(--primary-color);
  color: var(--text-on-primary);
  border-color: var(--primary-color);
}

.primary:hover:not(:disabled) {
  background-color: var(--primary-dark);
  border-color: var(--primary-dark);
}

.secondary {
  background-color: transparent;
  color: var(--primary-color);
  border-color: var(--primary-color);
}

.secondary:hover:not(:disabled) {
  background-color: var(--primary-color);
  color: var(--text-on-primary);
}

.danger {
  background-color: var(--danger-color);
  color: var(--text-on-primary);
  border-color: var(--danger-color);
}

.ghost {
  background-color: transparent;
  color: var(--text-dark);
  border-color: transparent;
}

.ghost:hover:not(:disabled) {
  background-color: var(--bg-light);
}

/* Sizes */
.sm {
  padding: var(--spacing-xs) var(--spacing-sm);
  font-size: var(--font-size-sm);
  min-height: 32px;
}

.md {
  padding: var(--spacing-sm) var(--spacing-md);
  font-size: var(--font-size-base);
  min-height: 40px;
}

.lg {
  padding: var(--spacing-md) var(--spacing-lg);
  font-size: var(--font-size-lg);
  min-height: 48px;
}

/* Modifiers */
.fullWidth {
  width: 100%;
}

.loading .content {
  opacity: 0;
}

.spinner {
  position: absolute;
  width: 16px;
  height: 16px;
  border: 2px solid transparent;
  border-top: 2px solid currentColor;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
```

---

## ✅ Quality Assurance & Testing

### CSS Modules Compliance Check

```bash
#!/bin/bash
# scripts/check-css-compliance.sh

echo "🔍 Checking CSS Modules compliance..."

# Check for inline styles
INLINE_STYLES=$(grep -r "style={{" src/ --include="*.tsx" --include="*.jsx" | wc -l)
if [ $INLINE_STYLES -gt 0 ]; then
    echo "❌ Found $INLINE_STYLES inline style usage(s)"
    grep -r "style={{" src/ --include="*.tsx" --include="*.jsx"
    exit 1
fi

# Check for JSX styles
JSX_STYLES=$(grep -r "<style jsx>" src/ --include="*.tsx" --include="*.jsx" | wc -l)
if [ $JSX_STYLES -gt 0 ]; then
    echo "❌ Found $JSX_STYLES JSX style usage(s)"
    grep -r "<style jsx>" src/ --include="*.tsx" --include="*.jsx"
    exit 1
fi

# Check for missing CSS modules
COMPONENTS_WITHOUT_STYLES=$(find src/components -name "*.tsx" -not -path "*/ui/*" | while read file; do
    dir=$(dirname "$file")
    basename=$(basename "$file" .tsx)
    if [ ! -f "$dir/$basename.module.css" ]; then
        echo "$file"
    fi
done | wc -l)

if [ $COMPONENTS_WITHOUT_STYLES -gt 0 ]; then
    echo "⚠️  Found $COMPONENTS_WITHOUT_STYLES component(s) without CSS modules"
fi

echo "✅ CSS Modules compliance check completed"
```

### Automated Styling Tests

```typescript
// __tests__/styling/css-variables.test.ts
import { validateCSSVariables, getCSSVariable } from '@/lib/utils/styleUtils';

describe('CSS Variables', () => {
  beforeEach(() => {
    // Reset DOM
    document.head.innerHTML = '';
    document.body.innerHTML = '';
  });

  test('validates CSS variables are loaded', () => {
    // Mock CSS variables
    const style = document.createElement('style');
    style.textContent = ':root { --primary-color: #0d6efd; }';
    document.head.appendChild(style);

    expect(validateCSSVariables()).toBe(true);
  });

  test('gets CSS variable value', () => {
    const style = document.createElement('style');
    style.textContent = ':root { --test-color: #ff0000; }';
    document.head.appendChild(style);

    const value = getCSSVariable('--test-color', '#000000');
    expect(value).toBe('#ff0000');
  });

  test('returns fallback when variable not found', () => {
    const value = getCSSVariable('--nonexistent-var', '#fallback');
    expect(value).toBe('#fallback');
  });
});
```

### Theme Testing

```typescript
// __tests__/styling/theme.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { ThemeProvider } from '@/components/ThemeProvider/ThemeProvider';
import ThemeToggle from '@/components/ThemeToggle/ThemeToggle';

describe('Theme System', () => {
  test('applies theme class to document', () => {
    render(
      <ThemeProvider>
        <ThemeToggle />
      </ThemeProvider>
    );

    expect(document.documentElement.className).toContain('theme-');
  });

  test('toggles between light and dark themes', () => {
    render(
      <ThemeProvider>
        <ThemeToggle />
      </ThemeProvider>
    );

    const toggle = screen.getByRole('button');
    
    // Should start with light theme
    expect(document.documentElement.className).toBe('theme-light');
    
    // Toggle to dark
    fireEvent.click(toggle);
    expect(document.documentElement.className).toBe('theme-dark');
    
    // Toggle back to light
    fireEvent.click(toggle);
    expect(document.documentElement.className).toBe('theme-light');
  });
});
```

---

## 📋 Styling Checklist

### Before Committing

- [ ] All components use CSS Modules (no inline styles)
- [ ] CSS variables used for colors, spacing, and typography
- [ ] Responsive design implemented for all breakpoints
- [ ] Theme compatibility tested (light/dark)
- [ ] CSS Modules compliance check passes
- [ ] No hardcoded values (use design tokens)
- [ ] Accessibility considerations addressed

### Code Review Standards

- [ ] CSS class names are semantic and clear
- [ ] No duplicate styles across components
- [ ] Proper use of CSS variables and design tokens
- [ ] Responsive design implementation
- [ ] Theme support verified
- [ ] Performance impact considered

---

This comprehensive styling guide ensures consistent, maintainable, and performant styling across all Next.js applications.

**Last Updated**: December 2024  
**Next Review**: March 2025  
**Maintained By**: Development Team 
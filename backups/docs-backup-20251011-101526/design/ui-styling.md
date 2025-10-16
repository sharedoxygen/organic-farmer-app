# OFMS UI & Styling

**Design system and styling guide for OFMS frontend development.**

*Consolidates: STYLING_GUIDE.md (trimmed) + CSS sections from other guides*

---

## 🎨 **Design System Overview**

### **Core Design Principles**
- **Consistency**: Unified visual language across all components
- **Scalability**: Maintainable styles that grow with the system
- **Accessibility**: WCAG 2.1 AA compliance
- **Performance**: Optimized CSS delivery and minimal bundle size

### **Technology Stack**
- **CSS Modules**: Component-scoped styling
- **CSS Variables**: Dynamic theming and consistency
- **PostCSS**: Modern CSS processing
- **Responsive Design**: Mobile-first approach

---

## 🛡️ **CSS Modules Standards**

### **🚨 CRITICAL: File Purpose Rules**

| File Type | Purpose | Allowed Syntax |
|-----------|---------|----------------|
| `globals.css` | Global styles, themes, resets | All CSS syntax |
| `Component.module.css` | Component-specific styles | Local classes only |
| `utilities.css` | Utility classes | Global utility classes |

### **❌ NEVER in .module.css Files**

```css
/* PROHIBITED in Component.module.css */
:global(.className) { ... }
html.theme-dark { ... }
body { ... }
* { ... }
:global(*) { ... }
```

### **✅ ALWAYS in globals.css for Global Styles**

```css
/* CORRECT in globals.css */
html.theme-dark {
  --primary-color: #60a5fa;
  --bg-primary: #0f172a;
}

body {
  font-family: var(--font-family-base);
  line-height: var(--line-height-base);
}

.theme-transitioning * {
  transition: all var(--transition-fast);
}
```

### **Proper CSS Modules Usage**

```typescript
// ✅ CORRECT: Component with CSS Modules
import styles from './UserCard.module.css';

export default function UserCard({ user }) {
  return (
    <div className={styles.container}>
      <h3 className={styles.title}>{user.name}</h3>
      <p className={styles.email}>{user.email}</p>
      <div className={styles.actions}>
        <button className={styles.editButton}>Edit</button>
        <button className={styles.deleteButton}>Delete</button>
      </div>
    </div>
  );
}
```

```css
/* UserCard.module.css */
.container {
  background: var(--card-bg);
  border: 1px solid var(--border-color);
  border-radius: var(--border-radius-lg);
  padding: var(--spacing-lg);
}

.title {
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-semibold);
  color: var(--text-dark);
  margin: 0 0 var(--spacing-sm) 0;
}

.email {
  color: var(--text-medium);
  margin: 0 0 var(--spacing-md) 0;
}

.actions {
  display: flex;
  gap: var(--spacing-sm);
}

.editButton {
  background: var(--primary-color);
  color: white;
  border: none;
  padding: var(--spacing-sm) var(--spacing-md);
  border-radius: var(--border-radius-md);
  cursor: pointer;
}

.deleteButton {
  background: var(--danger-color);
  color: white;
  border: none;
  padding: var(--spacing-sm) var(--spacing-md);
  border-radius: var(--border-radius-md);
  cursor: pointer;
}
```

---

## 🎯 **Design System Variables**

### **Color System**

```css
/* globals.css - Color Variables */
:root {
  /* Primary Colors */
  --primary-color: #3b82f6;
  --primary-hover: #2563eb;
  --primary-light: #dbeafe;
  --primary-dark: #1e40af;
  
  /* Secondary Colors */
  --secondary-color: #6b7280;
  --secondary-hover: #4b5563;
  --secondary-light: #f3f4f6;
  --secondary-dark: #374151;
  
  /* Status Colors */
  --success-color: #10b981;
  --warning-color: #f59e0b;
  --danger-color: #ef4444;
  --info-color: #3b82f6;
  
  /* Background Colors */
  --bg-primary: #ffffff;
  --bg-secondary: #f8fafc;
  --bg-tertiary: #f1f5f9;
  --bg-overlay: rgba(0, 0, 0, 0.5);
  
  /* Text Colors */
  --text-primary: #0f172a;
  --text-secondary: #475569;
  --text-tertiary: #64748b;
  --text-muted: #94a3b8;
  --text-inverse: #ffffff;
  
  /* Border Colors */
  --border-color: #e2e8f0;
  --border-focus: #3b82f6;
  --border-error: #ef4444;
  
  /* Card Colors */
  --card-bg: #ffffff;
  --card-border: #e2e8f0;
  --card-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);
}

/* Dark Theme */
html.theme-dark {
  --primary-color: #60a5fa;
  --bg-primary: #0f172a;
  --bg-secondary: #1e293b;
  --bg-tertiary: #334155;
  --text-primary: #f8fafc;
  --text-secondary: #cbd5e1;
  --text-tertiary: #94a3b8;
  --card-bg: #1e293b;
  --card-border: #334155;
  --border-color: #475569;
}
```

### **Typography System**

```css
/* globals.css - Typography Variables */
:root {
  /* Font Families */
  --font-family-base: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  --font-family-mono: 'SF Mono', Monaco, 'Cascadia Code', 'Roboto Mono', Consolas, 'Courier New', monospace;
  
  /* Font Sizes */
  --font-size-xs: 0.75rem;    /* 12px */
  --font-size-sm: 0.875rem;   /* 14px */
  --font-size-base: 1rem;     /* 16px */
  --font-size-lg: 1.125rem;   /* 18px */
  --font-size-xl: 1.25rem;    /* 20px */
  --font-size-2xl: 1.5rem;    /* 24px */
  --font-size-3xl: 1.875rem;  /* 30px */
  --font-size-4xl: 2.25rem;   /* 36px */
  
  /* Font Weights */
  --font-weight-light: 300;
  --font-weight-normal: 400;
  --font-weight-medium: 500;
  --font-weight-semibold: 600;
  --font-weight-bold: 700;
  
  /* Line Heights */
  --line-height-tight: 1.25;
  --line-height-base: 1.5;
  --line-height-relaxed: 1.75;
  
  /* Letter Spacing */
  --letter-spacing-tight: -0.025em;
  --letter-spacing-normal: 0;
  --letter-spacing-wide: 0.025em;
}
```

### **Spacing System**

```css
/* globals.css - Spacing Variables */
:root {
  --spacing-0: 0;
  --spacing-1: 0.25rem;   /* 4px */
  --spacing-2: 0.5rem;    /* 8px */
  --spacing-3: 0.75rem;   /* 12px */
  --spacing-4: 1rem;      /* 16px */
  --spacing-5: 1.25rem;   /* 20px */
  --spacing-6: 1.5rem;    /* 24px */
  --spacing-8: 2rem;      /* 32px */
  --spacing-10: 2.5rem;   /* 40px */
  --spacing-12: 3rem;     /* 48px */
  --spacing-16: 4rem;     /* 64px */
  --spacing-20: 5rem;     /* 80px */
  --spacing-24: 6rem;     /* 96px */
  
  /* Semantic Spacing */
  --spacing-xs: var(--spacing-2);
  --spacing-sm: var(--spacing-3);
  --spacing-md: var(--spacing-4);
  --spacing-lg: var(--spacing-6);
  --spacing-xl: var(--spacing-8);
  --spacing-2xl: var(--spacing-12);
}
```

### **Layout & Effects**

```css
/* globals.css - Layout Variables */
:root {
  /* Border Radius */
  --border-radius-none: 0;
  --border-radius-sm: 0.125rem;
  --border-radius-md: 0.375rem;
  --border-radius-lg: 0.5rem;
  --border-radius-xl: 0.75rem;
  --border-radius-2xl: 1rem;
  --border-radius-full: 9999px;
  
  /* Shadows */
  --shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
  --shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  --shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
  --shadow-xl: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
  
  /* Transitions */
  --transition-fast: 150ms ease-in-out;
  --transition-base: 250ms ease-in-out;
  --transition-slow: 500ms ease-in-out;
  
  /* Z-Index */
  --z-dropdown: 1000;
  --z-sticky: 1020;
  --z-fixed: 1030;
  --z-modal: 1040;
  --z-tooltip: 1070;
  
  /* Layout */
  --container-max-width: 1200px;
  --content-max-width: 1024px;
  --header-height: 4rem;
  --sidebar-width: 16rem;
}
```

---

## 🧩 **Component Patterns**

### **Standard Card Component**

```typescript
// components/ui/Card/Card.tsx
import { ReactNode } from 'react';
import styles from './Card.module.css';

interface CardProps {
  children: ReactNode;
  className?: string;
  variant?: 'default' | 'elevated' | 'outlined';
  padding?: 'sm' | 'md' | 'lg';
  onClick?: () => void;
}

export default function Card({ 
  children, 
  className = '', 
  variant = 'default',
  padding = 'md',
  onClick 
}: CardProps) {
  return (
    <div 
      className={`${styles.card} ${styles[variant]} ${styles[padding]} ${className}`}
      onClick={onClick}
    >
      {children}
    </div>
  );
}
```

```css
/* components/ui/Card/Card.module.css */
.card {
  background: var(--card-bg);
  border: 1px solid var(--card-border);
  border-radius: var(--border-radius-lg);
  transition: all var(--transition-base);
}

.default {
  box-shadow: var(--shadow-sm);
}

.elevated {
  box-shadow: var(--shadow-md);
}

.outlined {
  border: 2px solid var(--border-color);
  box-shadow: none;
}

.card:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-lg);
}

/* Padding variants */
.sm {
  padding: var(--spacing-sm);
}

.md {
  padding: var(--spacing-md);
}

.lg {
  padding: var(--spacing-lg);
}
```

### **Button Component System**

```typescript
// components/ui/Button/Button.tsx
import { ReactNode, ButtonHTMLAttributes } from 'react';
import styles from './Button.module.css';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  fullWidth?: boolean;
}

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  fullWidth = false,
  disabled,
  className = '',
  ...props
}: ButtonProps) {
  return (
    <button
      className={`
        ${styles.button}
        ${styles[variant]}
        ${styles[size]}
        ${fullWidth ? styles.fullWidth : ''}
        ${loading ? styles.loading : ''}
        ${className}
      `}
      disabled={disabled || loading}
      {...props}
    >
      {loading && <span className={styles.spinner} />}
      {children}
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
  gap: var(--spacing-2);
  font-family: var(--font-family-base);
  font-weight: var(--font-weight-medium);
  border: none;
  border-radius: var(--border-radius-md);
  cursor: pointer;
  transition: all var(--transition-fast);
  text-decoration: none;
  position: relative;
  overflow: hidden;
}

.button:focus {
  outline: 2px solid var(--border-focus);
  outline-offset: 2px;
}

.button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* Variants */
.primary {
  background: var(--primary-color);
  color: white;
}

.primary:hover:not(:disabled) {
  background: var(--primary-hover);
}

.secondary {
  background: var(--secondary-color);
  color: white;
}

.secondary:hover:not(:disabled) {
  background: var(--secondary-hover);
}

.danger {
  background: var(--danger-color);
  color: white;
}

.danger:hover:not(:disabled) {
  background: #dc2626;
}

.ghost {
  background: transparent;
  color: var(--text-primary);
  border: 1px solid var(--border-color);
}

.ghost:hover:not(:disabled) {
  background: var(--bg-secondary);
}

/* Sizes */
.sm {
  padding: var(--spacing-2) var(--spacing-3);
  font-size: var(--font-size-sm);
}

.md {
  padding: var(--spacing-3) var(--spacing-4);
  font-size: var(--font-size-base);
}

.lg {
  padding: var(--spacing-4) var(--spacing-6);
  font-size: var(--font-size-lg);
}

.fullWidth {
  width: 100%;
}

.loading {
  color: transparent;
}

.spinner {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 16px;
  height: 16px;
  border: 2px solid transparent;
  border-top: 2px solid currentColor;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: translate(-50%, -50%) rotate(0deg); }
  100% { transform: translate(-50%, -50%) rotate(360deg); }
}
```

### **Form Components**

```typescript
// components/ui/FormField/FormField.tsx
import { ReactNode } from 'react';
import styles from './FormField.module.css';

interface FormFieldProps {
  label: string;
  children: ReactNode;
  error?: string;
  required?: boolean;
  helpText?: string;
  className?: string;
}

export default function FormField({
  label,
  children,
  error,
  required,
  helpText,
  className = ''
}: FormFieldProps) {
  return (
    <div className={`${styles.field} ${className}`}>
      <label className={styles.label}>
        {label}
        {required && <span className={styles.required}>*</span>}
      </label>
      
      <div className={styles.inputWrapper}>
        {children}
      </div>
      
      {error && (
        <p className={styles.error}>{error}</p>
      )}
      
      {helpText && !error && (
        <p className={styles.helpText}>{helpText}</p>
      )}
    </div>
  );
}
```

```css
/* components/ui/FormField/FormField.module.css */
.field {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-2);
}

.label {
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  color: var(--text-primary);
  display: flex;
  align-items: center;
  gap: var(--spacing-1);
}

.required {
  color: var(--danger-color);
}

.inputWrapper {
  position: relative;
}

.error {
  font-size: var(--font-size-sm);
  color: var(--danger-color);
  margin: 0;
}

.helpText {
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
  margin: 0;
}
```

---

## 📱 **Responsive Design**

### **Breakpoint System**

```css
/* globals.css - Responsive Breakpoints */
:root {
  --breakpoint-sm: 640px;
  --breakpoint-md: 768px;
  --breakpoint-lg: 1024px;
  --breakpoint-xl: 1280px;
  --breakpoint-2xl: 1536px;
}

/* Mobile First Media Queries */
@media (min-width: 640px) {
  /* sm: small screens */
}

@media (min-width: 768px) {
  /* md: medium screens */
}

@media (min-width: 1024px) {
  /* lg: large screens */
}

@media (min-width: 1280px) {
  /* xl: extra large screens */
}
```

### **Responsive Grid System**

```css
/* components/ui/Grid/Grid.module.css */
.grid {
  display: grid;
  gap: var(--spacing-4);
  grid-template-columns: 1fr;
}

/* Responsive columns */
@media (min-width: 640px) {
  .grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (min-width: 768px) {
  .grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

@media (min-width: 1024px) {
  .grid {
    grid-template-columns: repeat(4, 1fr);
  }
}

/* Responsive utilities */
.hideOnMobile {
  display: none;
}

@media (min-width: 768px) {
  .hideOnMobile {
    display: block;
  }
}

.showOnlyMobile {
  display: block;
}

@media (min-width: 768px) {
  .showOnlyMobile {
    display: none;
  }
}
```

---

## 🎨 **Theme System**

### **Theme Implementation**

```typescript
// components/ui/ThemeProvider/ThemeProvider.tsx
import { createContext, useContext, useEffect, useState } from 'react';

type Theme = 'light' | 'dark';

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>('light');

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') as Theme;
    if (savedTheme) {
      setThemeState(savedTheme);
    }
  }, []);

  useEffect(() => {
    document.documentElement.className = `theme-${theme}`;
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setThemeState(prev => prev === 'light' ? 'dark' : 'light');
  };

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
```

### **Theme Toggle Component**

```typescript
// components/ui/ThemeToggle/ThemeToggle.tsx
import { useTheme } from '../ThemeProvider/ThemeProvider';
import styles from './ThemeToggle.module.css';

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      className={styles.toggle}
      onClick={toggleTheme}
      aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} theme`}
    >
      <span className={styles.icon}>
        {theme === 'light' ? '🌙' : '☀️'}
      </span>
    </button>
  );
}
```

---

## 🎯 **Accessibility Standards**

### **WCAG 2.1 AA Compliance**

```css
/* globals.css - Accessibility Styles */
/* Focus indicators */
*:focus {
  outline: 2px solid var(--border-focus);
  outline-offset: 2px;
}

/* High contrast mode support */
@media (prefers-contrast: high) {
  :root {
    --border-color: #000000;
    --text-primary: #000000;
    --bg-primary: #ffffff;
  }
}

/* Reduced motion support */
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}

/* Screen reader only text */
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}

/* Skip links */
.skip-link {
  position: absolute;
  top: -40px;
  left: 6px;
  background: var(--bg-primary);
  color: var(--text-primary);
  padding: 8px;
  text-decoration: none;
  z-index: 100;
  border-radius: var(--border-radius-md);
}

.skip-link:focus {
  top: 6px;
}
```

### **Semantic HTML Patterns**

```typescript
// Accessible component example
export default function AccessibleCard({ title, description, actions }) {
  return (
    <article className={styles.card} role="article">
      <header className={styles.header}>
        <h2 className={styles.title}>{title}</h2>
      </header>
      
      <div className={styles.content}>
        <p className={styles.description}>{description}</p>
      </div>
      
      <footer className={styles.footer}>
        <nav className={styles.actions} role="navigation" aria-label="Card actions">
          {actions}
        </nav>
      </footer>
    </article>
  );
}
```

---

## 🔧 **Development Tools**

### **CSS Linting Configuration**

```json
// .stylelintrc.json
{
  "extends": ["stylelint-config-standard"],
  "rules": {
    "custom-property-pattern": "^[a-z][a-z0-9]*(-[a-z0-9]+)*$",
    "selector-class-pattern": "^[a-z][a-zA-Z0-9]*$",
    "declaration-property-value-blacklist": {
      "/^color$/": ["/^#[0-9a-f]{3,6}$/i"]
    }
  }
}
```

### **VS Code Settings**

```json
// .vscode/settings.json
{
  "css.validate": false,
  "scss.validate": false,
  "stylelint.validate": ["css", "scss"],
  "editor.codeActionsOnSave": {
    "source.fixAll.stylelint": true
  }
}
```

---

## 📋 **Style Guide Checklist**

### **Component Development**
- [ ] Uses CSS Modules for component-specific styles
- [ ] Implements design system variables
- [ ] Follows responsive design patterns
- [ ] Includes accessibility features
- [ ] Supports theme switching
- [ ] Uses semantic HTML structure

### **CSS Quality**
- [ ] No hardcoded colors or spacing
- [ ] Consistent naming conventions
- [ ] Mobile-first responsive design
- [ ] Proper focus indicators
- [ ] Reduced motion support
- [ ] High contrast mode support

### **Performance**
- [ ] Minimal CSS bundle size
- [ ] Efficient selectors
- [ ] Optimized animations
- [ ] Lazy loading for non-critical styles

---

**This UI & styling guide ensures consistent, accessible, and maintainable design implementation across all OFMS components.**

**Focus**: CSS Modules standards, design system consistency, accessibility compliance  
**Coverage**: Complete design system with practical implementation patterns  
**Status**: Active UI Guide (January 2025) 
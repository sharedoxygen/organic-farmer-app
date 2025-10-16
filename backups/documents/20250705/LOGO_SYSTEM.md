# OFMS Logo System Documentation

## Overview

The Organic Farmer Management System (OFMS) logo system includes three main components designed for different use cases and display sizes.

## Logo Components

### 1. Full Logo (`/public/logo.svg`)
- **Size**: 200x60px
- **Usage**: Main website header, documents, presentations
- **Features**: Full "OFMS" text with "Organic Farmer Management" subtitle
- **Components**: 
  - Organic farming icon (plants and soil)
  - "OFMS" primary text
  - "Organic Farmer Management" subtitle
  - Modern accent elements and tech dots

### 2. Logo Icon (`/public/logo-icon.svg`)
- **Size**: 64x64px
- **Usage**: App icons, social media profiles, small spaces
- **Features**: Organic farming icon only, no text
- **Components**:
  - Centered organic farming elements
  - Clean circular background
  - Tech accent dots in corners

### 3. Favicon (`/public/favicon.svg`)
- **Size**: 32x32px
- **Usage**: Browser tabs, bookmarks, PWA icons
- **Features**: Simplified organic farming icon
- **Components**:
  - Minimal organic farming elements
  - Optimized for small display sizes

## Color Palette

### Primary Colors
- **Primary Green**: `#22C55E` - Main brand color
- **Dark Green**: `#16A34A` - Stems and structural elements
- **Light Green**: `#4ADE80` - Highlights and leaves
- **Background Green**: `#E8F5E8` - Subtle background tint

### Neutral Colors
- **Text Dark**: `#1F2937` - Primary text
- **Text Light**: `#6B7280` - Secondary text
- **Soil Brown**: `#8B4513` - Organic soil representation

## Design Principles

### Organic & Natural
- Represents growth, sustainability, and organic farming
- Natural plant forms with modern, clean execution
- Earth tones (green, brown) connected to agriculture

### Professional & Modern
- Clean typography with Inter font family
- Geometric precision balanced with organic shapes
- Tech elements (dots) suggest modern farming technology

### Scalable & Versatile
- Works across all sizes from favicon to large displays
- Maintains clarity and recognition at any scale
- Adaptable to different contexts and applications

## Usage Guidelines

### Do's
- ✅ Use official color palette
- ✅ Maintain proper proportions
- ✅ Ensure adequate white space around logo
- ✅ Use appropriate version for context (full, icon, favicon)

### Don'ts
- ❌ Don't modify colors or proportions
- ❌ Don't add effects or distortions
- ❌ Don't use on backgrounds that reduce readability
- ❌ Don't recreate or approximate the logo

## Technical Specifications

### File Formats
- **SVG**: Vector format for web and print
- **Scalable**: Maintains quality at any size
- **Web Optimized**: Small file sizes for fast loading

### Implementation
```html
<!-- Full Logo -->
<img src="/logo.svg" alt="OFMS - Organic Farmer Management System" />

<!-- Icon Only -->
<img src="/logo-icon.svg" alt="OFMS Icon" />

<!-- Favicon -->
<link rel="icon" href="/favicon.svg" type="image/svg+xml" />
```

### CSS Integration
```css
.logo {
  height: 60px;
  width: auto;
}

.logo-icon {
  height: 32px;
  width: 32px;
}
```

---

**The OFMS logo system provides a complete, professional branding solution for the Organic Farmer Management System across all platforms and use cases.** 
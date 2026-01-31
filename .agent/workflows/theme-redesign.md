---
description: Theme Redesign - Professional Color Palette & Light/Dark Mode Toggle
---

# Theme Redesign Implementation Plan

## Overview
Transform the INIT Club website with a professional color palette and add an interactive octopus-themed light/dark mode toggle.

## Implementation Steps

### Phase 1: Planning & Design
- [x] Analyze current color system
- [ ] Define professional color palettes (dark & light themes)
- [ ] Design octopus toggle button concept

### Phase 2: Core Theme System
- [ ] **Step 1**: Update CSS variables in `index.css` with new professional color palettes
  - Define dark theme colors
  - Define light theme colors
  - Add theme transition animations
  
- [ ] **Step 2**: Create theme context/provider for React
  - Create `src/context/ThemeContext.tsx`
  - Implement theme state management
  - Add localStorage persistence

### Phase 3: Octopus Toggle Component
- [ ] **Step 3**: Generate octopus SVG/image assets
  - Create dark mode octopus
  - Create light mode octopus
  - Ensure smooth animation between states

- [ ] **Step 4**: Build OctopusThemeToggle component
  - Create `src/components/OctopusThemeToggle.tsx`
  - Add interactive animations
  - Position strategically (fixed position)

### Phase 4: Integration
- [ ] **Step 5**: Integrate theme provider in App.tsx
  - Wrap app with ThemeProvider
  - Apply theme class to root element

- [ ] **Step 6**: Update Navbar to include theme toggle
  - Add octopus toggle to navbar
  - Ensure responsive positioning

### Phase 5: Component Updates
- [ ] **Step 7**: Update all components to use CSS variables
  - Ensure all hardcoded colors use var(--color-name)
  - Test each component in both themes

- [ ] **Step 8**: Update graph colors for both themes
  - Adjust GitGraph component colors
  - Ensure visibility in both modes

### Phase 6: Testing & Polish
- [ ] **Step 9**: Test all pages in both themes
  - Home page
  - About page
  - Contact page
  - Coming soon pages
  - 404 page

- [ ] **Step 10**: Final polish & accessibility
  - Ensure proper contrast ratios
  - Add ARIA labels
  - Test animations
  - Verify localStorage persistence

## Professional Color Palette Proposal

### Dark Theme (Default)
- **Background**: Deep Navy/Charcoal (#0a0e27, #1a1f3a)
- **Surface**: Slate (#1e293b, #2d3748)
- **Primary**: Professional Blue (#3b82f6, #60a5fa)
- **Secondary**: Teal/Cyan (#06b6d4, #22d3ee)
- **Accent**: Amber (#f59e0b, #fbbf24)
- **Text**: Off-white (#f8fafc, #e2e8f0)
- **Muted**: Gray (#94a3b8, #64748b)

### Light Theme
- **Background**: Clean White/Light Gray (#ffffff, #f8fafc)
- **Surface**: Light Slate (#f1f5f9, #e2e8f0)
- **Primary**: Deep Blue (#1e40af, #2563eb)
- **Secondary**: Teal (#0891b2, #0e7490)
- **Accent**: Orange (#ea580c, #f97316)
- **Text**: Dark Slate (#0f172a, #1e293b)
- **Muted**: Gray (#64748b, #475569)

## Notes
- All changes centralized in `index.css`
- No structural changes to existing components
- Smooth transitions between themes (300ms)
- Octopus button will be playful yet professional

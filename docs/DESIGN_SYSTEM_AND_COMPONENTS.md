# Design System and Components Documentation

This document provides an exhaustive technical specification of the design tokens, visual aesthetics, typography, animation patterns, component primitives, modal dialogs, and card patterns for the **Init-Website** codebase.

---

## 1. Design Tokens: Obsidian Dark Palette and Typography

### Palette Tokens (Obsidian Dark System)
The Init-Website design system is built exclusively for dark mode, using an "Obsidian Apple" aesthetic with slate-black background surfaces, neon cyan and purple accents, glassmorphic overlays, and high-contrast text typography.

Tokens are specified in [`src/styles/index.css`](file:///C:/My-Files/Github/Init-Website/src/styles/index.css) as CSS custom variables and standard Tailwind extensions in [`tailwind.config.js`](file:///C:/My-Files/Github/Init-Website/tailwind.config.js).

#### Primary Brand Colors

| Token | CSS Variable / Tailwind | Hex / OKLCH Representation | Usage & Context |
| :--- | :--- | :--- | :--- |
| `background` | `var(--bg)` / `bg-background` | `#09090b` / `oklch(0.098 0 0)` | Primary page background (Slate Obsidian Black) |
| `text` / `foreground` | `var(--text)` / `text-foreground` | `#ffffff` / `oklch(0.985 0 0)` | Primary body text and headings |
| `accent` / `primary` | `var(--accent)` / `text-accent` | `#00ffd5` / `oklch(0.88 0.17 179)` | Core brand cyan accent, neon glows, focus rings |
| `glass-bg` | `var(--glass-bg)` | `rgba(9, 9, 11, 0.5)` | Glassmorphism container background |
| `glass-border` | `var(--glass-border)` | `#18181b` | Zinc-900 subtle border for cards and panels |
| `card-hover` | `var(--card-hover)` | `rgba(255, 255, 255, 0.03)` | Subtle surface highlight on card hover |
| `muted` | `var(--muted)` / `text-muted` | `#a1a1aa` | Zinc-400 secondary text and subheadings |
| `grid-color` | `var(--grid-color)` | `#ffffff` | Color source for SVG background grid lines |

#### Domain Specific Color Tokens
The application assigns distinct color identity tokens to domain graphs and navigation sections:

| Token Variable | Hex Color | Associated Domain |
| :--- | :--- | :--- |
| `--color-about` | `#facc15` (Yellow-400) | About Us & Team |
| `--color-projects` | `#00ffd5` (Cyan-400) | Idea Wall & Repositories |
| `--color-events` | `#ff3366` (Rose-500) | Events & Attendance |
| `--color-blogs` | `#a855f7` (Purple-500) | Community Blogs |
| `--color-contact` | `#2979ff` (Blue-500) | Contact & Onboarding |

#### Shadcn UI / Radix OKLCH Semantic Tokens
To support Shadcn component primitives, CSS raw channels are defined inside `@layer base` in `index.css`:

```css
:root {
  --background: 0.098 0 0;
  --foreground: 0.985 0 0;
  --card: 0.13 0 0;
  --card-foreground: 0.985 0 0;
  --popover: 0.14 0 0;
  --popover-foreground: 0.9 0 0;
  --primary: 0.88 0.17 179;
  --primary-foreground: 0.098 0 0;
  --secondary: 0.2 0 0;
  --secondary-foreground: 0.85 0 0;
  --muted: 0.17 0 0;
  --muted-foreground: 0.63 0 0;
  --accent: 0.2 0 0;
  --accent-foreground: 0.985 0 0;
  --destructive: 0.577 0.245 27.325;
  --destructive-foreground: 0.985 0 0;
  --border: 0.27 0 0;
  --input: 0.2 0 0;
  --ring: 0.88 0.17 179;
  --radius: 0.75rem;
}
```

### Typography System
Typography is powered by Google Fonts and Fontsource packages imported in `src/styles/index.css`:

```css
@import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:ital,wght@0,100..800;1,100..800&family=Orbitron:wght@400..900&family=Space+Grotesk:wght@300..700&display=swap');
@import "@fontsource-variable/geist";
```

#### Font Families

1. **Heading Font (`Orbitron`)**:
   - Variable: `--font-heading: 'Orbitron', sans-serif`
   - Class: `font-heading`
   - Usage: Page titles, section headers, hero banners, and high-impact cyber displays.
2. **UI Font (`Space Grotesk`)**:
   - Variable: `--font-ui: 'Space Grotesk', sans-serif`
   - Class: `font-sans`
   - Usage: Primary body text, navigation items, buttons, form labels, and card titles.
3. **Monospace Font (`JetBrains Mono`)**:
   - Variable: `--font-mono: 'JetBrains Mono', monospace`
   - Class: `font-mono`
   - Usage: Code snippets, technical metadata, status indicators, badges, timestamps, and commit hashes.
4. **Variable Font (`Geist`)**:
   - Imported via `@fontsource-variable/geist` for dense UI elements and body text consistency.

---

## 2. Motion and Visual Effects

### Framer Motion Animation Patterns
The codebase leverages `framer-motion` for fluid, physics-based transitions across components.

#### Standard Card Entry & Hover Spring
```tsx
<motion.article
  initial={{ opacity: 0, y: 16 }}
  animate={{ opacity: 1, y: 0 }}
  whileHover={{ y: -3, scale: 1.012 }}
  transition={{ type: 'spring', stiffness: 350, damping: 30 }}
>
```

#### Modal Backdrop & Dialog Pop-in
```tsx
<AnimatePresence>
  {isOpen && (
    <motion.div
      initial={{ scale: 0.95, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0.95, opacity: 0 }}
      transition={{ type: 'spring', duration: 0.3 }}
    >
  )}
</AnimatePresence>
```

#### Keyframe Animations (`index.css` & `tailwind.config.js`)
- `powerOn`: Scale up animation simulating retro terminal display power ignition.
- `glowPulse`: Radial glow expansion keyframes.
- `scan`: Vertical scanline animation applied via `.animate-scan`.
- `scannerMove`: Horizontal translation (14s linear infinite) for laser scanner lines.
- `orb1` to `orb5`: Ambient background floating orb translation paths.
- `hueShift1` to `hueShift5`: 360-degree continuous color rotation keyframes.

### Lenis Smooth Scroll Integration
Smooth scrolling is handled by `@studio-freight/lenis` via [`SmoothScroll.tsx`](file:///C:/My-Files/Github/Init-Website/src/components/layout/SmoothScroll.tsx).

- **Provider setup**:
  ```tsx
  const instance = new Lenis({
    duration: 1.2,
    easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    touchMultiplier: 2,
    infinite: false,
  });
  ```
- **Animation Loop**: Driven by `requestAnimationFrame` and cleaned up on unmount.
- **Hook `useLenis()`**: Exposes the global Lenis instance across components. Modals (e.g., [`PdfModal.tsx`](file:///C:/My-Files/Github/Init-Website/src/components/shared/modals/PdfModal.tsx)) invoke `lenis.stop()` when opened to lock body scroll and `lenis.start()` when closed.

### FixedGrid SVG Background Scanner
The background grid system is rendered by [`FixedGrid.tsx`](file:///C:/My-Files/Github/Init-Website/src/components/layout/FixedGrid.tsx).

```tsx
export const FixedGrid = () => {
  return (
    <div className="fixed inset-0 w-full h-full pointer-events-none z-0">
      {/* SVG Matrix Pattern */}
      <svg className="absolute inset-0 w-full h-full" style={{ opacity: '0.05' }}>
        <defs>
          <pattern id="global-grid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="var(--grid-color)" strokeWidth="1" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#global-grid)" />
      </svg>

      {/* Dual Color Laser Scanner Beams */}
      <div
        className="absolute inset-0"
        style={{
          background: 'linear-gradient(120deg, transparent 48%, rgba(0,255,255,0.02) 50%, transparent 52%)',
          animation: 'scannerMove 14s linear infinite'
        }}
      />
      <div
        className="absolute inset-0"
        style={{
          background: 'linear-gradient(120deg, transparent 48%, rgba(168,85,247,0.018) 50%, transparent 52%)',
          animation: 'scannerMove 14s linear infinite',
          animationDelay: '2s'
        }}
      />
    </div>
  );
};
```

---

## 3. Component Primitives and Shared Modal Dialog System

### UI Component Primitives (`src/components/ui/`)

#### 1. Button Primitive ([`button.tsx`](file:///C:/My-Files/Github/Init-Website/src/components/ui/button.tsx))
Built using `class-variance-authority` (cva) and `@radix-ui/react-slot`.

- **Variants**:
  - `default`: Cyan primary fill with dark text (`bg-primary text-primary-foreground hover:bg-primary/80`).
  - `outline`: Dark glass outline border (`border-border bg-background hover:bg-muted`).
  - `secondary`: Subtle dark background (`bg-secondary text-secondary-foreground`).
  - `ghost`: Transparent backdrop (`hover:bg-muted hover:text-foreground`).
  - `destructive`: Red tint highlight (`bg-destructive/10 text-destructive hover:bg-destructive/20`).
  - `link`: Cyan text with hover underline.
- **Sizes**: `default` (h-8), `xs` (h-6), `sm` (h-7), `lg` (h-9), `icon` (size-8), `icon-xs`, `icon-sm`, `icon-lg`.

#### 2. Checkbox Primitive ([`checkbox.tsx`](file:///C:/My-Files/Github/Init-Website/src/components/ui/checkbox.tsx))
Built on `@radix-ui/react-checkbox`. Standard obsidian box with cyan check indicator.

#### 3. Radio Group Primitive ([`radio-group.tsx`](file:///C:/My-Files/Github/Init-Website/src/components/ui/radio-group.tsx))
Built on `@radix-ui/react-radio-group`. Provides customizable option selectors.

#### 4. Select Primitive ([`select.tsx`](file:///C:/My-Files/Github/Init-Website/src/components/ui/select.tsx))
Built on `@radix-ui/react-select`. Includes `SelectTrigger`, `SelectContent`, `SelectItem`, `SelectValue`, `SelectSeparator`, with dark obsidian backdrop and glass dropdown borders.

---

### Shared Modal Dialog System

```
                      ┌─────────────────────────────────┐
                      │   Shared Modal Dialog System    │
                      └────────────────┬────────────────┘
                                       │
      ┌────────────────────────────────┼────────────────────────────────┐
      ▼                                ▼                                ▼
[ConfirmModal]                [AccessDeniedModal]                  [PdfModal]
──────────────                ───────────────────                  ──────────
• Confirmation Actions        • GitHub Org Gate Keeper             • Task Sheet PDF Viewer
• Variants: danger, warning,  • Red Glow Shadow Effect             • Native Iframe Embed
  info                        • Force SignOut & Redirect           • Lenis Scroll Lock
• Loading Spinners            • High Z-Index (z-[60])              • PDF Download Trigger
```

#### 1. ConfirmModal ([`ConfirmModal.tsx`](file:///C:/My-Files/Github/Init-Website/src/components/shared/modals/ConfirmModal.tsx))
Reusable dialog for confirming actions (e.g., blog deletion, member role updates).

- **Props**:
  - `isOpen`: boolean
  - `title`: string
  - `message`: string
  - `confirmLabel`: string (default: `'Confirm'`)
  - `cancelLabel`: string (default: `'Cancel'`)
  - `onConfirm`: `() => void | Promise<void>`
  - `onClose`: `() => void`
  - `variant`: `'danger' | 'warning' | 'info'` (default: `'info'`)
  - `isLoading`: boolean
- **Visual Styling**: Dark backdrop `bg-black/90 backdrop-blur-sm`, variant-specific icon container and action button colors (danger: red, warning: yellow, info: white). Accessible `role="dialog"` with `aria-labelledby` and `aria-describedby`.

#### 2. AccessDeniedModal ([`AccessDeniedModal.tsx`](file:///C:/My-Files/Github/Init-Website/src/components/shared/modals/AccessDeniedModal.tsx))
High-priority modal (`z-[60]`) presented when a logged-in GitHub user does not belong to the `init-club` GitHub organization.

- **Visual Styling**: Intense red glowing container (`border-2 border-red-500/50 shadow-[0_0_50px_rgba(239,68,68,0.3)]`) with a pulsing background glow.
- **Action**: Triggers `supabase.auth.signOut()` and closes the modal, redirecting the user back to the homepage.

#### 3. PdfModal ([`PdfModal.tsx`](file:///C:/My-Files/Github/Init-Website/src/components/shared/modals/PdfModal.tsx))
Full-screen modal for previewing and downloading the Init Club Induction Task Sheet PDF document.

- **Scroll Management**: Integrates with `useLenis()` to freeze page scrolling while open.
- **Header Actions**: Direct download anchor tag linking to `pdfUrl` and close button.
- **Viewer**: Native browser `<iframe>` rendering the target PDF URL.

---

## 4. Card Component Patterns

### 1. BlogCard Pattern
- **File**: [`src/components/blogs/BlogCard.tsx`](file:///C:/My-Files/Github/Init-Website/src/components/blogs/BlogCard.tsx)
- **Visual Structure**:
  - **Cover Header**: If `cover_image_url` exists, renders image with scale zoom on hover (`group-hover:scale-[1.03]`). If missing, renders a gradient header with an oversized semi-transparent title initial character.
  - **Tag Badges**: Displays up to 3 tags as rounded purple pills (`bg-[rgba(168,85,247,0.12)] text-purple-400 border-purple-500/20`) with a tag icon.
  - **Title & Excerpt**: Title restricted to 2 lines (`line-clamp-2`), excerpt trimmed to 150 characters.
  - **Footer Metadata**: Displays author name (with cyan user icon) and formatted publication date.
  - **Shimmer Effect**: Subtle hover gradient shimmer (`from-purple-500/4 via-transparent to-cyan-500/4`).

### 2. ProjectCard Pattern
- **File**: [`src/components/projects/ProjectCard.tsx`](file:///C:/My-Files/Github/Init-Website/src/components/projects/ProjectCard.tsx)
- **Visual Structure**:
  - **Header Bar**: Status pill with pulsing dot (`idea`, `in_progress`, `completed`, `maintenance`) and difficulty badge (`beginner`: emerald, `intermediate`: yellow, `advanced`: rose).
  - **Title & Description**: Monospace project name with line-clamped description.
  - **Topic Badges**: Cyan topic pills (`bg-[rgba(0,255,213,0.08)] text-cyan-400`).
  - **GitHub Stats**: Star count (`Star` icon) and fork count (`GitFork` icon) alongside primary programming language indicator.
  - **Actions**: "View Details" button with gradient outline, GitHub repository link, and live demo link.

### 3. GraveyardCard Pattern
- **File**: [`src/components/projects/GraveyardCard.tsx`](file:///C:/My-Files/Github/Init-Website/src/components/projects/GraveyardCard.tsx)
- **Visual Structure**:
  - **Header Bar**: Features an oversized background archive ghost icon (`Archive`) and optional "Revivable" badge (`RefreshCw` icon).
  - **Archival Callout Box**: Dedicated dark section (`bg-zinc-900/60 border-zinc-800/50`) rendering `Why Archived` explanation (`archival_reason`).
  - **Metadata**: Last active timestamp (`pushed_at`) and direct link to archived GitHub code.

### 4. TeamSection Cards Pattern
- **File**: [`src/components/About/TeamSection.tsx`](file:///C:/My-Files/Github/Init-Website/src/components/About/TeamSection.tsx)
- **Visual Structure**:
  - **Tier Configurations**:
    - `sudo`: Golden yellow glow (`#facc15`), `#eab308` border, `#facc15` badge.
    - `maintainer`: Cyan glow (`#00ffd5`), `#06b6d4` border, `#00ffd5` badge.
    - `orchestrator`: Purple glow (`#a855f7`), `#9333ea` border, `#a855f7` badge.
  - **Avatar & Social Layer**: Round profile avatar with tier border ring, role label, and social icons (GitHub, LinkedIn, Instagram). Clicking triggers `ImageLightbox` modal displaying personnel file records.

### 5. ParallaxCard 3D Tilt Effect
- **File**: [`src/components/shared/effects/ParallaxCard.tsx`](file:///C:/My-Files/Github/Init-Website/src/components/shared/effects/ParallaxCard.tsx)
- **Mathematical Tilt Calculation**:

```tsx
const handleMouseMove = (e: React.MouseEvent) => {
  if (!cardRef.current || !contentRef.current || !glowRef.current) return;

  const rect = cardRef.current.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;
  const midX = rect.width / 2;
  const midY = rect.height / 2;

  // Calculate rotation angles (max 12 degrees)
  const rotateY = ((x - midX) / midX) * 12;
  const rotateX = -((y - midY) / midY) * 12;

  // Apply 3D transform with perspective
  cardRef.current.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.05)`;
  contentRef.current.style.transform = `translateZ(60px)`;

  // Backlight parallax displacement
  const glowX = ((x - midX) / midX) * -25;
  const glowY = ((y - midY) / midY) * -25;
  glowRef.current.style.transform = `translate3d(${glowX}px, ${glowY}px, -50px)`;
};
```

- **Layer Breakdown**:
  1. **Volumetric Backlight Layer (`glowRef`)**: Placed at `translateZ(-50px)` with `blur-[40px]` gradient (`from-white/20 via-cyan-500/20 to-purple-500/20`) that shifts in opposition to tilt.
  2. **Glass Card Surface**: Dark backdrop (`bg-black/60 backdrop-blur-xl border-white/10`) with hover border color change (`group-hover:border-cyan-500/30`).
  3. **Floating Content Layer (`contentRef`)**: Lifted to `translateZ(60px)` during hover to create true 3D spatial depth. Mouse position drives radial spotlight gradient (`radial-gradient(600px circle at var(--mouse-x) var(--mouse-y), rgba(0,255,213,0.2), transparent 40%)`).

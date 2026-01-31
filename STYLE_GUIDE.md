# Wheel Spinner - Style Guide

This document captures the design decisions and conventions used throughout the Wheel Spinner application.

## Design Philosophy

Modern gradient aesthetic inspired by Spotify/Instagram with a dark charcoal background. The design emphasizes:
- Flat cards without shadows (shadows reserved for specific interactive elements)
- Subtle glassmorphism effects (`backdrop-blur-sm`, `bg-card/80`)
- Gradient brand accents on primary headings

## Colors

### Theme Tokens
All colors use CSS custom properties defined in `index.css`:
- `--background`: Dark charcoal base
- `--foreground`: Primary text color
- `--card`: Card background color
- `--border`: Standard border color (use `border-border` class)
- `--muted-foreground`: Secondary/tertiary text

### Brand Gradient
Used on page titles:
```css
background: linear-gradient(135deg, #A855F7, #EC4899, #0EA5E9);
```

### Status Colors
Use Tailwind utility classes directly:
- **Success/Equal**: `text-emerald-400`
- **Warning**: `text-amber-400` 
- **Info**: `text-blue-400`
- **Error**: `text-destructive`

### Role Badge Colors (Admin Dashboard)
- **Admin**: `bg-purple-500/20 text-purple-400`
- **Paid**: `bg-blue-500/20 text-blue-400`
- **Free**: `bg-gray-500/20 text-gray-400`

## Typography

### Hierarchy
| Element | Classes | Usage |
|---------|---------|-------|
| Page title (h1) | `text-xl font-bold tracking-tight` | Main page headers |
| Card title | `text-lg font-semibold` | CardTitle component |
| Section headers | `text-base font-medium` | Sub-sections |
| Body text | Default (no classes) | Regular content |
| Small text | `text-sm text-muted-foreground` | Metadata, labels |
| Tiny text | `text-xs text-muted-foreground` | Timestamps, hints |

### Brand Title Styling
Page titles use the gradient text effect:
```tsx
<h1 
  className="text-xl font-bold tracking-tight"
  style={{
    background: "linear-gradient(135deg, #A855F7, #EC4899, #0EA5E9)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
    backgroundClip: "text",
  }}
>
  Page Title
</h1>
```

## Spacing

### Standard Padding
- Card content: `p-4` or `CardContent` default
- Page margins: `p-4 sm:p-8`
- Header: `px-4 py-3`
- Section gaps: `gap-4` or `space-y-4`

### Consistent Gaps
- Button groups: `gap-1` to `gap-2`
- Form fields: `gap-2`
- Card grids: `gap-4`

## Borders

### Standard Border
Always use `border-border` for theme-adaptive borders:
```tsx
// Good
className="border-border"
className="border-b border-border"

// Bad - doesn't adapt to theme
className="border-white/10"
```

### Subtle Borders
For very subtle separators, use `border-border/50`:
```tsx
className="border-b border-border/50"
```

## Shadows

Shadows are used sparingly, only on:
1. **Spin wheel** - Drop shadow for 3D effect
2. **Spin button** - Elevated primary action
3. **Winner modal** - Floating dialog emphasis

Cards and panels do NOT have shadows - they use subtle borders and background opacity instead.

## Icon Buttons

All icon-only buttons use `size="icon"`:
```tsx
// Correct
<Button variant="ghost" size="icon">
  <Settings className="w-4 h-4" />
</Button>

// Incorrect - don't set custom dimensions
<Button variant="ghost" className="w-7 h-7">
  <Settings className="w-4 h-4" />
</Button>
```

Icon buttons get default `h-9 w-9` dimensions from the Button component.

## Cards

### Standard Card
```tsx
<Card className="border-border bg-card/80 backdrop-blur-sm">
```

### Card Structure
- `CardHeader`: Title and description
- `CardContent`: Main content
- CardTitle uses `text-lg font-semibold`

## Interactive States

### Hover Effects
Use theme-aware utilities:
```tsx
// Table rows
className="hover:bg-muted/50"

// Don't use opacity-based white overlays
className="hover:bg-white/5" // Bad
```

## Animations

### Wheel Spin
- Duration: 4-5 seconds with variance
- Easing: `cubic-bezier(0.0, 0.0, 0.2, 1)` (ease-out)
- Uses CSS transforms for smooth performance

### Transitions
Standard transition: `transition-all duration-300`

## Glassmorphism

Applied to cards and modals:
```tsx
className="bg-card/80 backdrop-blur-sm"
// or for modals
className="bg-card/95 backdrop-blur-xl"
```

## Responsive Design

### Breakpoints
- Mobile first approach
- `sm:` for tablet (640px+)
- `lg:` for desktop (1024px+)

### Wheel Sizing
- Default: `max-w-[340px] sm:max-w-[420px]`
- Presentation mode: `max-w-[500px] sm:max-w-[600px]`

## Component Patterns

### Form Inputs
Standard input styling with theme borders:
```tsx
<Input className="bg-background/50 border-border" />
```

### Buttons
Use built-in variants without custom hover states:
- `variant="default"` - Primary actions
- `variant="outline"` - Secondary actions
- `variant="ghost"` - Toolbar/icon actions
- `variant="destructive"` - Delete/danger actions

### Tooltips
Used for icon buttons to provide context:
```tsx
<Tooltip>
  <TooltipTrigger asChild>
    <Button variant="ghost" size="icon">
      <Icon />
    </Button>
  </TooltipTrigger>
  <TooltipContent>
    <p>Action description</p>
  </TooltipContent>
</Tooltip>
```

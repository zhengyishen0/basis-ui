# Basis UI

Beautiful, customizable Astro + Alpine.js components that you can copy and paste into your apps. Built for developers who want full control over their component code.

![Basis UI](https://img.shields.io/npm/v/@basisui/ui?style=flat&colorA=000000&colorB=000000)
![License](https://img.shields.io/github/license/zhengyishen0/basis-ui?style=flat&colorA=000000&colorB=000000)
![Downloads](https://img.shields.io/npm/dm/@basisui/ui?style=flat&colorA=000000&colorB=000000)

## Features

- 🎨 **59 Components** - Forms, layouts, navigation, overlays, and more
- 🚀 **Astro + Alpine.js** - Optimized for static-first with interactive islands
- 📋 **Copy & Paste** - Own your components, no black boxes
- 🎯 **Tailwind CSS** - Utility-first styling with CSS variables
- 🔧 **Customizable** - Easy to modify and extend
- 📱 **Responsive** - Mobile-first design patterns
- ♿ **Accessible** - Built with accessibility in mind

## Quick Start

### 1. Initialize your Astro project

```bash
npx @basisui/ui@latest init
```

This will:
- Install Alpine.js and required dependencies
- Set up Tailwind CSS with theme variables
- Create `components.json` configuration
- Add utility functions

### 2. Add components

```bash
# Add individual components
npx @basisui/ui add button card

# Add multiple components
npx @basisui/ui add accordion dialog table
```

### 3. Use in your Astro pages

```astro
---
import Button from '@/components/ui/button/Button.astro';
import Card from '@/components/ui/card/Card.astro';
---

<Card>
  <h2>Welcome to Basis UI</h2>
  <p>Beautiful components for your Astro project.</p>
  <Button variant="default">Get Started</Button>
</Card>
```

## Available Components

### Forms (8 components)
- `button` - Versatile button with variants and sizes
- `text-input` - Input field with validation
- `textarea` - Multi-line text input
- `checkbox` - Custom styled checkbox
- `radio-group` - Radio button groups
- `select` - Dropdown with search support
- `slider` - Range slider component
- `rating` - Star rating component

### Display (11 components)
- `card` - Flexible content container
- `accordion` - Collapsible content sections
- `avatar` - User avatar with fallbacks
- `calendar` - Interactive calendar
- `carousel` - Image and content carousel
- `code` - Syntax highlighted code
- `image` - Responsive image component
- `navbar` - Navigation bar
- `table-of-contents` - Auto-generated TOC
- `text` - Typography component
- `video-player` - Video player component

### Layout (12 components)
- `column` - Vertical layout
- `row` - Horizontal layout
- `page` - Main page container
- `grid` - CSS Grid layout
- `grid-items` - Grid item wrapper
- `list` - Vertical list layout
- `list-items` - List item wrapper
- `inline` - Inline layout
- `divider` - Visual separator
- `spacer` - Empty space component
- `section` - Content section
- `conditional` - Conditional rendering

### Navigation (4 families)
- `tabs` - Tabbed interface
- `breadcrumbs` - Navigation breadcrumb
- `pagination` - Page navigation
- `navigation-menu` - Hierarchical menu

### Overlay (10 families)
- `dialog` - Modal dialog
- `popup` - Floating popup
- `tooltip` - Contextual tooltip
- `hover-card` - Rich hover content
- `context-menu` - Right-click menu
- `dropdown-menu` - Dropdown menu
- `menubar` - Menu bar component
- `command` - Command palette
- `menu` - Generic menu system

### Feedback (8 components)
- `alert` - Alert messages
- `badge` - Status indicator
- `banner` - Promotional banner
- `empty` - Empty state
- `error` - Error display
- `loading` - Loading indicators
- `progress` - Progress bar
- `toast` - Notifications

### Data (2 families)
- `table` - Basic data table
- `data-table` - Advanced table with features

### Interactive (2 components)
- `copy-to-clipboard` - Copy functionality
- `monaco-editor` - Code editor

## CLI Commands

### `init`
Initialize your project for Basis UI components.

```bash
npx @basisui/ui init
```

Options:
- `--yes` - Skip confirmation prompts
- `--cwd <path>` - Set working directory

### `add`
Add components to your project.

```bash
npx @basisui/ui add button card
```

Options:
- `--yes` - Skip confirmation prompts
- `--overwrite` - Overwrite existing files
- `--cwd <path>` - Set working directory
- `--path <path>` - Components directory (default: ./src/components/ui)

### `diff`
Check for component updates.

```bash
npx @basisui/ui diff
npx @basisui/ui diff button
```

Options:
- `--cwd <path>` - Set working directory

## Configuration

The `components.json` file in your project root contains your configuration:

```json
{
  "style": "default",
  "tailwind": {
    "config": "tailwind.config.mjs",
    "css": "src/styles/globals.css"
  },
  "aliases": {
    "components": "@/components",
    "utils": "@/lib/utils"
  }
}
```

## Architecture

Basis UI uses a **copy-paste approach** inspired by shadcn/ui but built specifically for Astro + Alpine.js:

- **No dependencies** - Components are copied into your project
- **Full ownership** - Modify components as needed
- **GitHub registry** - Components served from GitHub raw URLs
- **Instant updates** - New component versions available immediately

## Customization

### Theme Variables

Customize your theme by modifying CSS variables in your global CSS:

```css
:root {
  --primary: 221.2 83.2% 53.3%;
  --secondary: 210 40% 96%;
  --muted: 210 40% 96%;
  --accent: 210 40% 96%;
  --destructive: 0 62.8% 30.6%;
  /* ... more variables */
}
```

### Component Variants

Components use CVA (Class Variance Authority) for variants:

```astro
<Button variant="secondary" size="lg">
  Large Secondary Button
</Button>
```

### Alpine.js Integration

Components support Alpine.js props and directives:

```astro
<Button x-on:click="handleClick" x-bind:disabled="loading">
  Submit
</Button>
```

## Requirements

- **Astro** 3.0 or higher
- **Node.js** 18.0 or higher
- **Tailwind CSS** 3.0 or higher

## Links

- **Homepage**: [basis.zhengyishen.com](https://basis.zhengyishen.com)
- **GitHub**: [github.com/zhengyishen0/basis-ui](https://github.com/zhengyishen0/basis-ui)
- **Documentation**: [basis.zhengyishen.com/docs](https://basis.zhengyishen.com/docs)

## License

MIT © [Zhengyi Shen](https://github.com/zhengyishen0)
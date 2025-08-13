# Basis UI

<div align="center">
  <h3>Beautiful, customizable Astro + Alpine.js components</h3>
  <p>Copy and paste components that you can own and customize. Built for developers who want full control.</p>
  
  <a href="https://basis.zhengyishen.com">
    <img src="https://img.shields.io/badge/Documentation-basis.zhengyishen.com-blue?style=flat&logo=astro" alt="Documentation" />
  </a>
  <a href="https://www.npmjs.com/package/@basisui/ui">
    <img src="https://img.shields.io/npm/v/@basisui/ui?style=flat&colorA=000000&colorB=000000" alt="Version" />
  </a>
  <a href="https://github.com/zhengyishen0/basis-ui/blob/main/LICENSE">
    <img src="https://img.shields.io/github/license/zhengyishen0/basis-ui?style=flat&colorA=000000&colorB=000000" alt="License" />
  </a>
  <a href="https://www.npmjs.com/package/@basisui/ui">
    <img src="https://img.shields.io/npm/dm/@basisui/ui?style=flat&colorA=000000&colorB=000000" alt="Downloads" />
  </a>
</div>

<br />

## 🚀 Quick Start

```bash
# Initialize your Astro project
npx @basisui/ui@latest init

# Add components
npx @basisui/ui add button card accordion

# Use in your Astro pages
```

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

## ✨ Features

- 🎨 **59 Components** - Forms, layouts, navigation, overlays, and more
- 🚀 **Astro + Alpine.js** - Optimized for static-first with interactive islands
- 📋 **Copy & Paste** - Own your components, no black boxes
- 🎯 **Tailwind CSS** - Utility-first styling with CSS variables
- 🔧 **Customizable** - Easy to modify and extend
- 📱 **Responsive** - Mobile-first design patterns
- ♿ **Accessible** - Built with accessibility in mind
- 🎭 **Alpine.js Integration** - Reactive components with minimal JavaScript

## 📦 Components Library

### 📝 Forms (8 components)
- **Button** - Versatile button with variants and sizes
- **Text Input** - Input field with validation
- **Textarea** - Multi-line text input with auto-resize
- **Checkbox** - Custom styled checkbox
- **Radio Group** - Radio button groups with Alpine.js state
- **Select** - Dropdown with search and multi-select
- **Slider** - Range slider with custom styling
- **Rating** - Star rating component with hover effects

### 🖼️ Display (11 components)
- **Card** - Flexible content container with header/body/footer
- **Accordion** - Collapsible content sections with smooth animations
- **Avatar** - User avatar with fallback text and image support
- **Calendar** - Interactive calendar component
- **Carousel** - Image and content carousel with navigation
- **Code** - Syntax highlighted code display
- **Image** - Responsive image with lazy loading
- **Navbar** - Navigation bar with responsive design
- **Table of Contents** - Auto-generated table of contents
- **Text** - Typography component with semantic variants
- **Video Player** - Custom video player component

### 📐 Layout (12 components)
- **Column/Row** - Flexible layout components
- **Page** - Main page container with responsive padding
- **Grid** - CSS Grid layout with responsive columns
- **Grid Items** - Grid item wrapper with alignment
- **List/List Items** - Vertical list with gap control
- **Inline** - Horizontal inline layout
- **Divider** - Visual separator line
- **Spacer** - Empty space component for layout
- **Section** - Content section with semantic styling
- **Conditional** - Conditional rendering component

### 🧭 Navigation (4 families)
- **Tabs** - Tabbed interface with content panels (4 files)
- **Breadcrumbs** - Navigation breadcrumb trail (4 files)
- **Pagination** - Page navigation with numbered pages (5 files)
- **Navigation Menu** - Hierarchical navigation menu (9 files)

### 🎭 Overlay (10 families)
- **Dialog** - Modal dialog with backdrop and focus management (5 files)
- **Popup** - Floating popup with positioning (3 files)
- **Tooltip** - Contextual tooltip on hover
- **Hover Card** - Rich content card on hover
- **Context Menu** - Right-click context menu
- **Dropdown Menu** - Dropdown menu with items and shortcuts
- **Menubar** - Menu bar component
- **Command** - Command palette with search and filtering (5 files)
- **Menu** - Generic menu component with groups and items (10 files)

### 💬 Feedback (8 components)
- **Alert** - Alert message with semantic colors
- **Badge** - Small status indicator
- **Banner** - Full-width promotional banner (5 files)
- **Empty** - Empty state placeholder
- **Error** - Error message display
- **Loading** - Loading indicator with animations
- **Progress** - Progress bar with percentage
- **Toast** - Temporary notification message

### 📊 Data (2 families)
- **Table** - Basic data table with sorting (6 files)
- **Data Table** - Advanced table with filtering, pagination, and real-time updates (3 files + store)

### 🔧 Interactive (2 components)
- **Copy to Clipboard** - Copy text to clipboard with feedback
- **Monaco Editor** - Code editor powered by Monaco

## 🛠️ CLI Commands

### Initialize Project
```bash
npx @basisui/ui init
```
Sets up your Astro project with Alpine.js, Tailwind CSS, and utility functions.

### Add Components
```bash
# Add single component
npx @basisui/ui add button

# Add multiple components
npx @basisui/ui add card dialog table

# Add with options
npx @basisui/ui add button --overwrite --yes
```

### Check Updates
```bash
# Check all components
npx @basisui/ui diff

# Check specific component
npx @basisui/ui diff button
```

## 🏗️ Architecture

Basis UI follows a **copy-paste approach** inspired by shadcn/ui but built specifically for Astro + Alpine.js:

### 📋 Copy-Paste Philosophy
- **No dependencies** - Components are copied into your project
- **Full ownership** - Modify components as needed
- **No black boxes** - See exactly how everything works

### 🌐 GitHub Registry System
- **GitHub-hosted** - Components served from GitHub raw URLs
- **Instant updates** - New versions available immediately
- **Version control** - Git-based versioning

### 🔄 Update Workflow
1. **Edit components** in your `basis-stack` source repository
2. **Sync to registry** with `npm run sync-all`
3. **Push to GitHub** - components instantly available to users
4. **CLI unchanged** - 95% of updates don't require CLI republishing

## ⚙️ Configuration

The `components.json` file in your project root:

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

## 🎨 Theming

### CSS Variables
Customize your theme by modifying CSS variables:

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
Components use CVA (Class Variance Authority):

```astro
<Button variant="secondary" size="lg">
  Large Secondary Button
</Button>
```

## 🔧 Alpine.js Integration

Components support Alpine.js directives and reactive data:

```astro
---
import Button from '@/components/ui/button/Button.astro';
---

<div x-data="{ loading: false }">
  <Button 
    x-on:click="loading = true" 
    x-bind:disabled="loading"
    variant="default"
  >
    <span x-show="!loading">Submit</span>
    <span x-show="loading">Loading...</span>
  </Button>
</div>
```

## 📋 Requirements

- **Astro** 3.0 or higher
- **Node.js** 18.0 or higher
- **Tailwind CSS** 3.0 or higher

## 🔗 Links

- **🏠 Homepage**: [basis.zhengyishen.com](https://basis.zhengyishen.com)
- **📖 Documentation**: [basis.zhengyishen.com/docs](https://basis.zhengyishen.com/docs)
- **📦 NPM Package**: [@basisui/ui](https://www.npmjs.com/package/@basisui/ui)
- **🐛 Issues**: [GitHub Issues](https://github.com/zhengyishen0/basis-ui/issues)

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

MIT © [Zhengyi Shen](https://github.com/zhengyishen0)

---

<div align="center">
  <p>Built with ❤️ for the Astro community</p>
  <p>
    <a href="https://basis.zhengyishen.com">Documentation</a> •
    <a href="https://www.npmjs.com/package/@basisui/ui">NPM</a> •
    <a href="https://github.com/zhengyishen0/basis-ui/issues">Issues</a>
  </p>
</div>
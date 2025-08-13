# Basis UI - Astro + Alpine.js Component Library

## Project Overview

Basis UI is a shadcn/ui-inspired component library specifically designed for Astro + Alpine.js applications. It provides a CLI tool that copies component source code directly into projects, giving developers full ownership and customization control.

## Architecture Design

### **Core Philosophy**
- **Copy-paste approach**: Components are copied into projects, not installed as dependencies
- **GitHub-hosted registry**: Components fetched from GitHub raw URLs for instant updates
- **Developer ownership**: Full control over component code after installation
- **Astro + Alpine.js focused**: Optimized for static-first with interactive islands

### **Repository Structure**

```
basis-ui/
├── packages/
│   └── cli/                    # NPM CLI package (@basis-ui/cli)
│       ├── src/
│       │   ├── index.ts        # CLI entry point
│       │   └── commands/
│       │       ├── init.ts     # Project initialization
│       │       ├── add.ts      # Component installation
│       │       └── diff.ts     # Update checking
│       └── package.json
├── registry/                   # GitHub-hosted component registry
│   ├── components/             # Component files (generated)
│   ├── lib/                    # Utility files (generated)
│   └── index.json              # Registry metadata (generated)
├── scripts/
│   ├── sync.js                 # Sync from basis-stack source
│   └── build-registry.js       # Generate registry metadata
└── package.json                # Workspace root
```

### **Component Categories & Organization**

Based on the analysis of your basis-stack components:

#### **Forms** (8 components)
- `button`, `text-input`, `textarea`, `checkbox`, `slider`, `rating`
- `select` (3 files), `radio-group` (5 files)

#### **Display** (11 components)  
- `card` (4 files), `accordion` (5 files)
- `avatar`, `calendar`, `carousel`, `code`, `image`, `navbar`, `table-of-contents`, `text`, `video-player`

#### **Layout** (12 components)
- `column`, `row`, `page`, `grid`, `grid-items`, `list`, `list-items`
- `inline`, `divider`, `spacer`, `section`, `conditional`

#### **Navigation** (4 component families)
- `tabs` (4 files), `breadcrumbs` (4 files), `pagination` (5 files)
- `navigation-menu` (9 files)

#### **Overlay** (10 component families)
- `dialog` (5 files), `popup` (3 files), `command` (5 files), `menu` (10 files)
- `tooltip`, `hover-card`, `context-menu`, `dropdown-menu`, `menubar`

#### **Feedback** (8 components)
- `alert`, `badge`, `empty`, `error`, `loading`, `progress`, `toast`
- `banner` (5 files)

#### **Data** (2 component families)
- `table` (6 files), `data-table` (3 files + store)

#### **Indicators & Interactive** (6 components)
- `checkbox-indicator`, `radio-indicator`, `ellipsis`
- `copy-to-clipboard`, `monaco-editor`

### **Component Architecture Patterns**

#### **Universal Design System**
- **Content-driven**: List, Grid, Inline (handle dynamic content)
- **Layout-driven**: Row, Column, Page (handle static positioning)  
- **UI components**: Rich styled containers with full feature sets

#### **CVA Integration**
- Semantic variants: `default`, `secondary`, `destructive`, `outline`
- Universal sizing: `xs`, `sm`, `md`, `lg`, `xl`
- Interactive effects: `lift`, `scale`, `glow`, `subtle`, `bounce`

#### **Alpine.js Patterns**
- Component-level state with `x-data`
- Global stores with `Alpine.store()`
- Plugin ecosystem integration (collapse, focus, intersect, etc.)
- Pass-through props with `{...alpineProps}`

### **CLI Workflow**

#### **Installation Flow**
```bash
npx @basisui/ui@latest init     # Setup project
npx @basisui/ui add button card # Add components
npx @basisui/ui diff           # Check updates
```

#### **Init Command** (`packages/cli/src/commands/init.ts`)
1. Validates Astro project
2. Installs Alpine.js + plugins
3. Sets up Tailwind CSS with theme variables
4. Creates `components.json` config
5. Adds utility functions (`cn`, component variants)

#### **Add Command** (`packages/cli/src/commands/add.ts`)
1. Fetches registry from GitHub
2. Resolves component dependencies
3. Downloads component files
4. Installs NPM dependencies
5. Transforms import paths

#### **Diff Command** (`packages/cli/src/commands/diff.ts`)
1. Compares local vs remote component versions
2. Shows available updates
3. Provides update recommendations

### **GitHub Registry System**

#### **Registry Structure**
```json
{
  "version": "1.0.0",
  "components": {
    "button": {
      "name": "button",
      "category": "forms",
      "description": "Versatile button with variants",
      "dependencies": ["class-variance-authority", "clsx"],
      "registryDependencies": ["utils", "component-variants"],
      "files": [{"path": "components/button/Button.astro"}]
    }
  },
  "lib": {
    "utils": { "files": [{"path": "lib/utils.ts"}] }
  }
}
```

#### **Component URLs**
- Registry: `https://raw.githubusercontent.com/yourusername/basis-ui/main/registry/index.json`
- Files: `https://raw.githubusercontent.com/yourusername/basis-ui/main/registry/components/button/Button.astro`

### **Update Workflow**

#### **For Component Updates** (95% of updates)
1. **Edit in basis-stack** (source repository)
2. **Sync to basis-ui**:
   ```bash
   BASIS_STACK_PATH=../basis-stack npm run sync
   npm run build-registry
   git commit -am "Update button component"
   git push
   ```
3. **Users get updates instantly** - CLI unchanged

#### **For CLI Updates** (5% of updates)
- New commands or features
- Bug fixes in CLI logic
- Dependency changes

### **Dependency Management**

#### **Base Dependencies** (all components)
```json
["class-variance-authority@^0.7.1", "clsx@^2.1.1", "tailwind-merge@^3.3.1"]
```

#### **Alpine.js Plugins** (component-specific)
```json
{
  "data-table": ["@alpinejs/sort", "@alpinejs/persist"],
  "accordion": ["@alpinejs/collapse"],
  "dialog": ["@alpinejs/focus"]
}
```

#### **Registry Dependencies** (internal)
- All components depend on: `utils`, `component-variants`
- Complex components depend on simpler ones: `data-table` → `table`, `button`

### **Development Workflow**

#### **Daily Development**
1. Work in `basis-stack` (your main project)
2. Test components in real application
3. When ready to release: sync to `basis-ui`

#### **Component Development**
1. Follow existing patterns from `COMPONENT_GUIDE_COMPRESSED.md`
2. Use CVA for complex variants
3. Implement Alpine.js with `{...alpineProps}` pass-through
4. Test with documentation examples

#### **Release Process**
1. Update components in basis-stack
2. Run sync script in basis-ui
3. Commit and push to GitHub
4. Components available immediately to users

### **Key Benefits**

#### **For Developers**
- **Instant ownership**: Full control over component code
- **No black boxes**: Can see and modify everything
- **Tree-shakeable**: Only install what you use
- **Type-safe**: Full TypeScript support

#### **For Maintainers**
- **Instant updates**: Push to GitHub = immediate availability
- **Simple maintenance**: Most updates don't require CLI changes
- **Community friendly**: Easy to accept PRs for new components
- **Version flexibility**: Git tags for major versions

### **Technical Implementation Notes**

#### **Import Path Transformation**
```typescript
// Transform relative imports to aliases
content = content.replace(
  /from ['"]\.\.\/\.\.\/lib\/utils['"];?/g, 
  'from "@/lib/utils";'
);
```

#### **Alpine.js Store Integration**
```javascript
// Component stores are copied with components
// Users can modify store behavior as needed
export const tableStore = {
  // State and methods specific to data tables
};
```

#### **Tailwind Theme Integration**
```css
/* CSS variables for consistent theming */
:root {
  --primary: 221.2 83.2% 53.3%;
  --secondary: 210 40% 96%;
  /* ... theme variables */
}
```

## Development Commands

```bash
# Sync components from basis-stack
BASIS_STACK_PATH=../basis-stack npm run sync

# Build registry metadata  
npm run build-registry

# Run both sync and build
npm run sync-all

# Build CLI for testing
cd packages/cli && npm run build

# Test CLI locally
npm link  # In packages/cli
npx basis-ui init  # In test project
```

## Future Enhancements

1. **Multiple Style Variants**: Support for different design systems
2. **Plugin System**: Allow community extensions
3. **Component Playground**: Interactive preview site
4. **Auto-sync**: GitHub Actions for automatic syncing
5. **Theme Generator**: CLI for custom theme generation

---

This design provides a robust, maintainable system for distributing your Astro + Alpine.js components while maintaining the flexibility and developer experience that makes shadcn/ui so popular.
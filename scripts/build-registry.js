#!/usr/bin/env node
import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';
import { COMPONENT_CATEGORIES } from './sync.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const REGISTRY_DIR = path.join(__dirname, '../registry');
const OUTPUT_FILE = path.join(REGISTRY_DIR, 'index.json');

// Component dependency mapping
const COMPONENT_DEPENDENCIES = {
  // Base dependencies for most components
  base: [
    'class-variance-authority@^0.7.1',
    'clsx@^2.1.1',
    'tailwind-merge@^3.3.1'
  ],
  
  // Alpine.js plugins
  alpine: {
    'data-table': ['@alpinejs/sort@^3.14.9', '@alpinejs/persist@^3.14.9'],
    'command': ['@alpinejs/focus@^3.14.9'],
    'dropdown-menu': ['@alpinejs/focus@^3.14.9'],
    'dialog': ['@alpinejs/focus@^3.14.9'],
    'text-input': ['@alpinejs/mask@^3.14.9'],
    'carousel': ['@alpinejs/intersect@^3.14.9'],
    'accordion': ['@alpinejs/collapse@^3.14.9'],
    'tabs': ['@alpinejs/anchor@^3.14.9']
  },

  // Supabase for data components
  supabase: {
    'data-table': ['@supabase/supabase-js@^2.51.0']
  },

  // Icon dependencies
  icons: [
    '@iconify-json/lucide@^1.2.62',
    'astro-icon@^1.1.5'
  ]
};

// Registry dependencies (internal components/utils)
const REGISTRY_DEPENDENCIES = {
  'utils': [],
  'component-variants': ['utils'],
  
  // Components that depend on other components
  'data-table': ['table', 'button', 'text-input', 'pagination'],
  'banner': ['button'],
  'dialog': ['button'],
  'card': ['button'],
  'accordion': ['button'],
  'tabs': ['button'],
  'command': ['text-input'],
  'table': ['checkbox', 'button'],
  'navigation-menu': ['button']
};

function getComponentDependencies(componentName) {
  const deps = [...COMPONENT_DEPENDENCIES.base];
  
  // Add Alpine.js plugins
  if (COMPONENT_DEPENDENCIES.alpine[componentName]) {
    deps.push(...COMPONENT_DEPENDENCIES.alpine[componentName]);
  }
  
  // Add Supabase if needed
  if (COMPONENT_DEPENDENCIES.supabase[componentName]) {
    deps.push(...COMPONENT_DEPENDENCIES.supabase[componentName]);
  }
  
  // Add icons for display components
  if (['avatar', 'card', 'accordion', 'button', 'alert', 'banner'].includes(componentName)) {
    deps.push(...COMPONENT_DEPENDENCIES.icons);
  }
  
  return [...new Set(deps)]; // Remove duplicates
}

function getRegistryDependencies(componentName) {
  const deps = ['utils', 'component-variants'];
  
  if (REGISTRY_DEPENDENCIES[componentName]) {
    deps.push(...REGISTRY_DEPENDENCIES[componentName]);
  }
  
  return [...new Set(deps)];
}

function getComponentFiles(category, component) {
  const files = [];
  
  if (component.files) {
    // Multi-file component
    component.files.forEach(file => {
      files.push({
        path: `components/${component.name}/${file}`,
        type: 'component'
      });
    });
  } else {
    // Single file component
    const fileName = path.basename(component.source);
    files.push({
      path: `components/${component.name}/${fileName}`,
      type: 'component'
    });
  }
  
  // Add stores if specified
  if (component.stores) {
    component.stores.forEach(store => {
      files.push({
        path: `components/${component.name}/${store}`,
        type: 'store'
      });
    });
  }
  
  return files;
}

async function buildRegistry() {
  console.log('🔨 Building component registry...\n');

  const registry = {
    $schema: 'https://basis-ui.com/registry-schema.json',
    version: '1.0.0',
    components: {},
    lib: {
      utils: {
        name: 'utils',
        description: 'Utility functions for class name merging',
        files: [
          {
            path: 'lib/utils.ts',
            type: 'lib'
          }
        ]
      },
      'component-variants': {
        name: 'component-variants',
        description: 'Shared component variant system',
        dependencies: [],
        registryDependencies: ['utils'],
        files: [
          {
            path: 'lib/component-variants.ts',
            type: 'lib'
          }
        ]
      }
    }
  };

  // Build components
  for (const [categoryName, components] of Object.entries(COMPONENT_CATEGORIES)) {
    console.log(`📁 Processing ${categoryName}...`);
    
    for (const component of components) {
      const componentDir = path.join(REGISTRY_DIR, 'components', component.name);
      
      // Check if component exists
      if (await fs.pathExists(componentDir)) {
        registry.components[component.name] = {
          name: component.name,
          category: categoryName,
          description: generateDescription(component.name, categoryName),
          dependencies: getComponentDependencies(component.name),
          registryDependencies: getRegistryDependencies(component.name),
          files: getComponentFiles(categoryName, component)
        };
        
        console.log(`  ✓ ${component.name}`);
      } else {
        console.warn(`  ⚠ Missing component directory: ${component.name}`);
      }
    }
  }

  // Write registry file
  await fs.writeJson(OUTPUT_FILE, registry, { spaces: 2 });
  
  console.log(`\n✅ Registry built successfully!`);
  console.log(`📝 Generated: ${OUTPUT_FILE}`);
  console.log(`📊 Components: ${Object.keys(registry.components).length}`);
}

function generateDescription(componentName, category) {
  const descriptions = {
    // Forms
    button: 'A versatile button component with multiple variants and sizes',
    'text-input': 'Input field with validation and Alpine.js integration',
    textarea: 'Multi-line text input with auto-resize',
    checkbox: 'Checkbox input with custom styling',
    'radio-group': 'Radio button group with Alpine.js state management',
    select: 'Dropdown select with search and multi-select support',
    slider: 'Range slider with customizable styling',
    rating: 'Star rating component with hover effects',
    
    // Display
    card: 'Flexible content container with header, body, and footer',
    accordion: 'Collapsible content sections with smooth animations',
    avatar: 'User avatar with fallback text and image support',
    calendar: 'Interactive calendar component',
    carousel: 'Image and content carousel with navigation',
    code: 'Syntax highlighted code display',
    image: 'Responsive image with lazy loading',
    navbar: 'Navigation bar with responsive design',
    'table-of-contents': 'Auto-generated table of contents',
    text: 'Typography component with semantic variants',
    
    // Layout
    column: 'Flexible column layout component',
    row: 'Horizontal row layout with alignment options',
    page: 'Main page container with responsive padding',
    grid: 'CSS Grid layout with responsive columns',
    list: 'Vertical list with gap control',
    inline: 'Horizontal inline layout',
    divider: 'Visual separator line',
    spacer: 'Empty space component for layout',
    section: 'Content section with semantic styling',
    
    // Navigation
    tabs: 'Tabbed interface with content panels',
    breadcrumbs: 'Navigation breadcrumb trail',
    pagination: 'Page navigation with numbered pages',
    'navigation-menu': 'Hierarchical navigation menu',
    
    // Overlay
    dialog: 'Modal dialog with backdrop and focus management',
    popup: 'Floating popup with positioning',
    tooltip: 'Contextual tooltip on hover',
    'hover-card': 'Rich content card on hover',
    'context-menu': 'Right-click context menu',
    'dropdown-menu': 'Dropdown menu with items and shortcuts',
    command: 'Command palette with search and filtering',
    menu: 'Generic menu component with groups and items',
    
    // Feedback
    alert: 'Alert message with semantic colors',
    badge: 'Small status indicator',
    banner: 'Full-width promotional banner',
    empty: 'Empty state placeholder',
    error: 'Error message display',
    loading: 'Loading indicator with animations',
    progress: 'Progress bar with percentage',
    toast: 'Temporary notification message',
    
    // Data
    table: 'Basic data table with sorting',
    'data-table': 'Advanced data table with filtering, pagination, and real-time updates',
    
    // Interactive
    'copy-to-clipboard': 'Copy text to clipboard with feedback',
    'monaco-editor': 'Code editor powered by Monaco'
  };
  
  return descriptions[componentName] || `${componentName} component for ${category}`;
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  buildRegistry().catch(console.error);
}

export { buildRegistry };
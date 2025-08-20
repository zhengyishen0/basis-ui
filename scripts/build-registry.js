#!/usr/bin/env node
import fs from "fs-extra";
import path from "path";
import { fileURLToPath } from "url";
import { glob } from "glob";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const REGISTRY_DIR = path.join(__dirname, "../registry");
const UI_DIR = path.join(REGISTRY_DIR, "ui");
const OUTPUT_FILE = path.join(REGISTRY_DIR, "index.json");

// Common NPM dependencies found in UI components
const COMMON_DEPENDENCIES = {
  // Base dependencies
  'class-variance-authority': '^0.7.1',
  'clsx': '^2.1.1', 
  'tailwind-merge': '^3.3.1',
  
  // Alpine.js and plugins
  'alpinejs': '^3.14.9',
  '@alpinejs/anchor': '^3.14.9',
  '@alpinejs/collapse': '^3.14.9',
  '@alpinejs/focus': '^3.14.9',
  '@alpinejs/intersect': '^3.14.9',
  '@alpinejs/mask': '^3.14.9',
  '@alpinejs/morph': '^3.14.9',
  '@alpinejs/persist': '^3.14.9',
  '@alpinejs/resize': '^3.14.9',
  '@alpinejs/sort': '^3.14.9',
  
  // External services
  '@supabase/supabase-js': '^2.51.0',
  
  // Icons
  '@iconify-json/lucide': '^1.2.62',
  'astro-icon': '^1.1.5',
};

// Extract import statements from file content
function extractImports(content) {
  const imports = new Set();
  
  // Match various import patterns
  const importRegexes = [
    /from ['"]([^'"]+)['"]/g,
    /import ['"]([^'"]+)['"]/g,
  ];
  
  importRegexes.forEach(regex => {
    let match;
    while ((match = regex.exec(content)) !== null) {
      const importPath = match[1];
      // Only include external packages (not relative imports)
      if (!importPath.startsWith('.') && !importPath.startsWith('/') && !importPath.startsWith('@/')) {
        imports.add(importPath);
      }
    }
  });
  
  return Array.from(imports);
}

// Get NPM dependencies for a list of imports
function getDependenciesFromImports(imports) {
  const dependencies = [];
  
  imports.forEach(importPath => {
    // Get the package name (handle scoped packages)
    const packageName = importPath.startsWith('@') 
      ? importPath.split('/').slice(0, 2).join('/') 
      : importPath.split('/')[0];
      
    if (COMMON_DEPENDENCIES[packageName]) {
      dependencies.push(`${packageName}@${COMMON_DEPENDENCIES[packageName]}`);
    }
  });
  
  return [...new Set(dependencies)]; // Remove duplicates
}

// Scan ui/ folder and extract dependencies from files
async function scanUiFolder() {
  console.log('🔍 Scanning ui/ folder for dependencies...');
  
  if (!await fs.pathExists(UI_DIR)) {
    console.error(`❌ UI directory not found: ${UI_DIR}`);
    console.error('Please run the sync script first to copy the ui/ folder.');
    process.exit(1);
  }
  
  // Get all .astro, .js, .ts files in the ui/ directory
  const files = await glob('**/*.{astro,js,ts,jsx,tsx}', { cwd: UI_DIR });
  const allImports = new Set();
  
  // Extract imports from all files
  for (const file of files) {
    const filePath = path.join(UI_DIR, file);
    const content = await fs.readFile(filePath, 'utf-8');
    const imports = extractImports(content);
    imports.forEach(imp => allImports.add(imp));
  }
  
  // Get dependencies from imports
  const dependencies = getDependenciesFromImports(Array.from(allImports));
  
  console.log(`📦 Found ${dependencies.length} external dependencies`);
  console.log(`📁 Scanned ${files.length} files`);
  
  return {
    dependencies,
    allImports: Array.from(allImports),
    fileCount: files.length
  };
}

async function buildRegistry() {
  console.log("🔨 Building component registry...\n");

  // Scan the ui/ folder for dependencies
  const scanResult = await scanUiFolder();
  
  const registry = {
    $schema: "https://basis.zhengyishen.com/registry-schema.json",
    version: "1.0.0",
    ui: {
      name: "ui",
      description: "Complete UI component library for Astro + Alpine.js",
      dependencies: scanResult.dependencies,
      files: [
        {
          path: "ui",
          type: "folder"
        }
      ]
    },
    lib: {
      "utils": {
        name: "utils",
        description: "Utility functions for class name merging",
        files: [
          {
            path: "lib/utils.ts",
            type: "lib"
          }
        ]
      },
      "component-variants": {
        name: "component-variants",
        description: "Shared component variant system",
        dependencies: [],
        registryDependencies: ["utils"],
        files: [
          {
            path: "lib/component-variants.ts",
            type: "lib"
          }
        ]
      }
    },
    meta: {
      extractedImports: scanResult.allImports,
      scannedFiles: scanResult.fileCount,
      lastUpdated: new Date().toISOString()
    }
  };

  // Write registry file
  await fs.writeJson(OUTPUT_FILE, registry, { spaces: 2 });

  console.log(`\n✅ Registry built successfully!`);
  console.log(`📝 Generated: ${OUTPUT_FILE}`);
  console.log(`📦 Dependencies: ${scanResult.dependencies.length}`);
  console.log(`📁 Files scanned: ${scanResult.fileCount}`);
}

function generateDescription(componentName, category) {
  const descriptions = {
    // Forms
    "button": "A versatile button component with multiple variants and sizes",
    "text-input": "Input field with validation and Alpine.js integration",
    "textarea": "Multi-line text input with auto-resize",
    "checkbox": "Checkbox input with custom styling",
    "radio-group": "Radio button group with Alpine.js state management",
    "select": "Dropdown select with search and multi-select support",
    "slider": "Range slider with customizable styling",
    "rating": "Star rating component with hover effects",

    // Display
    "card": "Flexible content container with header, body, and footer",
    "accordion": "Collapsible content sections with smooth animations",
    "avatar": "User avatar with fallback text and image support",
    "calendar": "Interactive calendar component",
    "carousel": "Image and content carousel with navigation",
    "code": "Syntax highlighted code display",
    "image": "Responsive image with lazy loading",
    "navbar": "Navigation bar with responsive design",
    "table-of-contents": "Auto-generated table of contents",
    "text": "Typography component with semantic variants",

    // Layout
    "column": "Flexible column layout component",
    "row": "Horizontal row layout with alignment options",
    "page": "Main page container with responsive padding",
    "grid": "CSS Grid layout with responsive columns",
    "list": "Vertical list with gap control",
    "inline": "Horizontal inline layout",
    "divider": "Visual separator line",
    "spacer": "Empty space component for layout",
    "section": "Content section with semantic styling",

    // Navigation
    "tabs": "Tabbed interface with content panels",
    "breadcrumbs": "Navigation breadcrumb trail",
    "pagination": "Page navigation with numbered pages",
    "navigation-menu": "Hierarchical navigation menu",

    // Overlay
    "dialog": "Modal dialog with backdrop and focus management",
    "popup": "Floating popup with positioning",
    "tooltip": "Contextual tooltip on hover",
    "hover-card": "Rich content card on hover",
    "context-menu": "Right-click context menu",
    "dropdown-menu": "Dropdown menu with items and shortcuts",
    "command": "Command palette with search and filtering",
    "menu": "Generic menu component with groups and items",

    // Feedback
    "alert": "Alert message with semantic colors",
    "badge": "Small status indicator",
    "banner": "Full-width promotional banner",
    "empty": "Empty state placeholder",
    "error": "Error message display",
    "loading": "Loading indicator with animations",
    "progress": "Progress bar with percentage",
    "toast": "Temporary notification message",

    // Data
    "table": "Basic data table with sorting",
    "data-table":
      "Advanced data table with filtering, pagination, and real-time updates",

    // Interactive
    "copy-to-clipboard": "Copy text to clipboard with feedback",
    "monaco-editor": "Code editor powered by Monaco",
  };

  return (
    descriptions[componentName] || `${componentName} component for ${category}`
  );
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  buildRegistry().catch(console.error);
}

export { buildRegistry };

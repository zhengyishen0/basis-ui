#!/usr/bin/env node

import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';
import { glob } from 'glob';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Path to your basis-stack repository (adjust as needed)
const BASIS_STACK_PATH = process.env.BASIS_STACK_PATH || '../basis-stack';
const SOURCE_COMPONENTS = path.join(BASIS_STACK_PATH, 'src/components/ui');
const SOURCE_LIB = path.join(BASIS_STACK_PATH, 'src/lib');
const DEST_REGISTRY = path.join(__dirname, '../registry');
const REGISTRY_FILE = path.join(DEST_REGISTRY, 'index.json');

// Improved component mapping with correct names and complete coverage
const COMPONENT_CATEGORIES = {
  forms: [
    { name: 'button', source: 'forms/Button.astro' },
    { name: 'text-input', source: 'forms/TextInput.astro' },
    { name: 'textarea', source: 'forms/Textarea.astro' },
    { name: 'checkbox', source: 'forms/Checkbox.astro' },
    { name: 'slider', source: 'forms/Slider.astro' },
    { name: 'rating', source: 'forms/Rating.astro' },
    { 
      name: 'select', 
      source: 'forms/select',
      files: ['Select.astro', 'SelectItem.astro', 'SelectItems.astro'] 
    },
    { 
      name: 'radio-group', 
      source: 'forms/radiogroup',
      files: ['RadioGroup.astro', 'RadioGroupDescription.astro', 'RadioGroupItem.astro', 'RadioGroupItems.astro', 'RadioGroupLabel.astro'] 
    }
  ],
  display: [
    { 
      name: 'card', 
      source: 'display/card',
      files: ['Card.astro', 'CardContent.astro', 'CardFooter.astro', 'CardHeader.astro'] 
    },
    { 
      name: 'accordion', 
      source: 'display/accordion',
      files: ['Accordion.astro', 'AccordionContent.astro', 'AccordionItem.astro', 'AccordionItems.astro', 'AccordionTrigger.astro'] 
    },
    { name: 'avatar', source: 'display/Avatar.astro' },
    { name: 'calendar', source: 'display/Calendar.astro' },
    { name: 'carousel', source: 'display/Carousel.astro' },
    { name: 'code', source: 'display/Code.astro' },
    { name: 'image', source: 'display/Image.astro' },
    { name: 'navbar', source: 'display/Navbar.astro' },
    { name: 'table-of-contents', source: 'display/TableOfContents.astro' },
    { name: 'text', source: 'display/Text.astro' },
    { name: 'video-player', source: 'display/VideoPlayer.astro' }
  ],
  layout: [
    { name: 'column', source: 'layout/Column.astro' },
    { name: 'row', source: 'layout/Row.astro' },
    { name: 'page', source: 'layout/Page.astro' },
    { name: 'grid', source: 'layout/Grid.astro' },
    { name: 'grid-items', source: 'layout/GridItems.astro' },
    { name: 'list', source: 'layout/List.astro' },
    { name: 'list-items', source: 'layout/ListItems.astro' },
    { name: 'inline', source: 'layout/Inline.astro' },
    { name: 'divider', source: 'layout/Divider.astro' },
    { name: 'spacer', source: 'layout/Spacer.astro' },
    { name: 'section', source: 'layout/Section.astro' },
    { name: 'conditional', source: 'layout/Conditional.astro' }
  ],
  navigation: [
    { 
      name: 'tabs', 
      source: 'navigation/tabs',
      files: ['Tabs.astro', 'TabsContent.astro', 'TabsList.astro', 'TabsTrigger.astro'] 
    },
    { 
      name: 'breadcrumbs', 
      source: 'navigation/breadcrumbs',
      files: ['Breadcrumb.astro', 'BreadcrumbItem.astro', 'BreadcrumbItems.astro', 'SmartBreadcrumb.astro'] 
    },
    { 
      name: 'pagination', 
      source: 'navigation/pagination',
      files: ['Pagination.astro', 'PaginationItem.astro', 'PaginationLink.astro', 'PaginationNext.astro', 'PaginationPrevious.astro'] 
    },
    { 
      name: 'navigation-menu', 
      source: 'overlay/navigationmenu',
      files: ['NavigationMenu.astro', 'NavigationMenuContent.astro', 'NavigationMenuFeatured.astro', 'NavigationMenuItem.astro', 'NavigationMenuItems.astro', 'NavigationMenuLink.astro', 'NavigationMenuLinks.astro', 'NavigationMenuList.astro', 'NavigationMenuTrigger.astro'] 
    }
  ],
  overlay: [
    { 
      name: 'dialog', 
      source: 'overlay/dialog',
      files: ['Dialog.astro', 'DialogContent.astro', 'DialogFooter.astro', 'DialogHeader.astro', 'DialogTrigger.astro'] 
    },
    { 
      name: 'popup', 
      source: 'overlay/popup',
      files: ['Popup.astro', 'PopupContent.astro', 'PopupTrigger.astro'] 
    },
    { 
      name: 'tooltip', 
      source: 'overlay/tooltip',
      files: ['Tooltip.astro'] 
    },
    { 
      name: 'hover-card', 
      source: 'overlay/hovercard',
      files: ['HoverCard.astro'] 
    },
    { 
      name: 'context-menu', 
      source: 'overlay/contextmenu',
      files: ['ContextMenu.astro'] 
    },
    { 
      name: 'dropdown-menu', 
      source: 'overlay/dropdownmenu',
      files: ['DropdownMenu.astro'] 
    },
    { 
      name: 'menubar', 
      source: 'overlay/menubar',
      files: ['MenuBar.astro'] 
    },
    { 
      name: 'command', 
      source: 'overlay/command',
      files: ['Command.astro', 'CommandFooter.astro', 'CommandInput.astro', 'CommandItem.astro', 'CommandItems.astro'] 
    },
    { 
      name: 'menu', 
      source: 'overlay/menu',
      files: ['MenuConditional.astro', 'MenuContainer.astro', 'MenuGroup.astro', 'MenuGroups.astro', 'MenuInput.astro', 'MenuItem.astro', 'MenuItems.astro', 'MenuShortcut.astro', 'MenuSubMenu.astro', 'MenuSubTrigger.astro'] 
    }
  ],
  feedback: [
    { name: 'alert', source: 'feedback/Alert.astro' },
    { name: 'badge', source: 'feedback/Badge.astro' },
    { name: 'empty', source: 'feedback/Empty.astro' },
    { name: 'error', source: 'feedback/Error.astro' },
    { name: 'loading', source: 'feedback/Loading.astro' },
    { name: 'progress', source: 'feedback/Progress.astro' },
    { name: 'toast', source: 'feedback/Toast.astro' },
    { 
      name: 'banner', 
      source: 'feedback/banner',
      files: ['Banner.astro', 'BannerAction.astro', 'BannerClose.astro', 'BannerDescription.astro', 'BannerTitle.astro'] 
    }
  ],
  data: [
    { 
      name: 'table', 
      source: 'data',
      files: ['Table.astro', 'TableBody.astro', 'TableCell.astro', 'TableHead.astro', 'TableHeader.astro', 'TableRow.astro'] 
    },
    { 
      name: 'data-table', 
      source: 'data',
      files: ['DataTable.astro', 'TablePagination.astro', 'TableToolbar.astro'],
      stores: ['table-store.js']
    }
  ],
  indicators: [
    { name: 'checkbox-indicator', source: 'indicators/CheckboxIndicator.astro' },
    { name: 'radio-indicator', source: 'indicators/RadioIndicator.astro' },
    { name: 'ellipsis', source: 'indicators/Ellipsis.astro' }
  ],
  interactive: [
    { name: 'copy-to-clipboard', source: 'interactive/CopyToClipboard.astro' },
    { name: 'monaco-editor', source: 'interactive/MonacoEditor.astro' }
  ]
};

// Dependency analysis utilities
async function analyzeDependencies(componentName, componentPath) {
  const dependencies = new Set();
  
  // Get all .astro and .js files in the component folder
  const files = await glob('**/*.{astro,js}', { 
    cwd: componentPath,
    absolute: true 
  });
  
  for (const filePath of files) {
    const content = await fs.readFile(filePath, 'utf-8');
    const fileDeps = extractDependenciesFromContent(content, componentName);
    fileDeps.forEach(dep => dependencies.add(dep));
  }
  
  return Array.from(dependencies);
}

function extractDependenciesFromContent(content, currentComponent) {
  const dependencies = new Set();
  
  // Create a component name mapping for precise detection
  const componentNameMap = getComponentNameMapping();
  
  // Pattern 1: import Something from '../other-component/File.astro'
  const relativeImports = content.match(/import\s+[^'"]*\s+from\s+['"](\.\.\/[^'"]+)['"]/g);
  if (relativeImports) {
    for (const importStatement of relativeImports) {
      const match = importStatement.match(/from\s+['"](\.\.\/([^/'"]+))/);
      if (match) {
        const componentFolder = match[2];
        if (componentFolder && componentFolder !== currentComponent) {
          dependencies.add(componentFolder);
        }
      }
    }
  }
  
  // Pattern 2: import Something from '@/components/ui/category/Component.astro'
  const absoluteImports = content.match(/import\s+[^'"]*\s+from\s+['"]\@\/components\/ui\/[^'"]+['"]/g);
  if (absoluteImports) {
    for (const importStatement of absoluteImports) {
      // Match: @/components/ui/category/ComponentFile.astro
      const categoryMatch = importStatement.match(/from\s+['"]\@\/components\/ui\/([^/'"]+)\/([^/'"]+)['"]/);
      if (categoryMatch) {
        const category = categoryMatch[1];
        const fileName = categoryMatch[2];
        
        // Map to component name
        const componentName = mapFileToComponentName(category, fileName);
        if (componentName && componentName !== currentComponent) {
          dependencies.add(componentName);
        }
      } else {
        // Simple case: @/components/ui/category  
        const simpleMatch = importStatement.match(/from\s+['"]\@\/components\/ui\/([^/'"]+)['"]/);
        if (simpleMatch) {
          const categoryOrComponent = simpleMatch[1];
          // Check if it's a known component name
          if (componentNameMap.has(categoryOrComponent) && categoryOrComponent !== currentComponent) {
            dependencies.add(categoryOrComponent);
          }
        }
      }
    }
  }
  
  // Pattern 3: Component usage in template (e.g., <CheckboxIndicator>)
  const componentUsage = content.match(/<([A-Z][a-zA-Z]+)[\s>]/g);
  if (componentUsage) {
    for (const usage of componentUsage) {
      const match = usage.match(/<([A-Z][a-zA-Z]+)/);
      if (match) {
        const componentName = match[1];
        const mappedName = componentNameMap.get(componentName);
        if (mappedName && mappedName !== currentComponent) {
          dependencies.add(mappedName);
        }
      }
    }
  }
  
  return Array.from(dependencies);
}

function getComponentNameMapping() {
  // Map component class names to folder names
  const map = new Map();
  
  // Add all known components
  for (const [category, components] of Object.entries(COMPONENT_CATEGORIES)) {
    for (const component of components) {
      // Add the component name itself
      map.set(component.name, component.name);
      
      // Add PascalCase variants
      const pascalName = component.name.split('-').map(part => 
        part.charAt(0).toUpperCase() + part.slice(1)
      ).join('');
      map.set(pascalName, component.name);
      
      // Add specific mappings for common usage patterns
      if (component.files) {
        for (const file of component.files) {
          const fileName = file.replace('.astro', '');
          map.set(fileName, component.name);
        }
      }
    }
  }
  
  // Additional specific mappings
  map.set('CheckboxIndicator', 'checkbox-indicator');
  map.set('RadioIndicator', 'radio-indicator');
  map.set('CopyToClipboard', 'copy-to-clipboard');
  map.set('MonacoEditor', 'monaco-editor');
  map.set('TableOfContents', 'table-of-contents');
  map.set('VideoPlayer', 'video-player');
  map.set('TextInput', 'text-input');
  map.set('DataTable', 'data-table');
  map.set('GridItems', 'grid-items');
  map.set('ListItems', 'list-items');
  map.set('RadioGroup', 'radio-group');
  map.set('NavigationMenu', 'navigation-menu');
  map.set('DropdownMenu', 'dropdown-menu');
  map.set('ContextMenu', 'context-menu');
  map.set('HoverCard', 'hover-card');
  map.set('MenuBar', 'menubar');
  
  return map;
}

function mapFileToComponentName(category, fileName) {
  const componentMap = {
    'forms': {
      'Slider.astro': 'slider',
      'Button.astro': 'button',
      'TextInput.astro': 'text-input',
      'Checkbox.astro': 'checkbox',
      'Rating.astro': 'rating',
      'Textarea.astro': 'textarea'
    },
    'display': {
      'Text.astro': 'text',
      'Card.astro': 'card',
      'card': 'card',
      'Avatar.astro': 'avatar',
      'Code.astro': 'code',
      'Image.astro': 'image',
      'VideoPlayer.astro': 'video-player'
    },
    'layout': {
      'Divider.astro': 'divider',
      'Column.astro': 'column',
      'Row.astro': 'row',
      'Grid.astro': 'grid',
      'List.astro': 'list',
      'Page.astro': 'page',
      'Section.astro': 'section',
      'Spacer.astro': 'spacer',
      'Inline.astro': 'inline',
      'Conditional.astro': 'conditional'
    },
    'feedback': {
      'Empty.astro': 'empty',
      'Alert.astro': 'alert',
      'Badge.astro': 'badge',
      'Error.astro': 'error',
      'Loading.astro': 'loading',
      'Progress.astro': 'progress',
      'Toast.astro': 'toast'
    },
    'indicators': {
      'CheckboxIndicator.astro': 'checkbox-indicator',
      'RadioIndicator.astro': 'radio-indicator',
      'Ellipsis.astro': 'ellipsis'
    },
    'interactive': {
      'CopyToClipboard.astro': 'copy-to-clipboard',
      'MonacoEditor.astro': 'monaco-editor'
    },
    'overlay': {
      'popup': 'popup',
      'dialog': 'dialog',
      'menu': 'menu',
      'command': 'command'
    }
  };
  
  return componentMap[category]?.[fileName] || null;
}

async function ensureDir(dir) {
  await fs.ensureDir(dir);
}

async function copyComponent(category, component) {
  const destDir = path.join(DEST_REGISTRY, 'components', component.name);
  await ensureDir(destDir);

  if (component.files) {
    // Multi-file component
    for (const file of component.files) {
      const sourcePath = path.join(SOURCE_COMPONENTS, component.source, file);
      const destPath = path.join(destDir, file);
      
      if (await fs.pathExists(sourcePath)) {
        await fs.copy(sourcePath, destPath);
        console.log(`✓ Copied ${component.name}/${file}`);
      } else {
        console.warn(`⚠ Missing: ${sourcePath}`);
      }
    }
  } else {
    // Single file component
    const sourcePath = path.join(SOURCE_COMPONENTS, component.source);
    const fileName = path.basename(component.source);
    const destPath = path.join(destDir, fileName);
    
    if (await fs.pathExists(sourcePath)) {
      await fs.copy(sourcePath, destPath);
      console.log(`✓ Copied ${component.name}/${fileName}`);
    } else {
      console.warn(`⚠ Missing: ${sourcePath}`);
    }
  }

  // Copy index.ts or index.js file if it exists (crucial for re-exports)
  const sourceFolder = component.files ? 
    path.join(SOURCE_COMPONENTS, component.source) : 
    path.dirname(path.join(SOURCE_COMPONENTS, component.source));
  
  for (const indexFile of ['index.ts', 'index.js']) {
    const indexSourcePath = path.join(sourceFolder, indexFile);
    const indexDestPath = path.join(destDir, indexFile);
    
    if (await fs.pathExists(indexSourcePath)) {
      await fs.copy(indexSourcePath, indexDestPath);
      console.log(`✓ Copied ${component.name}/${indexFile} (re-exports)`);
      break; // Only copy one index file
    }
  }

  // Copy stores if specified
  if (component.stores) {
    for (const store of component.stores) {
      const sourcePath = path.join(SOURCE_COMPONENTS, component.source, store);
      const destPath = path.join(destDir, store);
      
      if (await fs.pathExists(sourcePath)) {
        await fs.copy(sourcePath, destPath);
        console.log(`✓ Copied ${component.name}/${store}`);
      }
    }
  }
}

async function syncLibFiles() {
  const libDestDir = path.join(DEST_REGISTRY, 'lib');
  await ensureDir(libDestDir);

  // Copy all lib files
  if (await fs.pathExists(SOURCE_LIB)) {
    await fs.copy(SOURCE_LIB, libDestDir);
    console.log('✓ Copied lib files');
  }
}

async function updateRegistryWithDependencies() {
  console.log('\n🔍 Analyzing component dependencies...');
  
  // Load existing registry or create new one
  let registry;
  try {
    registry = await fs.readJson(REGISTRY_FILE);
  } catch {
    console.log('📄 Creating new registry file...');
    registry = {
      "$schema": "https://basis.zhengyishen.com/registry-schema.json",
      "version": "1.0.0",
      "components": {},
      "lib": {
        "utils": {
          "name": "utils",
          "description": "Utility functions for class name merging",
          "files": [{ "path": "lib/utils.ts", "type": "lib" }]
        },
        "component-variants": {
          "name": "component-variants",
          "description": "Shared component variant system",
          "dependencies": [],
          "registryDependencies": ["utils"],
          "files": [{ "path": "lib/component-variants.ts", "type": "lib" }]
        }
      }
    };
  }
  
  // Analyze each component's dependencies
  const componentDeps = {};
  
  for (const [categoryName, components] of Object.entries(COMPONENT_CATEGORIES)) {
    for (const component of components) {
      const componentPath = path.join(DEST_REGISTRY, 'components', component.name);
      
      if (await fs.pathExists(componentPath)) {
        const dependencies = await analyzeDependencies(component.name, componentPath);
        if (dependencies.length > 0) {
          componentDeps[component.name] = dependencies;
          console.log(`📦 ${component.name}: ${dependencies.join(', ')}`);
        }
      }
    }
  }
  
  // Update registry with component information and dependencies
  for (const [categoryName, components] of Object.entries(COMPONENT_CATEGORIES)) {
    for (const component of components) {
      const deps = componentDeps[component.name] || [];
      
      // Base dependencies for all components
      const baseDependencies = [
        "class-variance-authority@^0.7.1",
        "clsx@^2.1.1", 
        "tailwind-merge@^3.3.1"
      ];
      
      // Add specific dependencies based on component type
      const specificDeps = [];
      if (categoryName === 'forms' && ['checkbox', 'radio-group'].includes(component.name)) {
        // No extra deps
      } else if (categoryName === 'overlay') {
        specificDeps.push("@alpinejs/focus@^3.14.9");
      }
      
      // Files array
      const files = [];
      if (component.files) {
        files.push(...component.files.map(file => ({
          path: `components/${component.name}/${file}`,
          type: "component"
        })));
      } else {
        const fileName = path.basename(component.source);
        files.push({
          path: `components/${component.name}/${fileName}`,
          type: "component"
        });
      }
      
      // Check for index files and add them to the files array
      const componentDir = path.join(DEST_REGISTRY, 'components', component.name);
      for (const indexFile of ['index.ts', 'index.js']) {
        const indexPath = path.join(componentDir, indexFile);
        if (await fs.pathExists(indexPath)) {
          files.push({
            path: `components/${component.name}/${indexFile}`,
            type: "index"
          });
          break; // Only include one index file
        }
      }
      
      if (component.stores) {
        files.push(...component.stores.map(store => ({
          path: `components/${component.name}/${store}`,
          type: "store"
        })));
      }
      
      registry.components[component.name] = {
        name: component.name,
        category: categoryName,
        description: generateDescription(component.name, categoryName),
        dependencies: [...baseDependencies, ...specificDeps],
        registryDependencies: [...new Set(['utils', 'component-variants', ...deps])],
        files: files
      };
    }
  }
  
  // Save updated registry
  await fs.writeJson(REGISTRY_FILE, registry, { spaces: 2 });
  console.log(`\n✅ Updated registry with ${Object.keys(registry.components).length} components`);
}

function generateDescription(componentName, category) {
  const descriptions = {
    'button': 'A versatile button component with multiple variants and sizes',
    'card': 'Flexible content container with header, body, and footer',
    'dialog': 'Modal dialog with backdrop and focus management',
    'dropdown-menu': 'Dropdown menu with items and shortcuts',
    'popup': 'Floating popup with positioning',
    'accordion': 'Collapsible content sections with smooth animations',
    'menu': 'Generic menu component with groups and items',
    'command': 'Command palette with search and filtering',
    'tabs': 'Tabbed interface with content panels',
    'table': 'Basic data table with sorting',
    'data-table': 'Advanced data table with filtering, pagination, and real-time updates'
  };
  
  return descriptions[componentName] || `${componentName.replace('-', ' ')} component for ${category}`;
}

async function syncComponents(specificComponent = null, specificCategory = null) {
  console.log('🔄 Syncing components from basis-stack...\n');

  // Check if source exists
  if (!await fs.pathExists(SOURCE_COMPONENTS)) {
    console.error(`❌ Source path not found: ${SOURCE_COMPONENTS}`);
    console.log('Set BASIS_STACK_PATH environment variable or ensure ../basis-stack exists');
    process.exit(1);
  }

  // Ensure registry directory exists
  await ensureDir(path.join(DEST_REGISTRY, 'components'));

  // Sync lib files first
  await syncLibFiles();

  // Sync components
  let totalSynced = 0;
  for (const [categoryName, components] of Object.entries(COMPONENT_CATEGORIES)) {
    if (specificCategory && categoryName !== specificCategory) continue;

    console.log(`📁 ${categoryName}:`);
    
    for (const component of components) {
      if (specificComponent && component.name !== specificComponent) continue;
      
      try {
        await copyComponent(categoryName, component);
        totalSynced++;
      } catch (error) {
        console.error(`❌ Error copying ${component.name}:`, error.message);
      }
    }
    console.log();
  }

  console.log(`✅ Sync completed! ${totalSynced} components synced.`);
  
  // Update registry with dependencies
  await updateRegistryWithDependencies();
}

// Parse command line arguments
const args = process.argv.slice(2);
const specificComponent = args.find(arg => !arg.startsWith('--'));
const specificCategory = args.find(arg => arg.startsWith('--category='))?.split('=')[1];

// Run sync
syncComponents(specificComponent, specificCategory).catch(console.error);

export { COMPONENT_CATEGORIES };
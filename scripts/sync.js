#!/usr/bin/env node
import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Path to your basis-stack repository (adjust as needed)
const BASIS_STACK_PATH = process.env.BASIS_STACK_PATH || '../basis-stack';
const SOURCE_COMPONENTS = path.join(BASIS_STACK_PATH, 'src/components/ui');
const SOURCE_LIB = path.join(BASIS_STACK_PATH, 'src/lib');
const DEST_REGISTRY = path.join(__dirname, '../registry');

// Component mapping - organize by category
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
      files: ['RadioGroup.astro', 'RadioGroupItem.astro', 'RadioGroupItems.astro', 'RadioGroupLabel.astro', 'RadioGroupDescription.astro'] 
    }
  ],
  display: [
    { 
      name: 'card', 
      source: 'display/card',
      files: ['Card.astro', 'CardHeader.astro', 'CardContent.astro', 'CardFooter.astro'] 
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
    { name: 'tooltip', source: 'overlay/tooltip/Tooltip.astro' },
    { name: 'hover-card', source: 'overlay/hovercard/HoverCard.astro' },
    { name: 'context-menu', source: 'overlay/contextmenu/ContextMenu.astro' },
    { name: 'dropdown-menu', source: 'overlay/dropdownmenu/DropdownMenu.astro' },
    { name: 'menubar', source: 'overlay/menubar/MenuBar.astro' },
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

async function syncComponents(specificComponent = null, specificCategory = null) {
  console.log('🔄 Syncing components from basis-stack...\n');

  // Ensure registry directory exists
  await ensureDir(path.join(DEST_REGISTRY, 'components'));

  // Sync lib files first
  await syncLibFiles();

  // Sync components
  for (const [categoryName, components] of Object.entries(COMPONENT_CATEGORIES)) {
    if (specificCategory && categoryName !== specificCategory) continue;

    console.log(`📁 ${categoryName}:`);
    
    for (const component of components) {
      if (specificComponent && component.name !== specificComponent) continue;
      
      try {
        await copyComponent(categoryName, component);
      } catch (error) {
        console.error(`❌ Error copying ${component.name}:`, error.message);
      }
    }
    console.log();
  }

  console.log('✅ Sync completed!');
}

// Parse command line arguments
const args = process.argv.slice(2);
const specificComponent = args.find(arg => !arg.startsWith('--'));
const specificCategory = args.find(arg => arg.startsWith('--category='))?.split('=')[1];

// Run sync
syncComponents(specificComponent, specificCategory).catch(console.error);

export { COMPONENT_CATEGORIES };
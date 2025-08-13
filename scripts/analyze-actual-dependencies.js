#!/usr/bin/env node

import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';
import { glob } from 'glob';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const BASIS_STACK_PATH = process.env.BASIS_STACK_PATH || '../basis-stack';
const SOURCE_COMPONENTS = path.join(BASIS_STACK_PATH, 'src/components/ui');

// Component name mapping for precise detection
function getComponentNameMapping() {
  const map = new Map();
  
  // Base component names
  const components = [
    'button', 'text-input', 'textarea', 'checkbox', 'slider', 'rating', 'select', 'radio-group',
    'card', 'accordion', 'avatar', 'calendar', 'carousel', 'code', 'image', 'navbar', 
    'table-of-contents', 'text', 'video-player',
    'column', 'row', 'page', 'grid', 'grid-items', 'list', 'list-items', 'inline', 
    'divider', 'spacer', 'section', 'conditional',
    'tabs', 'breadcrumbs', 'pagination', 'navigation-menu',
    'dialog', 'popup', 'tooltip', 'hover-card', 'context-menu', 'dropdown-menu', 
    'menubar', 'command', 'menu',
    'alert', 'badge', 'empty', 'error', 'loading', 'progress', 'toast', 'banner',
    'table', 'data-table',
    'checkbox-indicator', 'radio-indicator', 'ellipsis',
    'copy-to-clipboard', 'monaco-editor'
  ];
  
  for (const comp of components) {
    map.set(comp, comp);
    
    // PascalCase variants
    const pascalName = comp.split('-').map(part => 
      part.charAt(0).toUpperCase() + part.slice(1)
    ).join('');
    map.set(pascalName, comp);
    
    // Common file name patterns
    map.set(comp.split('-').map(part => 
      part.charAt(0).toUpperCase() + part.slice(1)
    ).join('') + '.astro', comp);
  }
  
  return map;
}

async function analyzeComponentDependencies(componentPath, componentName) {
  const dependencies = new Set();
  const componentMap = getComponentNameMapping();
  
  // Get all .astro and .ts/.js files in the component folder
  const files = await glob('**/*.{astro,ts,js}', { 
    cwd: componentPath,
    absolute: true 
  });
  
  for (const filePath of files) {
    try {
      const content = await fs.readFile(filePath, 'utf-8');
      
      // Pattern 1: import Something from '../other-component/File.astro'
      const relativeImports = content.match(/import\s+[^'"]*\s+from\s+['"](\.\.[^'"]+)['"]/g);
      if (relativeImports) {
        for (const importStatement of relativeImports) {
          const match = importStatement.match(/from\s+['"]\.\.\/([^/'"]+)/);
          if (match) {
            const folderName = match[1];
            const mappedName = componentMap.get(folderName);
            if (mappedName && mappedName !== componentName) {
              dependencies.add(mappedName);
            }
          }
        }
      }
      
      // Pattern 2: import Something from '@/components/ui/category/Component.astro'
      const absoluteImports = content.match(/import\s+[^'"]*\s+from\s+['"]@\/components\/ui\/[^'"]+['"]/g);
      if (absoluteImports) {
        for (const importStatement of absoluteImports) {
          // Extract component name from path
          const pathMatch = importStatement.match(/from\s+['"]@\/components\/ui\/[^/]+\/([^/'"]+)['"]/);
          if (pathMatch) {
            const fileName = pathMatch[1];
            const mappedName = componentMap.get(fileName);
            if (mappedName && mappedName !== componentName) {
              dependencies.add(mappedName);
            }
          }
        }
      }
      
      // Pattern 3: Component usage in templates (e.g., <Button>, <Text>)
      const componentUsage = content.match(/<([A-Z][a-zA-Z]*)[>\s]/g);
      if (componentUsage) {
        for (const usage of componentUsage) {
          const match = usage.match(/<([A-Z][a-zA-Z]*)/);
          if (match) {
            const usedComponent = match[1];
            const mappedName = componentMap.get(usedComponent);
            if (mappedName && mappedName !== componentName) {
              dependencies.add(mappedName);
            }
          }
        }
      }
      
    } catch (error) {
      console.warn(`Warning: Could not read ${filePath}: ${error.message}`);
    }
  }
  
  return Array.from(dependencies);
}

async function analyzeAllComponents() {
  console.log('🔍 Analyzing actual component dependencies from source files...\n');
  
  const allDependencies = {};
  
  // Get all component folders
  const categories = await fs.readdir(SOURCE_COMPONENTS);
  
  for (const category of categories) {
    const categoryPath = path.join(SOURCE_COMPONENTS, category);
    const stat = await fs.stat(categoryPath);
    
    if (stat.isDirectory()) {
      console.log(`📁 ${category}:`);
      
      const items = await fs.readdir(categoryPath);
      
      for (const item of items) {
        const itemPath = path.join(categoryPath, item);
        const itemStat = await fs.stat(itemPath);
        
        if (itemStat.isDirectory()) {
          // Multi-file component folder
          const componentName = item.toLowerCase().replace(/[^a-z0-9]/g, '-');
          const dependencies = await analyzeComponentDependencies(itemPath, componentName);
          
          if (dependencies.length > 0) {
            allDependencies[componentName] = dependencies;
            console.log(`  ${componentName}: ${dependencies.join(', ')}`);
          } else {
            console.log(`  ${componentName}: no dependencies`);
          }
        } else if (item.endsWith('.astro')) {
          // Single file component
          const componentName = item.replace('.astro', '').toLowerCase().replace(/[^a-z0-9]/g, '-');
          const dependencies = await analyzeComponentDependencies(categoryPath, componentName);
          
          if (dependencies.length > 0) {
            allDependencies[componentName] = dependencies;
            console.log(`  ${componentName}: ${dependencies.join(', ')}`);
          } else {
            console.log(`  ${componentName}: no dependencies`);
          }
        }
      }
      console.log();
    }
  }
  
  // Summary
  console.log('📊 Dependency Summary:');
  const dependentCount = {};
  
  Object.values(allDependencies).forEach(deps => {
    deps.forEach(dep => {
      dependentCount[dep] = (dependentCount[dep] || 0) + 1;
    });
  });
  
  const sorted = Object.entries(dependentCount).sort(([,a], [,b]) => b - a);
  
  console.log('\nMost depended upon components:');
  for (const [component, count] of sorted) {
    console.log(`  ${component}: ${count} dependents`);
  }
  
  return allDependencies;
}

analyzeAllComponents().catch(console.error);
#!/usr/bin/env node

import fs from 'fs-extra';
import path from 'path';
import { glob } from 'glob';

const REGISTRY_DIR = path.join(process.cwd(), 'registry');
const COMPONENTS_DIR = path.join(REGISTRY_DIR, 'components');
const REGISTRY_FILE = path.join(REGISTRY_DIR, 'index.json');

// Component name mapping for different import patterns
const COMPONENT_NAME_MAP = {
  'CheckboxIndicator': 'checkbox-indicator',
  'RadioIndicator': 'radio-indicator',
  'Slider': 'slider',
  'Empty': 'empty',
  'Text': 'text',
  'Card': 'card',
  'Divider': 'divider',
  'CopyToClipboard': 'copy-to-clipboard',
  'Button': 'button',
  'Popup': 'popup',
  'Dialog': 'dialog',
  'DialogContent': 'dialog',
  'MenuContainer': 'menu',
  'MenuItem': 'menu',
  'MenuInput': 'menu'
};

// Path to component name mapping
const PATH_TO_COMPONENT = {
  'popup/Popup.astro': 'popup',
  'dialog/Dialog.astro': 'dialog',
  'dialog/DialogContent.astro': 'dialog',
  'menu/MenuContainer.astro': 'menu',
  'menu/MenuItem.astro': 'menu',
  'menu/MenuInput.astro': 'menu',
  'indicators/CheckboxIndicator.astro': 'checkbox-indicator',
  'indicators/RadioIndicator.astro': 'radio-indicator',
  'overlay/popup/Popup.astro': 'popup',
  'overlay/menu/MenuItem.astro': 'menu',
  'forms/Slider.astro': 'slider',
  'feedback/Empty.astro': 'empty',
  'display/Text.astro': 'text',
  'display/card': 'card',
  'layout/Divider.astro': 'divider',
  'interactive/CopyToClipboard.astro': 'copy-to-clipboard'
};

async function analyzeComponentDependencies() {
  console.log('🔍 Analyzing component dependencies...\n');
  
  // Get all component files
  const componentFiles = await glob('**/*.astro', { 
    cwd: COMPONENTS_DIR,
    absolute: true 
  });
  
  const componentDependencies = {};
  
  for (const filePath of componentFiles) {
    const relativePath = path.relative(COMPONENTS_DIR, filePath);
    const componentName = getComponentNameFromPath(relativePath);
    
    if (!componentName) continue;
    
    const dependencies = await extractDependencies(filePath, relativePath);
    
    if (dependencies.length > 0) {
      componentDependencies[componentName] = {
        file: relativePath,
        dependencies: dependencies
      };
      
      console.log(`📦 ${componentName}:`);
      console.log(`   File: ${relativePath}`);
      console.log(`   Dependencies: ${dependencies.join(', ')}`);
      console.log('');
    }
  }
  
  return componentDependencies;
}

function getComponentNameFromPath(relativePath) {
  // Extract component name from path like "button/Button.astro" -> "button"
  const parts = relativePath.split('/');
  if (parts.length >= 2) {
    return parts[0];
  }
  return null;
}

async function extractDependencies(filePath, relativePath) {
  const content = await fs.readFile(filePath, 'utf-8');
  const dependencies = new Set();
  
  // Pattern 1: import Something from '../other-component/File.astro'
  const relativeImports = content.match(/import\s+[^'"]*\s+from\s+['"](\.\.\/[^'"]+)['"]/g);
  if (relativeImports) {
    for (const importStatement of relativeImports) {
      const match = importStatement.match(/from\s+['"](\.\.\/[^'"]+)['"]/);
      if (match) {
        const importPath = match[1];
        // Convert "../popup/Popup.astro" to "popup"
        const cleanPath = importPath.replace('../', '').replace('.astro', '');
        const componentName = PATH_TO_COMPONENT[cleanPath + '.astro'] || cleanPath.split('/')[0];
        if (componentName && componentName !== getComponentNameFromPath(relativePath)) {
          dependencies.add(componentName);
        }
      }
    }
  }
  
  // Pattern 2: import Something from '@/components/ui/category/Component.astro'
  const absoluteImports = content.match(/import\s+[^'"]*\s+from\s+['"]\@\/components\/ui\/[^'"]+['"]/g);
  if (absoluteImports) {
    for (const importStatement of absoluteImports) {
      const match = importStatement.match(/from\s+['"]\@\/components\/ui\/([^'"]+)['"]/);
      if (match) {
        const importPath = match[1];
        const componentName = PATH_TO_COMPONENT[importPath] || importPath.split('/').pop().replace('.astro', '').toLowerCase();
        if (componentName && componentName !== getComponentNameFromPath(relativePath)) {
          dependencies.add(componentName);
        }
      }
    }
  }
  
  // Pattern 3: Look for component usage in template (less reliable but catches some cases)
  const componentUsage = content.match(/<([A-Z][a-zA-Z]+)[^>]*>/g);
  if (componentUsage) {
    for (const usage of componentUsage) {
      const match = usage.match(/<([A-Z][a-zA-Z]+)/);
      if (match) {
        const componentName = COMPONENT_NAME_MAP[match[1]];
        if (componentName && componentName !== getComponentNameFromPath(relativePath)) {
          dependencies.add(componentName);
        }
      }
    }
  }
  
  return Array.from(dependencies);
}

async function updateRegistry() {
  console.log('📝 Updating registry with correct dependencies...\n');
  
  // Load current registry
  const registry = await fs.readJson(REGISTRY_FILE);
  const dependencies = await analyzeComponentDependencies();
  
  // Update registry dependencies
  let updated = 0;
  for (const [componentName, depInfo] of Object.entries(dependencies)) {
    if (registry.components[componentName]) {
      const currentDeps = registry.components[componentName].registryDependencies || [];
      const newDeps = [...new Set([...currentDeps, ...depInfo.dependencies])];
      
      // Filter out invalid dependencies (components that don't exist)
      const validDeps = newDeps.filter(dep => 
        registry.components[dep] || registry.lib[dep]
      );
      
      if (JSON.stringify(currentDeps) !== JSON.stringify(validDeps)) {
        registry.components[componentName].registryDependencies = validDeps;
        console.log(`✅ Updated ${componentName}: ${validDeps.join(', ')}`);
        updated++;
      }
    }
  }
  
  // Save updated registry
  await fs.writeJson(REGISTRY_FILE, registry, { spaces: 2 });
  
  console.log(`\n🎉 Updated ${updated} components with correct dependencies!`);
  console.log(`📋 Registry saved to: ${REGISTRY_FILE}`);
}

async function main() {
  try {
    console.log('🚀 Basis UI Dependency Analysis Tool\n');
    
    const dependencies = await analyzeComponentDependencies();
    
    console.log('\n📊 Dependency Summary:');
    console.log(`   Total components analyzed: ${Object.keys(dependencies).length}`);
    
    // Show most dependent components
    const sorted = Object.entries(dependencies)
      .sort((a, b) => b[1].dependencies.length - a[1].dependencies.length)
      .slice(0, 10);
    
    console.log('\n🔗 Most dependent components:');
    for (const [name, info] of sorted) {
      console.log(`   ${name}: ${info.dependencies.length} dependencies`);
    }
    
    console.log('\n' + '='.repeat(50));
    const proceed = process.argv.includes('--update');
    
    if (proceed) {
      await updateRegistry();
    } else {
      console.log('ℹ️  Run with --update flag to update the registry');
      console.log('   node scripts/analyze-dependencies.js --update');
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}
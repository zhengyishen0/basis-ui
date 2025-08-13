#!/usr/bin/env node

import fs from 'fs-extra';
import path from 'path';
import { glob } from 'glob';

const REGISTRY_DIR = path.join(process.cwd(), 'registry');
const COMPONENTS_DIR = path.join(REGISTRY_DIR, 'components');

async function analyzeComponentFolders() {
  console.log('🔍 Analyzing component folder dependencies...\n');
  
  // Get all component folders
  const componentFolders = await fs.readdir(COMPONENTS_DIR, { withFileTypes: true });
  const folders = componentFolders
    .filter(dirent => dirent.isDirectory())
    .map(dirent => dirent.name);
  
  const componentDependencies = {};
  
  for (const folderName of folders) {
    const folderPath = path.join(COMPONENTS_DIR, folderName);
    const dependencies = await analyzeComponentFolder(folderName, folderPath);
    
    if (dependencies.length > 0) {
      componentDependencies[folderName] = dependencies;
    }
  }
  
  return componentDependencies;
}

async function analyzeComponentFolder(componentName, folderPath) {
  const dependencies = new Set();
  
  // Get all .astro and .js files in the component folder
  const files = await glob('**/*.{astro,js}', { 
    cwd: folderPath,
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
      const match = importStatement.match(/from\s+['"]\@\/components\/ui\/([^/'"]+)/);
      if (match) {
        const componentFolder = match[1];
        if (componentFolder && componentFolder !== currentComponent) {
          dependencies.add(componentFolder);
        }
      }
    }
  }
  
  // Pattern 3: Look for specific component usage patterns
  // e.g., <Popup>, <Dialog>, etc.
  const componentTags = content.match(/<([A-Z][a-zA-Z]+)[\s>]/g);
  if (componentTags) {
    for (const tag of componentTags) {
      const match = tag.match(/<([A-Z][a-zA-Z]+)/);
      if (match) {
        const componentName = match[1];
        // Map component names to folder names
        const folderName = componentNameToFolder(componentName);
        if (folderName && folderName !== currentComponent) {
          dependencies.add(folderName);
        }
      }
    }
  }
  
  return Array.from(dependencies);
}

function componentNameToFolder(componentName) {
  // Map component names to their folder equivalents
  const nameMap = {
    'Popup': 'popup',
    'PopupContent': 'popup',
    'PopupTrigger': 'popup',
    'Dialog': 'dialog', 
    'DialogContent': 'dialog',
    'DialogFooter': 'dialog',
    'DialogHeader': 'dialog',
    'DialogTrigger': 'dialog',
    'Menu': 'menu',
    'MenuContainer': 'menu',
    'MenuItem': 'menu',
    'MenuInput': 'menu',
    'MenuGroup': 'menu',
    'MenuGroups': 'menu',
    'MenuItems': 'menu',
    'MenuShortcut': 'menu',
    'MenuSubMenu': 'menu',
    'MenuSubTrigger': 'menu',
    'MenuConditional': 'menu',
    'Button': 'button',
    'Card': 'card',
    'CardContent': 'card',
    'CardFooter': 'card',
    'CardHeader': 'card',
    'Text': 'text',
    'Slider': 'slider',
    'Empty': 'empty',
    'Divider': 'divider',
    'CheckboxIndicator': 'checkbox-indicator',
    'RadioIndicator': 'radio-indicator',
    'CopyToClipboard': 'copy-to-clipboard',
    'Table': 'table',
    'TableBody': 'table',
    'TableCell': 'table',
    'TableHead': 'table',
    'TableHeader': 'table',
    'TableRow': 'table'
  };
  
  return nameMap[componentName] || componentName.toLowerCase().replace(/([A-Z])/g, '-$1').substring(1);
}

async function generateDependencyReport() {
  const dependencies = await analyzeComponentFolders();
  
  console.log('📊 COMPONENT DEPENDENCY ANALYSIS REPORT');
  console.log('=' .repeat(60));
  console.log();
  
  // Sort components by number of dependencies (most dependent first)
  const sorted = Object.entries(dependencies)
    .sort((a, b) => b[1].length - a[1].length);
  
  console.log('🔗 COMPONENTS WITH DEPENDENCIES:');
  console.log('-'.repeat(40));
  
  for (const [componentName, deps] of sorted) {
    console.log(`📦 ${componentName.toUpperCase()}`);
    console.log(`   Dependencies (${deps.length}): ${deps.join(', ')}`);
    console.log();
  }
  
  // Show dependency tree
  console.log('🌳 DEPENDENCY TREE:');
  console.log('-'.repeat(40));
  
  // Create reverse dependency map
  const dependents = {};
  for (const [component, deps] of Object.entries(dependencies)) {
    for (const dep of deps) {
      if (!dependents[dep]) dependents[dep] = [];
      dependents[dep].push(component);
    }
  }
  
  // Show most used dependencies
  const mostUsed = Object.entries(dependents)
    .sort((a, b) => b[1].length - a[1].length)
    .slice(0, 10);
  
  console.log('📈 MOST USED COMPONENTS (as dependencies):');
  for (const [component, users] of mostUsed) {
    console.log(`   ${component}: used by ${users.length} components (${users.join(', ')})`);
  }
  
  console.log();
  console.log('💡 RECOMMENDATIONS:');
  console.log('-'.repeat(40));
  
  // Find potential circular dependencies
  console.log('🔄 Checking for circular dependencies...');
  let circularFound = false;
  for (const [component, deps] of Object.entries(dependencies)) {
    for (const dep of deps) {
      if (dependencies[dep] && dependencies[dep].includes(component)) {
        console.log(`   ⚠️  Circular: ${component} ↔ ${dep}`);
        circularFound = true;
      }
    }
  }
  if (!circularFound) {
    console.log('   ✅ No circular dependencies found');
  }
  
  console.log();
  
  // Show components that could be simplified
  const complex = sorted.filter(([, deps]) => deps.length >= 3);
  if (complex.length > 0) {
    console.log('🏗️  Complex components (3+ dependencies):');
    for (const [component, deps] of complex) {
      console.log(`   ${component}: ${deps.length} dependencies`);
    }
  }
  
  console.log();
  console.log('📋 SUMMARY:');
  console.log(`   Total components: ${Object.keys(dependencies).length + (60 - Object.keys(dependencies).length)} (${Object.keys(dependencies).length} with dependencies)`);
  console.log(`   Most dependencies: ${sorted[0] ? sorted[0][1].length : 0} (${sorted[0] ? sorted[0][0] : 'none'})`);
  console.log(`   Average dependencies: ${(Object.values(dependencies).reduce((sum, deps) => sum + deps.length, 0) / Object.keys(dependencies).length).toFixed(1)}`);
  
  return dependencies;
}

async function main() {
  try {
    const dependencies = await generateDependencyReport();
    
    // Optionally save to file
    if (process.argv.includes('--save')) {
      const outputFile = 'component-dependencies.json';
      await fs.writeJson(outputFile, dependencies, { spaces: 2 });
      console.log(`\n💾 Dependencies saved to: ${outputFile}`);
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}
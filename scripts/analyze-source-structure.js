#!/usr/bin/env node

import fs from 'fs-extra';
import path from 'path';
import { glob } from 'glob';

const BASIS_STACK_PATH = process.env.BASIS_STACK_PATH || '../basis-stack';
const SOURCE_COMPONENTS = path.join(BASIS_STACK_PATH, 'src/components/ui');

async function analyzeSourceStructure() {
  console.log('🔍 Analyzing actual source structure...\n');
  
  if (!await fs.pathExists(SOURCE_COMPONENTS)) {
    console.error(`❌ Source path not found: ${SOURCE_COMPONENTS}`);
    console.log('Set BASIS_STACK_PATH environment variable or ensure ../basis-stack exists');
    return;
  }
  
  const structure = {};
  
  // Get all categories (directories in ui/)
  const categories = await fs.readdir(SOURCE_COMPONENTS, { withFileTypes: true });
  
  for (const category of categories) {
    if (!category.isDirectory() || category.name === 'node_modules') continue;
    
    const categoryPath = path.join(SOURCE_COMPONENTS, category.name);
    const categoryItems = await fs.readdir(categoryPath, { withFileTypes: true });
    
    structure[category.name] = {
      files: [],
      folders: []
    };
    
    for (const item of categoryItems) {
      if (item.isDirectory()) {
        // This is a multi-file component folder
        const componentPath = path.join(categoryPath, item.name);
        const componentFiles = await fs.readdir(componentPath);
        const astroFiles = componentFiles.filter(f => f.endsWith('.astro'));
        const jsFiles = componentFiles.filter(f => f.endsWith('.js'));
        
        structure[category.name].folders.push({
          name: item.name,
          astroFiles,
          jsFiles,
          hasIndex: componentFiles.includes('index.ts')
        });
      } else if (item.name.endsWith('.astro')) {
        // This is a single-file component
        structure[category.name].files.push(item.name);
      }
    }
  }
  
  return structure;
}

async function generateSyncMapping() {
  const structure = await analyzeSourceStructure();
  
  console.log('📊 SOURCE STRUCTURE ANALYSIS');
  console.log('=' .repeat(50));
  
  const mapping = {};
  
  for (const [categoryName, categoryData] of Object.entries(structure)) {
    console.log(`\n📁 ${categoryName.toUpperCase()}:`);
    mapping[categoryName] = [];
    
    // Single-file components
    if (categoryData.files.length > 0) {
      console.log('   Single files:');
      for (const file of categoryData.files) {
        const componentName = file.replace('.astro', '').toLowerCase()
          .replace(/([A-Z])/g, '-$1').replace(/^-/, '');
        console.log(`     ${file} → ${componentName}`);
        
        mapping[categoryName].push({
          name: componentName,
          source: `${categoryName}/${file}`
        });
      }
    }
    
    // Multi-file components
    if (categoryData.folders.length > 0) {
      console.log('   Component folders:');
      for (const folder of categoryData.folders) {
        const componentName = folder.name.toLowerCase()
          .replace(/([A-Z])/g, '-$1').replace(/^-/, '');
        console.log(`     ${folder.name}/ (${folder.astroFiles.length} files) → ${componentName}`);
        console.log(`       Files: ${folder.astroFiles.join(', ')}`);
        if (folder.jsFiles.length > 0) {
          console.log(`       Stores: ${folder.jsFiles.join(', ')}`);
        }
        
        const component = {
          name: componentName,
          source: `${categoryName}/${folder.name}`,
          files: folder.astroFiles
        };
        
        if (folder.jsFiles.length > 0) {
          component.stores = folder.jsFiles;
        }
        
        mapping[categoryName].push(component);
      }
    }
  }
  
  console.log('\n' + '=' .repeat(50));
  console.log('📋 SUMMARY:');
  
  let totalComponents = 0;
  for (const [category, components] of Object.entries(mapping)) {
    totalComponents += components.length;
    console.log(`   ${category}: ${components.length} components`);
  }
  console.log(`   TOTAL: ${totalComponents} components`);
  
  return mapping;
}

async function main() {
  try {
    const mapping = await generateSyncMapping();
    
    if (process.argv.includes('--generate-sync')) {
      console.log('\n🔧 Generating sync script mapping...\n');
      
      console.log('const COMPONENT_CATEGORIES = {');
      for (const [categoryName, components] of Object.entries(mapping)) {
        console.log(`  ${categoryName}: [`);
        for (const component of components) {
          if (component.files) {
            console.log(`    {`);
            console.log(`      name: '${component.name}',`);
            console.log(`      source: '${component.source}',`);
            console.log(`      files: [${component.files.map(f => `'${f}'`).join(', ')}]`);
            if (component.stores) {
              console.log(`      stores: [${component.stores.map(f => `'${f}'`).join(', ')}]`);
            }
            console.log(`    },`);
          } else {
            console.log(`    { name: '${component.name}', source: '${component.source}' },`);
          }
        }
        console.log(`  ],`);
      }
      console.log('};');
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}
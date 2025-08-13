#!/usr/bin/env node

import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const REGISTRY_FILE = path.join(__dirname, '../registry/index.json');

async function analyzeDependencyPatterns() {
  const registry = await fs.readJson(REGISTRY_FILE);
  
  // Count how many times each component is depended upon
  const dependencyCount = {};
  const dependents = {}; // Track which components depend on each component
  
  // Initialize counts
  for (const componentName of Object.keys(registry.components)) {
    dependencyCount[componentName] = 0;
    dependents[componentName] = [];
  }
  
  // Count dependencies
  for (const [componentName, component] of Object.entries(registry.components)) {
    if (component.registryDependencies) {
      for (const dep of component.registryDependencies) {
        if (dep !== 'utils' && dep !== 'component-variants' && registry.components[dep]) {
          dependencyCount[dep]++;
          dependents[dep].push(componentName);
        }
      }
    }
  }
  
  console.log('🔍 Component Dependency Analysis\n');
  
  // Show most depended upon components
  const sortedDeps = Object.entries(dependencyCount)
    .filter(([_, count]) => count > 0)
    .sort(([,a], [,b]) => b - a);
  
  console.log('📊 Most Depended Upon Components:');
  for (const [component, count] of sortedDeps) {
    console.log(`  ${component}: ${count} dependents`);
    if (dependents[component].length > 0) {
      console.log(`    └─ ${dependents[component].join(', ')}`);
    }
  }
  
  console.log('\n🔗 Component Categories by Dependency Type:');
  
  // Analyze by category
  const categoryDeps = {};
  for (const [componentName, component] of Object.entries(registry.components)) {
    const category = component.category;
    if (!categoryDeps[category]) {
      categoryDeps[category] = { dependsOn: new Set(), dependedBy: 0 };
    }
    
    if (component.registryDependencies) {
      for (const dep of component.registryDependencies) {
        if (dep !== 'utils' && dep !== 'component-variants' && registry.components[dep]) {
          categoryDeps[category].dependsOn.add(dep);
        }
      }
    }
    
    categoryDeps[category].dependedBy += dependencyCount[componentName];
  }
  
  for (const [category, info] of Object.entries(categoryDeps)) {
    console.log(`\n  ${category}:`);
    console.log(`    Dependencies: ${Array.from(info.dependsOn).join(', ') || 'none'}`);
    console.log(`    Times depended upon: ${info.dependedBy}`);
  }
  
  console.log('\n⚠️  Potentially Missing Dependencies:');
  
  // Look for components that seem like they should have more dependencies
  const suspiciousComponents = [
    'dropdown-menu', 'context-menu', 'hover-card', 'menubar', 'navigation-menu',
    'command', 'data-table', 'accordion', 'tabs'
  ];
  
  for (const comp of suspiciousComponents) {
    if (registry.components[comp]) {
      const deps = registry.components[comp].registryDependencies || [];
      const nonUtilDeps = deps.filter(d => d !== 'utils' && d !== 'component-variants');
      console.log(`  ${comp}: ${nonUtilDeps.join(', ') || 'no component deps'}`);
    }
  }
  
  console.log('\n🎯 Foundational Components (likely missing from dependencies):');
  const foundational = ['button', 'text', 'divider', 'icon'];
  for (const comp of foundational) {
    if (registry.components[comp]) {
      console.log(`  ${comp}: ${dependencyCount[comp]} explicit dependents`);
    }
  }
}

analyzeDependencyPatterns().catch(console.error);
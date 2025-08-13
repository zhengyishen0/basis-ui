import fs from 'fs-extra';
import path from 'path';
import prompts from 'prompts';
import chalk from 'chalk';
import ora from 'ora';
import { execa } from 'execa';
import { z } from 'zod';
import fetch from 'node-fetch';

const addOptionsSchema = z.object({
  components: z.array(z.string()).optional(),
  yes: z.boolean().default(false),
  overwrite: z.boolean().default(false),
  cwd: z.string(),
  path: z.string().default('./src/components/ui'),
});

type AddOptions = z.infer<typeof addOptionsSchema>;

const REGISTRY_URL = 'https://raw.githubusercontent.com/zhengyishen0/basis-ui/main/registry/index.json';
const REGISTRY_BASE_URL = 'https://raw.githubusercontent.com/zhengyishen0/basis-ui/main/registry';

interface RegistryComponent {
  name: string;
  category: string;
  description: string;
  dependencies: string[];
  registryDependencies: string[];
  files: Array<{
    path: string;
    type: 'component' | 'store' | 'lib';
  }>;
}

interface Registry {
  components: Record<string, RegistryComponent>;
  lib: Record<string, any>;
}

export async function add(components: string[], options: AddOptions) {
  try {
    const opts = addOptionsSchema.parse({ ...options, components });
    const cwd = path.resolve(opts.cwd);

    // Check if this is a basis-ui project
    const configPath = path.join(cwd, 'components.json');
    if (!fs.existsSync(configPath)) {
      console.error(chalk.red('❌ Could not find components.json.'));
      console.error('Please run ' + chalk.blue('npx basis-ui init') + ' first.');
      process.exit(1);
    }

    const config = await fs.readJson(configPath);
    const componentsPath = path.join(cwd, opts.path);

    // Fetch registry
    const spinner = ora('Fetching registry...').start();
    let registry: Registry;
    
    try {
      const response = await fetch(REGISTRY_URL);
      if (!response.ok) {
        throw new Error(`Failed to fetch registry: ${response.statusText}`);
      }
      registry = await response.json() as Registry;
      spinner.succeed('Registry fetched');
    } catch (error) {
      spinner.fail('Failed to fetch registry');
      console.error(chalk.red('❌ Could not fetch component registry.'));
      console.error('Please check your internet connection and try again.');
      process.exit(1);
    }

    // If no components specified, show selection menu
    if (!components?.length) {
      const choices = Object.values(registry.components).map(component => ({
        title: component.name,
        description: component.description,
        value: component.name,
      }));

      const response = await prompts({
        type: 'multiselect',
        name: 'components',
        message: 'Which components would you like to add?',
        choices,
        min: 1,
      });

      if (!response.components?.length) {
        console.log(chalk.gray('No components selected.'));
        return;
      }

      components = response.components;
    }

    // Validate components exist
    const invalidComponents = components.filter(name => !registry.components[name]);
    if (invalidComponents.length > 0) {
      console.error(chalk.red(`❌ Invalid components: ${invalidComponents.join(', ')}`));
      console.error('Available components:');
      Object.keys(registry.components).forEach(name => {
        console.error(`  - ${name}`);
      });
      process.exit(1);
    }

    // Resolve dependencies
    const allComponents = new Set<string>();
    const queue = [...components];
    
    while (queue.length > 0) {
      const componentName = queue.shift()!;
      if (allComponents.has(componentName)) continue;
      
      allComponents.add(componentName);
      const component = registry.components[componentName];
      
      // Add registry dependencies to queue
      component.registryDependencies?.forEach(dep => {
        if (!allComponents.has(dep) && !queue.includes(dep)) {
          queue.push(dep);
        }
      });
    }

    // Show what will be installed
    const componentList = Array.from(allComponents);
    const libDeps = new Set<string>();
    
    componentList.forEach(name => {
      registry.components[name]?.registryDependencies?.forEach(dep => {
        if (registry.lib[dep]) {
          libDeps.add(dep);
        }
      });
    });

    if (!opts.yes) {
      console.log(chalk.blue('\nComponents to be added:'));
      componentList.forEach(name => {
        const component = registry.components[name];
        console.log(`  ${chalk.green('+')} ${name} ${chalk.gray(`(${component.category})`)}`);
      });

      if (libDeps.size > 0) {
        console.log(chalk.blue('\nUtilities to be added:'));
        Array.from(libDeps).forEach(name => {
          console.log(`  ${chalk.green('+')} ${name}`);
        });
      }

      const { proceed } = await prompts({
        type: 'confirm',
        name: 'proceed',
        message: 'Proceed with installation?',
        initial: true,
      });

      if (!proceed) {
        console.log(chalk.gray('Installation cancelled.'));
        return;
      }
    }

    // Install dependencies
    const allDependencies = new Set<string>();
    componentList.forEach(name => {
      registry.components[name]?.dependencies?.forEach(dep => allDependencies.add(dep));
    });

    if (allDependencies.size > 0) {
      const installSpinner = ora('Installing dependencies...').start();
      try {
        await execa('npm', ['install', ...Array.from(allDependencies)], { cwd });
        installSpinner.succeed('Dependencies installed');
      } catch (error) {
        installSpinner.fail('Failed to install dependencies');
        console.error(chalk.yellow('⚠ Some dependencies failed to install. Please install them manually:'));
        console.error(Array.from(allDependencies).map(dep => `  npm install ${dep}`).join('\n'));
      }
    }

    // Install lib dependencies first
    for (const libName of libDeps) {
      await installLibrary(libName, registry.lib[libName], cwd, opts.overwrite);
    }

    // Install components
    const installSpinner = ora('Installing components...').start();
    
    for (const componentName of componentList) {
      const component = registry.components[componentName];
      await installComponent(componentName, component, componentsPath, opts.overwrite);
      installSpinner.text = `Installing ${componentName}...`;
    }

    installSpinner.succeed('Components installed');

    console.log(chalk.green('\n✅ Success! Components added to your project.'));
    console.log(chalk.blue('\nYou can now import them in your Astro components:'));
    componentList.forEach(name => {
      console.log(chalk.gray(`  import ${pascalCase(name)} from '${config.aliases.components}/ui/${name}';`));
    });

  } catch (error) {
    console.error(chalk.red('❌ Installation failed:'), error);
    process.exit(1);
  }
}

async function installLibrary(name: string, lib: any, cwd: string, overwrite: boolean) {
  for (const file of lib.files) {
    const sourcePath = `${REGISTRY_BASE_URL}/${file.path}`;
    const destPath = path.join(cwd, 'src', file.path);

    // Check if file exists
    if (fs.existsSync(destPath) && !overwrite) {
      console.log(chalk.yellow(`⚠ ${file.path} already exists. Skipping.`));
      continue;
    }

    // Ensure directory exists
    await fs.ensureDir(path.dirname(destPath));

    // Fetch and save file
    try {
      const response = await fetch(sourcePath);
      if (!response.ok) {
        throw new Error(`Failed to fetch ${sourcePath}`);
      }
      const content = await response.text();
      await fs.writeFile(destPath, content);
    } catch (error) {
      console.error(chalk.red(`❌ Failed to install ${file.path}:`, error));
    }
  }
}

async function installComponent(name: string, component: RegistryComponent, componentsPath: string, overwrite: boolean) {
  const componentDir = path.join(componentsPath, name);
  await fs.ensureDir(componentDir);

  for (const file of component.files) {
    const sourcePath = `${REGISTRY_BASE_URL}/${file.path}`;
    const fileName = path.basename(file.path);
    const destPath = path.join(componentDir, fileName);

    // Check if file exists
    if (fs.existsSync(destPath) && !overwrite) {
      console.log(chalk.yellow(`⚠ ${name}/${fileName} already exists. Use --overwrite to replace.`));
      continue;
    }

    // Fetch and save file
    try {
      const response = await fetch(sourcePath);
      if (!response.ok) {
        throw new Error(`Failed to fetch ${sourcePath}`);
      }
      
      let content = await response.text();
      
      // Transform import paths if needed
      content = transformImports(content);
      
      await fs.writeFile(destPath, content);
    } catch (error) {
      console.error(chalk.red(`❌ Failed to install ${name}/${fileName}:`, error));
    }
  }
}

function transformImports(content: string): string {
  // Transform relative imports to use the configured aliases
  content = content.replace(/from ['"]\.\.\/\.\.\/lib\/utils['"];?/g, 'from "@/lib/utils";');
  content = content.replace(/from ['"]\.\.\/\.\.\/lib\/component-variants['"];?/g, 'from "@/lib/component-variants";');
  
  return content;
}

function pascalCase(str: string): string {
  return str
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join('');
}
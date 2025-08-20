import fs from 'fs-extra';
import path from 'path';
import prompts from 'prompts';
import chalk from 'chalk';
import ora from 'ora';
import { execa } from 'execa';
import { z } from 'zod';
import fetch from 'node-fetch';

const addOptionsSchema = z.object({
  target: z.string().optional(),
  yes: z.boolean().default(false),
  overwrite: z.boolean().default(false),
  cwd: z.string(),
  path: z.string().default('./src/components/ui'),
});

type AddOptions = z.infer<typeof addOptionsSchema>;

const REGISTRY_URL = 'https://raw.githubusercontent.com/zhengyishen0/basis-ui/main/registry/index.json';
const REGISTRY_BASE_URL = 'https://raw.githubusercontent.com/zhengyishen0/basis-ui/main/registry';

interface Registry {
  ui: {
    name: string;
    description: string;
    dependencies: string[];
    files: Array<{
      path: string;
      type: string;
    }>;
  };
  lib: Record<string, any>;
}

export async function add(target: string, options: AddOptions) {
  try {
    const opts = addOptionsSchema.parse({ ...options, target });
    const cwd = path.resolve(opts.cwd);

    // Validate target
    if (target && target !== 'ui') {
      console.error(chalk.red(`❌ Invalid target: "${target}"`));
      console.error('Only "ui" is supported as a target.');
      console.error('Usage: ' + chalk.blue('npx basisui add ui'));
      process.exit(1);
    }

    // Check if this is a basis-ui project
    const configPath = path.join(cwd, 'components.json');
    if (!fs.existsSync(configPath)) {
      console.error(chalk.red('❌ Could not find components.json.'));
      console.error('Please run ' + chalk.blue('npx basisui init') + ' first.');
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

    // Check if ui folder already exists
    if (fs.existsSync(componentsPath) && !opts.overwrite) {
      const { overwrite } = await prompts({
        type: 'confirm',
        name: 'overwrite',
        message: `UI components already exist in ${opts.path}. Overwrite?`,
        initial: false,
      });

      if (!overwrite) {
        console.log(chalk.gray('Installation cancelled.'));
        return;
      }
    }

    // Show what will be installed
    if (!opts.yes) {
      console.log(chalk.blue('\n📦 Complete UI component library will be added:'));
      console.log(`  ${chalk.green('+')} ${registry.ui.description}`);
      if (registry.ui?.dependencies) {
        console.log(`  ${chalk.green('+')} ${registry.ui.dependencies.length} dependencies`);
      }
      
      // Also show lib dependencies
      const libDeps = Object.keys(registry.lib);
      if (libDeps.length > 0) {
        console.log(chalk.blue('\nUtilities to be added:'));
        libDeps.forEach(name => {
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

    // Install NPM dependencies
    if (registry.ui?.dependencies && registry.ui.dependencies.length > 0) {
      const installSpinner = ora('Installing dependencies...').start();
      try {
        await execa('npm', ['install', ...registry.ui.dependencies], { cwd });
        installSpinner.succeed('Dependencies installed');
      } catch (error) {
        installSpinner.fail('Failed to install dependencies');
        console.error(chalk.yellow('⚠ Some dependencies failed to install. Please install them manually:'));
        console.error(registry.ui.dependencies.map(dep => `  npm install ${dep}`).join('\n'));
      }
    }

    // Install lib dependencies first
    for (const [libName, lib] of Object.entries(registry.lib)) {
      await installLibrary(libName, lib, cwd, opts.overwrite);
    }

    // Download and install the entire UI folder
    const downloadSpinner = ora('Downloading UI components...').start();
    
    try {
      // Download the ui folder as a zip or copy files individually
      await downloadUiFolder(componentsPath, opts.overwrite);
      downloadSpinner.succeed('UI components installed');
    } catch (error) {
      downloadSpinner.fail('Failed to download UI components');
      throw error;
    }

    console.log(chalk.green('\n✅ Success! Complete UI library added to your project.'));
    console.log(chalk.blue('\nYou can now import components from:'));
    console.log(chalk.gray(`  import Button from '${config.aliases.components}/ui/forms/Button.astro';`));
    console.log(chalk.gray(`  import Card from '${config.aliases.components}/ui/display/Card.astro';`));
    console.log('\n📖 View all components at: https://basis.zhengyishen.com/components');

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

// Download the entire ui folder by fetching a tarball or copying files recursively
async function downloadUiFolder(destinationPath: string, overwrite: boolean) {
  const uiSourceUrl = `${REGISTRY_BASE_URL}/ui`;
  
  // Ensure destination directory exists
  await fs.ensureDir(destinationPath);
  
  // Remove existing files if overwrite is true
  if (overwrite && await fs.pathExists(destinationPath)) {
    await fs.remove(destinationPath);
    await fs.ensureDir(destinationPath);
  }
  
  // Use a simpler approach: try to fetch a known file structure
  // In a real implementation, you might use a GitHub API or tarball download
  
  // For now, let's fetch the UI folder by making a request to GitHub API
  try {
    const apiUrl = 'https://api.github.com/repos/zhengyishen0/basis-ui/contents/registry/ui';
    const response = await fetch(apiUrl);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch UI folder structure: ${response.statusText}`);
    }
    
    const items = await response.json() as any[];
    
    // Recursively download all files and folders
    await downloadGitHubFolder(items, destinationPath, 'ui');
    
  } catch (error) {
    console.error(chalk.red('Failed to download via GitHub API, falling back to direct download...'));
    throw new Error(`Could not download UI components: ${error}`);
  }
}

// Recursively download files from GitHub
async function downloadGitHubFolder(items: any[], basePath: string, relativePath: string) {
  for (const item of items) {
    if (item.type === 'file') {
      // Download file
      const filePath = path.join(basePath, item.name);
      await fs.ensureDir(path.dirname(filePath));
      
      const response = await fetch(item.download_url);
      if (response.ok) {
        const content = await response.text();
        await fs.writeFile(filePath, content);
      }
    } else if (item.type === 'dir') {
      // Recursively download directory
      const dirPath = path.join(basePath, item.name);
      await fs.ensureDir(dirPath);
      
      const dirResponse = await fetch(item.url);
      if (dirResponse.ok) {
        const dirItems = await dirResponse.json();
        await downloadGitHubFolder(dirItems, dirPath, path.join(relativePath, item.name));
      }
    }
  }
}

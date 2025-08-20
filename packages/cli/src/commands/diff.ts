import fs from 'fs-extra';
import path from 'path';
import chalk from 'chalk';
import ora from 'ora';
import { z } from 'zod';
import fetch from 'node-fetch';

const diffOptionsSchema = z.object({
  component: z.string().optional(),
  cwd: z.string(),
});

type DiffOptions = z.infer<typeof diffOptionsSchema>;

const REGISTRY_URL = 'https://raw.githubusercontent.com/zhengyishen0/basis-ui/main/registry/index.json';
const REGISTRY_BASE_URL = 'https://raw.githubusercontent.com/zhengyishen0/basis-ui/main/registry';

export async function diff(component: string | undefined, options: DiffOptions) {
  try {
    const opts = diffOptionsSchema.parse({ ...options, component });
    const cwd = path.resolve(opts.cwd);

    // Check if this is a basis-ui project
    const configPath = path.join(cwd, 'components.json');
    if (!fs.existsSync(configPath)) {
      console.error(chalk.red('❌ Could not find components.json.'));
      console.error('Please run ' + chalk.blue('npx basisui init') + ' first.');
      process.exit(1);
    }

    const config = await fs.readJson(configPath);
    const componentsPath = path.join(cwd, './src/components/ui');

    // Fetch registry
    const spinner = ora('Checking for updates...').start();
    let registry: any;
    
    try {
      const response = await fetch(REGISTRY_URL);
      if (!response.ok) {
        throw new Error(`Failed to fetch registry: ${response.statusText}`);
      }
      registry = await response.json();
      spinner.succeed('Registry checked');
    } catch (error) {
      spinner.fail('Failed to check registry');
      console.error(chalk.red('❌ Could not fetch component registry.'));
      process.exit(1);
    }

    // Since we now have a single UI library approach, just check if local UI exists
    if (!fs.existsSync(componentsPath)) {
      console.log(chalk.yellow('⚠ UI components are not installed locally.'));
      console.log(chalk.blue('Run: npx basisui add ui'));
      return;
    }

    // For the simplified approach, we'll check if the registry has been updated
    const hasRemoteUpdates = await checkForRemoteUpdates(componentsPath);
    
    if (!hasRemoteUpdates) {
      console.log(chalk.green('✅ UI components are up to date!'));
    } else {
      console.log(chalk.blue('📦 UI library updates are available'));
      console.log(chalk.gray(`Run ${chalk.blue('npx basisui add ui --overwrite')} to update.`));
    }

  } catch (error) {
    console.error(chalk.red('❌ Diff check failed:'), error);
    process.exit(1);
  }
}

async function getLocalComponents(componentsPath: string): Promise<string[]> {
  if (!fs.existsSync(componentsPath)) {
    return [];
  }

  const items = await fs.readdir(componentsPath, { withFileTypes: true });
  return items
    .filter(item => item.isDirectory())
    .map(item => item.name);
}

async function checkComponentDiff(
  name: string, 
  component: any, 
  componentsPath: string,
  silent = false
): Promise<boolean> {
  const componentDir = path.join(componentsPath, name);
  
  if (!fs.existsSync(componentDir)) {
    if (!silent) {
      console.log(chalk.yellow(`⚠ Component "${name}" is not installed locally.`));
    }
    return false;
  }

  let hasUpdates = false;

  for (const file of component.files) {
    const fileName = path.basename(file.path);
    const localPath = path.join(componentDir, fileName);
    
    if (!fs.existsSync(localPath)) {
      if (!silent) {
        console.log(chalk.yellow(`⚠ Missing file: ${name}/${fileName}`));
      }
      hasUpdates = true;
      continue;
    }

    // Fetch remote content
    try {
      const remotePath = `${REGISTRY_BASE_URL}/${file.path}`;
      const response = await fetch(remotePath);
      
      if (!response.ok) {
        if (!silent) {
          console.log(chalk.red(`❌ Failed to fetch remote ${fileName}`));
        }
        continue;
      }

      const remoteContent = await response.text();
      const localContent = await fs.readFile(localPath, 'utf-8');

      // Normalize content for comparison (remove import path differences)
      const normalizedRemote = normalizeContent(remoteContent);
      const normalizedLocal = normalizeContent(localContent);

      if (normalizedRemote !== normalizedLocal) {
        if (!silent) {
          console.log(chalk.blue(`📝 ${name}/${fileName} has updates available`));
          
          // Show diff preview (simplified)
          const remoteLinesCount = remoteContent.split('\n').length;
          const localLinesCount = localContent.split('\n').length;
          
          if (remoteLinesCount !== localLinesCount) {
            console.log(chalk.gray(`   Lines: ${localLinesCount} → ${remoteLinesCount}`));
          }
        }
        hasUpdates = true;
      }
    } catch (error) {
      if (!silent) {
        console.log(chalk.red(`❌ Error checking ${fileName}:`, error));
      }
    }
  }

  if (!silent && !hasUpdates) {
    console.log(chalk.green(`✅ ${name} is up to date`));
  }

  return hasUpdates;
}

async function checkForRemoteUpdates(componentsPath: string): Promise<boolean> {
  try {
    // Simple check: compare the registry lastUpdated timestamp with local install time
    const response = await fetch(REGISTRY_URL);
    if (!response.ok) {
      return false;
    }
    
    const registry = await response.json();
    const registryUpdated = new Date(registry.meta?.lastUpdated || 0);
    
    // Check when the local UI folder was last modified
    const stats = await fs.stat(componentsPath);
    const localUpdated = stats.mtime;
    
    // If registry is newer than local installation, there might be updates
    return registryUpdated > localUpdated;
  } catch (error) {
    // If we can't check, assume no updates to avoid false positives
    return false;
  }
}

function normalizeContent(content: string): string {
  // Remove whitespace differences and normalize import paths
  return content
    .replace(/from ['"]@\/lib\/utils['"];?/g, 'from "@/lib/utils";')
    .replace(/from ['"]\.\.\/\.\.\/lib\/utils['"];?/g, 'from "@/lib/utils";')
    .replace(/\s+/g, ' ')
    .trim();
}

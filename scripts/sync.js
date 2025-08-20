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
const DEST_COMPONENTS = path.join(DEST_REGISTRY, 'ui');


async function sync() {
  console.log('🔄 Syncing entire ui/ folder from basis-stack...\n');

  // Ensure registry directory exists
  await fs.ensureDir(DEST_REGISTRY);

  // Check if source exists
  if (!await fs.pathExists(SOURCE_COMPONENTS)) {
    console.error(`❌ Source components directory not found: ${SOURCE_COMPONENTS}`);
    console.error(`Please ensure BASIS_STACK_PATH is correct or set the environment variable.`);
    console.error(`Current BASIS_STACK_PATH: ${BASIS_STACK_PATH}`);
    process.exit(1);
  }

  // Copy the entire ui/ folder
  try {
    // Remove existing ui folder if it exists
    if (await fs.pathExists(DEST_COMPONENTS)) {
      await fs.remove(DEST_COMPONENTS);
      console.log('🗑️  Removed existing ui/ folder');
    }

    // Copy the entire ui/ folder
    await fs.copy(SOURCE_COMPONENTS, DEST_COMPONENTS);
    console.log('✅ Copied entire ui/ folder from basis-stack');

    // Also copy lib files
    const libDestDir = path.join(DEST_REGISTRY, 'lib');
    if (await fs.pathExists(SOURCE_LIB)) {
      await fs.copy(SOURCE_LIB, libDestDir);
      console.log('✅ Copied lib files');
    }

    console.log('\n🎉 Sync completed successfully!');
    console.log(`📁 UI components synced to: ${DEST_COMPONENTS}`);
    
  } catch (error) {
    console.error('❌ Error during sync:', error.message);
    process.exit(1);
  }
}

// Run sync
sync().catch(console.error);

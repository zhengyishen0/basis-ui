import fs from "fs-extra";
import path from "path";
import prompts from "prompts";
import chalk from "chalk";
import ora from "ora";
import { execa } from "execa";
import { z } from "zod";

const initOptionsSchema = z.object({
  cwd: z.string(),
  yes: z.boolean().default(false),
});

type InitOptions = z.infer<typeof initOptionsSchema>;

export async function init(options: InitOptions) {
  try {
    const opts = initOptionsSchema.parse(options);
    const cwd = path.resolve(opts.cwd);

    // Check if this is an Astro project
    const astroConfig = path.join(cwd, "astro.config.js");
    const astroConfigMjs = path.join(cwd, "astro.config.mjs");
    const astroConfigTs = path.join(cwd, "astro.config.ts");

    if (
      !fs.existsSync(astroConfig) &&
      !fs.existsSync(astroConfigMjs) &&
      !fs.existsSync(astroConfigTs)
    ) {
      console.error(
        chalk.red("❌ This does not appear to be an Astro project.")
      );
      console.error("Please run this command in an Astro project directory.");
      process.exit(1);
    }

    console.log(chalk.blue("🚀 Welcome to Basis UI!\n"));

    // Configuration options
    const questions = [
      {
        type: "select",
        name: "style",
        message: "Which style would you like to use?",
        choices: [
          {
            title: "Default",
            value: "default",
            description: "Clean and minimal design",
          },
        ],
        initial: 0,
      },
      {
        type: "text",
        name: "tailwindConfig",
        message: "Where is your tailwind.config file?",
        initial: "tailwind.config.js",
      },
      {
        type: "text",
        name: "tailwindCss",
        message: "Where is your global CSS file?",
        initial: "src/styles/global.css",
      },
      {
        type: "confirm",
        name: "rsc",
        message: "Would you like to use Alpine.js for reactivity?",
        initial: true,
      },
      {
        type: "text",
        name: "componentsPath",
        message: "Configure the import alias for components?",
        initial: "@/components",
      },
      {
        type: "text",
        name: "utilsPath",
        message: "Configure the import alias for utils?",
        initial: "@/lib/utils",
      },
    ];

    const config = opts.yes
      ? {
          style: "default",
          tailwindConfig: "tailwind.config.js",
          tailwindCss: "src/styles/global.css",
          rsc: true,
          componentsPath: "@/components",
          utilsPath: "@/lib/utils",
        }
      : await prompts(questions);

    if (!config.style) {
      console.log(chalk.gray("Operation cancelled."));
      process.exit(0);
    }

    const spinner = ora("Setting up your project...").start();

    try {
      // Create directories
      await fs.ensureDir(path.join(cwd, "src/components/ui"));
      await fs.ensureDir(path.join(cwd, "src/lib"));
      await fs.ensureDir(path.join(cwd, "src/styles"));

      // Install Astro integrations and base packages
      await setupAstroIntegrations(cwd);

      // Create/update tsconfig.json paths
      await updateTsConfig(cwd, config);

      // Setup Tailwind CSS
      await setupTailwind(cwd, config);

      // Add Alpine.js if requested
      if (config.rsc) {
        await setupAlpine(cwd);
      }

      // Setup icons
      await setupIcons(cwd);

      // Add utils
      await addUtils(cwd);

      // Create config file
      const basisConfig = {
        $schema: "https://basis.zhengyishen.com/schema.json",
        style: config.style,
        tailwind: {
          config: config.tailwindConfig,
          css: config.tailwindCss,
        },
        alpine: config.rsc,
        aliases: {
          components: config.componentsPath,
          utils: config.utilsPath,
        },
      };

      await fs.writeJson(path.join(cwd, "components.json"), basisConfig, {
        spaces: 2,
      });

      spinner.succeed("Project setup complete!");

      console.log(
        chalk.green(
          "\n✅ Success! Your project is now ready for Basis UI components."
        )
      );
      console.log("\nNext steps:");
      console.log(chalk.blue("  npx basisui add ui"));
      console.log("\nThis will install the complete UI component library.");
      console.log("\nFor more information: https://basis.zhengyishen.com");
    } catch (error) {
      spinner.fail("Setup failed");
      throw error;
    }
  } catch (error) {
    console.error(chalk.red("❌ Initialization failed:"), error);
    process.exit(1);
  }
}

async function updateTsConfig(cwd: string, config: any) {
  const tsConfigPath = path.join(cwd, "tsconfig.json");

  if (fs.existsSync(tsConfigPath)) {
    const tsConfig = await fs.readJson(tsConfigPath);

    if (!tsConfig.compilerOptions) {
      tsConfig.compilerOptions = {};
    }

    if (!tsConfig.compilerOptions.paths) {
      tsConfig.compilerOptions.paths = {};
    }

    // Add path mappings
    tsConfig.compilerOptions.paths["@/components/*"] = ["./src/components/*"];
    tsConfig.compilerOptions.paths["@/lib/*"] = ["./src/lib/*"];
    tsConfig.compilerOptions.paths["@/styles/*"] = ["./src/styles/*"];

    await fs.writeJson(tsConfigPath, tsConfig, { spaces: 2 });
  }
}

async function setupTailwind(cwd: string, config: any) {
  const tailwindConfigPath = path.join(cwd, config.tailwindConfig);

  // Check if Tailwind is already installed
  const packageJsonPath = path.join(cwd, "package.json");
  const packageJson = await fs.readJson(packageJsonPath);

  // Install Tailwind CSS v3 and related packages
  const tailwindPackages = [
    "tailwindcss@^3.4.0",
    "@tailwindcss/typography@^0.5.10", 
    "autoprefixer@^10.4.16",
    "postcss@^8.4.32"
  ];
  
  const missingTailwindPackages = tailwindPackages.filter(pkg => {
    const packageName = pkg.split('@')[0];
    return !packageJson.dependencies?.[packageName] && !packageJson.devDependencies?.[packageName];
  });
  
  if (missingTailwindPackages.length > 0) {
    console.log(chalk.blue('📦 Installing Tailwind CSS v3...'));
    await execa("npm", ["install", "-D", ...missingTailwindPackages], { cwd });
  }

  // Update Tailwind config
  if (fs.existsSync(tailwindConfigPath)) {
    // Read existing config and update it
    let configContent = await fs.readFile(tailwindConfigPath, "utf-8");

    // Add basis-ui theme if not present
    if (!configContent.includes("basis-ui")) {
      // This is a simplified version - in a real implementation, you'd parse and merge properly
      const themeAddition = `
// Basis UI theme
const colors = require('tailwindcss/colors');

module.exports = {
  // ... existing config
  theme: {
    extend: {
      colors: {
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
      },
    },
  },
};`;

      console.log(
        chalk.yellow(
          "⚠ Please manually update your Tailwind config with Basis UI theme colors."
        )
      );
    }
  }

  // Add CSS variables
  const cssPath = path.join(cwd, config.tailwindCss);
  await fs.ensureDir(path.dirname(cssPath));

  const cssContent = `@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    --background: 0 0% 100%;
    --foreground: 222.2 84% 4.9%;
    --card: 0 0% 100%;
    --card-foreground: 222.2 84% 4.9%;
    --popover: 0 0% 100%;
    --popover-foreground: 222.2 84% 4.9%;
    --primary: 221.2 83.2% 53.3%;
    --primary-foreground: 210 40% 98%;
    --secondary: 210 40% 96%;
    --secondary-foreground: 222.2 84% 4.9%;
    --muted: 210 40% 96%;
    --muted-foreground: 215.4 16.3% 46.9%;
    --accent: 210 40% 96%;
    --accent-foreground: 222.2 84% 4.9%;
    --destructive: 0 84.2% 60.2%;
    --destructive-foreground: 210 40% 98%;
    --border: 214.3 31.8% 91.4%;
    --input: 214.3 31.8% 91.4%;
    --ring: 221.2 83.2% 53.3%;
    --radius: 0.5rem;
  }

  .dark {
    --background: 222.2 84% 4.9%;
    --foreground: 210 40% 98%;
    --card: 222.2 84% 4.9%;
    --card-foreground: 210 40% 98%;
    --popover: 222.2 84% 4.9%;
    --popover-foreground: 210 40% 98%;
    --primary: 217.2 91.2% 59.8%;
    --primary-foreground: 222.2 84% 4.9%;
    --secondary: 217.2 32.6% 17.5%;
    --secondary-foreground: 210 40% 98%;
    --muted: 217.2 32.6% 17.5%;
    --muted-foreground: 215 20.2% 65.1%;
    --accent: 217.2 32.6% 17.5%;
    --accent-foreground: 210 40% 98%;
    --destructive: 0 62.8% 30.6%;
    --destructive-foreground: 210 40% 98%;
    --border: 217.2 32.6% 17.5%;
    --input: 217.2 32.6% 17.5%;
    --ring: 224.3 76.3% 94.1%;
  }
}

@layer base {
  * {
    @apply border-border;
  }
  body {
    @apply bg-background text-foreground;
  }
}`;

  if (!fs.existsSync(cssPath)) {
    await fs.writeFile(cssPath, cssContent);
  } else {
    const existingCss = await fs.readFile(cssPath, "utf-8");
    if (!existingCss.includes("--background")) {
      await fs.appendFile(cssPath, "\n\n" + cssContent);
    }
  }
}

async function setupAlpine(cwd: string) {
  const packageJsonPath = path.join(cwd, "package.json");
  const packageJson = await fs.readJson(packageJsonPath);

  const alpinePackages = [
    "alpinejs",
    "@alpinejs/collapse",
    "@alpinejs/focus",
    "@alpinejs/intersect",
    "@alpinejs/mask",
    "@alpinejs/persist",
    "@alpinejs/sort",
    "@alpinejs/anchor",
    "@alpinejs/morph",
    "@alpinejs/resize",
  ];

  const missingPackages = alpinePackages.filter(
    (pkg) =>
      !packageJson.dependencies?.[pkg] && !packageJson.devDependencies?.[pkg]
  );

  if (missingPackages.length > 0) {
    await execa("npm", ["install", ...missingPackages], { cwd });
  }
}

async function setupAstroIntegrations(cwd: string) {
  const packageJsonPath = path.join(cwd, "package.json");
  const packageJson = await fs.readJson(packageJsonPath);

  // Core Astro integrations and packages
  const astroPackages = [
    "@astrojs/tailwind@^5.1.0",
    "@astrojs/alpinejs@^0.4.0",
    "astro-icon@^1.1.5",
    "astro@^4.15.0" // Ensure we have a recent version
  ];

  const missingAstroPackages = astroPackages.filter(pkg => {
    const packageName = pkg.split('@')[0] + (pkg.includes('/') ? '/' + pkg.split('/')[1].split('@')[0] : '');
    return !packageJson.dependencies?.[packageName] && !packageJson.devDependencies?.[packageName];
  });

  if (missingAstroPackages.length > 0) {
    console.log(chalk.blue('🚀 Installing Astro integrations...'));
    await execa("npm", ["install", ...missingAstroPackages], { cwd });
  }

  // Also install class-variance-authority which is core to the component system
  const corePackages = [
    "class-variance-authority@^0.7.1",
  ];

  const missingCorePackages = corePackages.filter(pkg => {
    const packageName = pkg.split('@')[0];
    return !packageJson.dependencies?.[packageName] && !packageJson.devDependencies?.[packageName];
  });

  if (missingCorePackages.length > 0) {
    console.log(chalk.blue('📦 Installing core packages...'));
    await execa("npm", ["install", ...missingCorePackages], { cwd });
  }
}

async function setupIcons(cwd: string) {
  const packageJsonPath = path.join(cwd, "package.json");
  const packageJson = await fs.readJson(packageJsonPath);

  // Icon packages for the UI components (astro-icon already installed in setupAstroIntegrations)
  const iconPackages = [
    "@iconify-json/lucide@^1.2.62",
    "@iconify/tools@^4.0.0"
  ];

  const missingIconPackages = iconPackages.filter(pkg => {
    const packageName = pkg.includes('/') 
      ? pkg.split('@')[0] + '/' + pkg.split('@')[1].split('/')[0]
      : pkg.split('@')[0];
    return !packageJson.dependencies?.[packageName] && !packageJson.devDependencies?.[packageName];
  });

  if (missingIconPackages.length > 0) {
    console.log(chalk.blue('🎨 Installing icon packages...'));
    await execa("npm", ["install", ...missingIconPackages], { cwd });
  }
}

async function addUtils(cwd: string) {
  const utilsContent = `import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}`;

  const utilsPath = path.join(cwd, "src/lib/utils.ts");
  await fs.writeFile(utilsPath, utilsContent);

  // Install dependencies
  await execa("npm", ["install", "clsx@^2.1.1", "tailwind-merge@^2.5.4"], { cwd });
}

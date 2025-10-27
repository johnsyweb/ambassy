#!/usr/bin/env ts-node

import puppeteer, { Browser } from 'puppeteer';
import * as fs from 'fs';
import * as path from 'path';
import { spawn, ChildProcess } from 'child_process';
import { promisify } from 'util';

interface ScreenshotConfig {
  name: string;
  url: string;
  waitForTimeout?: number;
  viewport?: { width: number; height: number };
}

const screenshotConfigs: ScreenshotConfig[] = [
  {
    name: 'screenshot',
    url: 'http://localhost:8081/',
    waitForTimeout: 3000,
    viewport: { width: 1200, height: 800 },
  },
  {
    name: 'ambassy-social-preview',
    url: 'http://localhost:8081/',
    waitForTimeout: 3000,
    viewport: { width: 1200, height: 630 },
  },
];

async function generateScreenshots(): Promise<void> {
  let browser: Browser | null = null;
  let devServer: ChildProcess | null = null;

  try {
    console.log('🚀 Starting screenshot generation...');
    const isCI =
      process.env.CI === 'true' || process.env.GITHUB_ACTIONS === 'true';
    if (isCI) {
      console.log('📝 Running in CI mode (headless browser)');
    } else {
      console.log(
        '📝 Note: This script will start a dev server and open a browser window to take screenshots.'
      );
    }

    // Start the dev server
    console.log('🚀 Starting dev server...');
    devServer = spawn('pnpm', ['start'], {
      detached: false,
      stdio: 'inherit',
      env: {
        ...process.env,
        BROWSER: 'none', // Don't open browser automatically
      },
    });

    // Wait for the server to start
    console.log('⏳ Waiting for dev server to start...');
    await new Promise((resolve) => setTimeout(resolve, 10000));

    // Launch browser
    console.log('🌐 Launching browser...');
    browser = await puppeteer.launch({
      headless: isCI ? true : false,
      args: [
        '--disable-web-security',
        '--disable-features=VizDisplayCompositor',
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--no-first-run',
        '--no-zygote',
        '--single-process',
        '--disable-gpu',
      ],
      defaultViewport: null,
    });

    const page = await browser.newPage();

    for (const config of screenshotConfigs) {
      console.log(`📸 Capturing screenshot: ${config.name}`);

      // Set viewport if specified
      if (config.viewport) {
        await page.setViewport(config.viewport);
      }

      // Navigate to the URL
      console.log(`🌐 Navigating to ${config.url}...`);
      await page.goto(config.url, { waitUntil: 'networkidle2' });

      // Wait for the page to fully load
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Additional wait if specified
      if (config.waitForTimeout) {
        await new Promise((resolve) =>
          setTimeout(resolve, config.waitForTimeout)
        );
      }

      // Take screenshot
      const screenshotPath = path.join(
        process.cwd(),
        'public',
        `${config.name}.png`
      );

      await page.screenshot({
        path: screenshotPath as `${string}.png`,
        type: 'png',
        fullPage: false,
      });
      console.log(`✅ Screenshot saved: ${screenshotPath}`);
    }

    console.log('🎉 All screenshots generated successfully!');
  } catch (error) {
    console.error('❌ Error generating screenshots:', error);
    process.exit(1);
  } finally {
    if (browser) {
      await browser.close();
    }
    if (devServer) {
      console.log('🛑 Stopping dev server...');
      devServer.kill();
    }
  }
}

// Run the script
if (require.main === module) {
  generateScreenshots().catch((error) => {
    console.error('❌ Script failed:', error);
    process.exit(1);
  });
}

export { generateScreenshots };

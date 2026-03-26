#!/usr/bin/env ts-node

import puppeteer, { Browser } from 'puppeteer';
import * as fs from 'fs';
import * as path from 'path';
import { spawn, ChildProcess, execSync } from 'child_process';
import { promisify } from 'util';
import Papa from 'papaparse';
import * as net from 'net';
import {
  parseEventTeams,
  type EventTeamRow,
} from '../src/parsers/parseEventTeams';
import {
  parseEventAmbassadors,
  type EventAmbassadorRow,
} from '../src/parsers/parseEventAmbassadors';
import {
  parseRegionalAmbassadors,
  type RegionalAmbassadorRow,
} from '../src/parsers/parseRegionalAmbassadors';
import { EventAmbassadorMap } from '../src/models/EventAmbassadorMap';
import { EventTeamMap } from '../src/models/EventTeamMap';
import { RegionalAmbassadorMap } from '../src/models/RegionalAmbassadorMap';

interface ScreenshotConfig {
  name: string;
  url: string;
  waitForTimeout?: number;
  viewport?: { width: number; height: number };
}

/**
 * Find an available port starting from a base port
 */
function findAvailablePort(startPort: number): Promise<number> {
  return new Promise((resolve, reject) => {
    const server = net.createServer();
    server.listen(startPort, () => {
      const port = (server.address() as net.AddressInfo).port;
      server.close(() => resolve(port));
    });
    server.on('error', (err: NodeJS.ErrnoException) => {
      if (err.code === 'EADDRINUSE') {
        // Try next port
        findAvailablePort(startPort + 1).then(resolve).catch(reject);
      } else {
        reject(err);
      }
    });
  });
}

/**
 * Install puppeteer browsers if needed
 */
async function ensurePuppeteerBrowsers(): Promise<void> {
  try {
    console.log('🔍 Checking for Puppeteer browsers...');
    // Try to launch to see if browser is available
    const testBrowser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    }).catch(() => null);
    
    if (testBrowser) {
      await testBrowser.close();
      console.log('✅ Puppeteer browsers already installed');
      return;
    }
  } catch {
    // Browser not found, need to install
  }
  
  console.log('📦 Installing Puppeteer browsers...');
  try {
    execSync('npx puppeteer browsers install chrome', {
      stdio: 'inherit',
      cwd: process.cwd(),
    });
    console.log('✅ Puppeteer browsers installed successfully');
  } catch (error) {
    console.error('❌ Failed to install Puppeteer browsers:', error);
    throw error;
  }
}

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

    // Ensure Puppeteer browsers are installed
    await ensurePuppeteerBrowsers();

    // Find an available port
    console.log('🔍 Finding available port...');
    const port = await findAvailablePort(8082); // Start from 8082 to avoid conflicts
    console.log(`✅ Using port ${port}`);

    // Start the dev server with custom port
    console.log('🚀 Starting dev server...');
    devServer = spawn('pnpm', ['webpack', 'serve', '--port', port.toString()], {
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

    // Load CSV files and populate data before taking screenshots
    console.log('📂 Loading CSV files from public directory...');
    const publicDir = path.join(process.cwd(), 'public');
    
    const csvFiles = {
      eventAmbassadors: path.join(publicDir, 'Ambassadors - Event Ambassadors.csv'),
      eventTeams: path.join(publicDir, 'Ambassadors - Event Teams.csv'),
      regionalAmbassadors: path.join(publicDir, 'Ambassadors - Regional Ambassadors.csv'),
    };

    // Read and parse CSV files
    const eventAmbassadorsData = fs.readFileSync(csvFiles.eventAmbassadors, 'utf-8');
    const eventTeamsData = fs.readFileSync(csvFiles.eventTeams, 'utf-8');
    const regionalAmbassadorsData = fs.readFileSync(csvFiles.regionalAmbassadors, 'utf-8');

    const eventAmbassadorsParsed = Papa.parse<EventAmbassadorRow>(
      eventAmbassadorsData,
      {
        header: true,
        skipEmptyLines: true,
      },
    );
    const eventTeamsParsed = Papa.parse<EventTeamRow>(eventTeamsData, {
      header: true,
      skipEmptyLines: true,
    });
    const regionalAmbassadorsParsed = Papa.parse<RegionalAmbassadorRow>(
      regionalAmbassadorsData,
      {
        header: true,
        skipEmptyLines: true,
      },
    );

    // Parse the data
    const eventAmbassadors = parseEventAmbassadors(eventAmbassadorsParsed.data);
    const eventTeams = parseEventTeams(eventTeamsParsed.data);
    const regionalAmbassadors = parseRegionalAmbassadors(
      regionalAmbassadorsParsed.data,
    );

    // Convert to arrays for localStorage
    const eventAmbassadorsArray = Array.from(eventAmbassadors.entries());
    const eventTeamsArray = Array.from(eventTeams.entries());
    const regionalAmbassadorsArray = Array.from(regionalAmbassadors.entries());

    // Create screenshot configs with dynamic port
    const screenshotConfigs: ScreenshotConfig[] = [
      {
        name: 'screenshot',
        url: `http://localhost:${port}/`,
        waitForTimeout: 3000,
        viewport: { width: 1200, height: 800 },
      },
      {
        name: 'ambassy-social-preview',
        url: `http://localhost:${port}/`,
        waitForTimeout: 3000,
        viewport: { width: 1200, height: 630 },
      },
    ];

    for (const config of screenshotConfigs) {
      console.log(`📸 Capturing screenshot: ${config.name}`);

      // Set viewport if specified
      if (config.viewport) {
        await page.setViewport(config.viewport);
      }

      // Navigate to the URL
      console.log(`🌐 Navigating to ${config.url}...`);
      await page.goto(config.url, { waitUntil: 'networkidle2' });

      // Inject data into localStorage with correct prefix
      // Serialize data as JSON strings first to ensure proper serialization
      const eaDataJson = JSON.stringify(eventAmbassadorsArray);
      const etDataJson = JSON.stringify(eventTeamsArray);
      const raDataJson = JSON.stringify(regionalAmbassadorsArray);
      
      await page.evaluate((eaJson, etJson, raJson) => {
        const prefix = 'ambassy:';
        localStorage.setItem(`${prefix}eventAmbassadors`, eaJson);
        localStorage.setItem(`${prefix}eventTeams`, etJson);
        localStorage.setItem(`${prefix}regionalAmbassadors`, raJson);
        // Also set in sessionStorage as fallback
        sessionStorage.setItem(`${prefix}eventAmbassadors`, eaJson);
        sessionStorage.setItem(`${prefix}eventTeams`, etJson);
        sessionStorage.setItem(`${prefix}regionalAmbassadors`, raJson);
      }, eaDataJson, etDataJson, raDataJson);

      // Reload the page so it picks up the localStorage data
      await page.reload({ waitUntil: 'networkidle2' });

      // Wait for the introduction screen to disappear (data loaded)
      await page.waitForFunction(
        () => {
          const intro = document.getElementById('introduction');
          const ambassy = document.getElementById('ambassy');
          return intro && ambassy && 
                 (intro.style.display === 'none' || getComputedStyle(intro).display === 'none') &&
                 (ambassy.style.display !== 'none' && getComputedStyle(ambassy).display !== 'none');
        },
        { timeout: 15000 }
      ).catch(() => {
        console.log('⚠️  Data may not have loaded, continuing anyway...');
      });

      // Wait for map to be ready (check for map container)
      await page.waitForSelector('#mapContainer', { timeout: 10000 }).catch(() => {
        console.log('⚠️  Map container not found, continuing anyway...');
      });

      // Wait for map tiles and UI to render
      await new Promise((resolve) => setTimeout(resolve, 3000));

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

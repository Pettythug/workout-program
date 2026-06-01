const puppeteer = require('puppeteer');
const fs = require('fs');

(async () => {
    try {
        console.log("Launching browser...");
        const browser = await puppeteer.launch({ headless: "new" });
        const page = await browser.newPage();
        await page.setViewport({ width: 480, height: 800 });
        
        console.log("Navigating to app...");
        await page.goto('http://localhost:5174', { waitUntil: 'networkidle2' });
        
        console.log("Waiting for app to load...");
        // Wait for the Circuit Trainer tab and click it
        await page.waitForSelector('text/CIRCUIT', { timeout: 5000 });
        const tabs = await page.$$('.nav-tab');
        for (const tab of tabs) {
            const text = await page.evaluate(el => el.textContent, tab);
            if (text === 'CIRCUIT') {
                await tab.click();
                break;
            }
        }
        
        await new Promise(r => setTimeout(r, 1000)); // Wait for transition
        
        console.log("Taking screenshot...");
        await page.screenshot({ path: 'circuit_view.png' });
        
        // Open the help drawer
        console.log("Opening help drawer...");
        const helpBtn = await page.$('button.btn-secondary:has-text("❓")');
        if (helpBtn) {
            await helpBtn.click();
            await new Promise(r => setTimeout(r, 500)); // Wait for animation
            await page.screenshot({ path: 'help_drawer.png' });
        } else {
            console.log("Could not find help button.");
        }
        
        await browser.close();
        console.log("Done.");
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
})();

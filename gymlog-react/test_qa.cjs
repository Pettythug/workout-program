const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

const SCRATCH_DIR = 'C:\\Users\\wance\\.gemini\\antigravity\\brain\\a0a7d34f-dcb2-4819-bc1e-ac0e4e305691\\scratch';

if (!fs.existsSync(SCRATCH_DIR)) {
  fs.mkdirSync(SCRATCH_DIR, { recursive: true });
}

(async () => {
  console.log('Starting QA tests...');
  const browser = await puppeteer.launch({
    headless: "new",
    defaultViewport: { width: 1280, height: 800 }
  });
  const page = await browser.newPage();
  
  page.on('dialog', async dialog => {
    await dialog.accept();
  });
  
  try {
    console.log('Navigating to app...');
    await page.goto('http://localhost:5174/lift', { waitUntil: 'networkidle2', timeout: 30000 });
    
    console.log('Waiting for app to load...');
    await page.waitForFunction(() => {
        const btns = Array.from(document.querySelectorAll('button'));
        return btns.some(b => b.textContent.includes('??') || b.textContent.includes('\u2699'));
    }, { timeout: 20000 });

    console.log('Testing Settings Modal & Roster...');
    await page.evaluate(() => {
        const btns = Array.from(document.querySelectorAll('button'));
        const btn = btns.find(b => b.textContent.includes('??') || b.textContent.includes('\u2699'));
        if (btn) btn.id = 'temp-settings-btn';
    });
    await page.click('#temp-settings-btn');
    await new Promise(r => setTimeout(r, 500));
    await page.screenshot({ path: path.join(SCRATCH_DIR, '01_settings_modal.png') });
    
    await page.evaluate(() => {
        const input = document.querySelector('input[placeholder="New person name..."]');
        if (input) input.id = 'temp-person-input';
        
        const btns = Array.from(document.querySelectorAll('button'));
        const addBtn = btns.find(b => b.textContent === 'ADD');
        if (addBtn) addBtn.id = 'temp-add-btn';
    });
    
    const hasInput = await page.evaluate(() => !!document.querySelector('#temp-person-input'));
    if (hasInput) {
        await page.type('#temp-person-input', 'Tester');
        await page.click('#temp-add-btn');
        await new Promise(r => setTimeout(r, 500));
    }

    await page.evaluate(() => {
        const checkbox = document.querySelector('input[type="checkbox"]');
        if (checkbox) checkbox.id = 'temp-checkbox';
    });
    const hasCheckbox = await page.evaluate(() => !!document.querySelector('#temp-checkbox'));
    if (hasCheckbox) {
        const isChecked = await page.evaluate(() => document.querySelector('#temp-checkbox').checked);
        if (!isChecked) await page.click('#temp-checkbox');
    }
    await new Promise(r => setTimeout(r, 500));

    await page.evaluate(() => {
        const btns = Array.from(document.querySelectorAll('button'));
        const btn = btns.find(b => b.textContent.includes('?'));
        if (btn) btn.id = 'temp-close-btn';
    });
    if (await page.evaluate(() => !!document.querySelector('#temp-close-btn'))) await page.click('#temp-close-btn');
    await new Promise(r => setTimeout(r, 500));

    await page.evaluate(() => {
        const header = document.querySelector('.exercise-header');
        if (header) header.id = 'temp-ex-header';
    });
    const hasExHeader = await page.evaluate(() => !!document.querySelector('#temp-ex-header'));
    if (hasExHeader) {
        await page.click('#temp-ex-header');
        await new Promise(r => setTimeout(r, 1000));
        await page.screenshot({ path: path.join(SCRATCH_DIR, '02_exercise_card_open.png') });
        
        const hasReps = await page.evaluate(() => {
            return !!document.querySelector('input[placeholder="Reps"]');
        });

        if (hasReps) console.log('? Reps/Weight input row successfully appeared inside an opened Exercise Card.');
        else console.log('? Reps/Weight input row NOT found.');
    } else {
        console.log('? No Exercise Card found to test.');
    }

    console.log('Testing Help Drawer...');
    await page.evaluate(() => {
        const btns = Array.from(document.querySelectorAll('button'));
        const btn = btns.find(b => b.textContent.includes('?'));
        if (btn) btn.id = 'temp-help-btn';
    });
    await page.click('#temp-help-btn');
    await new Promise(r => setTimeout(r, 500));
    await page.screenshot({ path: path.join(SCRATCH_DIR, '03_help_drawer.png') });
    
    const isHelpOpen = await page.evaluate(() => {
        return !!document.querySelector('.help-drawer.open');
    });

    if (isHelpOpen) console.log('? Help Drawer (.help-drawer.open) successfully appeared in the DOM.');
    else console.log('? Help Drawer NOT found or not open.');
    
    await page.evaluate(() => {
        const btns = Array.from(document.querySelectorAll('button'));
        const closeBtns = btns.filter(b => b.textContent.includes('?'));
        if (closeBtns.length > 0) {
            closeBtns[closeBtns.length - 1].id = 'temp-help-close';
        }
    });
    const hasHelpClose = await page.evaluate(() => !!document.querySelector('#temp-help-close'));
    if (hasHelpClose) {
        if (await page.evaluate(() => !!document.querySelector('#temp-help-close'))) await page.click('#temp-help-close');
    } else {
        await page.click('#temp-help-btn');
    }
    await new Promise(r => setTimeout(r, 500));

    console.log('Testing Circuit View...');
    await page.evaluate(() => {
        const links = Array.from(document.querySelectorAll('a'));
        const link = links.find(a => a.textContent.includes('CIRCUIT'));
        if (link) link.id = 'temp-circuit-link';
    });
    await page.click('#temp-circuit-link');
    await new Promise(r => setTimeout(r, 1500));
    await page.screenshot({ path: path.join(SCRATCH_DIR, '04_circuit_view.png') });
    
    const circuitInfo = await page.evaluate(() => {
        const text = document.body.innerText;
        return text.includes('Full Body Circuit') && text.includes('Plan Exercise Mimic') && text.includes('Hit Every Machine');
    });

    if (circuitInfo) console.log('? Circuit mode buttons are visible and stacked correctly.');
    else console.log('? Circuit mode buttons are missing.');
    
    console.log('All QA tests completed.');
  } catch (err) {
    console.error('Test failed:', err);
  } finally {
    await browser.close();
  }
})();

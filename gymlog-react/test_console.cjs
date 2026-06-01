
const puppeteer = require("puppeteer");
(async () => {
    const browser = await puppeteer.launch({headless: true});
    const page = await browser.newPage();
    page.on("console", msg => console.log("BROWSER CONSOLE:", msg.text()));
    page.on("pageerror", err => console.log("BROWSER ERROR:", err.message));
    
    await page.goto("http://localhost:5173/workout-program/react/#/circuit");
    await page.waitForSelector("button.btn-secondary", {timeout: 10000});
    
    const buttons = await page.$$("button.btn-secondary");
    for (const btn of buttons) {
        const text = await page.evaluate(el => el.innerText, btn);
        if (text.includes("Full Body Circuit")) {
            await btn.click();
            break;
        }
    }
    await new Promise(r => setTimeout(r, 2000));
    
    const cards = await page.$$(".exercise-header, [style*=\"cursor: pointer\"]");
    if (cards.length > 0) {
        await cards[0].click();
        await new Promise(r => setTimeout(r, 1000));
        
        const repInputs = await page.$$("input[placeholder=\"Reps\"]");
        if (repInputs.length > 0) {
            await repInputs[0].type("10");
        }
        
        const logBtns = await page.$$("button.btn-success");
        for (const btn of logBtns) {
            const text = await page.evaluate(el => el.innerText, btn);
            if (text.includes("LOG SET")) {
                await btn.click();
                break;
            }
        }
    }
    await new Promise(r => setTimeout(r, 5000));
    await browser.close();
})();

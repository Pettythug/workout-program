
const puppeteer = require("puppeteer");
(async () => {
    const browser = await puppeteer.launch({headless: true});
    const page = await browser.newPage();
    page.on("request", req => {
        if (req.url().includes("script.google.com")) {
            console.log("REQUEST URL:", req.url());
            console.log("REQUEST METHOD:", req.method());
            console.log("REQUEST POST DATA:", req.postData());
        }
    });
    page.on("response", async res => {
        if (res.url().includes("script.google.com")) {
            console.log("RESPONSE:", await res.text());
        }
    });
    await page.goto("http://localhost:5173/workout-program/react/#/circuit");
    await page.waitForSelector("button.btn-success", {timeout: 5000}); // Resume or Generate
    // Let us click "Full Body Circuit"
    const buttons = await page.$$("button.btn-secondary");
    for (const btn of buttons) {
        const text = await page.evaluate(el => el.innerText, btn);
        if (text.includes("Full Body Circuit")) {
            await btn.click();
            break;
        }
    }
    await new Promise(r => setTimeout(r, 2000));
    // Click the first card
    const cards = await page.$$(".exercise-header, [style*=\"cursor: pointer\"]");
    if (cards.length > 0) {
        await cards[0].click();
        await new Promise(r => setTimeout(r, 1000));
        // Type reps
        const repInputs = await page.$$("input[placeholder=\"Reps\"]");
        if (repInputs.length > 0) {
            await repInputs[0].type("10");
        }
        // Click LOG SET
        const logBtns = await page.$$("button.btn-success");
        for (const btn of logBtns) {
            const text = await page.evaluate(el => el.innerText, btn);
            if (text.includes("LOG SET")) {
                await btn.click();
                break;
            }
        }
    }
    await new Promise(r => setTimeout(r, 3000));
    await browser.close();
})();

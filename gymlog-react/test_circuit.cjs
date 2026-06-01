
const puppeteer = require("puppeteer");
(async () => {
    const browser = await puppeteer.launch({headless: true});
    const page = await browser.newPage();
    
    page.on("console", msg => console.log("CONSOLE:", msg.text()));
    
    await page.goto("http://localhost:5173/workout-program/react/#/circuit");
    await page.waitForSelector("button.btn-secondary", {timeout: 10000});
    
    const response = await page.evaluate(async () => {
        // Find React context or just try to trigger the log function manually if possible.
        // Or we can just use the UI.
        const btns = Array.from(document.querySelectorAll("button"));
        const fbcBtn = btns.find(b => b.innerText.includes("Full Body Circuit"));
        if (fbcBtn) fbcBtn.click();
        
        await new Promise(r => setTimeout(r, 1000));
        
        const cards = Array.from(document.querySelectorAll(".exercise-header"));
        if (cards.length > 0) cards[0].click();
        
        await new Promise(r => setTimeout(r, 1000));
        
        const inputs = Array.from(document.querySelectorAll("input[placeholder=\"Reps\"]"));
        if (inputs.length > 0) {
            // simulate typing
            const nativeInputValueSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, "value").set;
            nativeInputValueSetter.call(inputs[0], "10");
            const ev2 = new Event("input", { bubbles: true});
            inputs[0].dispatchEvent(ev2);
        }
        
        await new Promise(r => setTimeout(r, 1000));
        
        const logBtns = Array.from(document.querySelectorAll("button.btn-success"));
        const logBtn = logBtns.find(b => b.innerText.includes("LOG SET"));
        if (logBtn) {
            logBtn.click();
            return "Clicked Log Set";
        }
        return "Failed to click";
    });
    
    console.log("Evaluation:", response);
    
    // Wait for network
    await new Promise(r => setTimeout(r, 5000));
    
    await browser.close();
})();

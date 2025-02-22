const puppeteer = require('puppeteer-core');

(async () => {
    const browser = await puppeteer.launch({
        executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', // System Chrome
        headless: false,
        userDataDir: "/tmp/puppeteer-profile", // Temporary profile
        args: ["--no-sandbox", "--disable-setuid-sandbox"]
    });

    const page = await browser.newPage();

    // Set user agent to avoid bot detection
    await page.setUserAgent(
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
    );

    console.log("Opening Minerva...");
    await page.goto('https://forum.minerva.edu/app', { waitUntil: 'networkidle2' });

    console.log("Waiting for login...");
    try {
        // Click the login button if it exists
        await page.waitForSelector('button[data-testid="Button"]', { timeout: 10000 });
        await page.click('button[data-testid="Button"]');
        console.log("Clicked login button.");
    } catch (error) {
        console.log("Login button not found. Skipping...");
    }

    // Wait for Google login or redirection
    await page.waitForTimeout(20000);
    const pages = await browser.pages();
    const googleLoginPage = pages[pages.length - 1];
    await googleLoginPage.bringToFront();

    // If already logged in, it should redirect to Minerva
    if (await googleLoginPage.$('input[type="email"]')) {
        console.log("Google login detected. Entering credentials...");
        
        await googleLoginPage.type('input[type="email"]', 'your-email@example.com');
        await googleLoginPage.keyboard.press('Enter');

        await googleLoginPage.waitForSelector('input[type="password"]', { timeout: 15000 });
        await googleLoginPage.type('input[type="password"]', 'your-password');
        await googleLoginPage.keyboard.press('Enter');

        await googleLoginPage.waitForNavigation({ waitUntil: 'networkidle2' });
        console.log("Logged in successfully.");
    } else {
        console.log("Already logged in. Redirecting to Minerva...");
    }

    // Wait for Minerva to fully load after authentication
    await page.waitForNavigation({ waitUntil: 'networkidle2' });

    // Extract cookies
    const cookies = await page.cookies();
    const csrfToken = cookies.find(c => c.name === 'csrftoken')?.value;
    const sessionId = cookies.find(c => c.name === 'sessionid')?.value;

    console.log(`CSRF Token: ${csrfToken || "Not found"}`);
    console.log(`Session ID: ${sessionId || "Not found"}`);

    await browser.close();
})();

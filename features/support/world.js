const { setWorldConstructor, Before, After } = require('@cucumber/cucumber');
const puppeteer = require('puppeteer');

class CustomWorld {
  async init() {
    this.browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    this.page = await this.browser.newPage();
    await this.page.setViewport({ width: 1600, height: 1200 });
  }

  async cleanup() {
    if (this.browser) {
      await this.browser.close();
    }
  }

  async goto(url) {
    await this.page.goto(url, { waitUntil: 'networkidle0' });
  }

  async waitForSelector(selector, options = {}) {
    return await this.page.waitForSelector(selector, { timeout: 5000, ...options });
  }

  async click(selector) {
    await this.waitForSelector(selector);
    await this.page.click(selector);
  }

  async getText(selector) {
    await this.waitForSelector(selector);
    return await this.page.$eval(selector, el => el.textContent);
  }

  async countElements(selector) {
    return await this.page.$$eval(selector, elements => elements.length);
  }

  async isVisible(selector) {
    try {
      await this.waitForSelector(selector, { timeout: 2000 });
      return await this.page.$eval(selector, el => {
        const style = window.getComputedStyle(el);
        return style.display !== 'none' && style.visibility !== 'hidden' && style.opacity !== '0';
      });
    } catch (error) {
      return false;
    }
  }
}

setWorldConstructor(CustomWorld);

Before(async function() {
  await this.init();
});

After(async function() {
  await this.cleanup();
});

const { Given, When, Then } = require('@cucumber/cucumber');
const assert = require('assert');

const BASE_URL = 'http://localhost:3000';

// Navigation steps
Given('I am on the landing page', async function() {
  await this.goto(BASE_URL);
  await this.waitForSelector('#landing-screen.active');
});

When('I click on the {string} category card', async function(category) {
  const categoryCards = await this.page.$$('.category-card');

  for (const card of categoryCards) {
    const text = await card.evaluate(el => el.textContent);
    if (text.includes(category)) {
      await card.click();
      await new Promise(resolve => setTimeout(resolve, 500)); // Wait for transition
      break;
    }
  }
});

When('I click the back button', async function() {
  // Check which screen we're on and click the appropriate back button
  const onDetailScreen = await this.page.$('#detail-screen.active');
  const onListScreen = await this.page.$('#list-screen.active');

  if (onDetailScreen) {
    await this.page.evaluate(() => {
      document.querySelector('#back-to-list').click();
    });
  } else if (onListScreen) {
    await this.page.evaluate(() => {
      document.querySelector('#back-to-categories').click();
    });
  }

  await new Promise(resolve => setTimeout(resolve, 500));
});

When('I click on the page title', async function() {
  await this.click('#home-link');
  await new Promise(resolve => setTimeout(resolve, 500));
});

When('I click on the first item in the list', async function() {
  await this.waitForSelector('.item-card');
  await new Promise(resolve => setTimeout(resolve, 1000)); // Wait for images to start loading
  await this.click('.item-card:first-child');
  await new Promise(resolve => setTimeout(resolve, 500));
});

// Assertion steps
Then('I should see the title {string}', async function(title) {
  const actualTitle = await this.getText('header h1');
  assert.strictEqual(actualTitle, title);
});

Then('I should see the subtitle {string}', async function(subtitle) {
  const actualSubtitle = await this.getText('.subtitle');
  assert.strictEqual(actualSubtitle, subtitle);
});

Then('I should see {int} category cards', async function(count) {
  const actualCount = await this.countElements('.category-card');
  assert.strictEqual(actualCount, count);
});

Then('I should see a category card for {string}', async function(category) {
  const cards = await this.page.$$('.category-card');
  let found = false;

  for (const card of cards) {
    const text = await card.evaluate(el => el.textContent);
    if (text.includes(category)) {
      found = true;
      break;
    }
  }

  assert.strictEqual(found, true, `Category card for "${category}" not found`);
});

Then('I should be on the landing screen', async function() {
  const isActive = await this.isVisible('#landing-screen.active');
  assert.strictEqual(isActive, true);
});

Then('I should be on the list screen', async function() {
  await this.waitForSelector('#list-screen.active');
  const isActive = await this.isVisible('#list-screen.active');
  assert.strictEqual(isActive, true);
});

Then('I should be on the detail screen', async function() {
  const isActive = await this.isVisible('#detail-screen.active');
  assert.strictEqual(isActive, true);
});

Then('I should see the list title {string}', async function(title) {
  const actualTitle = await this.getText('#list-title');
  assert.strictEqual(actualTitle.toLowerCase(), title.toLowerCase());
});

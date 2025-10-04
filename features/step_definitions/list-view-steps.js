const { Then } = require('@cucumber/cucumber');
const assert = require('assert');

Then('I should see a list of items', async function() {
  const itemCount = await this.countElements('.item-card');
  assert.ok(itemCount > 0, 'No items found in the list');
});

Then('each item should have a thumbnail image', async function() {
  const thumbnails = await this.countElements('.item-thumbnail');
  const items = await this.countElements('.item-card');
  assert.strictEqual(thumbnails, items, 'Not all items have thumbnails');
});

Then('each item should have a name', async function() {
  const names = await this.countElements('.item-card h3');
  const items = await this.countElements('.item-card');
  assert.strictEqual(names, items, 'Not all items have names');
});

Then('I should see pagination controls', async function() {
  const isVisible = await this.isVisible('.pagination');
  assert.strictEqual(isVisible, true, 'Pagination controls not visible');
});

Then('I should see a {string} button', async function(buttonText) {
  const buttons = await this.page.$$('.page-btn');
  let found = false;

  for (const button of buttons) {
    const text = await button.evaluate(el => el.textContent);
    if (text.includes(buttonText)) {
      found = true;
      break;
    }
  }

  assert.strictEqual(found, true, `"${buttonText}" button not found`);
});

Then('I should see page information', async function() {
  const isVisible = await this.isVisible('#page-info');
  assert.strictEqual(isVisible, true, 'Page information not visible');
});

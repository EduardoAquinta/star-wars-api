const { Then } = require('@cucumber/cucumber');
const assert = require('assert');

Then('I should see item details', async function() {
  const isVisible = await this.isVisible('#detail-content');
  assert.strictEqual(isVisible, true, 'Detail content not visible');
});

Then('I should see a detail wrapper with two columns', async function() {
  const isVisible = await this.isVisible('#detail-wrapper');
  assert.strictEqual(isVisible, true, 'Detail wrapper not visible');
});

Then('I should see the detail content section', async function() {
  const isVisible = await this.isVisible('#detail-content');
  assert.strictEqual(isVisible, true, 'Detail content section not visible');
});

Then('I should see the detail image section', async function() {
  const isVisible = await this.isVisible('#detail-image');
  assert.strictEqual(isVisible, true, 'Detail image section not visible');
});

Then('the detail content should contain item properties', async function() {
  const rowCount = await this.countElements('.detail-row');
  assert.ok(rowCount > 0, 'No detail rows found');

  // Check that each row has a label and value
  const labelCount = await this.countElements('.detail-label');
  const valueCount = await this.countElements('.detail-value');

  assert.strictEqual(labelCount, rowCount, 'Not all rows have labels');
  assert.strictEqual(valueCount, rowCount, 'Not all rows have values');
});

Then('I should see an image or a loading message in the image section', async function() {
  const hasImage = await this.page.$eval('#detail-image', el => {
    return el.querySelector('img') !== null || el.textContent.includes('Loading') || el.textContent.includes('Image not available');
  });

  assert.strictEqual(hasImage, true, 'No image or loading message found');
});

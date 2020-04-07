const target_url = 'http://127.0.0.1:8081/tests/fixture-data/index.html';
const waitTime = 10000;
const selBtnFS = '.button-fullscreen';
const selCanvas = '.canvas-container';

module.exports = {
  tags: ['skip-chrome-headless'],
  beforeEach: (browser) => {
     browser.url(target_url)
     .waitForElementVisible(selCanvas, waitTime);
  },
  'Should reset icon on fullscreen': (browser) => {
    const selFS = '.av-icon-fullscreen';
    browser
      .click(selBtnFS)
      .assert.cssClassPresent(selFS, 'exit')
      .click(selBtnFS)
      .assert.not.cssClassPresent(selFS, 'exit')
      .end();
  }
};

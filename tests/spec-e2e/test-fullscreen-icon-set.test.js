const target_url = 'http://127.0.0.1:8084/tests/fixture-data/index.html';
const waitTime = 10000;
const selBtnFS = '.button-fullscreen';
const selCanvas = '.canvas-container';

module.exports = {
  beforeEach: (browser) => {
     browser.url(target_url)
     .waitForElementVisible(selCanvas, waitTime);
  },
  'Should update icon on fullscreen': (browser) => {
    const selFS = '.av-icon-fullscreen';
    browser
      .assert.not.cssClassPresent(selFS, 'exit')
      .click(selBtnFS)
      .assert.cssClassPresent(selFS, 'exit')
      .end();
  }
};

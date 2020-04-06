const target_url = 'http://127.0.0.1:8081/tests/fixture-data/index.html';
const waitTime = 10000;
const selBtnFS = '.button-fullscreen';
const selCanvas = '.canvas-container';

module.exports = {
  beforeEach: (browser) => {
     browser.url(target_url)
     .waitForElementVisible(selCanvas, waitTime)
  },
  'Should update icon on fullscreent': (browser) => {
    browser
      .assert.not.cssClassPresent('.av-icon-fullscreen', 'exit')
      .click(selBtnFS)
      .assert.cssClassPresent('.av-icon-fullscreen', 'exit')
      .end()
  }
};

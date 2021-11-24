const target_url = 'http://127.0.0.1:8084/tests/fixture-data/index.html?language=nl';
const waitTime = 10000;
const selBtnFS = '.button-fullscreen';
const selBtnSubs = '.btn[data-name=Subtitles]';
const selMenu = '.subtitlemenu-option';

module.exports = {
  beforeEach: (browser) => {
     browser.url(target_url)
     .waitForElementVisible(selBtnFS, waitTime);
  },
  'Accessibility Check': function (browser) {
    browser
      .initAccessibility()
      .assert.accessibility('.eups-player', {
        verbose: true
      })
      .end();
  },
  'Keyboard-accessible menu check': function (browser) {
    browser
      .assert.not.visible(selMenu)
      .assert.cssClassPresent(selBtnSubs, 'option-set')
      .sendKeys(selBtnSubs, browser.Keys.ENTER)
      .assert.visible(selMenu)
      .sendKeys(selMenu, browser.Keys.ENTER)
      .assert.not.cssClassPresent(selBtnSubs, 'option-set')
      .assert.not.visible(selMenu)
      .end();
  }
};

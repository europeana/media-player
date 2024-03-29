const target_url = 'http://127.0.0.1:8085/tests/fixture-data/index.html?language=nl';
const waitTime = 10000;
const selBtnFS = '.button-fullscreen';
const selBtnSubs = '.btn[data-name=Subtitles]';
const selMenu = '.subtitledialogbox';

module.exports = {
  beforeEach: (browser) => {
     browser.url(target_url)
     .waitForElementVisible(selBtnFS, waitTime);
  },
  'Accessibility Check': function (browser) {
    browser
      .axeInject()
      .axeRun('.eups-player')
      .end();
  },
  'Keyboard-accessible menu check': function (browser) {
    browser
      .assert.not.visible(selMenu)
      .sendKeys(selBtnSubs, browser.Keys.ENTER)
      .assert.cssClassPresent(selBtnSubs, 'open')
      .assert.visible(selMenu)
      .sendKeys(selBtnSubs, browser.Keys.ENTER)
      .assert.not.cssClassPresent(selBtnSubs, 'open')
      .assert.not.visible(selMenu)
      .end();
  }
};

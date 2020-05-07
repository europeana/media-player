const target_url = 'http://127.0.0.1:8081/tests/fixture-data/index.html?language=pl';
const waitTime = 10000;
const selBtnSubs = '.btn[data-name=Subtitles]';
const selMenu = '.subtitlemenu-option';

module.exports = {
  tags: ['skip-chrome-headless'],
  beforeEach: (browser) => {
     browser.url(target_url)
     .waitForElementVisible(selBtnSubs, waitTime);
  },
  'Should initialise with Polish subtitles set': (browser) => {
    browser
      .assert.cssClassPresent(selBtnSubs, 'option-set')
      .click(selBtnSubs)
      .assert.containsText(selMenu, 'Polski')
      .assert.cssClassPresent(selMenu, 'selected')
      .end();
  }
};

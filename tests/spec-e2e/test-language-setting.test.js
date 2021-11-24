const target_url = 'http://127.0.0.1:8084/tests/fixture-data/index.html?language=nl';
const waitTime = 10000;
const selBtnSubs = '.btn[data-name=Subtitles]';
const selMenu = '.subtitlemenu-option';

module.exports = {
  tags: ['skip-chrome-headless'],
  beforeEach: (browser) => {
     browser.url(target_url)
     .waitForElementVisible(selBtnSubs, waitTime);
  },
  'Should initialise with Dutch subtitles set': (browser) => {
    browser
      .assert.cssClassPresent(selBtnSubs, 'option-set')
      .click(selBtnSubs)
      .assert.containsText(selMenu, 'Nederlands')
      .assert.cssClassPresent(selMenu, 'selected')
      .end();
  }
};

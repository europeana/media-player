const target_url = 'http://127.0.0.1:8085/tests/fixture-data/index.html?language=nl';
const waitTime = 10000;
const selBtnSubs = '.btn[data-name=Subtitles]';
const selDialogBox = '.subtitledialogbox';
const selToggle = '.subtitledialogboxtoggleline input';
const selOptions = '.subtitledialogboxlanguage div[role="button"]';

module.exports = {
  tags: ['skip-chrome-headless'],
  beforeEach: (browser) => {
     browser.url(target_url)
     .waitForElementVisible(selBtnSubs, waitTime);
  },
  'Should initialise with Dutch subtitles': (browser) => {
    browser
      .click(selBtnSubs)
      .waitForElementVisible(selDialogBox, waitTime)
      .assert.attributeContains(selToggle, 'checked', 'true')
      .assert.containsText(selOptions, 'Nederlands')
      .end();
  }
};

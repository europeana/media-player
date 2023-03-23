const target_url = 'http://127.0.0.1:8085/tests/fixture-data/index-multilingual.html?language=nl';
const waitTime = 10000;
const selBtn = '.btn[data-name=Subtitles]';
const selDialogBox = '.subtitledialogbox';
const selToggle = '.subtitledialogboxtoggleline input';
const selOptions = '.subtitledialogboxlanguage div[role="button"]';
const muiList = '.MuiList-root li';
const expectedLanguagesOrder = ['-', 'Deutsch', 'English', 'Nederlands [CC]'];

module.exports = {
  tags: ['skip-chrome-headless'],
  beforeEach: (browser) => {
     browser.url(target_url)
     .waitForElementVisible(selBtn, waitTime);
  },
  'Should initialise with Dutch, English and German subtitles': (browser) => {
    browser
      .assert.not.visible(selDialogBox)
      .assert.not.cssClassPresent(selBtn, 'open')
      .click(selBtn)
      .waitForElementVisible(selDialogBox, waitTime)
      .click(selToggle)
      .click(selOptions)
      .elements('css selector', muiList, (elements) => {
        elements.value.forEach(function (element, index) {
          browser.elementIdText(element[Object.keys(element)[0]], function (res) {
            browser.assert.equal(res.value, expectedLanguagesOrder[index]);
          });
        });
      })
      .end();
  }
};

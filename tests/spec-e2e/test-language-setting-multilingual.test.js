const target_url = 'http://127.0.0.1:8085/tests/fixture-data/index-multilingual.html?language=nl';
const waitTime = 10000;
const selBtnSubs = '.btn[data-name=Subtitles]';
const selMenu = '.subtitledialogbox';
const selMenuDutch = '.subtitlemenu-option[data-language=nl-NL]'
const expectedLanguagesOrder = ['Deutsch', 'English', 'Nederlands [CC]'];

module.exports = {
  tags: ['skip-chrome-headless'],
  beforeEach: (browser) => {
     browser.url(target_url)
     .waitForElementVisible(selBtnSubs, waitTime);
  },
  'Should initialise with Dutch, English and German subtitles': (browser) => {
    browser
      .assert.cssClassPresent(selBtnSubs, 'option-set')
      .click(selBtnSubs)
      .elements('css selector', selMenu, (elements) => {
        elements.value.forEach(function (element, index) {
          browser.elementIdText(element.ELEMENT, function (res) {
            browser.assert.equal(res.value, expectedLanguagesOrder[index]);
          });
        });
      })
      .assert.cssClassPresent(selMenuDutch, 'selected')
      .end();
  }
};

const target_url = 'http://127.0.0.1:8081/tests/fixture-data/index.html';
const waitTime = 10000;
const selTime = '.canvas-time';
const selPlay = '.button-play';

module.exports = {
  beforeEach: (browser) => {
     browser.url(target_url)
     .waitForElementVisible(selPlay, waitTime)
     .waitForElementVisible(selTime, waitTime);
  },
  'Clicking play': (browser) => {
    const extraWaitTime = 2000;
    browser
      .getText(selTime, function(result) {
        let initialValue = parseInt(result.value.split(':').pop());
        console.log(`${selTime} actual value = ${initialValue}`);
        browser.assert.ok(initialValue < 2, `Expect initial time ${initialValue} to be 0 or 1 second`);
      })
      .assert.attributeContains(selPlay, 'title', 'Play')
      .click(selPlay)
      .waitForElementVisible('.pause')
      .pause(extraWaitTime)
      .assert.attributeContains(selPlay, 'title', 'Pause')
      .getText(selTime, function(result) {
        let updatedValue = parseInt(result.value.split(':').pop());
        console.log(`${selTime} actual value = ${updatedValue}`);
        browser.assert.ok(updatedValue > 2, `Expect time ${updatedValue} to have elapsed`);
      })
      .end()
  },
  'Clicking play and then pause': (browser) => {
    browser
      .assert.visible('.playcircle')
      .click(selPlay)
      .assert.attributeContains(selPlay, 'title', 'Pause')
      .assert.not.visible('.playcircle')
      .click(selPlay)
      .assert.attributeContains(selPlay, 'title', 'Play')
      .end()
  },
  'Subtitles are displayed.': (browser) => {
    const extraWaitTime = 1000;
    const selBtn = '.btn[data-name=Subtitles]';
    const selIcon = selBtn + ' .av-icon';
    const selMenu = '.subtitlemenu-option';
    browser
      .waitForElementVisible(selBtn, waitTime)
      .assert.not.visible(selMenu)
      .assert.not.cssClassPresent(selIcon, 'open')
      .pause(extraWaitTime)
      .click(selBtn)
      .waitForElementVisible(selMenu, waitTime)
      .assert.attributeEquals(selMenu, 'data-language', 'pl-PL')
      .assert.containsText(selMenu, 'Polski')
      .assert.cssClassPresent(selIcon, 'open')
      .click(selMenu)
      .assert.not.visible(selMenu)
      .click(selBtn)
      .assert.not.cssClassPresent(selIcon, 'open')
      .end()
  }
};

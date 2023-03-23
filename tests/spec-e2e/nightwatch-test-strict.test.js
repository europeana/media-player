const target_url = 'http://127.0.0.1:8085/tests/fixture-data/index.html';
const waitTime = 10000;
const selTime = '.canvas-time';
const selPlay = '.button-play';
const selVideo = 'video.anno';
const selPlayIcon = selPlay + ' .av-icon';

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
        browser.assert.ok(initialValue <= 1, `Expect initial time ${initialValue} to be 0 or 1 second`);
      })
      .assert.attributeContains(selPlay, 'title', 'Play')
      .assert.not.cssClassPresent(selPlayIcon, 'pause')
      .pause(extraWaitTime)
      .click(selPlay)      
      .assert.cssClassPresent(selPlayIcon, 'pause')
      .pause(extraWaitTime)
      .click(selPlay) 
      .waitForElementVisible(selTime, extraWaitTime)
      .getText(selTime, function(result) {
        let updatedValue = parseInt(result.value.split(':').pop());
        browser.assert.ok(updatedValue >= 1, `Expect time ${updatedValue} to have elapsed`);
      }) 
      .end()
  },
  'Clicking play and then pause': (browser) => {
    const extraWaitTime = 1000;
    browser
      .assert.visible('.playcircle')
      .click(selPlay)
      .pause(extraWaitTime)
      .assert.attributeContains(selPlay, 'title', 'Pause')
      .assert.not.visible('.playcircle')
      .click(selPlay)
      .pause(extraWaitTime)
      .assert.attributeContains(selPlay, 'title', 'Play')
      .end()
  },
  'Subtitles are displayed.': (browser) => {
    const extraWaitTime = 1000;
    const selBtn = '.btn[data-name=Subtitles]';
    const selDialogBox = '.subtitledialogbox';
    const selToggle = '.subtitledialogboxtoggleline input';
    const selOptions = '.subtitledialogboxlanguage div[role="button"]';
    const muiList = '.MuiList-root li[data-value="nl-NL"]';
    browser
      .waitForElementVisible(selBtn, waitTime)
      .assert.not.visible(selDialogBox)
      .assert.not.cssClassPresent(selBtn, 'open')
      .pause(extraWaitTime)
      .click(selBtn)
      .waitForElementVisible(selDialogBox, waitTime)
      .click(selToggle)
      .click(selOptions)
      .assert.attributeEquals(muiList, 'data-value', 'nl-NL')
      .assert.containsText(muiList, 'Nederlands')
      .click(muiList)
      .assert.cssClassPresent(selBtn, 'open')
      .click(selBtn)
      .assert.not.visible(selDialogBox)
      .assert.not.cssClassPresent(selBtn, 'open')
      .end()
  }
};

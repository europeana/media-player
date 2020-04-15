const target_url = 'http://127.0.0.1:8081/tests/fixture-data/index.html';
const selTime = '.canvas-time';
const selTimeline = '.canvas-timeline-container';
const videoEndTime = '02:42';
const videoMidTime = '01:21';

module.exports = {
   tags: ['skip-firefox'],
   beforeEach: (browser) => {
     browser.url(target_url)
     .waitForElementVisible('.button-play')
     .waitForElementVisible(selTime);
   },
  'Using slider to scrub video': (browser) => {
    const extraWaitTime = 1;
    browser
      .assert.attributeContains('.ui-slider-handle', 'style', 'left: 0')
      .moveToElement(selTimeline, 0, 2)
      .mouseButtonDown(0)
      .getElementSize(selTimeline, function (result) {
        this.moveToElement(selTimeline, result.value.width, result.value.height / 2);
        this..mouseButtonUp(0);
      })
      .pause(extraWaitTime)
      .getText(selTime, function(result) {
        browser.assert.ok(result.value === videoEndTime, `Expect time ${result.value} to be at ${videoEndTime}`);
      })
      .mouseButtonDown(0)
      .getElementSize(selTimeline, function (result) {
        this.moveToElement(selTimeline, (result.value.width / 2) -1, result.value.height / 2);
      })
      .mouseButtonUp(0)
      .pause(extraWaitTime)
      .getText(selTime, function(result) {
        let initialValue = result.value;
        console.log(`${selTime} actual value = ${initialValue}`);
      })
      .assert.containsText(selTime, videoMidTime)
      .end()
  },
  'Volume controls': (browser) => {
    browser
      .assert.attributeEquals('.volume-mute', 'title','Mute')
      .moveToElement('.volume-slider', 2, 2)
      .mouseButtonDown(0)
      .moveToElement('.volume-slider', 0, 2)
      .mouseButtonUp(0)
      .assert.attributeEquals('.volume-mute', 'title','Unmute')
      .moveToElement('.volume-slider', 70, 2)
      .mouseButtonClick(0)
      .assert.attributeEquals('.volume-mute', 'title','Mute')
      .end()
  },
  'Resize the browser and check if the controls are visible': (browser) => {
    browser
      .assert.attributeContains('.button-play', 'title', 'Play')
      .assert.visible('.btn[data-name=Subtitles]')
      .assert.visible('.volume-mute')
      .assert.visible('.ui-slider-handle')
      .resizeWindow(400, 800)
      .assert.visible('.playcircle')
      .assert.attributeContains('.button-play', 'title', 'Play')
      .assert.visible('.btn[data-name=Subtitles]')
      .assert.visible('.volume-mute')
      .assert.visible('.ui-slider-handle')
      .end()
  }
};

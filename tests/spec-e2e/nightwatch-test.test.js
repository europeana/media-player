const target_url = 'http://127.0.0.1:8085/tests/fixture-data/index.html';
const selTime = '.canvas-time';
const selTimeline = '.canvas-timeline-container';
const videoEndTime = '01:49';
const videoMidTime = '00:55';

module.exports = {
   tags: ['skip-firefox'],
   beforeEach: (browser) => {
     browser.url(target_url)
     .waitForElementVisible('.button-play')
     .waitForElementVisible(selTime);
   },
  'Using slider to scrub video': (browser) => {
    const extraWaitTime = 1000;
    browser
      .assert.attributeContains('.ui-slider-handle', 'style', 'left: 0')
      .moveToElement(selTimeline, 0, 0)
      .pause(extraWaitTime)
      .getElementSize(selTimeline, function (result) {
        this.dragAndDrop(selTimeline, {x: (result.value.width / 2), y: 0});
      })
      .pause(extraWaitTime)
      .getText(selTime, function(result) {
        browser.assert.ok(result.value === videoEndTime, `Expect time ${result.value} to be at ${videoEndTime}`);
      })
      .dragAndDrop(selTimeline, {x: 0, y: 0})
      .getText(selTime)
      .assert.containsText(selTime, videoMidTime)
      .end()
  },
  'Volume controls': (browser) => {
    browser
      .assert.attributeEquals('.volume-mute', 'title','Mute')
      .getElementSize('.volume-slider', function (result) {
        this.dragAndDrop('.volume-slider', {x: -(result.value.width / 2), y: 0});
      })
      .assert.attributeEquals('.volume-mute', 'title','Unmute')
      .getElementSize('.volume-slider', function (result) {
        this.dragAndDrop('.volume-slider', {x: ((result.value.width / 10) * 7), y: 0});
      })
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

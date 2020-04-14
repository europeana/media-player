import * as empIndex  from '../../src/index';

const $ = require("jquery");
import * as pEvents  from '../../src/components/player/playerEventHandlers';
import Player from '../../src/components/player/index';

const manifestEditable = 'http://localhost:9876/base/tests/fixture-data/manifest.json';
const manifestAudio = 'http://localhost:9876/base/tests/fixture-data/manifest-audio.json';
const manifestQuicktime = 'http://localhost:9876/base/tests/fixture-data/manifest-mov.json';
const manifestWebm = 'http://localhost:9876/base/tests/fixture-data/manifest-webm.json';
const manifestM4v = 'http://localhost:9876/base/tests/fixture-data/manifest-m4v.json';
const manifestWmv = 'http://localhost:9876/base/tests/fixture-data/manifest-wmv.json';
const manifestEUscreen = 'http://localhost:9876/base/tests/fixture-data/manifest-euscreen.json';

describe('Player functions', () => {

  const appendFixture = (className, id) => {
    $(`.${className}`).remove();
    let markup = `<div class="${className}" ${id ? 'id="' + id + '"' : ''}></div>`;
    return $(markup).appendTo('body');
  };

  const elClass        =  'eups-player';
  const elWrapperClass =  'player-wrapper';

  const removeFixtures = (className, id) => {
    $(`.${elClass}`).remove();
    $(`.${elWrapperClass}`).remove();

  };

  const getPlayer = (manifestToUse, cbDone) => {
    const EuropeanaMediaPlayer = empIndex.default;

    let emp = new EuropeanaMediaPlayer(
      appendFixture(elWrapperClass),
      {manifest: manifestToUse},
      {mode: 'player', manifest: manifestToUse}
    );

    expect(emp.player).toBeTruthy();
    expect(emp.player.avcomponent).toBeTruthy();
    expect(document.querySelector(`.${elClass}`)).toBeTruthy();
    expect('.button-play').toBeTruthy();

    emp.player.avcomponent.on('mediaready', () => {
      cbDone(emp.player);
    });
  };

  const getErrorPlayer = (manifestToUse, cbDone) => {
    const EuropeanaMediaPlayer = empIndex.default;

    let emp = new EuropeanaMediaPlayer(
      appendFixture(elWrapperClass),
      {manifest: manifestToUse},
      {mode: 'player', manifest: manifestToUse}
    );

    expect(emp.player).toBeTruthy();
    expect(emp.player.avcomponent).toBeTruthy();
    expect(document.querySelector(`.${elClass}`)).toBeTruthy();

    emp.player.avcomponent.on('mediaerror', (error) => {
      cbDone(emp.player, error);
    });

    emp.player.avcomponent.on('mediaready', () => {
      cbDone(emp.player, undefined);
    });
  };

  beforeEach(() => {
    removeFixtures();
  });

  describe('Video format checks', () => {

    let player;

    describe('should support mp4', () => {

      beforeEach((done) => {
        getPlayer(manifestEditable, (innerPlayer) => {
          player = innerPlayer;
          done();
        });
      });

      it('should show no error message for mp4', () => {
        expect($('.errormessage').length).toBeFalsy();
      });

      it('should have a video object duration greater then 0', () => {
        expect($('video')[0].duration).toBeGreaterThan(0);
      });
    });

    describe('should support quicktime', () => {
      beforeEach((done) => {
        getPlayer(manifestQuicktime, (innerPlayer) => {
          player = innerPlayer;
          done();
        });
      });

      it('should show no error message for quicktime', () => {
        expect($('.errormessage').length).toBeFalsy();
      });

      it('should have a video object duration greater then 0', () => {
        expect($('video')[0].duration).toBeGreaterThan(0);
      });
    });

    describe('should support webm', () => {
      beforeEach((done) => {
        getPlayer(manifestWebm, (innerPlayer) => {
          player = innerPlayer;
          done();
        });
      });

      it('should show no error message for webm', () => {
        expect($('.errormessage').length).toBeFalsy();
      });

      it('should have a video object duration greater then 0', () => {
        expect($('video')[0].duration).toBeGreaterThan(0);
      });
    });

    describe('should support m4v', () => {
      beforeEach((done) => {
        getPlayer(manifestM4v, (innerPlayer) => {
          player = innerPlayer;
          done();
        });
      });

      it('should show no error message for m4v', () => {
        expect($('.errormessage').length).toBeFalsy();
      });

      it('should have a video object duration greater then 0', () => {
        expect($('video')[0].duration).toBeGreaterThan(0);
      });
    });

    /*
    describe('should not support wmv', () => {
      let error;

      beforeEach((done) => {
        getErrorPlayer(manifestWmv, (innerPlayer, err) => {
          player = innerPlayer;
          error = err;
          done();
        });
      });

      it('should show an error message for wmv', () => {
        expect($('.errormessage').length).toBeTruthy();
      });

      it('should have an undefined video duration', () => {
        console.log('acual duration ' + $('video')[0].duration);
        expect($('video')[0].duration).toBeUndefined;
      });

      it('should have media error code 4', () => {
        console.log('actual error code ' + error.code);
         expect(error.code).toEqual(4);
      });

    });
    */
  });

  describe('Audio format checks', () => {

    let player;

    describe('should support mp3', () => {
      beforeEach((done) => {
        getPlayer(manifestAudio, (innerPlayer) => {
          player = innerPlayer;
          done();
        });
      });

      it('should show no error message for mp3', () => {
        expect($('.errormessage').length).toBeFalsy();
      });

      it('should have a audio object duration greater then 0', () => {
        expect($('audio')[0].duration).toBeGreaterThan(0);
      });
    });

    describe('should support ogg', () => {
      beforeEach((done) => {
        getPlayer(manifestAudio, (innerPlayer) => {
          player = innerPlayer;
          done();
        });
      });

      it('should show no error message for ogg', () => {
        expect($('.errormessage').length).toBeFalsy();
      });

      it('should have a audio object duration greater then 0', () => {
        expect($('audio')[0].duration).toBeGreaterThan(0);
      });
    });
  });
});

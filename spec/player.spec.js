import * as empIndex  from '../src/index';

const $ = require("jquery");
import * as pEvents  from '../src/components/player/playerEventHandlers';
import Player from '../src/components/player/index';

const manifestEditable = 'http://localhost:9876/base/spec/fixture-data/manifest.json';
const manifestAudio = 'http://localhost:9876/base/spec/fixture-data/manifest-audio.json';

describe('Player functions', () => {

  const appendFixture = (className, id) => {
    $(`.${className}`).remove();
    let markup = `<div class="${className}" ${id ? 'id="' + id + '"' : ''}></div>`;
    return $(markup).appendTo('body');
  };

  const getPlayer = (manifestToUse, cbDone) => {
    const elClass        =  'eups-player';
    const elWrapperClass =  'player-wrapper';
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

  describe('player tests', () => {
    it('should not be constructed without an element', () => {
      const EuropeanaMediaPlayer = empIndex.default;
      let emp;
      try{
        emp = new EuropeanaMediaPlayer();
      }
      catch(e){}
      expect(emp).toBeFalsy();
    });

    it('should generate a unique player id', () => {
      let ids = {};
      let r = /^[A-Za-z0-9]{8}-[A-Za-z0-9]{4}-[A-Za-z0-9]{4}-[A-Za-z0-9]{4}-[A-Za-z0-9]{12}$/;
      for(var i=0; i<100; i++){
        let id = empIndex.uuidv4();
        ids[id] = true;
        expect(Object.keys(ids).length).toEqual(i + 1);
        expect(id.match(r)).toBeTruthy();
      }
    });
  });

  describe('DOM checks audio', () => {

    let player;

    beforeEach((done) => {
      getPlayer(manifestAudio, (innerPlayer) => {
        player = innerPlayer;
        done();
      });
    });

    it('should have an audio component', () => {
      expect($('audio').length).toBeTruthy();
      expect($('video').length).toBeFalsy();
    });

  });

  describe('DOM checks video', () => {

    let player;

    beforeEach((done) => {
      getPlayer(manifestEditable, (innerPlayer) => {
        player = innerPlayer;
        done();
      });
    });

    it('should have a duration', () => {
      const duration = document.querySelector('.canvas-duration');
      expect(duration.textContent).toMatch(/[0-9][0-9]:[0-9][0-9]/);
      const t = new Date(`1970-01-01T00:${duration.textContent}Z`);
      expect(t.getSeconds() | t.getMinutes()).toBeTruthy();
    });

    it('should show the more button / menu in editor mode', () => {

      // check button / menu added

      expect($('.moremenu').length).toBeFalsy();
      expect($('.btn[data-name=More').length).toBeFalsy();

      player.addEditorOption(player);

      expect($('.moremenu').length).toBeTruthy();
      expect($('.btn[data-name=More').length).toBeTruthy();

      // check button / menu work

      expect($('.moremenu').is(':visible')).toBeFalsy();
      $('.btn[data-name=More')[0].dispatchEvent(new Event('click'))
      expect($('.moremenu').is(':visible')).toBeTruthy();
    });

    it('should test if ended', () => {
      expect(player.hasEnded()).toBeFalsy();
    });

    it('plays on click', () => {
      expect($('.playwrapper').is(':visible')).toBeTruthy();
      $('.canvas-container').trigger('click');
      expect($('.playwrapper').is(':visible')).toBeFalsy();
    });

    it('should set the background', () => {
      const imgUrl = 'http://123.jpg';
      expect($('.canvas-container').attr('style')).not.toContain(imgUrl);
      player.setImage(player, imgUrl);
      expect($('.canvas-container').attr('style')).toContain(imgUrl);
    });

    it('should optimize for smaller screens', () => {
      let w1 = $('.volume').width();
      expect(w1).toBeGreaterThan(0);
      player.optimizeForSmallerScreens();
      let w2 = $('.volume').width();
      expect(w1).toBeGreaterThan(w2);
    });

    it('should optimize for smaller screens automatially', () => {
      spyOn(player, 'optimizeForSmallerScreens');
      player.avcomponent.canvasInstances[0]._canvasWidth = 300;
      player.handleMediaReady(player);
      expect(player.optimizeForSmallerScreens).toHaveBeenCalled();
    });

    it('should create a manifest', () => {
      const src  = 'EUS_'
      const prefix = 'https://videoeditor.noterik.com/manifest/euscreenmanifest.php?id=';
      player.createManifest({source: src});
      expect(player.manifesturl).toEqual(prefix + src);
    });

  });

  describe('Language Loading', () => {
    it('should (not yet) work with languages', () => {
      let player;
      let error = false;
      try{
        player = new Player(appendFixture('eups-player', 'eups-player-123')[0]);
        player.init({ manifest: manifestEditable }, manifestEditable, 'fr');
      }
      catch(e){
        error = true;
      }
      expect(error).toBeTruthy();
      // TODO: investigate why this reinitialisation is necessary to sto pother tests failing
      player.init({ manifest: manifestEditable }, manifestEditable, '');
    });

  });

  /*describe('Event Handling', () => {

    let player;

    beforeEach((done) => {
      player = new Player(appendFixture('eups-player', 'eups-player-123')[0]);
      player.init({ manifest: manifestEditable }, manifestEditable, '');
      player.avcomponent.on('mediaready', function() {
        done();
      });
    });

    it('should close the subtitle menu', () => {
      if($('.subtitlemenu').length > 0){
        $('.subtitlemenu').show();
        expect($('.subtitlemenu').is(':visible')).toBeTruthy();
        pEvents.subtitleMenuEventHandler(player, {stopPropagation: () => {}});
        expect($('.subtitlemenu').is(':visible')).toBeFalsy();
      }
      else{
        expect('skip').toBeTruthy();
      }
    })

    it('has a key shortcut for fullscreen', () => {
      let sel = '.button-fullscreen';
      const spy = { cb: () => {}};
      spyOn(spy, 'cb');
      $(sel)[0].addEventListener('click', spy.cb);
      pEvents.keyEventHandler(player, { keyCode: 70 });
      expect(spy.cb).toHaveBeenCalled();
    });

    it('should show an error message', () => {
      [
        'Error: loading aborted',
        'Error: network error',
        'Error: decoding of media failed',
        'Error: media format not suppported by this browser',
        'Error: unknown'
      ].forEach((msg, index) => {
        $('.errormessage').remove();
        pEvents.mediaErrorHandler(player, { code: index + 1 });
        expect($('.errormessage').text()).toEqual(msg);
      })
      $('.errormessage').remove();
    });

    it('should toggle mute', () => {
      expect($('.volume-mute').attr('title')).toEqual('Mute');
      pEvents.volumeChangedEventHandler(player, 0);
      expect($('.volume-mute').attr('title')).toEqual('Unmute');
      pEvents.volumeChangedEventHandler(player, 1);
      expect($('.volume-mute').attr('title')).toEqual('Mute');
    });

    it('should pause on space', () => {
      expect($('.playwrapper').is(':visible')).toBeTruthy();
      pEvents.keyEventHandler(player, { keyCode: 32 });
      expect($('.playwrapper').is(':visible')).toBeFalsy();
      pEvents.keyEventHandler(player, { keyCode: 32 });
    });

    it('should pause on K', () => {
      expect($('.playwrapper').is(':visible')).toBeTruthy();
      pEvents.keyEventHandler(player, { keyCode: 75 });
      expect($('.playwrapper').is(':visible')).toBeFalsy();
      pEvents.keyEventHandler(player, { keyCode: 75 });
    });

    it('has key shortcuts for the volume', () => {
      const selSlider = '.volume-slider .ui-slider-range';
      expect($(selSlider).attr('style')).toEqual('width: 100%;');

      const getRange = (offset) => [...Array(10)].map((_,i) => (i + (offset ? 1 : 0)) * 10);
      const fireKeyUp = () => pEvents.keyEventHandler(player, { keyCode: 38 });
      const fireKeyDown = () => pEvents.keyEventHandler(player, { keyCode: 40 });

      // decrement in units of 10
      getRange().reverse().forEach((pct) => {
        fireKeyDown();
        expect($(selSlider).attr('style')).toEqual(`width: ${pct}%;`);
      })

      // never fall below 0
      expect($(selSlider).attr('style')).toEqual(`width: 0%;`);
      fireKeyDown();
      expect($(selSlider).attr('style')).toEqual(`width: 0%;`);

      // increment in units of 10
      getRange(true).forEach((pct) => {
        fireKeyUp();
        expect($(selSlider).attr('style')).toEqual(`width: ${pct}%;`);
      })

      // never go above 100%
      expect($(selSlider).attr('style')).toEqual(`width: 100%;`);
      fireKeyUp();
      expect($(selSlider).attr('style')).toEqual(`width: 100%;`);
    });

    /*
    it('should toggle the subtitles', () => {
      expect($('.subtitlemenu').is(':visible')).toBeFalsy();
      // not exported...
      pEvents.toggleMenuOption(player, { preventDefault: () => {} }, 'subtitlemenu', 'Subtitles');
      expect($('.subtitlemenu').is(':visible')).toBeTruthy();
    });
    */

    /*it('should open types', () => {
      spyOn(window, 'open').and.callFake(() => {});
      const e = {
        stopPropagation: () => {}
      };
      expect(window.open).not.toHaveBeenCalled();
      pEvents.openEditorTypeEventHandler({
        editorurl: manifestEditable,
        manifesturl: manifestEditable
      }, e, 'type')
      expect(window.open).toHaveBeenCalled();
    });

  });*/

});

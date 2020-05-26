import * as pEvents  from '../../../../src/components/player/playerEventHandlers';
import Player from '../../../../src/components/player/index';
const $ = require("jquery");

//const manifest = 'https://iiif.europeana.eu/presentation/08609/fe9c5449_9522_4a70_951b_ef0b27893ae9/manifest?format=3&wskey=api2demo';
//const manifestEditable = 'https://beta.qandr.eu/euscreenxlmanifestservlet/?videoid=http://stream4.noterik.com/progressive/stream4/domain/euscreen/user/eu_luce/video/1323/rawvideo/1/raw.mp4&ticket=83510250&duration=73&maggieid=/domain/euscreenxl/user/eu_luce/video/EUS_DD5A286675EE415894693ED77BCC41A5'
const manifestEditable = 'http://localhost:9876/base/tests/fixture-data/manifest.json';

describe('Event Handling', () => {

  let player;
  const emptyEvent = {stopPropagation: () => {}, preventDefault: () => {}};

  const appendFixture = (className, id) => {
    $(`.${className}`).remove();
    let markup = `<div class="${className}" ${id ? 'id="' + id + '"' : ''}></div>`;
    return $(markup).appendTo('body');
  };

  const addSubtitleElement = () => {
    player.initLanguages([{
      language: 'nl'
    }]);
  };

  beforeEach((done) => {
    player = new Player(appendFixture('eups-player', 'eups-player-123')[0]);
    player.init({ manifest: manifestEditable }, manifestEditable, '');
    player.avcomponent.on('mediaready', function() {
      done();
    });
  });

  it('should open and close the subtitle menu', () => {
    addSubtitleElement();
    expect($('.subtitlemenu').hasClass('showing')).toBeFalsy();
    const testEvent = Object.assign(emptyEvent, { target: { hasClass: ()=> { return false; } } });
    pEvents.subtitleMenuEventHandler(player, testEvent);
    expect($('.subtitlemenu').is(':visible')).toBeTruthy();
    pEvents.subtitleMenuEventHandler(player, testEvent);
    expect($('.subtitlemenu').hasClass('showing')).toBeFalsy();
  });

  it('should close the subtitle menu on resize', () => {
    addSubtitleElement();
    $('.subtitlemenu').addClass('showing');
    expect($('.subtitlemenu').is(':visible')).toBeTruthy();
    pEvents.resizeEventHandler(player);
    expect($('.subtitlemenu').hasClass('showing')).toBeFalsy();
    expect($('.subtitlemenu').is(':visible')).toBeFalsy();
  });

  it('should set a class on the opener when a menu option is set', () => {

    const selBtnSubtitles = '.btn[data-name=Subtitles]';
    const selOption = '.subtitlemenu-option';

    addSubtitleElement();
    expect($(selBtnSubtitles).hasClass('option-set')).toBeFalsy();
    $(selOption).click();
    expect($(selBtnSubtitles).hasClass('option-set')).toBeTruthy();
    $(selOption).click();
    expect($(selBtnSubtitles).hasClass('option-set')).toBeFalsy();
  });

  it('has a key shortcut for fullscreen', () => {
    let sel = '.button-fullscreen';
    const spy = { cb: () => {}};
    spyOn(spy, 'cb');
    $(sel)[0].addEventListener('click', spy.cb);
    expect($('.av-icon-fullscreen')[0]).not.toHaveClass('exit');
    pEvents.keyEventHandler(player, { keyCode: 70 });
    expect($('.av-icon-fullscreen')[0]).toHaveClass('exit');
    expect(spy.cb).toHaveBeenCalled();
    pEvents.fullScreenEventHandler(player, 'off');
    expect($('.av-icon-fullscreen')[0]).not.toHaveClass('exit');
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
      pEvents.mediaErrorHandler(player, { code: index + 1 }, 'https://iiif.europeana.eu/presentation/2051906/data_euscreenXL_http___openbeelden_nl_media_10067/canvas/p1');
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

  it('should open types', () => {
    spyOn(window, 'open').and.callFake(() => {});
    expect(window.open).not.toHaveBeenCalled();
    pEvents.openEditorTypeEventHandler({
      editorurl: manifestEditable,
      manifesturl: manifestEditable
    }, emptyEvent, 'type')
    expect(window.open).toHaveBeenCalled();
  });
});

/* global $ initCanvasNavigation */

import './index.scss';

require('@iiif/iiif-tree-component');
require('@iiif/base-component');

const Manifold = require('@iiif/manifold');
const IIIFAVComponent = require('@iiif/iiif-av-component');
require('dashjs');

require('webpack-jquery-ui/slider');
require('webpack-jquery-ui/effects');

import Banana from 'banana-i18n';

const { hidePopups, playEventHandler, pauseEventHandler, volumeChangedEventHandler, keyEventHandler, playPauseEventHandler, fullScreenEventHandler, editorButtonEventHandler, toggleSubtitlesEventHandler, subtitleMenuEventHandler, openEditorTypeEventHandler, mediaErrorHandler, resizeEventHandler } = require('./playerEventHandlers');

const { handleEUscreenItem } = require('./EUscreen');

const { handleTranscriptionAnnotations } = require('./transcriptionAnnotations');

const languages = require('../languages/lang.js').default.locales;
const i18n = require('./i18n/languages.json');

let helper;
let configuredLanguage;

export default class Player {
  constructor(elem) {
    if (!elem) {
      return;
    }
    this.elem = $(elem);
    this.videoId = '';
    this.avcomponent;
    this.timeupdate;
    this.manifest;
    this.manifesturl;
    this.editorurl;
    this.banana;
  }

  init(videoObj, editorurl, language) {
    this.createAVComponent();
    this.createManifest(videoObj);
    this.editorurl = editorurl;

    this.state = {
      limitToRange: false,
      autoSelectRange: true,
      constrainNavigationToRange: true,
      virtualCanvasEnabled: true
    };

    //Check if the language is set, and if we have this present, otherwise default to English
    if (language.length === 0 || languages.find(lang => lang.code === language) === undefined) {
      language = 'en';
    } else {
      configuredLanguage = language;
    }

    const banana = new Banana(language);
    banana.load(i18n[language], language);
    this.banana = banana;
  }

  createAVComponent() {
    this.$avcomponent = $('<div class="iiif-av-component" tabindex="0"></div>');
    this.elem.append(this.$avcomponent);

    let player = this;

    this.avcomponent = new IIIFAVComponent.AVComponent({ target: this.$avcomponent[0] });

    this.avcomponent.on('mediaerror', (error) => {
      mediaErrorHandler(player, error);
    });

    this.avcomponent.on('log', (message) => {
      console.log(message);
    });

    this.avcomponent.on('play', () => {
      playEventHandler(player);
    });

    this.avcomponent.on('pause', () => {
      pauseEventHandler(player);
    });

    this.avcomponent.on('mediaready', () => {
      this.handleMediaReady(player);
    });

    this.avcomponent.on('fullscreen', (value) => {
      fullScreenEventHandler(player, value);
    });

    this.avcomponent.on('volumechanged', (value) => {
      volumeChangedEventHandler(player, value);
    });

    this.$avcomponent.on('keydown', (e) => {
      keyEventHandler(player, e);
    });
  }

  itemSelectListener(data) {
    if (this.handler === undefined) {
      this.handler = this;
    }

    this.handler.videoId = data;

    let player = this;

    this.handler.ldManifest(data, (helper) => {
      player.manifest = helper.manifest;

      let canvases = helper.getCanvases();
      if (canvases.length > 1) {
        initCanvasNavigation(canvases);
      } else {
        $('.canvasNavigationContainer').hide();
      }
    }, (error) => {
      console.error('ERROR: Could not load manifest data.', error);
    });
  }

  ldManifest(manifest, successcb, errorcb) {
    let player = this;

    Manifold.loadManifest({
      manifestUri: manifest,
      collectionIndex: 0,
      manifestIndex: 0,
      sequenceIndex: 0,
      canvasIndex: 0
    }).then((h) => {
      helper = h;

      if (helper.manifest.__jsonld.items[0].items[0].items[0].body.id.indexOf('http://www.euscreen.eu/item.html?id=') > -1) {
        handleEUscreenItem(player, helper)
          .then((h) => {
            helper = h;
            player.setAvComponent(player, successcb);
          });
      } else {
        player.setAvComponent(player, successcb);
      }
    }).catch((e) => {
      errorcb(e);
    });
  }

  setAvComponent(player, successcb) {
    player.avcomponent.set({
      helper,
      limitToRange: player.state.limitToRange,
      autoSelectRange: player.state.autoSelectRange,
      constrainNavigationToRange: player.state.constrainNavigationToRange,
      virtualCanvasEnabled: player.state.virtualCanvasEnabled
    });
    successcb(helper);
    player.resize();
  }

  resize() {
    let $playerContainer = $('#' + this.elem.id + ' .playerContainer');
    $playerContainer.height($playerContainer.width() * 0.75);
    this.avcomponent.resize();
  }

  createManifest(vObj) {
    if (!vObj.manifest && vObj.source.startsWith('EUS_')) {
      vObj.manifest = 'https://videoeditor.noterik.com/manifest/euscreenmanifest.php?id='+vObj.source;
    }

    this.manifesturl = vObj.manifest;
    this.itemSelectListener(vObj.manifest);
  }

  initLanguages() {
    let textTracks = this.elem.find('video')[0].textTracks;

    // check if we have any texttracks
    if (textTracks.length === 0) {
      return;
    }

    const btnSubtitles = this.createButton('Subtitles', this.banana.i18n('player-subtitles'), 'av-icon-subtitles', true);
    const player = this;

    this.elem.find('.button-fullscreen').before(btnSubtitles);

    let menu = '<div class="anno subtitlemenu" data-opener="Subtitles">';
    for (let i = 0; i < textTracks.length; i++) {
      menu += '<div class="subtitlemenu-option" data-language="' +textTracks[i].language + '">'
       + languages.find(lang => lang.iso === textTracks[i].language).name
       + '</div>';
    }
    menu += '</div>';

    this.elem.find('.canvas-container').append(menu);

    btnSubtitles.on('optionSet', (e, value) => {
      if (value) {
        btnSubtitles.addClass('option-set');
      } else {
        btnSubtitles.removeClass('option-set');
      }
    })[0].addEventListener('click', (e) => {
      toggleSubtitlesEventHandler(this, e);
    });

    $('.subtitlemenu-option').on('click', (e) => {
      subtitleMenuEventHandler(player, e);
    });

    $('.subtitlemenu-option').each((i, option) => {
      const op = $(option);
      if (op.data('language').indexOf(configuredLanguage + '-') === 0) {
        op.click();
        hidePopups(this);
      }
    });

    $(window).on('resize', () => {
      resizeEventHandler(player);
    });

    //show button only if we have at least one language set
    btnSubtitles.show();
    this.avcomponent.fire('languagesinitialized');
  }

  hasEnded() {
    let durationTypes = ['Audio', 'Video'];
    if (durationTypes.includes(this.getMediaType(this))) {
      let durationElement = this.elem.find(this.getMediaType(this).toLowerCase());
      return durationElement.length ? durationElement[0].ended : false;
    }
    return false;
  }

  handleMediaReady(player) {
    this.updateAVComponentLanguage(player);

    if (player.editorurl && player.editorurl.length > 0) {
      let showMenu = player.needToShowMenu(player);

      if (showMenu) {
        this.addEditorOption(player);
      }
    }

    const cContainer = this.elem.find('.canvas-container');
    cContainer.append('<div class=\'anno playwrapper\'><span class=\'playcircle\'></span></div>');

    this.handleMediaType(player);
    handleTranscriptionAnnotations(player);

    cContainer.on('click', () => {
      playPauseEventHandler(player);
    });
  }

  addEditorOption(player) {
    let more = this.createButton('More', this.banana.i18n('player-more'), 'av-icon-more', true);
    more[0].addEventListener('click', (e) => {
      editorButtonEventHandler(player, e);
    });
    this.elem.find('.button-fullscreen').before(more);
    this.handleMenuOptions(player);
  }

  updateAVComponentLanguage(player) {
    this.elem.find('.volume-mute').attr('title', player.banana.i18n('player-mute'));
    this.elem.find('.button-fullscreen').attr('title', player.banana.i18n('player-fullscreen'));
    this.elem.find('.button-play').attr('title', player.banana.i18n('player-play'));
  }

  createButton(name, text, classname, openCloseHandler) {
    let button = $('<button class="btn" data-name="'+name+'" title="'+text+'"><i class="av-icon '+classname+'" aria-hidden="true"></i>'+text+'</button>');

    if (openCloseHandler) {
      button.on('open-close', (e, value) => {
        if (value) {
          button.addClass('open');
        } else {
          button.removeClass('open');
        }
      });
    }
    return button;
  }

  handleMenuOptions(player) {
    this.elem.find('.canvas-container').append('<div class="anno moremenu" data-opener="More"></div>');

    let options = { embed: true, annotation: false, playlist: false, subtitles: false };
    options = player.determineOptionDisplay(player, options);

    for (let [key, value] of Object.entries(options)) {
      if (value) {
        this.elem.find('.moremenu').append('<div id=\'create-' + key + '-link\' class=\'moremenu-option\'>' + this.banana.i18n('player-create-' + key) + '</div>');
        this.elem.find('#create-' + key + '-link').on('click', (e) => {
          openEditorTypeEventHandler(player, e, key);
        });
      }
    }
  }

  needToShowMenu(player) {
    for (let [key, value] of Object.entries(player.manifest.__jsonld.rights)) {
      if (value === 'allowed' && (key === 'embed' || key === 'annotation' || key === 'playlist' || key === 'subtitles')) {
        return true;
      }
    }
    return false;
  }

  determineOptionDisplay(player, options) {
    for (let [key, value] of Object.entries(player.manifest.__jsonld.rights)) {
      if (value === 'allowed') {
        options[key] = true;
      }
    }
    return options;
  }

  handleMediaType(player) {
    switch (this.getMediaType(player)) {
      case 'Audio':
        this.setImage(player, player.manifest.__jsonld.thumbnail[0].id);
        break;
    }
    player.elem.css({ width : '100%', height : '100%' });

  }

  getMediaType(player) {
    return player.manifest.__jsonld.items[0].items[0].items[0].body.type;
  }

  setImage(player, image) {
    const playerEl = player.elem;
    playerEl.find('.canvas-container').css({ 'background-image' : 'url(' + image +')' });
    playerEl.find('.canvas-container').addClass('audio-background');
  }

  hidePlayerMenus(player) {
    hidePopups(player);
  }
}

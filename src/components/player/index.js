/* global $ */

import './scss/index.scss';

require('@iiif/iiif-tree-component');
require('@iiif/base-component');

const Manifold = require('@noterik/manifold');
const IIIFAVComponent = require('@noterik/iiif-av-component');
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
let timeoutMouseMove;

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
    this.canvasId;
    this.canvases;
    this.mediaItem;
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

    // Check if the language is set, and if we have this present, otherwise default to English
    if (language.length === 0 || languages.find(lang => lang.code === language) === undefined || i18n[language] === undefined) {
      language = 'en';
    } else {
      configuredLanguage = language;
    }

    const banana = new Banana(language);
    banana.load(i18n[language], language);
    this.banana = banana;
  }

  createAVComponent() {
    this.$avcomponent = $('<section class="iiif-av-component" tabindex="0"></section>');
    this.elem.append(this.$avcomponent);

    let player = this;

    this.avcomponent = new IIIFAVComponent.AVComponent({ target: this.$avcomponent[0] });

    this.avcomponent.on('mediaerror', (error, canvasId) => {
      mediaErrorHandler(player, error, canvasId);
    });

    // For debugging purposes uncomment this to see player process updates, do not use in production
    // this.avcomponent.on('log', (message) => {
    //   console.log(message);
    // });

    this.avcomponent.on('play', () => {
      playEventHandler(player);
      this.elem.addClass('playing');
    });

    this.avcomponent.on('pause', () => {
      pauseEventHandler(player);
      this.elem.removeClass('playing');
    });

    this.elem.on('mousemove', () => {
      this.elem.addClass('moving');
      if (timeoutMouseMove) {
        window.clearTimeout(timeoutMouseMove);
      }
      timeoutMouseMove = setTimeout(() => {
        this.elem.removeClass('moving');
      }, 3000);
    });

    this.avcomponent.on('mediaready', () => {
      this.handleMediaReady(player);
      const optionsContainer = this.elem.find('.options-container');
      const playerWrapper = player.elem.find('.playwrapper');
      optionsContainer.on('mouseenter', () => {
        playerWrapper.addClass('force-controls');
      });

      optionsContainer.on('mouseleave', () => {
        playerWrapper.removeClass('force-controls');
      });
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

      this.canvases = helper.getCanvases();
      if (this.canvases.length > 1) {
        this.canvases.forEach((canvas) => {
          $('[data-id=\'' + canvas.id + '\']').hide();
        });
      }

      if (this.canvasId !== null) {
        this.avcomponent.showCanvas(this.canvasId);
        $('[data-id=\'' + this.canvasId + '\']').show();
      } else if (this.mediaItem !== null) {
        const canvas = this.getCanvasForMediaItem(this.mediaItem);
        if (canvas !== null) {
          this.setMediaItem(this.mediaItem);
          $('[data-id=\'' + canvas + '\']').show();
        }
      } else if (this.canvasId === null && this.mediaItem === null) {
        this.avcomponent.showCanvas(this.canvases[0].id);
        $('[data-id=\'' + this.canvases[0].id + '\']').show();
      }

      $('.canvasNavigationContainer').hide();
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
      vObj.manifest = 'https://videoeditor.noterik.com/manifest/euscreenmanifest.php?id=' + vObj.source;
    }

    this.manifesturl = vObj.manifest;
    this.canvasId = vObj.canvasId || null;
    this.mediaItem = vObj.mediaItem || null;

    this.itemSelectListener(vObj.manifest);
  }

  initLanguages(textTracks) {
    // check if we have any texttracks
    if (textTracks.length === 0) {
      return;
    }

    const btnSubtitles = this.createButton('Subtitles', this.banana.i18n('player-subtitles'), 'av-icon-subtitles', true);
    const player = this;

    this.elem.find('.button-fullscreen').before(btnSubtitles);

    const tracksArray = this.getSortedTracks(textTracks);

    let menu = '<ul class="anno subtitlemenu" data-opener="Subtitles" >';
    menu += this.getLanguageMenuContent(tracksArray);
    menu += '</ul>';

    btnSubtitles.after(menu);
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
    }).on('keypress', (e) => {
      if (e.key === 'Enter') {
        subtitleMenuEventHandler(player, e);
      }
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

    // show button only if we have at least one language set
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
    [
      {
        sel: '.volume-mute',
        lab: 'player-mute'
      },
      {
        sel: '.button-fullscreen',
        lab: 'player-fullscreen'
      },
      {
        sel: '.button-play',
        lab: 'player-play'
      },
      {
        sel: 'data-name[Subtitles]',
        lab: 'player-subtitles'
      }
    ].forEach((conf) => {
      this.elem.find(conf.sel).attr({
        'title': player.banana.i18n(conf.lab),
        'aria-label': player.banana.i18n(conf.lab)
      });
    });
  }

  createButton(name, text, classname, openCloseHandler) {
    let markup = '<button class="btn" data-name="' + name + '" title="' + text + '"><i class="av-icon ' + classname + '" aria-hidden="true"></i>' + text + '</button>';
    let button = $(markup);
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
    this.elem.find('.btn[data-name=More]').after('<ul class="anno moremenu" data-opener="More"></ul>');
    let options = { embed: true, annotation: false, playlist: false, subtitles: false };
    options = player.determineOptionDisplay(player, options);

    for (let [key, value] of Object.entries(options)) {
      if (value) {
        const markup = '<li id=\'create-' + key + '-link\' class=\'moremenu-option\' tabindex=\'0\'>' + this.banana.i18n('player-create-' + key) + '</li>';
        this.elem.find('.moremenu').append(markup);
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
    player.elem.css({ width: '100%', height: '100%' });
  }

  getMediaType(player) {
    return player.manifest.__jsonld.items[0].items[0].items[0].body.type;
  }

  setImage(player, image) {
    const playerEl = player.elem;
    playerEl.find('.canvas-container').css({ 'background-image': 'url(' + image + ')' });
    playerEl.find('.canvas-container').addClass('audio-background');
  }

  hidePlayerMenus(player) {
    hidePopups(player);
  }

  setTitle(title) {
    let markup = $(`<div class="info">
      <span class="title-logo">
        <a class="title-link"></a>
        <a class="logo-link" href="https://www.europeana.eu" target="_blank" rel="noopener"></a>
      </span>
    </div>`);
    this.elem.after(markup);
    markup.find('.title-link').text(title);
  }

  getCanvasForMediaItem(mediaUrl) {
    for (let i = 0; i < this.canvases.length; i++) {
      const canvasContent = this.canvases[i].getContent();
      if (mediaUrl === canvasContent[0].__jsonld.body.id) {
        return this.canvases[i].id;
      }
    }
    return null;
  }

  getLanguageForCanvas() {
    if (this.canvasId !== null) {
      return this.getLanguageForCanvasId();
    } else if (this.mediaItem !== null) {
      return this.getLanguageForMediaItem();
    } else if (this.canvasId === null && this.mediaItem === null) {
      return this.getLanguageWhenNoCanvasIdOrMediaItemAvailable();
    } else {
      return null;
    }
  }

  getLanguageForCanvasId() {
    for (let i = 0; i < this.canvases.length; i++) {
      if (this.canvasId === this.canvases[i].id) {
        if (this.canvases[i].getContent()[0].__jsonld.body.language) {
          return languages.find(lang => lang.code === this.canvases[i].getContent()[0].__jsonld.body.language).iso;
        } else {
          return null;
        }
      }
    }
    return null;
  }

  getLanguageForMediaItem() {
    for (let i = 0; i < this.canvases.length; i++) {
      const canvasContent = this.canvases[i].getContent();
      if (this.mediaItem === canvasContent[0].__jsonld.body.id) {
        if (canvasContent[0].__jsonld.body.language) {
          return languages.find(lang => lang.code === canvasContent[0].__jsonld.body.language).iso;
        } else {
          return null;
        }
      }
    }
    return null;
  }

  getLanguageWhenNoCanvasIdOrMediaItemAvailable() {
    const canvasContent = this.canvases[0].getContent();
    if (canvasContent[0].__jsonld.body.language) {
      return languages.find(lang => lang.code === canvasContent[0].__jsonld.body.language).iso;
    } else {
      return null;
    }
  }

  setMediaItem(mediaUrl) {
    const canvas = this.getCanvasForMediaItem(mediaUrl);
    if (canvas !== null) {
      this.setCanvas(canvas);
    }
  }

  setCanvas(canvasId) {
    this.avcomponent.set({
      virtualCanvasEnabled: false
    });
    this.avcomponent.showCanvas(canvasId);
  }

  getSortedTracks(textTracks) {
    const tracksArray = Array.from(textTracks);

    // Order languages alphabetically
    tracksArray.sort((a, b) => {
      let languageA = languages.find(lang => lang.iso === a.language);
      languageA = languageA && languageA.name.toLowerCase() ? languageA.name : a.language;
      let languageB = languages.find(lang => lang.iso === b.language);
      languageB = languageB && languageB.name.toLowerCase() ? languageB.name : b.language;
      return languageA.localeCompare(languageB);
    });

    return tracksArray;
  }

  getLanguageMenuContent(tracksArray) {
    // Determine media item language so we can add [CC] in case of that language
    const mediaItemLanguage = this.getLanguageForCanvas();

    const menuContent = tracksArray.map((track) => {
      let label = languages.find(lang => lang.iso === track.language);
      label = label && label.name ? label.name : track.language;
      label += track.language === mediaItemLanguage ? ' [CC]' : '';
      return '<li class="subtitlemenu-option" data-language="' + track.language + '" tabindex="0">' + label + '</li>';
    }).join('');

    return menuContent;
  }
}

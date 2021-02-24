/* global $ */
import './index.scss';
import './favicon.ico';

import Player from './components/player';

let editorurl = '';
let player;
let language = '';

export const init = (container, videoObj, options) => {
  // Create unique player id
  let playerId = uuidv4();

  // Append player to container with the unique id
  $(container).append('<section id="eups-player-' + playerId + '" class="eups-player"></section>');

  // Set options
  editorurl = options.editor || editorurl;
  language = options.language || language;

  // Create player
  player = new Player(document.getElementById('eups-player-' + playerId));

  // Initialize player
  player.init(videoObj, editorurl, language);
};

export const uuidv4 = () => {
  return ([1e7]+-1e3+-4e3+-8e3+-1e11).replace(/[018]/g, c =>
    (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
  );
};

export default class EuropeanaMediaPlayer {
  constructor(container, videoObj, options) {
    options = arguments.length > 2 ? options : {};
    init(container, videoObj, options);
  }

  get player() {
    return player;
  }
}

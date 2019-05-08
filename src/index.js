import Glue from './components/glue';
import Player from './components/player';
import TestData from './components/testdata';
import Timeline from './components/timeline';
import AnnotationEditor from './components/annotationeditor';

//var $ = require('jquery');
//require('jqueryui');
//global.jQuery = global.$ = $;

window.addEventListener('load', () => {
    const glue = new Glue();

    const testData = new TestData(document.getElementById('testdata'));
    const player = new Player(document.getElementById('player'));
    const timeline = new Timeline(document.getElementById('timeline'));
    const annotationeditor = new AnnotationEditor(document.getElementById('annotationeditor'));

    // init / render elements
    testData.init(glue);
    player.init(glue);
    timeline.init(glue);
    annotationeditor.init(glue);
})
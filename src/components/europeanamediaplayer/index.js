import Glue from '../glue';
import Player from '../player';
import TestData from '../testdata';
import Timeline from '../timeline';
import AnnotationEditor from '../annotationeditor';

import * as css from './index.css'

const environment = process.env.NODE_ENV;

var glue;
var testData;
var player;
var timeline;
var annotationeditor;

function EuropeanaMediaPlayer(container, videoObj) {
    $(container).append('<div id="eups-content-wrapper"><div id="eups-player"></div><div id="eups-timeline"></div></div><div id="eups-editor-wrapper"><div id="eups-annotationeditor"></div></div>');

    glue = new Glue();

    if (environment == "development") {
        console.log("development environment detected");
        testData = new TestData(document.getElementById('eups-content-wrapper'));
        testData.init(glue);
    }
    
    player = new Player(document.getElementById('eups-player'));
    timeline = new Timeline(document.getElementById('eups-timeline'));
    annotationeditor = new AnnotationEditor(document.getElementById('eups-annotationeditor'));

    // init / render elements    
    player.init(glue, videoObj);
    timeline.init(glue);
    annotationeditor.init(glue);

    glue.listen("annotationeditor", "addannotation", this, storeAnnotation);
    glue.listen("annotationeditor", "deleteannotation", this, storeAnnotation);
    glue.listen("player", "mediaready", this, getAnnotations);
}

function storeAnnotation(data) {
    //update current storage
    localStorage.removeItem('annotations_'+player.getVideoId());
    localStorage.setItem("annotations_"+player.getVideoId(), JSON.stringify(annotationeditor.getAnnotations()));
}

function getAnnotations(data) {
    if (localStorage.getItem("annotations_"+player.getVideoId()) !== null) {
        let annotations = JSON.parse(localStorage.getItem("annotations_"+player.getVideoId()));

        glue.signal("main", "loadannotations", annotations);
    }
}

module.exports = EuropeanaMediaPlayer;
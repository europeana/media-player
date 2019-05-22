import Glue from '../glue';
import Player from '../player';
import TestData from '../testdata';
import Timeline from '../timeline';
import AnnotationEditor from '../annotationeditor';

import * as css from './index.css'
import AnnotationViewer from '../annotationviewer/index';

const environment = process.env.NODE_ENV;

var glue;
var testData;
var player;
var timeline;
var annotationeditor;
var annotationviewer;
var eupsid;
var mode = "player";

function EuropeanaMediaPlayer(container, videoObj) {
    $(container).append('<div id="eups-content-wrapper"><div id="eups-player"></div><div id="eups-timeline"></div><div id="eups-annotationviewer"></div></div><div id="eups-editor-wrapper"><div id="eups-annotationeditor"></div></div>');

    var urlParams = new URLSearchParams(window.location.search);
    //check if we got predefined manifest, eupsid and editor mode
    if (urlParams.has('manifest')) {
        videoObj.source = urlParams.get('manifest');
    }
    if (urlParams.has('eupsid')) {
        eupsid = urlParams.get('eupsid');
    }
    if (urlParams.has('mode')) {
        mode = urlParams.get('mode');
    }
    
    glue = new Glue();

    if (environment == "development") {
        console.log("development environment detected");
        testData = new TestData(document.getElementById('eups-content-wrapper'));
        testData.init(glue);
    }
    
    annotationviewer = new AnnotationViewer(document.getElementById('eups-annotationviewer'));
    player = new Player(document.getElementById('eups-player'));
    timeline = new Timeline(document.getElementById('eups-timeline'));
    annotationeditor = new AnnotationEditor(document.getElementById('eups-annotationeditor'));
    
    // init / render elements 
    annotationviewer.init(glue);   
    player.init(glue, videoObj);
    timeline.init(glue);
    annotationeditor.init(glue);
   

    glue.listen("annotationeditor", "addannotation", this, storeAnnotation);
    glue.listen("annotationeditor", "updateannotation", this, storeAnnotation);
    glue.listen("annotationeditor", "deleteannotation", this, storeAnnotation);
    glue.listen("player", "mediaready", this, getAnnotations);

    glue.signal("main", "eupsId", getUniqueEUPSId());
    
    
}

function storeAnnotation(data) {
    //update current storage
    localStorage.removeItem('annotations_'+player.getVideoId());
    localStorage.setItem("annotations_"+player.getVideoId(), JSON.stringify(annotationeditor.getAnnotations()));
}

function getAnnotations(data) {
    if (mode == "editor") {
        glue.signal("annotationviewer", "edit", null);
    }

    if (localStorage.getItem("annotations_"+player.getVideoId()) !== null) {
        let annotations = JSON.parse(localStorage.getItem("annotations_"+player.getVideoId()));

        glue.signal("main", "loadannotations", annotations);
    }
}

function setUniqueEUPSId() {    
    let id = uuidv4();

    var expires = new Date();
    expires.setTime(expires.getTime() + (2 * 365 * 24 * 60 * 60 * 1000));
    document.cookie = 'eups_id=' + id + ';expires=' + expires.toUTCString();

    return id;
}

function getUniqueEUPSId() {
    if (eupsid != undefined) {
        return eupsid;
    }
    var keyValue = document.cookie.match('(^|;) ?eups_id=([^;]*)(;|$)');
    return keyValue ? keyValue[2] : setUniqueEUPSId();
}

function uuidv4() {
    return ([1e7]+-1e3+-4e3+-8e3+-1e11).replace(/[018]/g, c =>
      (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
    )
}

module.exports = EuropeanaMediaPlayer;
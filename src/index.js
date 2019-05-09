import Glue from './components/glue';
import Player from './components/player';
import TestData from './components/testdata';
import Timeline from './components/timeline';
import AnnotationEditor from './components/annotationeditor';

//var $ = require('jquery');
//require('jqueryui');
//global.jQuery = global.$ = $;

var glue;
var testData;
var player;
var timeline;
var annotationeditor;

window.addEventListener('load', () => {
    glue = new Glue();

    testData = new TestData(document.getElementById('testdata'));
    player = new Player(document.getElementById('player'));
    timeline = new Timeline(document.getElementById('timeline'));
    annotationeditor = new AnnotationEditor(document.getElementById('annotationeditor'));

    // init / render elements
    testData.init(glue);
    player.init(glue);
    timeline.init(glue);
    annotationeditor.init(glue);

    glue.listen("annotationeditor", "addannotation", this, storeAnnotation);
    glue.listen("annotationeditor", "deleteannotation", this, storeAnnotation);
    glue.listen("testItem", "clicked", this, getAnnotations);
});

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
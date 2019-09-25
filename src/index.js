import Glue from './components/glue';
import Player from './components/player';
import Timeline from './components/timeline';
import AnnotationEditor from './components/annotationeditor';

import * as css from './index.css'
import AnnotationViewer from './components/annotationviewer';

var glue;
var player;
var timeline;
var annotationeditor;
var annotationviewer;
var eupsid;
var mode = "player";
var editorurl = "";

function init(container, videoObj, options) {
    if (!$("link[href='https://use.fontawesome.com/releases/v5.8.1/css/all.css']").length) {
        $("<link/>", {
            rel: "stylesheet",
            type: "text/css",
            href: "https://use.fontawesome.com/releases/v5.8.1/css/all.css"
          }).appendTo("head");
    }

    let playerId = uuidv4();

    $(container).append('<div class="eups-content-wrapper"><div id="eups-player-'+playerId+'" class="eups-player"></div><div id="eups-timeline"></div><div id="eups-annotationviewer"></div></div><div id="eups-editor-wrapper"><div id="eups-annotationeditor"></div></div>');

    videoObj.source = options.manifest || videoObj.source;
    mode = options.mode || mode;
    eupsid = options.eupsid || eupsid;
    editorurl = options.editor || editorurl;
    
    glue = new Glue();
    
    //annotationviewer = new AnnotationViewer(document.getElementById('eups-annotationviewer'));
    player = new Player(document.getElementById('eups-player-'+playerId));
    //timeline = new Timeline(document.getElementById('eups-timeline'));
    //annotationeditor = new AnnotationEditor(document.getElementById('eups-annotationeditor'));
    
    // init / render elements 
    //annotationviewer.init(glue, editorurl);   
    player.init(glue, videoObj, editorurl, mode, eupsid);
    //timeline.init(glue);
    //annotationeditor.init(glue);

    //glue.listen("annotationeditor", "addannotation", this, storeAnnotation);
    //glue.listen("annotationeditor", "updateannotation", this, storeAnnotation);
    //glue.listen("annotationeditor", "updateAnnotationfromtimeline", this, storeAnnotation);
    //glue.listen("annotationeditor", "deleteannotation", this, storeAnnotation);
    glue.listen("player", "mediaready", this, getAnnotations);

    glue.signal("main", "eupsId", getUniqueEUPSId());

    if (editorurl !== undefined) {
        $("#eups-content-wrapper").removeClass("editor").addClass("no-editor");
    }
}

function storeAnnotation(data) {
    let link = "https://videoeditor.noterik.com/annotations/saveannotations.php?id="+encodeURIComponent(player.getVideoId())+"&eupsid="+getUniqueEUPSId();

    fetch(
        link, { 
            method: 'POST',
            mode: 'cors',
            headers: { "Content-Type": "application/json; charset=utf-8"
            },
            body: JSON.stringify(annotationeditor.getAnnotations())
        })
    .then(res => res.json())
    .then(response => {

    })
    .catch(err => {
        console.error("Could not save annotations");
    });
}

function getAnnotations(data) {
    if (mode == "editor") {
        glue.signal("annotationviewer", "edit", null);
    }

    let link = "https://videoeditor.noterik.com/annotations/getannotations.php?id="+encodeURIComponent(player.getVideoId())+"&eupsid="+getUniqueEUPSId();

    fetch(
        link, { 
            method: 'GET',
            mode: 'cors',
            headers: { "Content-Type": "application/json; charset=utf-8" }
        })
    .then(res => res.json())
    .then(response => {
        glue.signal("main", "loadannotations", response);
    })
    .catch(err => {
        console.error("Could not retrieve annotations");
        console.log(err);
    });
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

export default class EuropeanaMediaPlayer {
    constructor(container, videoObj, options) {
        options = arguments.length > 2 ? options : {};
        init(container, videoObj, options);
    }
}
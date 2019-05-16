import EuropeanaMediaPlayer from './components/europeanamediaplayer';

window.addEventListener('load', () => {
    var container = document.body;
    var videoObj = { source: "https://videoeditor.noterik.com/manifest/05_synchronised_av_text.json", duration: 120, id: "05_synchronized_av_test.json" };

    new EuropeanaMediaPlayer(container, videoObj);

});

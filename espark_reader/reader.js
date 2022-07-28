//const {Howl, Howler} = require('howler');

var book = ePub();
var rendition;

var inputElement;
var audioClips = [];
var currentWord = 0;
var isPlaying = false;
function init() {
    inputElement = document.getElementById("input");

    inputElement.addEventListener('change', function (e) {
        var file = e.target.files[0];
        if (window.FileReader) {
            var reader = new FileReader();
            reader.onload = openBook;
            reader.readAsArrayBuffer(file);
        }
    });
}

function openBook(e) {
    var bookData = e.target.result;
    var title = document.getElementById("title");
    var next = document.getElementById("next");
    var prev = document.getElementById("prev");

    book.open(bookData, "binary");
    /*     console.log("opened book")
        console.log(book) */

    var rendition = book.renderTo("viewer", {
        //manager: "continuous",
        flow: "paginated",
        width: "100%",
        height: "100%",
        snap: true
    });

    rendition.display();
    var keyListener = function (e) {

        // Left Key
        if ((e.keyCode || e.which) == 37) {
            rendition.prev();
        }

        // Right Key
        if ((e.keyCode || e.which) == 39) {
            rendition.next();
        }

    };

    rendition.on("keyup", keyListener);
    rendition.on("relocated", function (location) {
        console.log(location);
        var iframeList = document.getElementsByTagName("iframe");

        for (let iframe of iframeList) {
            var iframeDoc = iframe.contentDocument;

            iframeDoc.querySelectorAll('par').forEach(par => {
                var text = par.getElementsByTagName("text")[0]; //should only be one
                var audio = par.getElementsByTagName("audio")[0]; //should only be one
                var textId = text.getAttribute("src");
                var audioSrc = audio.getAttribute("src");
                audioClips.push({
                    textId: textId,
                    audio: audio
                })
            });
        }
        console.log(audioClips);
    });

    next.addEventListener("click", function (e) {
        rendition.next();
        e.preventDefault();
    }, false);

    prev.addEventListener("click", function (e) {
        rendition.prev();
        e.preventDefault();
    }, false);

    document.addEventListener("keyup", keyListener, false);
}
/**
 * This is where the audio play/pause function should load and play everything on the page.
 * Needs to loop through all available iframes because there may be 1-2 pages loaded separately on the page.
 * I believe the audio tags will be in order per epub spec.  Could look at play start and check if that's not the case.
 * To play audio and go through highlighting the text and stopping at the right point, need to look at the clipBegin/clipEnd properties
 * You could go through each audio tag and play/stop for each one but I think that'd cause some choppy behavior.  Probably would be smoother to get the start/end for the page,
 * and then track the time so that you can track the word for highlighting and pausing.
 * 
 * 
 * Something to consider: will tracking the pages like this get messed up if the device rotates and only shows one page?
 */
function playPause() {
    if (audioClips.length > 0) {
        if (isPlaying) {
            audioClips[currentWord].audio.pause();
            isPlaying = false;
        }
        else {
            audioClips[currentWord].audio.play();
            isPlaying = true;
        }
    }
}
/**
 * To highlight text with audio, search for the span with the id that matches the #id in the text src wrapping the audio.  Each par tag has a text with source and the audio.
 * Add a css highlight class to the span, then remove when moving to the next word.
 */
function highlightText() {

}
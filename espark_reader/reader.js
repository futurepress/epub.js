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
        initAudio();
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
function initAudio() {
    var iframeList = document.getElementsByTagName("iframe");
    audioClips = [];
    for (let iframe of iframeList) {
        var iframeDoc = iframe.contentDocument;

        //get audio information
        iframeDoc.querySelectorAll('par').forEach(par => {
            var text = par.getElementsByTagName("text")[0]; //should only be one
            var audio = par.getElementsByTagName("audio")[0]; //should only be one
            var textId = text.getAttribute("src").split("#")[1];//text source format is page.xhtml#word
            var textRef = iframeDoc.getElementById(textId);
            var audioSrc = audio.getAttribute("src");
            const contentType = "audio/mp3";
            /*var sound = new Howl({
                src: [`data:${contentType};base64,${audioSrc}`]
            });*/
            audioClips.push({
                textId: textId,
                text: textRef,
                audio: audio,
                clipBegin: parseFloat(audio.getAttribute("clipbegin")),
                clipEnd: parseFloat(audio.getAttribute("clipend"))
                //duration: 1000 * (parseFloat(audio.getAttribute("clipend")) - parseFloat(audio.getAttribute("clipbegin")))
            })
        });
        //add next clip's start to the duration to account for pauses
        for (let i = 0; i < audioClips.length - 1; i++) {
            audioClips[i].duration = 1000 * (audioClips[i + 1].clipBegin - audioClips[i].clipBegin);
        }
        if (audioClips.length > 0) {
            document.getElementById("audioplayer").style.visibility = "visible";
            resetAudioToStart();
        }
        else {
            document.getElementById("audioplayer").style.visibility = "hidden";
        }
    }

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
            pauseAudio();
        }
        else {
            playAudio();
        }
    }
}
/**
 * The audio is the same for the whole book, need to play/pause the same audio tag
 */
function playAudio() {
    isPlaying = true;
    highlightWord();
    audioClips[0].audio.play();
    document.getElementById("playButton").textContent = "Pause";
}
function pauseAudio() {
    isPlaying = false;
    audioClips[0].audio.pause();
    document.getElementById("playButton").textContent = "Play";
}
function resetAudioToStart() {
    if (currentWord > 0)
        audioClips[currentWord - 1].text.setAttribute("style", "");
    currentWord = 0;
    pauseAudio();
    audioClips[0].audio.currentTime = audioClips[currentWord].clipBegin;
}
function resetAudioToWord() {
    audioClips[0].audio.currentTime = audioClips[currentWord].clipBegin;
}
/**
 * To highlight text with audio, search for the span with the id that matches the #id in the text src wrapping the audio.  Each par tag has a text with source and the audio.
 * Add a css highlight class to the span, then remove when moving to the next word.
 */
function highlightWord() {
    //don't increment words if the audio is ended
    if (currentWord >= audioClips.length) {
        resetAudioToStart();
        return;
    }
    if (!isPlaying) {
        return;
    }

    /**
     * note: using class add/remove doesn't work with iframes because the css is separate
     */

    //highlight current word
    if (currentWord > 0)
        audioClips[currentWord - 1].text.setAttribute("style", "");

    audioClips[currentWord].text.setAttribute("style", "background-color:yellow;");
    //setup timer for when word is done being read
    const myTimeout = setTimeout(highlightWord, audioClips[currentWord].duration);
    //increment word index
    currentWord++;
}
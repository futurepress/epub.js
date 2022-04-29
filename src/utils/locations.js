import {qs, sprint} from "./core.js";
import Queue from "./queue.js";
import EpubCFI from "./epubcfi.js";
import request from "./request.js";
import Locator from "../publication/locator.js";

export async function generateLocations(sections, options={}) {
    let q = new Queue();
    let chars = options.chars || 150;
    let requestMethod = options.request || request;
    let pause = options.pause || 100;
    let processing = [];
    let locations = [];

    q.pause();

    for (const [key, section] of sections) {
        processing.push(q.enqueue(process, section, chars, requestMethod, pause));
    }

    q.run();

    let processed = await Promise.all(processing);

    for (const group of processed) {
        locations.push(...group);
    }

    return locations;
}

function createRange() {
    return {
        startContainer: undefined,
        startOffset: undefined,
        endContainer: undefined,
        endOffset: undefined
    };
}

async function process(section, chars, requestMethod, pause) {
    let contents = await requestMethod(section.url);
    let locations = parse(contents, section.cfiBase);

    return locations;
}

function parse(doc, cfiBase, chars) {
    let locations = [];
    let range;
    let body = qs(doc, "body");
    let counter = 0;
    let prev;
    let _break = chars;
    let parser = function(node) {
        let len = node.length;
        let dist;
        let pos = 0;

        if (node.textContent.trim().length === 0) {
            return false; // continue
        }

        // Start range
        if (counter == 0) {
            range = createRange();
            range.startContainer = node;
            range.startOffset = 0;
        }

        dist = _break - counter;

        // Node is smaller than a break,
        // skip over it
        if(dist > len){
            counter += len;
            pos = len;
        }


        while (pos < len) {
            dist = _break - counter;

            if (counter === 0) {
                // Start new range
                pos += 1;
                range = createRange();
                range.startContainer = node;
                range.startOffset = pos;
            }

            // pos += dist;

            // Gone over
            if(pos + dist >= len){
                // Continue counter for next node
                counter += len - pos;
                // break
                pos = len;
            // At End
            } else {
                // Advance pos
                pos += dist;

                // End the previous range
                range.endContainer = node;
                range.endOffset = pos;
                // cfi = section.cfiFromRange(range);
                let cfi = new EpubCFI(range, cfiBase).toString();
                locations.push({cfi});
                counter = 0;
            }
        }
        prev = node;
    };

    sprint(body, parser);

    // Close remaining
    if (range && range.startContainer && prev) {
        range.endContainer = prev;
        range.endOffset = prev.length;
        let cfi = new EpubCFI(range, cfiBase).toString();
        locations.push({cfi});
        counter = 0;
    }

    return locations;
}


/**
 * Load all of sections in the book to generate locations
 * @param  {string} startCfi start position
 * @param  {int} wordCount how many words to split on
 * @param  {int} count result count
 * @return {object} locations
 */
 export async function generateLocationsFromWords(sections, options={}) {
    let q = new Queue();
    let wordCount = options.wordCount;
    let count = options.count;
    let startCfi = options.startCfi;
    let requestMethod = options.request || request;
    let pause = options.pause || 100;
    let processing = [];
    let locations = [];
    let start = startCfi ? new EpubCFI(startCfi) : undefined;
    let wordCounter = 0;

    q.pause();

    for (const [key, section] of sections) {
        if (start) {
            if (section.cfiPos >= start.spinePos) {
                processing.push(q.enqueue(processWords, section, wordCount, start, wordCounter, requestMethod));
            }
        } else {
            processing.push(q.enqueue(processWords, section, wordCount, start, wordCounter, requestMethod));
        }
    }

    q.run();

    let processed = await Promise.all(processing);

    for (const group of processed) {
        if (count && locations.length >= count) {
            break;
        }
        let remainingCount = count - locations.length;
        let toAdd = group.length >= count ? group.slice(0, remainingCount) : group;
        locations.push(...toAdd);
    }

    return locations;
}

async function processWords(section, wordCount, startCfi, wordCounter, requestMethod) {
    let contents = await requestMethod(section.url);
    let locations = parseWords(contents, section, wordCount, startCfi, wordCounter);

    return locations;
}

//http://stackoverflow.com/questions/18679576/counting-words-in-string
function countWords(s) {
    s = s.replace(/(^\s*)|(\s*$)/gi, "");//exclude  start and end white-space
    s = s.replace(/[ ]{2,}/gi, " ");//2 or more space to 1
    s = s.replace(/\n /, "\n"); // exclude newline with a start spacing
    return s.split(" ").length;
}

function parseWords(doc, section, wordCount, startCfi, wordCounter) {
    let cfiBase = section.cfiBase;
    let locations = [];
    let body = qs(doc, "body");
    let prev;
    let _break = wordCount;
    let foundStartNode = startCfi ? startCfi.spinePos !== section.index : true;
    let startNode;
    if (startCfi && section.cfiPos === startCfi.spinePos) {
        startNode = startCfi.findNode(startCfi.range ? startCfi.path.steps.concat(startCfi.start.steps) : startCfi.path.steps, doc);
    }
    let parser = function(node) {
        if (!foundStartNode) {
            if (node === startNode) {
                foundStartNode = true;
            } else {
                return false;
            }
        }
        if (node.textContent.length < 10) {
            if (node.textContent.trim().length === 0) {
                return false;
            }
        }
        let len = countWords(node.textContent);
        let dist;
        let pos = 0;

        if (len === 0) {
            return false; // continue
        }

        dist = _break - wordCounter;

        // Node is smaller than a break,
        // skip over it
        if (dist > len) {
            wordCounter += len;
            pos = len;
        }


        while (pos < len) {
            dist = _break - wordCounter;

            // Gone over
            if (pos + dist >= len) {
                // Continue counter for next node
                wordCounter += len - pos;
                // break
                pos = len;
                // At End
            } else {
                // Advance pos
                pos += dist;

                let cfi = new EpubCFI(node, cfiBase);
                locations.push({ cfi: cfi.toString(), wordCount: wordCounter });
                wordCounter = 0;
            }
        }
        prev = node;
    };

    sprint(body, parser.bind(this));

    return locations;
}

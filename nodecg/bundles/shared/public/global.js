const fontsReplicant = nodecg.Replicant('assets:font', 'shared');
const styleSheet = document.styleSheets[0];

const WsSubscribers = {
    __subscribers: {},
    websocket: undefined,
    webSocketConnected: false,
    registerQueue: [],
    init: function(port, debug, debugFilters) {
        port = port || 49322;
        debug = debug || false;
        if (debug) {
            if (debugFilters !== undefined) {
                console.warn("WebSocket Debug Mode enabled with filtering. Only events not in the filter list will be dumped");
            } else {
                console.warn("WebSocket Debug Mode enabled without filters applied. All events will be dumped to console");
                console.warn("To use filters, pass in an array of 'channel:event' strings to the second parameter of the init function");
            }
        }
        WsSubscribers.webSocket = new WebSocket("ws://localhost:" + port);
        WsSubscribers.webSocket.onmessage = function (event) {
            let jEvent = JSON.parse(event.data);
            if (!jEvent.hasOwnProperty('event')) {
                return;
            }
            let eventSplit = jEvent.event.split(':');
            let channel = eventSplit[0];
            let event_event = eventSplit[1];
            if (debug) {
                if (!debugFilters) {
                    console.log(channel, event_event, jEvent);
                } else if (debugFilters && debugFilters.indexOf(jEvent.event) < 0) {
                    console.log(channel, event_event, jEvent);
                }
            }
            WsSubscribers.triggerSubscribers(channel, event_event, jEvent.data);
        };
        WsSubscribers.webSocket.onopen = function () {
            WsSubscribers.triggerSubscribers("ws", "open");
            WsSubscribers.webSocketConnected = true;
            WsSubscribers.registerQueue.forEach((r) => {
                WsSubscribers.send("wsRelay", "register", r);
            });
            WsSubscribers.registerQueue = [];
        };
        WsSubscribers.webSocket.onerror = function () {
            WsSubscribers.triggerSubscribers("ws", "error");
            WsSubscribers.webSocketConnected = false;
        };
        WsSubscribers.webSocket.onclose = function () {
            WsSubscribers.triggerSubscribers("ws", "close");
            WsSubscribers.webSocketConnected = false;
        };
    },
    /**
     * Add callbacks for when certain events are thrown
     * Execution is guaranteed to be in First In First Out order
     * @param channels
     * @param events
     * @param callback
     */
    subscribe: function(channels, events, callback) {
        if (typeof channels === "string") {
            let channel = channels;
            channels = [];
            channels.push(channel);
        }
        if (typeof events === "string") {
            let event = events;
            events = [];
            events.push(event);
        }
        channels.forEach(function(c) {
            events.forEach(function (e) {
                if (!WsSubscribers.__subscribers.hasOwnProperty(c)) {
                    WsSubscribers.__subscribers[c] = {};
                }
                if (!WsSubscribers.__subscribers[c].hasOwnProperty(e)) {
                    WsSubscribers.__subscribers[c][e] = [];
                    if (WsSubscribers.webSocketConnected) {
                        WsSubscribers.send("wsRelay", "register", `${c}:${e}`);
                    } else {
                        WsSubscribers.registerQueue.push(`${c}:${e}`);
                    }
                }
                WsSubscribers.__subscribers[c][e].push(callback);
            });
        })
    },
    clearEventCallbacks: function (channel, event) {
        if (WsSubscribers.__subscribers.hasOwnProperty(channel) && WsSubscribers.__subscribers[channel].hasOwnProperty(event)) {
            WsSubscribers.__subscribers[channel] = {};
        }
    },
    triggerSubscribers: function (channel, event, data) {
        if (WsSubscribers.__subscribers.hasOwnProperty(channel) && WsSubscribers.__subscribers[channel].hasOwnProperty(event)) {
            WsSubscribers.__subscribers[channel][event].forEach(function(callback) {
                if (callback instanceof Function) {
                    callback(data);
                }
            });
        }
    },
    send: function (channel, event, data) {
        if (typeof channel !== 'string') {
            console.error("Channel must be a string");
            return;
        }
        if (typeof event !== 'string') {
            console.error("Event must be a string");
            return;
        }
        if (channel === 'local') {
            this.triggerSubscribers(channel, event, data);
        } else {
            let cEvent = channel + ":" + event;
            WsSubscribers.webSocket.send(JSON.stringify({
                'event': cEvent,
                'data': data
            }));
        }
    }
};

function convertTime(seconds) {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
  
    // Add leading zero if remainingSeconds is less than 10
    const formattedSeconds = remainingSeconds < 10 ? "0" + remainingSeconds : remainingSeconds;
  
    return minutes + ":" + formattedSeconds;
}

function updateDivTextValueOnReplicantChange(replicant, div, textToAppendBefore = "", textToAppendAfter = "", upperCase = false) {
    const divElement = typeof div === "string" ? document.getElementById(div) : div;
    
    replicant.on('change', (newVal) => {
        if (upperCase)
            newVal = newVal.toUpperCase();
        divElement.innerHTML = textToAppendBefore + " " + newVal + " " + textToAppendAfter;
    })
}

function getImageUrl(imagesReplicant, nameSubStr = "", exactMatch = true) {
    let imgObj = "";

    if (exactMatch) {
        imgObj = imagesReplicant.value.find(o => o["name"].toLowerCase() === nameSubStr.toLowerCase());
    } 
    else {
        imgObj = imagesReplicant.value.find(o => o["name"].toLowerCase().includes(nameSubStr.toLowerCase()));
    }

    if (!imgObj) {
        if(imagesReplicant['name'] === 'assets:player-portraits') {
            imgObj =  imagesReplicant.value.find(o => o["name"] === 'player_silhouette' );
        }
        else {
            console.log("Could not find name substring in images replicant");
            return "";
        }
    }

    return imgObj["url"];
}

function addImageInsideDiv(div, imgUrl, imgId = "", imgClass = "", prepend = false) {
    const img = document.createElement("img");
    img.src = imgUrl;
    img.alt = "Image";
    img.id = imgId;

    if (imgClass)
        img.classList.add(imgClass);

    const divElement = typeof div === "string" ? document.getElementById(div) : div;

    if (prepend) {
        divElement.prepend(img)
    } else {
        divElement.appendChild(img);
    }
}

function setDefaultPageFont(defaultFontName = '') {
    const body = document.querySelector('body');
    body.style.fontFamily = defaultFontName + ', sans-serif';
}

function addFontsToCss(...fonts) {
    fontsReplicant.on('change', (fontObjectsArray) => {
        fonts.forEach(fontName => {
            const fontObject = fontObjectsArray.find(fontObject => fontName === fontObject['name']);

            if (fontObject) {
                const fontName = fontObject['name'];
                const fontPath = fontObject['url'];

                const rule = '@font-face { font-family: ' + fontName + '; src: url('+ fontPath +'); }';
                styleSheet.insertRule(rule, styleSheet.cssRules.length);
            } else 
                console.log(fontName, "font does not exist in assets");
        })
    });
}

addFontsToCss('Scout-Regular', "ScoutCond-Regular", "ScoutCond-Bold", "Scout-Thin");
import { dev } from "$app/env";

// our current position
let positionCurrent = {
    lat: null,
    lng: null,
    hng: null
};


// the outer part of the compass that rotates
let rose = document.getElementById("rose");


// elements that ouput our position
let positionLat = document.getElementById("position-lat");
let positionLng = document.getElementById("position-lng");
let positionHng = document.getElementById("position-hng");


// debug outputs
let debugOrientation = document.getElementById("debug-orientation");
let debugOrientationDefault = document.getElementById("debug-orientation-default");


// info popup elements, pus buttons that open popups
let popup = document.getElementById("popup");
let popupContents = document.getElementById("popup-contents");
let popupInners = document.querySelectorAll(".popup__inner");
let btnsPopup = document.querySelectorAll(".btn-popup");


// buttons at the bottom of the screen
let btnLockOrientation = document.getElementById("btn-lock-orientation");
let btnNightmode = document.getElementById("btn-nightmode");
let btnMap = document.getElementById("btn-map");
let btnInfo = document.getElementById("btn-info");


// if we have shown the heading unavailable warning yet
let warningHeadingShown = false;


// switches keeping track of our current app state
let isOrientationLockable = false;
let isOrientationLocked = false;
let isNightMode = false;


// the orientation of the device on app load
let defaultOrientation;


// browser agnostic orientation
export function getBrowserOrientation() {
    let orientation;
    if (screen.orientation && screen.orientation.type) {
    orientation = screen.orientation.type;
    } else {
    orientation = screen.orientation ||
                    screen.mozOrientation ||
                    screen.msOrientation;
    }

    /*
    'portait-primary':      for (screen width < screen height, e.g. phone, phablet, small tablet)
                                device is in 'normal' orientation
                            for (screen width > screen height, e.g. large tablet, laptop)
                                device has been turned 90deg clockwise from normal

    'portait-secondary':    for (screen width < screen height)
                                device has been turned 180deg from normal
                            for (screen width > screen height)
                                device has been turned 90deg anti-clockwise (or 270deg clockwise) from normal

    'landscape-primary':    for (screen width < screen height)
                                device has been turned 90deg clockwise from normal
                            for (screen width > screen height)
                                device is in 'normal' orientation

    'landscape-secondary':  for (screen width < screen height)
                                device has been turned 90deg anti-clockwise (or 270deg clockwise) from normal
                            for (screen width > screen height)
                                device has been turned 180deg from normal
    */

    return orientation;
}


// browser agnostic orientation unlock
export function browserUnlockOrientation() {
    if (screen.orientation && screen.orientation.unlock) {
    screen.orientation.unlock();
    } else if (screen.unlockOrientation) {
    screen.unlockOrientation();
    } else if (screen.mozUnlockOrientation) {
    screen.mozUnlockOrientation();
    } else if (screen.msUnlockOrientation) {
    screen.msUnlockOrientation();
    }
}


// browser agnostic document.fullscreenElement
export function getBrowserFullscreenElement() {
    if (typeof document.fullscreenElement !== "undefined") {
    return document.fullscreenElement;
    } else if (typeof document.webkitFullscreenElement !== "undefined") {
    return document.webkitFullscreenElement;
    } else if (typeof document.mozFullScreenElement !== "undefined") {
    return document.mozFullScreenElement;
    } else if (typeof document.msFullscreenElement !== "undefined") {
    return document.msFullscreenElement;
    }
}


// browser agnostic document.documentElement.requestFullscreen
export function browserRequestFullscreen() {
    if (document.documentElement.requestFullscreen) {
    document.documentElement.requestFullscreen();
    } else if (document.documentElement.webkitRequestFullscreen) {
    document.documentElement.webkitRequestFullscreen();
    } else if (document.documentElement.mozRequestFullScreen) {
    document.documentElement.mozRequestFullScreen();
    } else if (document.documentElement.msRequestFullscreen) {
    document.documentElement.msRequestFullscreen();
    }
}


// browser agnostic document.documentElement.exitFullscreen
export function browserExitFullscreen() {
    if (document.exitFullscreen) {
    document.exitFullscreen();
    } else if (document.webkitExitFullscreen) {
    document.webkitExitFullscreen();
    } else if (document.mozCancelFullScreen) {
    document.mozCancelFullScreen();
    } else if (document.msExitFullscreen) {
    document.msExitFullscreen();
    }
}


// called on device orientation change
export function onHeadingChange(event) {
    let heading = event.alpha;

    if (typeof event.webkitCompassHeading !== "undefined") {
    heading = event.webkitCompassHeading; //iOS non-standard
    }

    let orientation = getBrowserOrientation();

    if (typeof heading !== "undefined" && heading !== null) { // && typeof orientation !== "undefined") {
    // we have a browser that reports device heading and orientation


    if (dev) {
        debugOrientation.textContent = orientation;
    }


    // what adjustment we have to add to rotation to allow for current device orientation
    let adjustment = 0;
    if (defaultOrientation === "landscape") {
        adjustment -= 90;
    }

    if (typeof orientation !== "undefined") {
        let currentOrientation = orientation.split("-");

        if (defaultOrientation !== currentOrientation[0]) {
        if (defaultOrientation === "landscape") {
            adjustment -= 270;
        } else {
            adjustment -= 90;
        }
        }

        if (currentOrientation[1] === "secondary") {
        adjustment -= 180;
        }
    }

    positionCurrent.hng = heading + adjustment;

    let phase = positionCurrent.hng < 0 ? 360 + positionCurrent.hng : positionCurrent.hng;
    positionHng.textContent = (360 - phase | 0) + "°";


    // apply rotation to compass rose
    if (typeof rose.style.transform !== "undefined") {
        rose.style.transform = "rotateZ(" + positionCurrent.hng + "deg)";
    } else if (typeof rose.style.webkitTransform !== "undefined") {
        rose.style.webkitTransform = "rotateZ(" + positionCurrent.hng + "deg)";
    }
    } else {
    // device can't show heading

    positionHng.textContent = "n/a";
    showHeadingWarning();
    }
}

export function showHeadingWarning() {
    if (!warningHeadingShown) {
    popupOpen("noorientation");
    warningHeadingShown = true;
    }
}

export function onFullscreenChange() {
    if (isOrientationLockable && getBrowserFullscreenElement()) {
    if (screen.orientation && screen.orientation.lock) {
        screen.orientation.lock(getBrowserOrientation()).then(export function () {
        }).catch(export function () {
        });
    }
    } else {
    lockOrientationRequest(false);
    }
}

export function toggleOrientationLockable(lockable) {
    isOrientationLockable = lockable;

    if (isOrientationLockable) {
    btnLockOrientation.classList.remove("btn--hide");

    btnNightmode.classList.add("column-25");
    btnNightmode.classList.remove("column-33");
    btnMap.classList.add("column-25");
    btnMap.classList.remove("column-33");
    btnInfo.classList.add("column-25");
    btnInfo.classList.remove("column-33");
    } else {
    btnLockOrientation.classList.add("btn--hide");

    btnNightmode.classList.add("column-33");
    btnNightmode.classList.remove("column-25");
    btnMap.classList.add("column-33");
    btnMap.classList.remove("column-25");
    btnInfo.classList.add("column-33");
    btnInfo.classList.remove("column-25");
    }
}

export function checkLockable() {
    if (screen.orientation && screen.orientation.lock) {
    screen.orientation.lock(getBrowserOrientation()).then(export function () {
        toggleOrientationLockable(true);
        browserUnlockOrientation();
    }).catch(export function (event) {
        if (event.code === 18) { // The page needs to be fullscreen in order to call lockOrientation(), but is lockable
        toggleOrientationLockable(true);
        browserUnlockOrientation(); //needed as chrome was locking orientation (even if not in fullscreen, bug??)
        } else {  // lockOrientation() is not available on this device (or other error)
        toggleOrientationLockable(false);
        }
    });
    } else {
    toggleOrientationLockable(false);
    }
}

export function lockOrientationRequest(doLock) {
    if (isOrientationLockable) {
    if (doLock) {
        browserRequestFullscreen();
        lockOrientation(true);
    } else {
        browserUnlockOrientation();
        browserExitFullscreen();
        lockOrientation(false);
    }
    }
}

export function lockOrientation(locked: boolean) {
    if (locked) {
    btnLockOrientation.classList.add("active");
    } else {
    btnLockOrientation.classList.remove("active");
    }

    isOrientationLocked = locked;
}

export function toggleOrientationLock() {
    if (isOrientationLockable) {
    lockOrientationRequest(!isOrientationLocked);
    }
}

export function locationUpdate(position) {
    positionCurrent.lat = position.coords.latitude;
    positionCurrent.lng = position.coords.longitude;

    positionLat.textContent = decimalToSexagesimal(positionCurrent.lat, "lat");
    positionLng.textContent = decimalToSexagesimal(positionCurrent.lng, "lng");
}

export function locationUpdateFail(error) {
    positionLat.textContent = "n/a";
    positionLng.textContent = "n/a";
    console.log("location fail: ", error);
}

export function setNightmode(on) {

    if (on) {
    btnNightmode.classList.add("active");
    } else {
    btnNightmode.classList.remove("active");
    }

    window.setTimeout(export function() {
    if (on) {
        document.documentElement.classList.add("nightmode");
    } else {
        document.documentElement.classList.remove("nightmode");
    }
    }, 1);


    isNightMode = on;
}

export function toggleNightmode() {
    setNightmode(!isNightMode);
}

export function openMap() {
    window.open("https://www.google.com/maps/place/@" + positionCurrent.lat + "," + positionCurrent.lng + ",16z", "_blank");
}

export function popupOpenFromClick(event) {
    popupOpen(event.currentTarget.dataset.name);
}

export function popupOpen(name) {
    let i;
    for (i=0; i<popupInners.length; i++) {
    popupInners[i].classList.add("popup__inner--hide");
    }
    document.getElementById("popup-inner-" + name).classList.remove("popup__inner--hide");

    popup.classList.add("popup--show");
}

export function popupClose() {
    popup.classList.remove("popup--show");
}

export function popupContentsClick(event) {
    event.stopPropagation();
}

export function decimalToSexagesimal(decimal, type) {
    let degrees = decimal | 0;
    let fraction = Math.abs(decimal - degrees);
    let minutes = (fraction * 60) | 0;
    let seconds = (fraction * 3600 - minutes * 60) | 0;

    let direction = "";
    let positive = degrees > 0;
    degrees = Math.abs(degrees);
    switch (type) {
    case "lat":
        direction = positive ? "N" : "S";
        break;
    case "lng":
        direction = positive ? "E" : "W";
        break;
    }

    return degrees + "° " + minutes + "' " + seconds + "\" " + direction;
}

if (screen.width > screen.height) {
    defaultOrientation = "landscape";
} else {
    defaultOrientation = "portrait";
}
if (dev) {
    debugOrientationDefault.textContent = defaultOrientation;
}

window.addEventListener("deviceorientation", onHeadingChange);

document.addEventListener("fullscreenchange", onFullscreenChange);
document.addEventListener("webkitfullscreenchange", onFullscreenChange);
document.addEventListener("mozfullscreenchange", onFullscreenChange);
document.addEventListener("MSFullscreenChange", onFullscreenChange);

btnLockOrientation.addEventListener("click", toggleOrientationLock);
btnNightmode.addEventListener("click", toggleNightmode);
btnMap.addEventListener("click", openMap);

let i;
for (i=0; i<btnsPopup.length; i++) {
    btnsPopup[i].addEventListener("click", popupOpenFromClick);
}

popup.addEventListener("click", popupClose);
popupContents.addEventListener("click", popupContentsClick);

navigator.geolocation.watchPosition(locationUpdate, locationUpdateFail, {
    enableHighAccuracy: false,
    maximumAge: 30000,
    timeout: 27000
});

setNightmode(false);
checkLockable();

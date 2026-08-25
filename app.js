/*
    GB300 WEB EMULATOR
    ------------------

    Input:
        ArrowUp
        ArrowDown
        ArrowLeft
        ArrowRight

        A
        B
        X
        Y

        Start
        Select

    D-pad:
        mouse
        touch
        keyboard

*/


const state = {

    booted: false,

    selected: 0,

    menuCount: 4,

    asdLoaded: false,

    asdSize: 0,

    elfOffset: -1,

    keyDown: {}

};


/* =========================
   ELEMENTS
========================= */

const bootScreen =
    document.getElementById("bootScreen");

const bootText =
    document.getElementById("bootText");

const progressBar =
    document.getElementById("progressBar");

const os =
    document.getElementById("os");

const menuItems =
    [...document.querySelectorAll(".menu-item")];

const infoText =
    document.getElementById("infoText");


/* =========================
   BOOT
========================= */

async function bootGB300() {

    const steps = [

        ["POWER ON", 10],

        ["CHECK MEMORY", 22],

        ["LOAD LCFG", 38],

        ["LOAD ASD", 55],

        ["PARSE ELF", 70],

        ["INITIALIZE VIDEO", 84],

        ["INITIALIZE INPUT", 94],

        ["START GB300 OS", 100]

    ];


    for (const step of steps) {

        bootText.textContent =
            step[0];

        progressBar.style.width =
            step[1] + "%";

        await sleep(350);

    }


    await loadASD();


    bootScreen.classList.add("hidden");

    os.classList.remove("hidden");

    state.booted = true;

    updateMenu();

}


/* =========================
   ASD LOADER
========================= */

async function loadASD() {

    try {

        const response =
            await fetch("assets/system.asd", {
                cache: "no-store"
            });


        if (!response.ok) {

            throw new Error(
                "system.asd not found"
            );

        }


        const buffer =
            await response.arrayBuffer();


        state.asdSize =
            buffer.byteLength;


        const data =
            new Uint8Array(buffer);


        /*
            LCFG

            The supplied ASD starts
            with the LCFG container.
        */

        const magic =
            readASCII(data, 0, 4);


        if (magic !== "LCFG") {

            console.warn(
                "ASD does not begin with LCFG"
            );

        }


        /*
            Locate ELF.

            ELF magic:

                7F 45 4C 46
        */

        state.elfOffset =
            findELF(data);


        state.asdLoaded = true;


        console.log(
            "GB300 ASD loaded:",
            state.asdSize,
            "bytes"
        );


        console.log(
            "LCFG:",
            magic
        );


        console.log(
            "ELF offset:",
            state.elfOffset
        );


    } catch (error) {

        console.error(error);

        /*
            Don't stop the web UI if the
            ASD is missing while testing.
        */

        infoText.textContent =
            "WEB OS đang chạy. " +
            "Không tìm thấy assets/system.asd.";

    }

}


/* =========================
   ELF SEARCH
========================= */

function findELF(data) {

    for (
        let i = 0;
        i < data.length - 4;
        i++
    ) {

        if (
            data[i] === 0x7f &&
            data[i + 1] === 0x45 &&
            data[i + 2] === 0x4c &&
            data[i + 3] === 0x46
        ) {

            return i;

        }

    }


    return -1;

}


/* =========================
   MENU
========================= */

function updateMenu() {

    menuItems.forEach(
        (item, index) => {

            item.classList.toggle(
                "selected",
                index === state.selected
            );

        }
    );


    const names = [

        "Games",

        "Favorites",

        "Last Played",

        "Tools"

    ];


    infoText.textContent =

        names[state.selected] +

        " selected. " +

        "Press A to open.";

}


/* =========================
   NAVIGATION
========================= */

function navigate(direction) {

    if (!state.booted) {

        return;

    }


    let next =
        state.selected;


    if (direction === "left") {

        next--;

    }


    if (direction === "right") {

        next++;

    }


    if (direction === "up") {

        next -= 2;

    }


    if (direction === "down") {

        next += 2;

    }


    /*
        Wrap menu
    */

    if (next < 0) {

        next =
            state.menuCount - 1;

    }


    if (next >= state.menuCount) {

        next = 0;

    }


    state.selected =
        next;


    updateMenu();

}


/* =========================
   BUTTONS
========================= */

function pressButton(key) {

    console.log(
        "GB300 INPUT:",
        key
    );


    if (!state.booted) {

        return;

    }


    switch (key) {

        case "ArrowUp":

            navigate("up");

            break;


        case "ArrowDown":

            navigate("down");

            break;


        case "ArrowLeft":

            navigate("left");

            break;


        case "ArrowRight":

            navigate("right");

            break;


        case "a":

            selectCurrent();

            break;


        case "b":

            goBack();

            break;


        case "x":

            console.log("X");

            break;


        case "y":

            console.log("Y");

            break;


        case "Start":

            console.log(
                "START"
            );

            break;


        case "Select":

            console.log(
                "SELECT"
            );

            break;

    }

}


/* =========================
   SELECT
========================= */

function selectCurrent() {

    const item =
        menuItems[state.selected];

    const name =
        item
            .querySelector(
                "span:last-child"
            )
            .textContent;


    infoText.textContent =
        "Opening " +
        name +
        "...";


    console.log(
        "SELECT:",
        name
    );

}


/* =========================
   BACK
========================= */

function goBack() {

    infoText.textContent =
        "Back";

}


/* =========================
   KEYBOARD
========================= */

window.addEventListener(
    "keydown",
    event => {

        let key =
            event.key;


        /*
            Prevent Chrome scrolling
            when D-pad is used.
        */

        if (
            [
                "ArrowUp",
                "ArrowDown",
                "ArrowLeft",
                "ArrowRight",
                " "
            ].includes(key)
        ) {

            event.preventDefault();

        }


        /*
            Avoid repeating key events.
        */

        if (state.keyDown[key]) {

            return;

        }


        state.keyDown[key] =
            true;


        let mapped =
            key;


        switch (
            key.toLowerCase()
        ) {

            case "z":

                mapped = "a";

                break;


            case "x":

                mapped = "b";

                break;


            case "a":

                mapped = "x";

                break;


            case "s":

                mapped = "y";

                break;


            case "enter":

                mapped = "Start";

                break;


            case "shift":

                mapped = "Select";

                break;

        }


        pressButton(mapped);

    }
);


window.addEventListener(
    "keyup",
    event => {

        state.keyDown[
            event.key
        ] = false;

    }
);


/* =========================
   PHYSICAL BUTTONS
========================= */

document
    .querySelectorAll(
        "[data-key]"
    )
    .forEach(button => {


        /*
            Mouse
        */

        button.addEventListener(
            "mousedown",
            event => {

                event.preventDefault();

                pressButton(
                    button.dataset.key
                );

            }
        );


        /*
            Touch
        */

        button.addEventListener(
            "touchstart",
            event => {

                event.preventDefault();

                pressButton(
                    button.dataset.key
                );

            },
            {
                passive: false
            }
        );

    });


/* =========================
   MENU MOUSE CLICK
========================= */

menuItems.forEach(
    (item, index) => {

        item.addEventListener(
            "click",
            () => {

                state.selected =
                    index;

                updateMenu();

                selectCurrent();

            }
        );

    }
);


/* =========================
   HELPERS
========================= */

function sleep(ms) {

    return new Promise(
        resolve =>
            setTimeout(
                resolve,
                ms
            )
    );

}


function readASCII(
    data,
    start,
    length
) {

    let result = "";

    for (
        let i = start;
        i < start + length;
        i++
    ) {

        result +=
            String.fromCharCode(
                data[i]
            );

    }

    return result;

}


/* =========================
   START
========================= */

bootGB300();

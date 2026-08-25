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

    screen: "main",

    selected: 0,

    systemSelected: 0,

    romSelected: 0,

    menuCount: 5

};


const systems = [

    {
        name: "NES",
        extensions: [".nes"],
        folder: "roms/nes/"
    },

    {
        name: "SNES",
        extensions: [".sfc", ".smc"],
        folder: "roms/snes/"
    },

    {
        name: "GB",
        extensions: [".gb"],
        folder: "roms/gb/"
    },

    {
        name: "GBC",
        extensions: [".gbc"],
        folder: "roms/gbc/"
    },

    {
        name: "GBA",
        extensions: [".gba"],
        folder: "roms/gba/"
    },

    {
        name: "PS1",
        extensions: [".bin", ".cue", ".iso"],
        folder: "roms/ps1/"
    },

    {
        name: "MAME",
        extensions: [".zip"],
        folder: "roms/mame/"
    }

];


const roms = {

    NES: [
        {
            name: "Super Mario Bros.",
            file: "roms/nes/Super Mario Bros.nes"
        }
    ],

    SNES: [],

    GB: [],

    GBC: [],

    GBA: [],

    PS1: [],

    MAME: []

};


function updateMenu() {

    if (state.screen !== "main")
        return;

    menuItems.forEach(
        (item, index) => {

            item.classList.toggle(
                "selected",
                index === state.selected
            );

        }
    );

    infoText.textContent =
        menuItems[state.selected]
            .querySelector(
                "span:last-child"
            )
            .textContent;

}


function openRoms() {

    state.screen = "systems";

    document
        .querySelector(".platform")
        .classList.add("hidden");

    document
        .getElementById("info")
        .classList.add("hidden");

    const browser =
        document.getElementById(
            "romBrowser"
        );

    browser.classList.remove(
        "hidden"
    );

    renderSystems();

}


function renderSystems() {

    const container =
        document.getElementById(
            "systems"
        );

    container.innerHTML = "";

    systems.forEach(
        (system, index) => {

            const button =
                document.createElement(
                    "button"
                );

            button.className =
                "rom-system";

            if (
                index ===
                state.systemSelected
            ) {

                button.classList.add(
                    "selected"
                );

            }

            button.textContent =
                system.name;

            button.onclick = () => {

                state.systemSelected =
                    index;

                openSystem();

            };

            container.appendChild(
                button
            );

        }
    );

}


function openSystem() {

    state.screen = "roms";

    const system =
        systems[state.systemSelected];

    const list =
        document.getElementById(
            "romList"
        );

    list.classList.remove(
        "hidden"
    );

    list.innerHTML = "";

    const games =
        roms[system.name] || [];


    const title =
        document.createElement(
            "div"
        );

    title.className =
        "browser-title";

    title.textContent =
        system.name;

    list.appendChild(title);


    if (games.length === 0) {

        const empty =
            document.createElement(
                "div"
            );

        empty.className =
            "empty";

        empty.textContent =
            "No ROMs installed.";

        list.appendChild(empty);

        return;

    }


    games.forEach(
        (game, index) => {

            const button =
                document.createElement(
                    "button"
                );

            button.className =
                "rom-item";

            if (
                index ===
                state.romSelected
            ) {

                button.classList.add(
                    "selected"
                );

            }

            button.textContent =
                game.name;

            button.onclick = () => {

                state.romSelected =
                    index;

                playRom(game);

            };

            list.appendChild(
                button
            );

        }
    );

}


function playRom(game) {

    console.log(
        "GB300 PLAY:",
        game.file
    );

    /*
        Đây là điểm giao cho emulator core.

        Sau này:
        NES  -> NES WASM core
        SNES -> SNES WASM core
        GB   -> GB WASM core
        GBA  -> GBA WASM core
        PS1  -> PS1/QPSX WASM core
        MAME -> MAME2000 WASM core
    */

    document.getElementById(
        "bootText"
    ).textContent =
        "LOADING " + game.name;

    alert(
        "ROM selected:\\n\\n" +
        game.name +
        "\\n\\n" +
        "Core: " +
        systems[state.systemSelected].name
    );

}

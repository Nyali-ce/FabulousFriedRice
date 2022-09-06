"use strict"

const builder = require("electron-builder")
const Platform = builder.Platform

// Let's get that intellisense working
/**
* @type {import('electron-builder').Configuration}
* @see https://www.electron.build/configuration/configuration
*/
const options = {
    protocols: {
        name: "Deeplink Example",
        schemes: [
            "deeplink"
        ]
    },

    compression: "normal",
    removePackageScripts: true,
    nodeGypRebuild: false,
    buildDependenciesFromSource: false,

    directories: {
        output: "dist/artifacts/local",
        buildResources: "installer/resources"
    },
    files: [
        "out"
    ],
    extraFiles: [
        {
            from: "./",
            filter: "*.node"
        }
    ],

    win: {
        target: 'nsis',
        icon: ''
    },
    nsis: {
        deleteAppDataOnUninstall: true,
    },
};

// Promise is returned
builder.build({
    config: options
})
    .then((result) => {
        console.log(JSON.stringify(result))
    })
    .catch((error) => {
        console.error(error)
    })
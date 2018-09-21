"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const cache_path_1 = require("cache-path");
const bluebird = require("bluebird");
const debug_color2_1 = require("debug-color2");
exports.debugConsole = new debug_color2_1.Console(null, {
    label: true,
    time: true,
});
exports.debugConsole.inspectOptions = {
    colors: exports.debugConsole.enabledColor,
};
exports.debugConsole.enabled = false;
function enableDebug(bool) {
    if (bool || typeof bool === 'undefined') {
        exports.debugConsole.enabled = true;
    }
    else if (bool === false) {
        exports.debugConsole.enabled = false;
    }
    return exports.debugConsole.enabled;
}
exports.enableDebug = enableDebug;
function getCacheDirPath(name, options, isAsync) {
    options = options || {};
    let fnOrder = [];
    if (options.getCachePathOptions && options.getCachePathOptions.fnOrder) {
        fnOrder.push(...options.getCachePathOptions.fnOrder);
    }
    if (options.useGlobalCache) {
        fnOrder.push(...[
            cache_path_1.findNpmCachePath,
            cache_path_1.getOSTempPath,
            cache_path_1.findPkgModulePath,
        ]);
    }
    if (!fnOrder || !fnOrder.length) {
        fnOrder = null;
    }
    let opts = Object.assign({}, options.getCachePathOptions, { name, create: true, fnOrder });
    let fn = isAsync ? cache_path_1.getCachePathAsync : cache_path_1.getCachePath;
    return fn(opts);
}
exports.getCacheDirPath = getCacheDirPath;
function getOptions(options) {
    if (typeof options === 'string') {
        options = {
            name: options,
        };
    }
    options = options || {};
    if (!options.cachePath && options.name) {
        options.cachePath = getCacheDirPath(options.name, options);
    }
    options.getCachePathOptions = options.getCachePathOptions || {};
    return options;
}
exports.getOptions = getOptions;
function getOptionsAsync(options) {
    if (typeof options === 'string') {
        options = {
            name: options,
        };
    }
    return bluebird.resolve(options || {})
        .then(async function (options) {
        if (!options.cachePath && options.name) {
            options.cachePath = await getCacheDirPath(options.name, options, true);
        }
        options.getCachePathOptions = options.getCachePathOptions || {};
        return options;
    });
}
exports.getOptionsAsync = getOptionsAsync;
// @ts-ignore
exports = Object.freeze(exports);

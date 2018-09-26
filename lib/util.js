"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const entry_index_1 = require("cacache/lib/entry-index");
const cache_path_1 = require("cache-path");
const bluebird = require("bluebird");
const debug_color2_1 = require("debug-color2");
const path = require("upath2");
const deleteEmpty = require("delete-empty");
exports.deleteEmpty = deleteEmpty;
const _contentPath = require("cacache/lib/content/path");
const ssri = require("ssri");
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
function bucketPath(key, cachePath) {
    let fullpath = entry_index_1._bucketPath(cachePath, key);
    let p = path.relative(cachePath, fullpath);
    return {
        fullpath,
        path: p,
    };
}
exports.bucketPath = bucketPath;
function contentPath(integrity, cachePath) {
    let fullpath = _contentPath(cachePath, integrity);
    let p = path.relative(cachePath, fullpath);
    return {
        fullpath,
        path: p,
    };
}
exports.contentPath = contentPath;
function ssriData(data) {
    return ssri.fromData(data);
}
exports.ssriData = ssriData;
function ssriJSON(data, integrity) {
    return hashData(JSON.stringify(data));
}
exports.ssriJSON = ssriJSON;
function hashData(data) {
    return ssri.stringify(ssriData(data));
}
exports.hashData = hashData;
// @ts-ignore
exports = Object.freeze(exports);

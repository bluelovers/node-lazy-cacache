"use strict";
const cacache = require("cacache");
const bluebird = require("bluebird");
const crypto = require("crypto");
const util_1 = require("./lib/util");
const fs = require("fs-extra");
class Cacache {
    static getHashes() {
        return crypto.getHashes();
    }
    static create(options) {
        let SELF_CLASS = this;
        return new SELF_CLASS(options);
    }
    static createAsync(options) {
        let SELF_CLASS = this;
        return bluebird.resolve()
            .bind(SELF_CLASS)
            .then(async function () {
            options = await util_1.getOptionsAsync(options);
            return new SELF_CLASS(options);
        });
    }
    constructor(options) {
        options = util_1.getOptions(options);
        if (!options.cachePath) {
            let err = new Error(`name or cachePath is undefined`);
            // @ts-ignore
            err.options = options;
            throw err;
        }
        this.cachePath = options.cachePath;
        if (!fs.existsSync(this.cachePath)) {
            if (options.autoCreateDir) {
                util_1.debugConsole.debug(`auto create cachePath: ${this.cachePath}`);
                fs.ensureDirSync(this.cachePath);
            }
            else {
                throw new Error(`發生錯誤 快取目錄不存在 '${this.cachePath}'`);
            }
        }
        util_1.debugConsole.debug(`cachePath: ${this.cachePath}`);
    }
    list() {
        return bluebird
            .resolve(cacache.ls(this.cachePath));
    }
    readData(key, options) {
        return bluebird
            .resolve(cacache.get(this.cachePath, key, options));
    }
    readJSON(key, options) {
        return this.readData(key, options)
            .then(function (ret) {
            let ret2 = ret;
            ret2.json = JSON.parse(ret2.data.toString());
            return ret2;
        });
    }
    readDataIfExists(key, options) {
        let self = this;
        return this.hasData(key, options)
            .bind(this)
            .then(function (v) {
            if (v) {
                return self.readData(key, options);
            }
            return null;
        });
    }
    readJSONIfExists(key, options) {
        let self = this;
        return this.hasData(key, options)
            .bind(this)
            .then(function (v) {
            if (v) {
                return self.readJSON(key, options);
            }
            return null;
        });
    }
    readDataInfo(key, options) {
        return bluebird
            .resolve(cacache.get.info(this.cachePath, key, options));
    }
    hasContent(integrity) {
        return bluebird
            .resolve(cacache.get.hasContent(this.cachePath, integrity));
    }
    hasData(key, options) {
        let self = this;
        return bluebird
            .resolve()
            .bind(this)
            .then(async function () {
            let info = await self.readDataInfo(key);
            if (info
                && options
                && options.ttl
                && (info.time + options.ttl) <= Date.now()) {
                await self.remove(key);
                return null;
            }
            return info || null;
        });
    }
    writeData(key, data, options) {
        return bluebird
            .resolve(cacache.put(this.cachePath, key, data, options));
    }
    writeJSON(key, data, options) {
        return this.writeData(key, JSON.stringify(data), options);
    }
    removeAll() {
        return bluebird.resolve(cacache.rm.all(this.cachePath));
    }
    remove(key) {
        return bluebird.resolve(cacache.rm.entry(this.cachePath, key));
    }
    removeContent(data_integrity) {
        return bluebird.resolve(cacache.rm.content(this.cachePath, data_integrity));
    }
    clearMemoized() {
        cacache.clearMemoized();
        return bluebird.resolve();
    }
    createTempDirPath(options) {
        return bluebird.resolve(cacache.tmp.mkdir(this.cachePath, options));
    }
    withTempDirPath(options) {
        return new bluebird((resolve, reject) => {
            cacache.tmp.withTmp(this.cachePath, resolve, options);
        });
    }
}
exports.default = Cacache;
module.exports = Object.freeze(Object.assign(Cacache, exports, {
    default: Cacache,
    Cacache,
}));

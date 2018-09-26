"use strict";
const cacache = require("cacache");
const bluebird = require("bluebird");
const crypto = require("crypto");
const event_1 = require("./lib/event");
const util_1 = require("./lib/util");
const fs = require("fs-extra");
const entry_index_1 = require("cacache/lib/entry-index");
const ssri = require("ssri");
const util = require("./lib/util");
class Cacache extends event_1.default {
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
        super();
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
            .resolve(cacache.put(this.cachePath, key, data, options))
            .bind(this);
    }
    writeJSON(key, data, options) {
        return this.writeData(key, JSON.stringify(data), options);
    }
    writeDataAndClear(key, data, options) {
        let self = this;
        return this.writeData(key, data, options)
            .tap(function () {
            return self.clearKey(key, true);
        });
    }
    writeJSONAndClear(key, data, options) {
        let self = this;
        return this.writeJSON(key, data, options)
            .tap(function () {
            return self.clearKey(key, true);
        });
    }
    removeAll() {
        return bluebird.resolve(cacache.rm.all(this.cachePath));
    }
    remove(key) {
        return bluebird.resolve(cacache.rm.entry(this.cachePath, key));
    }
    _ssriData(data) {
        return util.ssriData(data);
    }
    _ssriJSON(data, integrity) {
        return this.hashData(JSON.stringify(data));
    }
    hashData(data) {
        return ssri.stringify(this._ssriData(data));
    }
    hashJSON(data) {
        return this.hashData(JSON.stringify(data));
    }
    clearKey(key, keepLatest) {
        let self = this;
        return bluebird
            .resolve(this.bucketEntries(key))
            .bind(this)
            .then(function (ls) {
            if (!ls) {
                return null;
            }
            return bluebird
                .reduce(ls, async function (latest, next) {
                if (next.key === key) {
                    if (latest.time > next.time) {
                        [latest, next] = [next, latest];
                    }
                    if (next.integrity != latest.integrity) {
                        await self.removeContent(latest.integrity);
                    }
                    latest = next;
                }
                return latest;
            })
                .then(async function (latest) {
                if (!keepLatest) {
                    await self.removeContent(latest.integrity);
                    return null;
                }
                return latest;
            });
        })
            .tap(async function (latest) {
            let bucket = self.bucketPath(key);
            if (latest) {
                let entry = Object.assign({}, latest);
                delete entry.path;
                let stringified = JSON.stringify(entry);
                await fs.writeFile(bucket.fullpath, "\n" + `${entry_index_1._hashEntry(stringified)}\t${stringified}`);
            }
            else {
                await fs.remove(bucket.fullpath);
            }
            await util_1.deleteEmpty(self.cachePath);
        });
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
    bucketPath(key) {
        return util.bucketPath(key, this.cachePath);
    }
    contentPath(integrity) {
        return util.contentPath(integrity, this.cachePath);
    }
    bucketEntries(key) {
        let self = this;
        return bluebird.resolve()
            .bind(this)
            .then(function () {
            let bucket = self.bucketPath(key);
            if (!fs.existsSync(bucket.fullpath)) {
                return null;
            }
            return fs.readFile(bucket.fullpath, 'utf8')
                .then(data => {
                let entries = [];
                data.split('\n').forEach(entry => {
                    if (!entry) {
                        return;
                    }
                    const pieces = entry.split('\t');
                    if (!pieces[1] || entry_index_1._hashEntry(pieces[1]) !== pieces[0]) {
                        // Hash is no good! Corruption or malice? Doesn't matter!
                        // EJECT EJECT
                        return;
                    }
                    let obj;
                    try {
                        obj = JSON.parse(pieces[1]);
                    }
                    catch (e) {
                        // Entry is corrupted!
                        return;
                    }
                    if (obj) {
                        obj.path = self.contentPath(obj.integrity).fullpath;
                        entries.push(obj);
                    }
                });
                return entries;
            });
        });
    }
    destroy() {
        let self = this;
        return bluebird
            .resolve(self.emit('destroy'))
            .tap(function () {
            return bluebird.all([
                self.removeAllListeners(),
            ]);
        });
    }
}
exports.default = Cacache;
module.exports = Object.freeze(Object.assign(Cacache, exports, {
    default: Cacache,
    Cacache,
}));

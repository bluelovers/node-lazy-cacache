"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !exports.hasOwnProperty(p)) __createBinding(exports, m, p);
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Cacache = void 0;
const cacache_1 = __importDefault(require("cacache"));
const bluebird_1 = __importDefault(require("bluebird"));
const crypto_1 = __importDefault(require("crypto"));
const event_1 = __importDefault(require("./lib/event"));
const util_1 = __importStar(require("./lib/util"));
const fs_extra_1 = __importDefault(require("fs-extra"));
const entry_index_1 = require("cacache/lib/entry-index");
const ssri_1 = __importDefault(require("ssri"));
__exportStar(require("./lib/types"), exports);
class Cacache extends event_1.default {
    constructor(options) {
        super();
        this.Cacache = Cacache;
        this.default = Cacache;
        options = util_1.getOptions(options);
        if (!options.cachePath) {
            let err = new Error(`name or cachePath is undefined`);
            // @ts-ignore
            err.options = options;
            throw err;
        }
        this.cachePath = options.cachePath;
        if (!fs_extra_1.default.existsSync(this.cachePath)) {
            if (options.autoCreateDir) {
                util_1.debugConsole.debug(`auto create cachePath: ${this.cachePath}`);
                fs_extra_1.default.ensureDirSync(this.cachePath);
            }
            else {
                throw new Error(`發生錯誤 快取目錄不存在 '${this.cachePath}'`);
            }
        }
        util_1.debugConsole.debug(`cachePath: ${this.cachePath}`);
    }
    static getHashes() {
        return crypto_1.default.getHashes();
    }
    static create(options) {
        let SELF_CLASS = this;
        return new SELF_CLASS(options);
    }
    static createAsync(options) {
        let SELF_CLASS = this;
        return bluebird_1.default.resolve()
            .bind(SELF_CLASS)
            .then(async function () {
            options = await util_1.getOptionsAsync(options);
            return new SELF_CLASS(options);
        });
    }
    list() {
        return bluebird_1.default
            .resolve(cacache_1.default.ls(this.cachePath));
    }
    readData(key, options) {
        return bluebird_1.default
            .resolve(cacache_1.default.get(this.cachePath, key, options));
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
        return bluebird_1.default
            // @ts-ignore
            .resolve(cacache_1.default.get.info(this.cachePath, key, options));
    }
    hasContent(integrity) {
        return bluebird_1.default
            .resolve(cacache_1.default.get.hasContent(this.cachePath, integrity));
    }
    hasData(key, options) {
        let self = this;
        return bluebird_1.default
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
        return bluebird_1.default
            .resolve(cacache_1.default.put(this.cachePath, key, data, options))
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
        return bluebird_1.default.resolve(cacache_1.default.rm.all(this.cachePath));
    }
    remove(key) {
        return bluebird_1.default.resolve(cacache_1.default.rm.entry(this.cachePath, key));
    }
    _ssriData(data) {
        return util_1.default.ssriData(data);
    }
    _ssriJSON(data, integrity) {
        return this.hashData(JSON.stringify(data));
    }
    hashData(data) {
        return ssri_1.default.stringify(this._ssriData(data));
    }
    hashJSON(data) {
        return this.hashData(JSON.stringify(data));
    }
    clearKey(key, keepLatest) {
        let self = this;
        return bluebird_1.default
            .resolve(this.bucketEntries(key))
            .bind(this)
            .then(function (ls) {
            if (!ls) {
                return null;
            }
            return bluebird_1.default
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
                await fs_extra_1.default.writeFile(bucket.fullpath, "\n" + `${entry_index_1._hashEntry(stringified)}\t${stringified}`);
            }
            else {
                await fs_extra_1.default.remove(bucket.fullpath);
            }
            await util_1.deleteEmpty(self.cachePath);
        });
    }
    removeContent(data_integrity) {
        return bluebird_1.default.resolve(cacache_1.default.rm.content(this.cachePath, data_integrity));
    }
    clearMemoized() {
        return bluebird_1.default.resolve()
            .tap(function () {
            return cacache_1.default.clearMemoized();
        });
    }
    createTempDirPath(options) {
        return bluebird_1.default.resolve(cacache_1.default.tmp.mkdir(this.cachePath, options));
    }
    withTempDirPath(options) {
        return new bluebird_1.default((resolve, reject) => {
            cacache_1.default.tmp.withTmp(this.cachePath, resolve, options);
        });
    }
    bucketPath(key) {
        return util_1.default.bucketPath(key, this.cachePath);
    }
    contentPath(integrity) {
        return util_1.default.contentPath(integrity, this.cachePath);
    }
    bucketEntries(key) {
        let self = this;
        return bluebird_1.default.resolve()
            .bind(this)
            .then(function () {
            let bucket = self.bucketPath(key);
            if (!fs_extra_1.default.existsSync(bucket.fullpath)) {
                return null;
            }
            return fs_extra_1.default.readFile(bucket.fullpath, 'utf8')
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
        return bluebird_1.default
            .resolve(self.emit('destroy'))
            .tap(function () {
            return bluebird_1.default.all([
                self.removeAllListeners(),
            ]);
        });
    }
}
exports.Cacache = Cacache;
exports.default = Cacache;
//# sourceMappingURL=core.js.map
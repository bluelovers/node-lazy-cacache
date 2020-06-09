/// <reference types="node" />
import Bluebird from 'bluebird';
import EventEmitterAsync from './lib/event';
import { ICacacheDataHasContent, ICacacheJSON, ICacacheData, ICacacheList, ICacacheListEntry, ICacacheHash, ICacacheIntegrity, ICacacheOptionsPlus, ICacacheOptionsCore, ICacacheOptions } from './lib/types';
export * from './lib/types';
import TypedArray = NodeJS.TypedArray;
export declare class Cacache extends EventEmitterAsync {
    cachePath: string;
    static getHashes(): string[];
    static create(options: string | ICacacheOptions): Cacache;
    static createAsync(options?: string | ICacacheOptions): Bluebird<Cacache>;
    constructor(options: string | ICacacheOptions);
    list<M>(): Bluebird<ICacacheList<M>>;
    readData<D = Buffer, M = any>(key: string, options?: ICacacheOptionsCore): Bluebird<ICacacheData<D, M>>;
    readJSON<D = any, M = any>(key: string, options?: ICacacheOptionsCore): Bluebird<ICacacheJSON<D, M>>;
    readDataIfExists<D = Buffer, M = any>(key: string, options?: ICacacheOptionsPlus): Bluebird<ICacacheData<D, M>>;
    readJSONIfExists<D = any, M = any>(key: string, options?: ICacacheOptionsPlus): Bluebird<ICacacheJSON<D, M>>;
    readDataInfo<M>(key: string, options?: ICacacheOptionsCore): Bluebird<ICacacheListEntry<M>>;
    hasContent<O>(integrity: string): Bluebird<ICacacheDataHasContent<O>>;
    hasData<M>(key: string, options?: ICacacheOptionsPlus): Bluebird<ICacacheListEntry<M>>;
    writeData<O = any, M = any>(key: string, data: string | DataView | TypedArray, options?: ICacacheOptionsCore<M>): Bluebird<ICacacheIntegrity<ICacacheHash<O>>>;
    writeJSON<O = any, M = any>(key: string, data: any, options?: ICacacheOptionsCore<M>): Bluebird<ICacacheIntegrity<ICacacheHash<O>>>;
    writeDataAndClear<O = any, M = any>(key: string, data: string | DataView | TypedArray, options?: ICacacheOptionsCore<M>): Bluebird<ICacacheIntegrity<ICacacheHash<O>>>;
    writeJSONAndClear<O = any, M = any>(key: string, data: any, options?: ICacacheOptionsCore<M>): Bluebird<ICacacheIntegrity<ICacacheHash<O>>>;
    removeAll(): Bluebird<void>;
    remove(key: string): Bluebird<void>;
    _ssriData(data: string | DataView | TypedArray): string;
    _ssriJSON(data: any, integrity?: string): string;
    hashData(data: string | DataView | TypedArray): string;
    hashJSON(data: any): string;
    clearKey<M = any>(key: string, keepLatest?: boolean): Bluebird<ICacacheListEntry<M>>;
    removeContent(data_integrity: string): Bluebird<void>;
    clearMemoized(): Bluebird<void>;
    createTempDirPath(options?: ICacacheOptionsCore): Bluebird<string>;
    withTempDirPath(options?: ICacacheOptionsCore): Bluebird<string>;
    bucketPath(key: string): {
        fullpath: string;
        path: string;
    };
    contentPath(integrity: string): {
        fullpath: string;
        path: string;
    };
    bucketEntries<M = any>(key: string): Bluebird<ICacacheListEntry<M>[]>;
    destroy(): Bluebird<boolean>;
    Cacache: typeof Cacache;
    default: typeof Cacache;
}
export default Cacache;

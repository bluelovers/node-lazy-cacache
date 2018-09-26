/// <reference types="node" />
import bluebird = require('bluebird');
import { Console } from 'debug-color2';
import { ICacacheOptions } from '../index';
import deleteEmpty = require('delete-empty');
import TypedArray = NodeJS.TypedArray;
export { deleteEmpty };
export declare const debugConsole: Console;
export declare function enableDebug(bool?: boolean): boolean;
export declare function getCacheDirPath(name: string, options: ICacacheOptions, isAsync: true): bluebird<string>;
export declare function getCacheDirPath(name: string, options: ICacacheOptions, isAsync?: boolean): string;
export declare function getOptions(options?: string | ICacacheOptions): ICacacheOptions;
export declare function getOptionsAsync(options?: string | ICacacheOptions): bluebird<ICacacheOptions>;
export declare function bucketPath(key: string, cachePath: string): {
    fullpath: string;
    path: string;
};
export declare function contentPath(integrity: string, cachePath: string): {
    fullpath: string;
    path: string;
};
export declare function ssriData(data: string | DataView | TypedArray): string;
export declare function ssriJSON(data: any, integrity?: string): string;
export declare function hashData(data: string | DataView | TypedArray): string;

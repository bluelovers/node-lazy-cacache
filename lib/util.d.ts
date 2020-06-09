/// <reference types="node" />
import Bluebird from 'bluebird';
import { Console } from 'debug-color2';
import deleteEmpty from 'delete-empty';
import TypedArray = NodeJS.TypedArray;
import { ICacacheOptions } from './types';
export { deleteEmpty };
export declare const debugConsole: Console;
export declare function enableDebug(bool?: boolean): boolean;
export declare function getCacheDirPath(name: string, options: ICacacheOptions, isAsync: true): Bluebird<string>;
export declare function getCacheDirPath(name: string, options: ICacacheOptions, isAsync?: boolean): string;
export declare function getOptions(options?: string | ICacacheOptions): ICacacheOptions;
export declare function getOptionsAsync(options?: string | ICacacheOptions): Bluebird<ICacacheOptions>;
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
declare const _default: typeof import("./util");
export default _default;

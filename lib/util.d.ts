import bluebird = require('bluebird');
import { Console } from 'debug-color2';
import { ICacacheOptions } from '../index';
export declare const debugConsole: Console;
export declare function enableDebug(bool?: boolean): boolean;
export declare function getCacheDirPath(name: string, options: ICacacheOptions, isAsync: true): bluebird<string>;
export declare function getCacheDirPath(name: string, options: ICacacheOptions, isAsync?: boolean): string;
export declare function getOptions(options?: string | ICacacheOptions): ICacacheOptions;
export declare function getOptionsAsync(options?: string | ICacacheOptions): bluebird<ICacacheOptions>;

import { _bucketPath } from 'cacache/lib/entry-index';
import { getCachePath, findNpmCachePath, getOSTempPath, findPkgModulePath, getCachePathAsync } from 'cache-path';
import bluebird = require('bluebird');
import { Console } from 'debug-color2';
import * as path from 'upath2';
import { ICacacheOptions } from '../index';
import deleteEmpty = require('delete-empty');
import _contentPath = require('cacache/lib/content/path');
import ssri = require('ssri');
import TypedArray = NodeJS.TypedArray;

export { deleteEmpty }

export const debugConsole = new Console(null, {
	label: true,
	time: true,
});

debugConsole.inspectOptions = {
	colors: debugConsole.enabledColor,
};

debugConsole.enabled = false;

export function enableDebug(bool?: boolean)
{
	if (bool || typeof bool === 'undefined')
	{
		debugConsole.enabled = true;
	}
	else if (bool === false)
	{
		debugConsole.enabled = false;
	}

	return debugConsole.enabled;
}

export function getCacheDirPath(name: string, options: ICacacheOptions, isAsync: true): bluebird<string>
export function getCacheDirPath(name: string, options: ICacacheOptions, isAsync?: boolean): string
export function getCacheDirPath(name: string, options: ICacacheOptions, isAsync?: boolean)
{
	options = options || {};

	let fnOrder = [];

	if (options.getCachePathOptions && options.getCachePathOptions.fnOrder)
	{
		fnOrder.push(...options.getCachePathOptions.fnOrder);
	}

	if (options.useGlobalCache)
	{
		fnOrder.push(...[
			findNpmCachePath,
			getOSTempPath,
			findPkgModulePath,
		]);
	}

	if (!fnOrder || !fnOrder.length)
	{
		fnOrder = null;
	}

	let opts = {
		...options.getCachePathOptions,
		name,
		create: true,
		fnOrder,
	};

	let fn = isAsync ? getCachePathAsync : getCachePath;

	return fn(opts);
}

export function getOptions(options?: string | ICacacheOptions)
{
	if (typeof options === 'string')
	{
		options = {
			name: options,
		}
	}

	options = options || {};

	if (!options.cachePath && options.name)
	{
		options.cachePath = getCacheDirPath(options.name, options);
	}

	options.getCachePathOptions = options.getCachePathOptions || {};

	return options;
}

export function getOptionsAsync(options?: string | ICacacheOptions)
{
	if (typeof options === 'string')
	{
		options = {
			name: options,
		}
	}

	return bluebird.resolve(options || {})
		.then(async function (options: ICacacheOptions)
		{
			if (!options.cachePath && options.name)
			{
				options.cachePath = await getCacheDirPath(options.name, options, true);
			}

			options.getCachePathOptions = options.getCachePathOptions || {};

			return options;
		})
	;
}

export function bucketPath(key: string, cachePath: string)
{
	let fullpath: string = _bucketPath(cachePath, key);

	let p = path.relative(cachePath, fullpath);

	return {
		fullpath,
		path: p,
	}
}

export function contentPath(integrity: string, cachePath: string)
{
	let fullpath: string = _contentPath(cachePath, integrity);

	let p = path.relative(cachePath, fullpath);

	return {
		fullpath,
		path: p,
	}
}

export function ssriData(data: string | DataView | TypedArray): string
{
	return ssri.fromData(data)
}

export function ssriJSON(data, integrity?: string): string
{
	return hashData(JSON.stringify(data));
}

export function hashData(data: string | DataView | TypedArray): string
{
	return ssri.stringify(ssriData(data));
}

// @ts-ignore
exports = Object.freeze(exports);

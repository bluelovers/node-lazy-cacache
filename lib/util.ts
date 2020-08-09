import { _bucketPath } from 'cacache/lib/entry-index';
import { getCachePath, findNpmCachePath, findYarnCachePath, findOSTempPath, findPkgModulePath, getCachePathAsync } from 'cache-path';
import Bluebird from 'bluebird';
import { Console } from 'debug-color2';
import path from 'upath2';
import deleteEmpty from 'delete-empty';
import _contentPath from 'cacache/lib/content/path';
import ssri from 'ssri';

import TypedArray = NodeJS.TypedArray;
import { ICacacheOptions } from './types';

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

export function getCacheDirPath(name: string, options: ICacacheOptions, isAsync: true): Bluebird<string>
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
			findYarnCachePath,
			findNpmCachePath,
			findOSTempPath,
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

	return fn(opts) as any;
}

export function getOptions(options?: string | ICacacheOptions): ICacacheOptions
{
	if (typeof options === 'string')
	{
		options = {
			name: options,
		} as ICacacheOptions
	}

	options = options || {} as ICacacheOptions;

	if (!options.cachePath && options.name)
	{
		options.cachePath = getCacheDirPath(options.name, options);
	}

	options.getCachePathOptions = options.getCachePathOptions || {};

	return options;
}

export function getOptionsAsync(options?: string | ICacacheOptions): Bluebird<ICacacheOptions>
{
	if (typeof options === 'string')
	{
		options = {
			name: options,
		}
	}

	return Bluebird.resolve<ICacacheOptions>(options || {})
		.then<ICacacheOptions>(async function (options: ICacacheOptions)
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
	return ssri.fromData(data) as any
}

export function ssriJSON(data, integrity?: string): string
{
	return hashData(JSON.stringify(data));
}

export function hashData(data: string | DataView | TypedArray): string
{
	return ssri.stringify(ssriData(data));
}

export default exports as typeof import('./util')

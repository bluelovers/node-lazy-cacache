import { getCachePath, findNpmCachePath, getOSTempPath, findPkgModulePath, getCachePathAsync } from 'cache-path';
import bluebird = require('bluebird');
import { Console } from 'debug-color2';
import { ICacacheOptions } from '../index';
import deleteEmpty = require('delete-empty');

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

// @ts-ignore
exports = Object.freeze(exports);

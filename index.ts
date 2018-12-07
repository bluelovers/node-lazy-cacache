import cacache = require('cacache');
import bluebird = require('bluebird');
import TypedArray = NodeJS.TypedArray;
import crypto = require('crypto');
import { IOptions as IGetCachePathOptions } from 'cache-path';
import EventEmitterAsync from './lib/event';
import { getCacheDirPath, debugConsole, getOptionsAsync, getOptions, deleteEmpty } from './lib/util';
import * as fs from 'fs-extra';
import { _bucketPath, _hashEntry } from 'cacache/lib/entry-index';
import ssri = require('ssri');
import util = require('./lib/util');

export interface ICacacheOptions extends ICacacheOptionsCore
{
	/**
	 * name for auto create cachePath
	 */
	name?: string,
	/**
	 * root path of cache save
	 */
	cachePath?: string,
	/**
	 * use global cache path first
	 */
	useGlobalCache?: boolean,

	getCachePathOptions?: IGetCachePathOptions,

	/**
	 * auto create cachePath if not exists
	 */
	autoCreateDir?: boolean,
}

export interface ICacacheOptionsCore<M = any>
{
	integrity?,
	algorithms?: ICacacheAlgorithm,
	memoize?,
	uid?
	git?

	metadata?: M,
}

export interface ICacacheOptionsPlus extends ICacacheOptionsCore
{
	ttl?: number,
}

export class Cacache extends EventEmitterAsync
{
	cachePath: string;

	static getHashes()
	{
		return crypto.getHashes();
	}

	static create(options: string | ICacacheOptions)
	{
		let SELF_CLASS = this;
		return new SELF_CLASS(options);
	}

	static createAsync(options?: string | ICacacheOptions)
	{
		let SELF_CLASS = this;

		return bluebird.resolve()
			.bind(SELF_CLASS)
			.then(async function ()
			{
				options = await getOptionsAsync(options);

				return new SELF_CLASS(options);
			})
			;
	}

	constructor(options: string | ICacacheOptions)
	{
		super();

		options = getOptions(options);

		if (!options.cachePath)
		{
			let err = new Error(`name or cachePath is undefined`);

			// @ts-ignore
			err.options = options;

			throw err;
		}

		this.cachePath = options.cachePath;

		if (!fs.existsSync(this.cachePath))
		{
			if (options.autoCreateDir)
			{
				debugConsole.debug(`auto create cachePath: ${this.cachePath}`);
				fs.ensureDirSync(this.cachePath)
			}
			else
			{
				throw new Error(`發生錯誤 快取目錄不存在 '${this.cachePath}'`);
			}
		}

		debugConsole.debug(`cachePath: ${this.cachePath}`);
	}

	list<M>(): bluebird<ICacacheList<M>>
	{
		return bluebird
			.resolve(cacache.ls(this.cachePath))
			;
	}

	readData<D = Buffer, M = any>(key: string,
		options?: ICacacheOptionsCore,
	): bluebird<ICacacheData<D, M>>
	{
		return bluebird
			.resolve(cacache.get(this.cachePath, key, options));
	}

	readJSON<D = any, M = any>(key: string,
		options?: ICacacheOptionsCore,
	)
	{
		return this.readData(key, options)
			.then(function (ret)
			{
				let ret2 = ret as any as ICacacheJSON<D, M>;

				ret2.json = JSON.parse(ret2.data.toString());

				return ret2;
			})
			;
	}

	readDataIfExists<D = Buffer, M = any>(key: string,
		options?: ICacacheOptionsPlus,
	): bluebird<ICacacheData<D, M>>
	{
		let self = this;

		return this.hasData(key, options)
			.bind(this)
			.then(function (this: Cacache, v)
			{
				if (v)
				{
					return self.readData<D, M>(key, options)
				}

				return null;
			})
			;
	}

	readJSONIfExists<D = any, M = any>(key: string,
		options?: ICacacheOptionsPlus,
	): bluebird<ICacacheJSON<D, M>>
	{
		let self = this;

		return this.hasData(key, options)
			.bind(this)
			.then(function (this: Cacache, v)
			{
				if (v)
				{
					return self.readJSON<D, M>(key, options)
				}

				return null;
			})
			;
	}

	readDataInfo<M>(key: string,
		options?: ICacacheOptionsCore,
	): bluebird<ICacacheListEntry<M>>
	{
		return bluebird
			.resolve(cacache.get.info(this.cachePath, key, options));
	}

	hasContent<O>(integrity: string): bluebird<ICacacheDataHasContent<O>>
	{
		return bluebird
			.resolve(cacache.get.hasContent(this.cachePath, integrity));
	}

	hasData<M>(key: string,
		options?: ICacacheOptionsPlus,
	)
	{
		let self = this;

		return bluebird
			.resolve()
			.bind(this)
			.then(async function ()
			{
				let info = await self.readDataInfo<M>(key);

				if (info
					&& options
					&& options.ttl
					&& (info.time + options.ttl) <= Date.now()
				)
				{
					await self.remove(key);

					return null;
				}

				return info || null;
			})
			;
	}

	writeData<O = any, M = any>(key: string,
		data: string | DataView | TypedArray,
		options?: ICacacheOptionsCore<M>,
	): bluebird<ICacacheIntegrity<ICacacheHash<O>>>
	{
		return bluebird
			.resolve(cacache.put(this.cachePath, key, data, options))
			.bind(this)
			;
	}

	writeJSON<O = any, M = any>(key: string, data, options?: ICacacheOptionsCore<M>)
	{
		return this.writeData<O, M>(key, JSON.stringify(data), options);
	}

	writeDataAndClear<O = any, M = any>(key: string,
		data: string | DataView | TypedArray,
		options?: ICacacheOptionsCore<M>,
	): bluebird<ICacacheIntegrity<ICacacheHash<O>>>
	{
		let self = this;

		return this.writeData<O, M>(key, data, options)
			.tap(function ()
			{
				return self.clearKey(key, true);
			})
			;
	}

	writeJSONAndClear<O = any, M = any>(key: string,
		data,
		options?: ICacacheOptionsCore<M>,
	): bluebird<ICacacheIntegrity<ICacacheHash<O>>>
	{
		let self = this;

		return this.writeJSON<O, M>(key, data, options)
			.tap(function ()
			{
				return self.clearKey(key, true);
			})
			;
	}

	removeAll(): bluebird<void>
	{
		return bluebird.resolve(cacache.rm.all(this.cachePath));
	}

	remove(key: string): bluebird<void>
	{
		return bluebird.resolve(cacache.rm.entry(this.cachePath, key));
	}

	_ssriData(data: string | DataView | TypedArray): string
	{
		return util.ssriData(data)
	}

	_ssriJSON(data, integrity?: string)
	{
		return this.hashData(JSON.stringify(data));
	}

	hashData(data: string | DataView | TypedArray): string
	{
		return ssri.stringify(this._ssriData(data));
	}

	hashJSON(data)
	{
		return this.hashData(JSON.stringify(data));
	}

	clearKey<M = any>(key: string, keepLatest?: boolean)
	{
		let self = this;

		return bluebird
			.resolve(this.bucketEntries(key))
			.bind(this)
			.then(function (ls)
			{
				if (!ls)
				{
					return null;
				}

				return bluebird
					.reduce(ls, async function (latest: ICacacheListEntry<M>, next: ICacacheListEntry<M>)
					{
						if (next.key === key)
						{
							if (latest.time > next.time)
							{
								[latest, next] = [next, latest];
							}

							if (next.integrity != latest.integrity)
							{
								await self.removeContent(latest.integrity);
							}

							latest = next;
						}

						return latest;
					})
					.then(async function (latest)
					{
						if (!keepLatest)
						{
							await self.removeContent(latest.integrity);

							return null;
						}

						return latest
					})
			})
			.tap(async function (latest)
			{
				let bucket = self.bucketPath(key);

				if (latest)
				{
					let entry = Object.assign({}, latest);

					delete entry.path;

					let stringified = JSON.stringify(entry);

					await fs.writeFile(bucket.fullpath, "\n" + `${_hashEntry(stringified)}\t${stringified}`)
				}
				else
				{
					await fs.remove(bucket.fullpath)
				}

				await deleteEmpty(self.cachePath);
			})
			;
	}

	removeContent(data_integrity: string): bluebird<void>
	{
		return bluebird.resolve(cacache.rm.content(this.cachePath, data_integrity));
	}

	clearMemoized()
	{
		return bluebird.resolve()
			.tap(function ()
			{
				return cacache.clearMemoized()
			})
			;
	}

	createTempDirPath(options?: ICacacheOptionsCore): bluebird<string>
	{
		return bluebird.resolve(cacache.tmp.mkdir(this.cachePath, options));
	}

	withTempDirPath(options?: ICacacheOptionsCore): bluebird<string>
	{
		return new bluebird((resolve, reject) =>
		{
			cacache.tmp.withTmp(this.cachePath, resolve, options)
		});
	}

	bucketPath(key: string)
	{
		return util.bucketPath(key, this.cachePath);
	}

	contentPath(integrity: string)
	{
		return util.contentPath(integrity, this.cachePath);
	}

	bucketEntries<M = any>(key: string)
	{
		let self = this;

		return bluebird.resolve()
			.bind(this)
			.then(function (this: Cacache)
			{
				let bucket = self.bucketPath(key);

				if (!fs.existsSync(bucket.fullpath))
				{
					return null;
				}

				return fs.readFile(bucket.fullpath, 'utf8')
					.then(data =>
					{
						let entries = [] as ICacacheListEntry<M>[];

						data.split('\n').forEach(entry =>
						{
							if (!entry)
							{
								return
							}
							const pieces = entry.split('\t');
							if (!pieces[1] || _hashEntry(pieces[1]) !== pieces[0])
							{
								// Hash is no good! Corruption or malice? Doesn't matter!
								// EJECT EJECT
								return
							}
							let obj;
							try
							{
								obj = JSON.parse(pieces[1])
							}
							catch (e)
							{
								// Entry is corrupted!
								return
							}
							if (obj)
							{
								obj.path = self.contentPath(obj.integrity).fullpath;

								entries.push(obj)
							}
						});
						return entries
					})
					;
			})
			;
	}

	destroy()
	{
		let self = this;

		return bluebird
			.resolve(self.emit('destroy'))
			.tap(function ()
			{
				return bluebird.all([
					self.removeAllListeners(),
				])
			})
			;
	}
}

type valueof<T> = T[keyof T]

export type ICacacheAlgorithm = 'sha512' | string;

export interface ICacacheIntegrity<T = ICacacheHash>
{
	sha512?: T[],

	[k: string]: T[],
}

export interface ICacacheHash<O = any>
{
	source: string,
	algorithm: ICacacheAlgorithm,
	digest: string,
	options: O[],
}

export interface ICacacheListEntry<M = any>
{
	key: string,
	integrity: string,
	path: string,
	size: number,
	time: number,
	metadata: M,
}

export interface ICacacheList<M = any>
{
	[k: string]: ICacacheListEntry<M>,
}

export interface ICacacheData<D = Buffer, M = any>
{
	metadata: M,
	integrity: string,
	data: D | Buffer | DataView | TypedArray,
	size: string,
}

export interface ICacacheJSON<D = Buffer, M = any>
{
	metadata: M,
	integrity: string,
	data: Buffer | DataView | TypedArray,
	size: string,
	json: D,
}

export interface ICacacheDataHasContent<O = any>
{
	sri: ICacacheHash<O>,
	size: number,
}

export default Cacache

// @ts-ignore
export = Object.freeze(Object.assign(Cacache, exports, {
	default: Cacache,
	Cacache,
}) as typeof Cacache & {
	default: typeof Cacache,
	Cacache: typeof Cacache,
});

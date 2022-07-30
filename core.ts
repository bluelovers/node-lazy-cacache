import cacache from 'cacache';
import Bluebird from 'bluebird';
import crypto from 'crypto';
import EventEmitterAsync from './lib/event';
import util, { debugConsole, getOptionsAsync, getOptions, deleteEmpty } from './lib/util';
import { ensureDirSync, existsSync, writeFile, remove, readFile } from 'fs-extra';
import { _hashEntry } from 'cacache/lib/entry-index';
import ssri from 'ssri';
import {
	ICacacheDataHasContent,
	ICacacheJSON,
	ICacacheData,
	ICacacheList,
	ICacacheListEntry,
	ICacacheHash,
	ICacacheIntegrity,
	ICacacheOptionsPlus,
	ICacacheOptionsCore,
	ICacacheOptions,
} from './lib/types';

export * from './lib/types';

import TypedArray = NodeJS.TypedArray;

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

		return Bluebird.resolve()
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

		if (!existsSync(this.cachePath))
		{
			if (options.autoCreateDir)
			{
				debugConsole.debug(`auto create cachePath: ${this.cachePath}`);
				ensureDirSync(this.cachePath)
			}
			else
			{
				throw new Error(`發生錯誤 快取目錄不存在 '${this.cachePath}'`);
			}
		}

		debugConsole.debug(`cachePath: ${this.cachePath}`);
	}

	list<M>(): Bluebird<ICacacheList<M>>
	{
		return Bluebird
			.resolve(cacache.ls(this.cachePath)) as any
			;
	}

	readData<D = Buffer, M = any>(key: string,
		options?: ICacacheOptionsCore,
	): Bluebird<ICacacheData<D, M>>
	{
		return Bluebird
			.resolve(cacache.get(this.cachePath, key, options)) as any;
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
	): Bluebird<ICacacheData<D, M>>
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
	): Bluebird<ICacacheJSON<D, M>>
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
	): Bluebird<ICacacheListEntry<M>>
	{
		return Bluebird
			// @ts-ignore
			.resolve(cacache.get.info(this.cachePath, key, options as any)) as any;
	}

	hasContent<O>(integrity: string): Bluebird<ICacacheDataHasContent<O>>
	{
		return Bluebird
			.resolve(cacache.get.hasContent(this.cachePath, integrity)) as any;
	}

	hasData<M>(key: string,
		options?: ICacacheOptionsPlus,
	)
	{
		let self = this;

		return Bluebird
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
	): Bluebird<ICacacheIntegrity<ICacacheHash<O>>>
	{
		return Bluebird
			.resolve(cacache.put(this.cachePath, key, data, options as any))
			.bind(this) as any
			;
	}

	writeJSON<O = any, M = any>(key: string, data, options?: ICacacheOptionsCore<M>)
	{
		return this.writeData<O, M>(key, JSON.stringify(data), options);
	}

	writeDataAndClear<O = any, M = any>(key: string,
		data: string | DataView | TypedArray,
		options?: ICacacheOptionsCore<M>,
	): Bluebird<ICacacheIntegrity<ICacacheHash<O>>>
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
	): Bluebird<ICacacheIntegrity<ICacacheHash<O>>>
	{
		let self = this;

		return this.writeJSON<O, M>(key, data, options)
			.tap(function ()
			{
				return self.clearKey(key, true);
			})
			;
	}

	removeAll(): Bluebird<void>
	{
		return Bluebird.resolve(cacache.rm.all(this.cachePath));
	}

	remove(key: string): Bluebird<void>
	{
		return Bluebird.resolve(cacache.rm.entry(this.cachePath, key)) as any;
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

		return Bluebird
			.resolve(this.bucketEntries(key))
			.bind(this)
			.then(function (ls)
			{
				if (!ls)
				{
					return null;
				}

				return Bluebird
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

					await writeFile(bucket.fullpath, "\n" + `${_hashEntry(stringified)}\t${stringified}`)
				}
				else
				{
					await remove(bucket.fullpath)
				}

				await deleteEmpty(self.cachePath);
			})
			;
	}

	removeContent(data_integrity: string): Bluebird<void>
	{
		return Bluebird.resolve(cacache.rm.content(this.cachePath, data_integrity)) as any;
	}

	clearMemoized()
	{
		return Bluebird.resolve()
			.tap(function ()
			{
				return cacache.clearMemoized()
			})
			;
	}

	createTempDirPath(options?: ICacacheOptionsCore): Bluebird<string>
	{
		return Bluebird.resolve(cacache.tmp.mkdir(this.cachePath, options as any));
	}

	withTempDirPath(options?: ICacacheOptionsCore): Bluebird<string>
	{
		return new Bluebird((resolve, reject) =>
		{
			cacache.tmp.withTmp(this.cachePath, resolve as any, options as any)
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

		return Bluebird.resolve()
			.bind(this)
			.then(function (this: Cacache)
			{
				let bucket = self.bucketPath(key);

				if (!existsSync(bucket.fullpath))
				{
					return null;
				}

				return readFile(bucket.fullpath, 'utf8')
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

		return Bluebird
			.resolve(self.emit('destroy'))
			.tap(function ()
			{
				return Bluebird.all([
					self.removeAllListeners(),
				])
			})
			;
	}

	Cacache = Cacache;
	default = Cacache;
}

export default Cacache

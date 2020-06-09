/**
 * Created by user on 2020/6/10.
 */

import { IOptions as IGetCachePathOptions } from 'cache-path';

import TypedArray = NodeJS.TypedArray;

export type { TypedArray }

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

type valueof<T> = T[keyof T]

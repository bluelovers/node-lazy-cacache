import Cacache from '../core';
import path from "path";

import { jest } from '@jest/globals'

jest.setTimeout(1000 * 60 * 20);

describe(`default`, () =>
{
	let cache = new Cacache('lazy-cacache');
	_setup(cache)
});

describe(`useGlobalCache`, () =>
{
	let cache = Cacache.createAsync({
		name: 'lazy-cacache',
		useGlobalCache: true,
	});
	_setup(cache)
});

describe(`autoCreateDir`, () =>
{
	let cache = Cacache.create({
		cachePath: path.join(__dirname, '.mycache'),
		// if not set, u will need create by self
		autoCreateDir: true,
	});
	_setup(cache)
});

describe(`getCachePathOptions`, () =>
{
	let cache = new Cacache({
		name: 'lazy-cacache',
		getCachePathOptions: {
			// hash the cache name
			hash: true,
		}
	});
	_setup(cache)
});

function _setup(cache: Cacache | Promise<Cacache>)
{
	const key1 = 'data1' as const;
	const key2 = 'data2' as const;

	let actual1;
	let actual2;

	let expected1 = 'data111' as const;
	let expected2 = {
		data: 222,
	} as const;

	beforeAll(async () =>
	{
		cache = await cache as Cacache;

		await cache.removeAll();

		actual1 = await cache.readDataInfo(key1)
		actual2 = await cache.readDataInfo(key2)

		actual1 = await cache.writeData(key1, expected1);
		actual2 = await cache.writeJSON(key2, expected2);
	})

	test(`readDataInfo`, async () =>
	{
		cache = await cache as Cacache;

		console.dir({
			actual1,
			actual2,
		})

		let actual3 = await cache.readDataInfo(key1)
		let actual4 = await cache.readDataInfo(key2)

		let actual5 = await cache.readData(key1)
		let actual6 = await cache.readJSON(key2)

		console.dir({
			actual3,
			actual4,
		})

		expect(actual3).toHaveProperty('key', key1);
		expect(actual4).toHaveProperty('key', key2);

		console.dir({
			actual5,
			actual6,
		})

		console.dir(actual5.data.toString())
		console.dir(actual6.data.toString())

		expect(actual5).toHaveProperty('data', Buffer.from(expected1));

		expect(actual6).toHaveProperty('data', Buffer.from(JSON.stringify(expected2)));

		expect(actual6).toHaveProperty('json', expected2);

		//expect(actual).toStrictEqual(expected);
		//expect(actual).toBeInstanceOf(Date);
		//expect(actual).toMatchSnapshot();

	});
}

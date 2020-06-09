import Cacache from '../index';
import path from 'path';

(async () => {

	// create Cacache object
	let cache1 = new Cacache('lazy-cacache');
	// => cachePath: 'xxxx\\node_modules\\.cache\\lazy-cacache'
	let cache2 = await Cacache.createAsync({
		name: 'lazy-cacache',
		useGlobalCache: true,
	});
	// => cachePath: 'T:\\cache\\npm-cache\\.cache\\lazy-cacache'
	let cache3 = Cacache.create({
		cachePath: path.join(__dirname, '.mycache'),
		// if not set, u will need create by self
		autoCreateDir: true,
	});
	// => cachePath: 'xxxx\\test\\.mycache'
	let cache4 = new Cacache({
		name: 'lazy-cacache',
		getCachePathOptions: {
			// hash the cache name
			hash: true,
		}
	});
	// => cachePath: 'xxxx\\node_modules\\.cache\\54ccbb81'

	console.dir(cache1);
	console.dir(cache2);
	console.dir(cache3);
	console.dir(cache4);

	let key1 = 'data1';
	let key2 = 'data2';

	// delete all exists cache
	await cache1.removeAll();

	// read cache info
	console.log(await cache1.readDataInfo(key1));
	console.log(await cache1.readDataInfo(key2));

	// save a cache data
	console.log(await cache1.writeData(key1, 'data111'));
	console.log(await cache1.writeJSON(key2, {
		data: 222,
	}));

	// read cache info again, see what return
	console.log(await cache1.readDataInfo(key1));
	console.log(await cache1.readDataInfo(key2));

	// read cache data
	console.log(await cache1.readData(key1));
	console.log(await cache1.readJSON(key2));

})();



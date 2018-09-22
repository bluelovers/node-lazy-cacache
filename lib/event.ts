const EventEmitter = require('events');
import bluebird = require('bluebird');

export class EventEmitterAsync extends EventEmitter
{
	emit(event: string | symbol, ...args: any[]): bluebird<boolean>
	{
		let self = this;

		return bluebird
			.mapSeries(self.rawListeners(event), async (fn) =>
			{
				// @ts-ignore
				return fn.call(self, ...args)
			})
			.then(function (ls)
			{
				return !!ls.length;
			})
			;
	}

	emitWithEventName(event: string | symbol, ...args: any[]): bluebird<boolean>
	{
		let self = this;

		return bluebird
			.mapSeries(self.rawListeners(event), async (fn) =>
			{
				// @ts-ignore
				return fn.call(self, event, ...args)
			})
			.then(function (ls)
			{
				return !!ls.length;
			})
			;
	}
}

export default EventEmitterAsync

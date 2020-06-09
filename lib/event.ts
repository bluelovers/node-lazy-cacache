import { EventEmitter } from 'events';
import Bluebird from 'bluebird';

export class EventEmitterAsync extends EventEmitter
{
	// @ts-ignore
	emit(event: string | symbol, ...args: any[]): Bluebird<boolean>
	{
		let self = this;

		return Bluebird
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

	emitWithEventName(event: string | symbol, ...args: any[]): Bluebird<boolean>
	{
		let self = this;

		return Bluebird
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

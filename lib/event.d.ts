declare const EventEmitter: any;
import bluebird = require('bluebird');
export declare class EventEmitterAsync extends EventEmitter {
    emit(event: string | symbol, ...args: any[]): bluebird<boolean>;
    emitWithEventName(event: string | symbol, ...args: any[]): bluebird<boolean>;
}
export default EventEmitterAsync;

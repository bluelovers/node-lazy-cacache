/// <reference types="node" />
import { EventEmitter } from 'events';
import Bluebird from 'bluebird';
export declare class EventEmitterAsync extends EventEmitter {
    emit(event: string | symbol, ...args: any[]): Bluebird<boolean>;
    emitWithEventName(event: string | symbol, ...args: any[]): Bluebird<boolean>;
}
export default EventEmitterAsync;

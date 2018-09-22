"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const EventEmitter = require('events');
const bluebird = require("bluebird");
class EventEmitterAsync extends EventEmitter {
    emit(event, ...args) {
        let self = this;
        return bluebird
            .mapSeries(self.rawListeners(event), async (fn) => {
            // @ts-ignore
            return fn.call(self, ...args);
        })
            .then(function (ls) {
            return !!ls.length;
        });
    }
    emitWithEventName(event, ...args) {
        let self = this;
        return bluebird
            .mapSeries(self.rawListeners(event), async (fn) => {
            // @ts-ignore
            return fn.call(self, event, ...args);
        })
            .then(function (ls) {
            return !!ls.length;
        });
    }
}
exports.EventEmitterAsync = EventEmitterAsync;
exports.default = EventEmitterAsync;

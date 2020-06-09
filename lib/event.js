"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.EventEmitterAsync = void 0;
const events_1 = require("events");
const bluebird_1 = __importDefault(require("bluebird"));
class EventEmitterAsync extends events_1.EventEmitter {
    // @ts-ignore
    emit(event, ...args) {
        let self = this;
        return bluebird_1.default
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
        return bluebird_1.default
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
//# sourceMappingURL=event.js.map
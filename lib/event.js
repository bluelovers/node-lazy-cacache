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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZXZlbnQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJldmVudC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBLE1BQU0sWUFBWSxHQUFHLE9BQU8sQ0FBQyxRQUFRLENBQUMsQ0FBQztBQUN2QyxxQ0FBc0M7QUFFdEMsTUFBYSxpQkFBa0IsU0FBUSxZQUFZO0lBRWxELElBQUksQ0FBQyxLQUFzQixFQUFFLEdBQUcsSUFBVztRQUUxQyxJQUFJLElBQUksR0FBRyxJQUFJLENBQUM7UUFFaEIsT0FBTyxRQUFRO2FBQ2IsU0FBUyxDQUFDLElBQUksQ0FBQyxZQUFZLENBQUMsS0FBSyxDQUFDLEVBQUUsS0FBSyxFQUFFLEVBQUUsRUFBRSxFQUFFO1lBRWpELGFBQWE7WUFDYixPQUFPLEVBQUUsQ0FBQyxJQUFJLENBQUMsSUFBSSxFQUFFLEdBQUcsSUFBSSxDQUFDLENBQUE7UUFDOUIsQ0FBQyxDQUFDO2FBQ0QsSUFBSSxDQUFDLFVBQVUsRUFBRTtZQUVqQixPQUFPLENBQUMsQ0FBQyxFQUFFLENBQUMsTUFBTSxDQUFDO1FBQ3BCLENBQUMsQ0FBQyxDQUNEO0lBQ0gsQ0FBQztJQUVELGlCQUFpQixDQUFDLEtBQXNCLEVBQUUsR0FBRyxJQUFXO1FBRXZELElBQUksSUFBSSxHQUFHLElBQUksQ0FBQztRQUVoQixPQUFPLFFBQVE7YUFDYixTQUFTLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxLQUFLLENBQUMsRUFBRSxLQUFLLEVBQUUsRUFBRSxFQUFFLEVBQUU7WUFFakQsYUFBYTtZQUNiLE9BQU8sRUFBRSxDQUFDLElBQUksQ0FBQyxJQUFJLEVBQUUsS0FBSyxFQUFFLEdBQUcsSUFBSSxDQUFDLENBQUE7UUFDckMsQ0FBQyxDQUFDO2FBQ0QsSUFBSSxDQUFDLFVBQVUsRUFBRTtZQUVqQixPQUFPLENBQUMsQ0FBQyxFQUFFLENBQUMsTUFBTSxDQUFDO1FBQ3BCLENBQUMsQ0FBQyxDQUNEO0lBQ0gsQ0FBQztDQUNEO0FBbkNELDhDQW1DQztBQUVELGtCQUFlLGlCQUFpQixDQUFBIiwic291cmNlc0NvbnRlbnQiOlsiY29uc3QgRXZlbnRFbWl0dGVyID0gcmVxdWlyZSgnZXZlbnRzJyk7XG5pbXBvcnQgYmx1ZWJpcmQgPSByZXF1aXJlKCdibHVlYmlyZCcpO1xuXG5leHBvcnQgY2xhc3MgRXZlbnRFbWl0dGVyQXN5bmMgZXh0ZW5kcyBFdmVudEVtaXR0ZXJcbntcblx0ZW1pdChldmVudDogc3RyaW5nIHwgc3ltYm9sLCAuLi5hcmdzOiBhbnlbXSk6IGJsdWViaXJkPGJvb2xlYW4+XG5cdHtcblx0XHRsZXQgc2VsZiA9IHRoaXM7XG5cblx0XHRyZXR1cm4gYmx1ZWJpcmRcblx0XHRcdC5tYXBTZXJpZXMoc2VsZi5yYXdMaXN0ZW5lcnMoZXZlbnQpLCBhc3luYyAoZm4pID0+XG5cdFx0XHR7XG5cdFx0XHRcdC8vIEB0cy1pZ25vcmVcblx0XHRcdFx0cmV0dXJuIGZuLmNhbGwoc2VsZiwgLi4uYXJncylcblx0XHRcdH0pXG5cdFx0XHQudGhlbihmdW5jdGlvbiAobHMpXG5cdFx0XHR7XG5cdFx0XHRcdHJldHVybiAhIWxzLmxlbmd0aDtcblx0XHRcdH0pXG5cdFx0XHQ7XG5cdH1cblxuXHRlbWl0V2l0aEV2ZW50TmFtZShldmVudDogc3RyaW5nIHwgc3ltYm9sLCAuLi5hcmdzOiBhbnlbXSk6IGJsdWViaXJkPGJvb2xlYW4+XG5cdHtcblx0XHRsZXQgc2VsZiA9IHRoaXM7XG5cblx0XHRyZXR1cm4gYmx1ZWJpcmRcblx0XHRcdC5tYXBTZXJpZXMoc2VsZi5yYXdMaXN0ZW5lcnMoZXZlbnQpLCBhc3luYyAoZm4pID0+XG5cdFx0XHR7XG5cdFx0XHRcdC8vIEB0cy1pZ25vcmVcblx0XHRcdFx0cmV0dXJuIGZuLmNhbGwoc2VsZiwgZXZlbnQsIC4uLmFyZ3MpXG5cdFx0XHR9KVxuXHRcdFx0LnRoZW4oZnVuY3Rpb24gKGxzKVxuXHRcdFx0e1xuXHRcdFx0XHRyZXR1cm4gISFscy5sZW5ndGg7XG5cdFx0XHR9KVxuXHRcdFx0O1xuXHR9XG59XG5cbmV4cG9ydCBkZWZhdWx0IEV2ZW50RW1pdHRlckFzeW5jXG4iXX0=
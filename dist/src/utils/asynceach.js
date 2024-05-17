"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.asynceach = void 0;
function asynceach(events, onErrorHalt, done) {
    if (arguments.length === 2) {
        done = onErrorHalt;
        onErrorHalt = undefined;
    }
    // Halt on error by default.
    onErrorHalt = typeof onErrorHalt === 'undefined' ? false : onErrorHalt;
    let results;
    const errors = [];
    let queued;
    let keys;
    let isSync = true;
    function finished(err) {
        function end() {
            if (done)
                done(onErrorHalt ? err.shift() : errors, results);
            done = null;
        }
        if (isSync)
            process.nextTick(end);
        else
            end();
    }
    function each(i, err, result) {
        results[i] = (typeof result === 'undefined' ? null : result);
        if (err)
            errors.push(err);
        if (--queued === 0 || (err && onErrorHalt))
            finished(errors);
    }
    if (Array.isArray(events)) {
        results = [];
        queued = events.length;
    }
    else {
        keys = Object.keys(events);
        results = {};
        queued = keys.length;
    }
    // All done.
    if (!queued) {
        finished(null);
    }
    // Iterating Object.
    else if (keys) {
        keys.forEach((k) => {
            events[k]((err, result) => {
                each(k, err, result);
            });
        });
    }
    // Iterating Array.
    else {
        events.forEach((task, i) => {
            task((err, result) => {
                each(i, err, result);
            });
        });
    }
    isSync = false;
}
exports.asynceach = asynceach;
//# sourceMappingURL=asynceach.js.map
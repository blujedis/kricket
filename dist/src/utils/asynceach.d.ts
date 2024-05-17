export type RunnerResult<T> = T[] | {
    [key: string]: T;
};
export type RunnerCallback<T> = (err: Error | Error[], results: RunnerResult<T>) => void;
export type RunnerEvents = Function[] | {
    [key: string]: Function;
};
/**
 * Runs events in parallel return results.
 *
 * @example
 * runner({
 *    one: function (cb) {
 *       setTimeout(() => { cb(null, 1); })
 *    },
 *    two: function (cb) {
 *       setTimeout(() => { cb(new Error(`Error on item 2`)); })
 *    },
 *    three: function (cb) {
 *       setTimeout(() => { cb(null, 3); })
 *    }
 * });
 *
 * @param events an array of functions to run or any indexed object of functions.
 * @param done callback on event runner finished.
 */
export declare function asynceach<T>(events: RunnerEvents, done: RunnerCallback<T>): void;
/**
 * Runs events in parallel return results.
 *
 * @example
 * runner([
 *    function (cb) {
 *       setTimeout(() => { cb(null, 1); })
 *    },
 *    function (cb) {
 *       setTimeout(() => { cb(new Error(`Error on item 2`)); })
 *    }
 *    function (cb) {
 *       setTimeout(() => { cb(null, 3); })
 *    }
 * ]);
 *
 * @param events an array of functions to run or any indexed object of functions.
 * @param onErrorHalt when true runner will exit when error is detected (default: false)
 * @param done callback on event runner finished.
 */
export declare function asynceach<T>(events: RunnerEvents, onErrorHalt: boolean | RunnerCallback<T>, done: RunnerCallback<T>): void;

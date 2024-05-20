"use strict";
/**
 * get-current-line package wouldn't import correct, so I'm shamelessly
 * copying temporarily. Please see source and author via below link!
 *
 * @see https://github.com/bevry/get-current-line/blob/master/source/index.ts
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.getLocationFromError = exports.getFileFromError = exports.getLocationWithOffset = exports.getLocationsFromFrames = exports.getFramesFromError = void 0;
/**
 * For an error instance, return its stack frames as an array.
 */
function getFramesFromError(error) {
    // Create an error
    let stack, frames;
    // And attempt to retrieve it's stack
    // https://github.com/winstonjs/winston/issues/401#issuecomment-61913086
    try {
        stack = error.stack;
    }
    catch (error1) {
        try {
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            const previous = err.__previous__ || err.__previous;
            stack = previous && previous.stack;
        }
        catch (error2) {
            stack = null;
        }
    }
    // Handle different stack formats
    if (stack) {
        if (Array.isArray(stack)) {
            frames = Array(stack);
        }
        else {
            frames = stack.toString().split('\n');
        }
    }
    else {
        frames = [];
    }
    // Parse our frames
    return frames;
}
exports.getFramesFromError = getFramesFromError;
// Compatibility with Node.js versions <10
let frameRegexNamedGroups, frameRegexNumberedGroups;
try {
    frameRegexNamedGroups =
        /\s+at\s(?:(?<method>.+?)\s\()?(?<file>.+?):(?<line>\d+):(?<char>\d+)\)?\s*$/;
}
catch (error) {
    frameRegexNumberedGroups = /\s+at\s(?:(.+?)\s\()?(.+?):(\d+):(\d+)\)?\s*$/;
}
/**
 * Get the locations from a list of error stack frames.
 */
function getLocationsFromFrames(frames) {
    // Prepare
    const locations = [];
    // Cycle through the frames
    for (let frame of frames) {
        // ensure each frame is a string
        frame = (frame || '').toString();
        // skip empty frames
        if (frame.length === 0)
            continue;
        // Error
        // at file:///Users/balupton/Projects/active/get-current-line/asd.js:1:13
        // at ModuleJob.run (internal/modules/esm/module_job.js:140:23)
        // at async Loader.import (internal/modules/esm/loader.js:165:24)
        // at async Object.loadESM (internal/process/esm_loader.js:68:5)
        if (frameRegexNamedGroups) {
            const match = frame.match(frameRegexNamedGroups);
            if (match && match.groups) {
                locations.push({
                    method: match.groups.method || '',
                    file: match.groups.file || '',
                    line: Number(match.groups.line),
                    char: Number(match.groups.char),
                });
            }
        }
        else {
            const [match, method, file, line, char] = frame.match(frameRegexNumberedGroups) || [];
            if (match) {
                locations.push({
                    method: method || '',
                    file: file || '',
                    line: Number(line),
                    char: Number(char),
                });
            }
        }
    }
    return locations;
}
exports.getLocationsFromFrames = getLocationsFromFrames;
/**
 * If a location is not found, this is the result that is used.
 */
const failureLocation = {
    line: -1,
    char: -1,
    method: '',
    file: '',
};
/**
 * From a list of locations, get the location that is determined by the offset.
 * If none are found, return the failure location
 */
function getLocationWithOffset(locations, offset) {
    // Continue
    let found = !offset.file && !offset.method;
    // use while loop so we can skip ahead
    let i = 0;
    while (i < locations.length) {
        const location = locations[i];
        // the current location matches the offset
        if ((offset.file &&
            (typeof offset.file === 'string'
                ? location.file.includes(offset.file)
                : offset.file.test(location.file))) ||
            (offset.method &&
                (typeof offset.method === 'string'
                    ? location.method.includes(offset.method)
                    : offset.method.test(location.method)))) {
            // we are found, and we should exit immediatelyg, so return with the frame offset applied
            if (offset.immediate) {
                // apply frame offset
                i += offset.frames || 0;
                // and return the result
                return locations[i];
            }
            // otherwise, continue until the found condition has exited
            else {
                found = true;
                ++i;
                continue;
            }
        }
        // has been found, and the found condition has exited, so return with the frame offset applied
        else if (found) {
            // apply frame offset
            i += offset.frames || 0;
            // and return the result
            return locations[i];
        }
        // nothing has been found yet, so continue until we find the offset
        else {
            ++i;
            continue;
        }
    }
    // return failure
    return failureLocation;
}
exports.getLocationWithOffset = getLocationWithOffset;
/**
 * Get each error stack frame's location information.
 */
function getLocationsFromError(error) {
    const frames = getFramesFromError(error);
    return getLocationsFromFrames(frames);
}
/**
 * Get the file path that appears in the stack of the passed error.
 * If no offset is provided, then the first location that has a file path will be used.
 */
function getFileFromError(error, offset = {
    file: /./,
    immediate: true,
}) {
    const locations = getLocationsFromError(error);
    return getLocationWithOffset(locations, offset).file;
}
exports.getFileFromError = getFileFromError;
/**
 * Get first determined location information that appears in the stack of the error.
 * If no offset is provided, then the offset used will determine the first location information.
 */
function getLocationFromError(error, offset = {
    immediate: true,
}) {
    const locations = getLocationsFromError(error);
    return getLocationWithOffset(locations, offset);
}
exports.getLocationFromError = getLocationFromError;
/**
 * Get the location information about the line that called this method.
 * If no offset is provided, then continue until the caller of the `getCurrentLine` is found.
 * @example Input
 * ``` javascript
 * console.log(getCurrentLine())
 * ```
 * @example Result
 * ``` json
 * {
 * 	"line": "1",
 * 	"char": "12",
 * 	"method": "Object.<anonymous>",
 * 	"file": "/Users/balupton/some-project/calling-file.js"
 * }
 * ```
 */
function getCurrentLine(offset = {
    method: 'getCurrentLine',
    frames: 0,
    immediate: false,
}) {
    return getLocationFromError(new Error(), offset);
}
exports.default = getCurrentLine;
//# sourceMappingURL=trace.js.map
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TOKEN_MAP = exports.EOL = exports.SPLAT = exports.MESSAGE = exports.TIMESTAMP = exports.FILENAME = exports.FILEPATH = exports.METHOD = exports.CHAR = exports.LINE = exports.LEVELINT = exports.LEVEL = exports.TRANSPORT = exports.LOGGER = exports.UUID = void 0;
//  CONSTANTS
// ----------------------------------------------------------
exports.UUID = Symbol.for('UUID');
exports.LOGGER = Symbol.for('LOGGER');
exports.TRANSPORT = Symbol.for('TRANSPORT');
exports.LEVEL = Symbol.for('LEVEL');
exports.LEVELINT = Symbol.for('LEVELINT');
exports.LINE = Symbol.for('LINE');
exports.CHAR = Symbol.for('CHAR');
exports.METHOD = Symbol.for('METHOD');
exports.FILEPATH = Symbol.for('METHOD');
exports.FILENAME = Symbol.for('FILENAME');
exports.TIMESTAMP = Symbol.for('TIMESTAMP');
exports.MESSAGE = Symbol.for('MESSAGE');
exports.SPLAT = Symbol.for('SPLAT');
exports.EOL = '\n';
exports.TOKEN_MAP = {
    uuid: exports.UUID,
    logger: exports.LOGGER,
    transport: exports.TRANSPORT,
    level: exports.LEVEL,
    levelint: exports.LEVELINT,
    char: exports.CHAR,
    line: exports.LINE,
    filepath: exports.FILEPATH,
    filename: exports.FILENAME,
    timestamp: exports.TIMESTAMP,
    message: exports.MESSAGE
};
//# sourceMappingURL=types.js.map
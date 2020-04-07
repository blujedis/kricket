 <p align="left">
  <a href="http://github.com/blujedis/kricket"><img src="https://raw.githubusercontent.com/blujedis/kricket/master/fixtures/logo.jpg" width="200" /></a>
</p>

A un-opinionated Logger using Transport streams. Kricket makes only one opinion that being to manage log levels for you that you specify. All other filters and transforms are up to you.

## Install

```sh
npm install kricket -s

OR

yarn add kricket -s
```

## Usage

The default logger contains only one Transport that being a console logger. The default levels are <code>fatal, error, warn, info, debug</code>;

```ts
import { defaultLogger } from 'kricket';
defaultLogger.writeLn('write some log message.');
defaultLogger.info('this is an info message.');
```

## Filters

Kricket does not filter or prevent any log level from logging. This is entirely up to you. When Kricket is initialized it considers the order of the log levels you have provided.

Consider the "defaultLogger" that Kricket ships with.

```ts
export const defaultLogger = createLogger('default', {

  // This is the current active level
  level: 'info',

  // Your initialized log levels where fatal = 0 and debug = 4
  levels: ['fatal', 'error', 'warn', 'info', 'debug'],

  // The default console Transport.
  transports: [
    new ConsoleTransport({ asJSON: false })
  ]
});
```

### Limiting Output by Level

Considering the above let's say we want to limit any message above the "warn" level.

First we need to set or initalize our Logger with that level. So for the defaultLogger we'd do:

```ts
import { defaultLogger, LEVEL } from 'kricket';
defaultLogger.setLevel('warn');

// Note some properties in the payload object are symbols LEVEL is one.
// Filters will "filter" a message and prevent output when
// a filter return true. So here we listen if it's NOT true.
// when this occurs we reject the message.
defaultLogger.filter((payload) => {
  return !defaultLogger.isLevelActive(payload[LEVEL]);
});
```

### Transforming Messages

Although the log payload message stores any formatting args it leaves that up to you as to how you want to handle them. For example if we wanted to do the typical node formating from the util lib this would be how.


```ts
import { defaultLogger, SPLAT } from 'kricket';
import { format } from 'util';

defaultLogger.transform((payload) => {
  payload.message = format(payload.message, ...payload[SPLAT]);
  return payload;
});
```

Now you can use formatting in your messages.

```ts
defaultLogger.info('My name is %s.', 'Milton');
```

## Output Format

By default Kricket outputs JSON to each transport. This can be disabled as it is in the default **ConsoleTransport**. When doing so Kricket will grab your formatted message resulting from your **transform** stack if any. The message is stored at: <code>payload.message</code>

```ts
import { ConsoleTransport } from 'kricket';
const consoleTransport = new ConsoleTransport({ asJSON: false });
```

## Transports

Kricket contains three default Transports:

- **ConsoleTransport** to log to your terminal.
- **FileTransport** to log to file with file rotation capabilities.
- **StreamTransport** simple wrapper you can pass any Writable Stream to.

### Custom Transports 

To create a custom Transport simply extend from the base abstract **Transport** class.

```ts
import { Transport } from './transport';
import { ITransportOptions } from '../types';

interface IMyTransport<Level extends string> extends ITransportOptions<Level> {
 // your options here.
}

export class MyTransport<Level extends string> extends Transport<IMyTransport<Level>> {
  static Type = typeof MyTransport; // This is important for creating new instances internally.
  constructor(options?: IMyTransport<Level>, alias?: string) {
    super(alias || 'myTransport', options);
  }
  log(payload: string) {
    // This method MUST be overloaded or you will get an error.
  }
}
```

### Consuming the Above Transport

To consume our new Transport we simply pass it to our Logger's transports.

```ts
export const myLogger = createLogger('myLogger', {
  level: 'info',
  levels: ['fatal', 'error', 'warn', 'info', 'debug'],
  transports: [
    new MyTransport()
  ]
});
```

You can also add a Transport after Logger creation as follows:

```ts
myLogger.addTransport(new MyTransport());
```

## Docs

See [https://blujedis.github.io/kricket/](https://blujedis.github.io/kricket/)

## Change

See [CHANGE.md](CHANGE.md)

## License

See [LICENSE.md](LICENSE)


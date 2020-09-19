 <p align="left">
  <a href="http://github.com/blujedis/kricket"><img src="https://raw.githubusercontent.com/blujedis/kricket/master/fixtures/logo.jpg" width="200" /></a>
</p>

A un-opinionated Logger using Transport streams. Kricket makes only one opinion that being to manage log levels for you that you specify. All other filters and transforms are up to you.

If you are looking for a Logger that auto-magically wires up things for you, this is **NOT** it!

Kricket simply provides the tools for you to make as simple or as complex a Logger as you wish. Initially it may seem a bit much but once you get the hang of it you'll find it quite useful and extremely flexible. 

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
defaultLogger
  .group()
  .write('some value')
  .write('another value')
  .end();
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

#### Logger Labels

As shown above the default Logger is generated with the label **default**. This allows you to lookup other Loggers you might have generated from any other Logger which can be helpful in some instances.

However a label is not required you can also create a logger without a label although a random generated string will be created for you behind the scenes.

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

### Assigning Filters or Transports

To this point we've shown how global Filters and Transforms. You can also assign a Filter or Transform to a specific Transport.

```ts
defaultLogger.transform('console', payload => {
  // do something.
  return payload.
})
```

**The above works the same for Filters.**

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

interface IMyTransport<Level extends string, Label extends string> extends ITransportOptions<Level> {
 // your options here.
 label: Label;
}

export class MyTransport<Level extends string, Label extends string> extends Transport<IMyTransport<Level>> {

  // This is important if you wish to clone and reuse Transports.
  static Type = typeof MyTransport; 
  
  constructor(options?: IMyTransport<Level, Label>) {
    super('myTransport', options);
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

## Real World Example

For a real work example take a look at the basic example found in the **examples** directory.

See [examples](examples/basic.ts)


## Docs

There is much more that Kricket does as time permits more examples will be added. You can also checkout the docs below as well as look at the tests/ folder.

See [https://blujedis.github.io/kricket/](https://blujedis.github.io/kricket/)

## Change

See [CHANGE.md](CHANGE.md)

## License

See [LICENSE.md](LICENSE)


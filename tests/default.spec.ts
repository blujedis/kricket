import 'mocha';
import { assert } from 'chai';
import { createLogger, DummyTransport, LEVEL, ConsoleTransport, defaultLogger } from '../src';

const dummyTransport = new DummyTransport();

const testLogger = createLogger({
  label: 'testLogger',
  levels: ['fatal', 'error', 'warn', 'info', 'debug'],
  transports: [dummyTransport],
});

describe('Kricket', () => {

  it('Should write to buffer then log', (done) => {
    testLogger
      .write('buffer message')
      .writeEnd((data) => {
        data = JSON.parse(data[0]);
        assert.equal(data.message, 'buffer message');
        done();
      });
  });

  it('Should write line "simple log message"', (done) => {
    function listener(v) {
      assert.equal(v[LEVEL] + ' ' + v.message, 'writeLn simple log message');
      // While we're at it test off listener.
      testLogger.off('log', listener);
      done();
    }
    testLogger.on('log', listener);
    testLogger.writeLn('simple log message').writeEnd();
  });

  it('Should set the log level to warn.', () => {
    testLogger.setLevel('warn');
    assert.equal(testLogger.isLevelActive('warn'), true);
    assert.equal(testLogger.isLevelActive('info'), false);
  });

  it('Child logger should contain "api" flag in result.', (done) => {
    const child = testLogger.child('api');
    child
      .write('child log message')
      .writeEnd((data) => {
        data = JSON.parse(data[0]);
        assert.equal(data.message, 'child log message');
        assert.equal(data.api, true);
        done();
      });
  });

  it('Should transform message adding level label to messages.', (done) => {
    testLogger.setLevel('info');
    testLogger.transform((payload) => {
      const level = payload[LEVEL] as string;
      if (level !== 'write' && level !== 'writeLn')
        payload.message = payload[LEVEL] + ': ' + payload.message;
      return payload;
    });
    testLogger.once('log', (v) => {
      assert.equal(v[LEVEL] + ': ' + v.message, 'info: ' + v.message);
      done();
    });
    testLogger.info('info message');
  });

  it('Should add Console Transport', (done) => {
    testLogger.addTransport(new ConsoleTransport());
    const Transport = testLogger.options.transports?.find(transport => transport.label === 'console');
    assert.instanceOf(Transport, ConsoleTransport);
    done();
  });


  it('Should remove Console Transport', (done) => {
    testLogger.removeTransport('console');
    assert.equal(testLogger.transports?.length, 1);
    done();
  });

});

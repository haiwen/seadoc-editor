import Debug from 'debug';

const stateDebug = Debug('sdoc:state-change');
stateDebug.enabled = true;
stateDebug.log = console.log;

const clientDebug = Debug('sdoc:socket-client');
clientDebug.enabled = true;
clientDebug.log = console.log;

const serverDebug = Debug('sdoc:socket-server');
serverDebug.enabled = true;
serverDebug.log = console.log;

const conflictDebug = Debug('sdoc:sdoc-conflict');
conflictDebug.enabled = true;
conflictDebug.log = console.log;

export {
  stateDebug,
  clientDebug,
  serverDebug,
  conflictDebug,
};

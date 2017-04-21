const test = require('./tap').test
const testStart = require('./test-start')
const onServerReady = require('./on-server-ready')

test((expect) => testStart('sample-project', onServerReady(expect)))

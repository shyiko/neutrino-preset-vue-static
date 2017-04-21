const test = require('./tap').test
const testBuild = require('./test-build')
const onServerReady = require('./on-server-ready')

test((expect) =>
  testBuild(expect, 'sample-project-with-vue-router',
    onServerReady(expect, true))
)

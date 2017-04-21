const assert = require('assert')
const pify = require('pify')
const {readFile} = pify(require('fs'))
const path = require('path')
const mkdirp = pify(require('mkdirp'))
const cpr = pify(require('cpr'))
const lsr = pify(require('recursive-readdir'))
const httpServer = require('http-server')
const neutrino = require('neutrino')

module.exports = async function (expect, projectName,
    onServerReady/* : (port: number) => Promise<void> */) {
  const sourceDir = path.join(__dirname, 'fixture', projectName)
  const dir = path.join(process.cwd(), '.cache', 'vue-static', 'test',
    projectName + '-build')

  await mkdirp(dir)
  await cpr(sourceDir, dir, {filter: /build/, deleteFirst: true})

  await new Promise((resolve, reject) => {
    neutrino.build([
      path.join(__dirname, '..', 'neutrino-preset.js')
    ], Object.assign({}, (require(path.join(dir, 'package.json')).neutrino || {}).options, {
      root: dir
    }))
      .fork(reject, resolve)
  })

  const buildDir = path.join(dir, 'build')
  const buildDirFileList = (await lsr(buildDir))
    .map(_ => path.relative(buildDir, _)).sort()
  const expectedBuildDir = path.join(sourceDir, 'build')
  const expectedBuildDirFileList = (await lsr(expectedBuildDir))
    .map(_ => path.relative(expectedBuildDir, _)).sort()
  assert.deepEqual(buildDirFileList, expectedBuildDirFileList,
    `content of ${
      path.relative('', buildDir)
    } and ${
      path.relative('', expectedBuildDir)
    } do not match`)
  expect.comment(`comparing files in ${
      path.relative('', buildDir)
    } to ${
      path.relative('', expectedBuildDir)
    }`)
  for (let fileName of buildDirFileList) {
    const [actual, expected] = await Promise.all([
      readFile(path.join(buildDir, fileName)),
      readFile(path.join(expectedBuildDir, fileName))
    ])
    expect.ok(!actual.compare(expected), `match ${fileName}`)
  }

  const server = httpServer.createServer({root: buildDir})
  // prevent port collisions when running tests in parallel processes (-J)
  const port = parseInt(process.env.TAP_PORT, 10) ||
    10000 + (process.pid % 10000)
  await pify((cb) => server.listen(port, 'localhost', cb))()
  try {
    await onServerReady(port, expect)
  } finally {
    server.close()
  }

  return buildDir
}

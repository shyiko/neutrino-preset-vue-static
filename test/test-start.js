const pify = require('pify')
const path = require('path')
const mkdirp = pify(require('mkdirp'))
const cpr = pify(require('cpr'))
const {Neutrino} = require('neutrino')
const webpack = require('webpack')
const WebpackDevServer = require('webpack-dev-server/lib/Server')

module.exports = async function (projectName,
    onServerReady/* : (port: number) => Promise<void> */) {
  const sourceDir = path.join(__dirname, 'fixture', projectName)
  const dir = path.join(process.cwd(), '.cache', 'vue-static', 'test',
    projectName + '-start')

  await mkdirp(dir)
  await cpr(sourceDir, dir, {filter: /build/, deleteFirst: true})

  // prevent port collisions when running tests in parallel processes (-J)
  const port = parseInt(process.env.TAP_PORT, 10) ||
    10000 + (process.pid % 10000)

  // latest neutrino (5.4.0 at the time of writing) has no way to stop
  // the dev server once it's started (using neutrino.start)
  // as a  workaround, piping config to the WebpackDevServer

  const neutrino = Neutrino(Object.assign({},
    (require(path.join(dir, 'package.json')).neutrino || {}).options,
    {config: {devServer: {port}}, root: dir}
  ))
  neutrino.use(require('../neutrino-preset.js'))
  const webpackConfig = neutrino.config.toConfig()

  const server = new WebpackDevServer(webpack(webpackConfig),
    {quiet: true, historyApiFallback: true})
  await pify((cb) => server.listen(port, 'localhost', cb))()
  try {
    // console.log(port)
    // await pify((cb) => setTimeout(cb, 999999))()
    await onServerReady(port)
  } finally {
    server.close()
  }
}

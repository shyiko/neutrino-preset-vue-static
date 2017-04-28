const path = require('path')
const fs = require('fs')
const globSync = require('glob').sync
const mkdirpSync = require('mkdirp').sync
const webpack = require('webpack')
const WebpackConfig = require('webpack-chain')
const SplitByNamePlugin = require('split-by-name-webpack2-plugin')
const CopyWebpackPlugin = require('copy-webpack-plugin')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const ExtractTextPlugin = require('extract-text-webpack-plugin')
const ChunkManifestPlugin = require('chunk-manifest-webpack-plugin')
const Md5HashPlugin = require('webpack-md5-hash')
const CleanWebpackPlugin = require('clean-webpack-plugin')
const htmlMinifier = require('html-minifier')
const createBundleRenderer = require('vue-server-renderer').createBundleRenderer
const dom = require('domino')
const trimSlash = (str) => str.match(/^\/*(.*?)\/*$/)[1]
const requirable = (module) => {
  try { require.resolve(module); return true } catch (e) { return false }
}

const {
  DefinePlugin,
  optimize: {UglifyJsPlugin},
  HotModuleReplacementPlugin,
  NamedModulesPlugin
} = webpack

// https://github.com/kangax/html-minifier#options-quick-reference
const htmlMinifierConfigDef = {
  collapseBooleanAttributes: true,
  collapseWhitespace: true,
  decodeEntities: true,
  minifyCSS: true,
  minifyJS: true,
  processConditionalComments: true,
  removeComments: true,
  removeEmptyAttributes: true,
  removeOptionalTags: true,
  removeRedundantAttributes: true,
  removeScriptTypeAttributes: true,
  removeStyleLinkTypeAttributes: true,
  removeTagWhitespace: true,
  sortAttributes: true,
  sortClassName: true,
  trimCustomFragments: true,
  useShortDoctype: true
}

module.exports = (neutrino) => {
  const {
    config,
    options: {
      root, source, output, 'vue-static': preset = {}, config: userConfig = {}
    }
  } = neutrino

  const {
    sourceGlob = ['**/*.vue'],
    staticSource = 'public',
    // {[entry: string]: Array<{path: string, output: string}>}
    routes = {},
    pageTemplate = path.join(__dirname, 'page-template.html'),
    injectionPlaceholder = '<div id="app"></div>',
    clientEntryTemplate = path.join(__dirname, 'entry-client.js'),
    // entry for vue-server-renderer
    serverEntryTemplate =
      path.join(__dirname, 'entry-server.js'),
    vendorBundle = 'vendor',
    runtimeOnly = true,
    htmlMinifierConfig = htmlMinifierConfigDef,
    emitSourceMapsOnBuild = true,
    minify = true,
    serverConfig = {},
    hmr = {
      // the other option - webpack/hot/dev-server
      // "only-" means "to only hot reload for successful updates"
      entry: 'webpack/hot/only-dev-server'
    }
  } = preset

  function writeEntrySync (templatePath, template, pageName) {
    const entryPath = path.dirname(templatePath)
    mkdirpSync(entryPath)

    const entryRelativePath = path.relative(entryPath, source)
      .replace(/\\/g, '/')

    fs.writeFileSync(templatePath, template
      .replace(/<%= __dirname %>/g, entryRelativePath)
      .replace(/<%= entry %>/g, entryRelativePath + '/' + pageName))

    // https://github.com/webpack/watchpack/issues/25
    const timestamp = Date.now() / 1000 - 10
    fs.utimesSync(templatePath, timestamp, timestamp)
  }

  const cacheDir = path.join(root, '.cache', 'vue-static')
  mkdirpSync(cacheDir)

  const staticDirExists = staticSource &&
    fs.existsSync(path.join(root, staticSource))

  const htmlWebpackPluginDef = {
    template: path.isAbsolute(pageTemplate)
      ? pageTemplate : path.join(root, pageTemplate),
    inject: false
  }

  const pages = sourceGlob
    .reduce((_, glob) => {
      const pattern = typeof glob === 'string' ? glob : glob.pattern
      const options = {cwd: source}
      return _.concat(globSync(pattern, typeof glob === 'string'
        ? options : Object.assign(options, glob.options)))
    }, [])
    .map((filename) => {
      const name = filename.slice(0, -path.extname(filename).length)
      return ({
        name,
        chunkName: name !== 'index' && !name.endsWith('/index')
          ? `${name}/index` : name,
        path: filename
      })
    })

  const entry = fs.readFileSync(
    path.isAbsolute(clientEntryTemplate)
      ? clientEntryTemplate : path.join(root, clientEntryTemplate),
    'utf8'
  )

  const port = (userConfig.devServer || {}).port || 5000

  // each page gets generated entry.js (using entryTemplate)
  // (in simplest case entry just mounts App to #app)
  pages.forEach((page) => {
    const entryPath = path.join(cacheDir, page.chunkName + '.js')
    writeEntrySync(entryPath, entry, page.name)
    // https://webpack.js.org/guides/hmr-react/
    // how about your own webpack/hot/dev-server that groups messages?
    config.entry(page.chunkName)
      .when(!!hmr, (set) => set
        .add(hmr.entry)
        .add('webpack-dev-server/client?http://0.0.0.0:' + port)
      )
      .add(entryPath)
  })

  config.output
    .path(output)
    .filename(process.env.NODE_ENV === 'production'
      ? '[name].[chunkhash:12].js' : '[name].js')
    .chunkFilename(process.env.NODE_ENV === 'production'
      ? '[name].[chunkhash:12].js' : '[name].js')

  config.module
    .rule('load-vue')
    .test(/\.vue$/)
    .use('vue')
    .loader('vue-loader')
    // extracting css into a separate file(s)
    // https://github.com/webpack-contrib/extract-text-webpack-plugin
    .when(process.env.NODE_ENV === 'production',
      (config) => config.options({
        loaders: {
          'css': ExtractTextPlugin.extract({
            fallback: 'vue-style-loader',
            use: 'css-loader?' + [
              emitSourceMapsOnBuild && 'sourceMap',
              minify && 'minimize'
            ].filter(Boolean).join('&')
          })
        }
      }))

  // same order as in vue-loader/lib/loader.js
  const loaderForJS = ['buble-loader', 'babel-loader'].find(requirable)

  if (loaderForJS) {
    config.module
      .rule('load-js')
      .test(/\.js$/)
      .exclude.add(/node_modules(?!\/.cache)/).end()
      .use(loaderForJS)
      .loader(loaderForJS)
  }

  // generate html for each page
  pages.forEach((page) => {
    const chunks = [vendorBundle, page.chunkName]
    const customRoutes = routes[page.name]
    if (process.env.NODE_ENV === 'production' &&
        customRoutes && customRoutes.length) {
      customRoutes.forEach((customRoute) => {
        const route = typeof customRoute === 'string'
          ? {path: customRoute} : customRoute
        route.output || (route.output =
          path.join(trimSlash(route.path), 'index.html'))
        config
          .plugin('html:' + page.name + ':' + route.path)
          .use(HtmlWebpackPlugin, [Object.assign({}, htmlWebpackPluginDef, {
            filename: route.output,
            chunks,
            chunksSortMode: (a, b) => chunks.indexOf(a.names[0]) -
              chunks.indexOf(b.names[0]),
            page,
            route: route.path
          })])
      })
    } else {
      config
        .plugin('html:' + page.name)
        .use(HtmlWebpackPlugin, [Object.assign({}, htmlWebpackPluginDef, {
          filename: page.name === 'index' || page.name.endsWith('/index')
            ? `${page.name}.html` : `${page.name}/index.html`,
          chunks,
          chunksSortMode: (a, b) => chunks.indexOf(a.names[0]) -
            chunks.indexOf(b.names[0]),
          page
        })])
    }
  })

  if (process.env.NODE_ENV === 'production') {
    config
      .plugin('clean')
      .use(CleanWebpackPlugin, [[path.resolve(root, output)], {verbose: false}])

    if (staticDirExists) {
      config
        .plugin('copy-static')
        .use(CopyWebpackPlugin, [
          [{from: `${path.join(root, staticSource)}/`, to: '.'}],
          {ignore: ['**/*.html']}
        ])
      config
        .plugin('copy-static-html')
        .use(CopyWebpackPlugin, [[{
          context: path.join(root, staticSource),
          from: '**/*.html',
          to: '.',
          transform: (content) => minify
            ? htmlMinifier.minify(content.toString(), htmlMinifierConfig)
            : content
        }]])
    }

    config
      .plugin('define')
      .use(DefinePlugin, [{'process.env.NODE_ENV': '"production"'}])

    config
      .plugin('extract-text')
      .use(ExtractTextPlugin, ['[name].[contenthash:12].css'])

    if (minify) {
      config
        .plugin('uglify-js')
        .use(UglifyJsPlugin, [{sourceMap: true, compress: {warnings: false}}])
    }

    config
      .plugin('chunk-manifest')
      .use(ChunkManifestPlugin, [{
        filename: 'manifest.json',
        manifestVariable: 'webpackManifest'
      }])

    // used to get reliable chunkhash
    config.plugin('md5-hash').use(Md5HashPlugin)

    class VueServerRendererPlugin {
      apply (compiler) {
        let executed
        compiler.plugin('after-compile', (compilation, cb) => {
          if (executed) {
            process.nextTick(cb)
            return
          }
          executed = true
          const entry = fs.readFileSync(
            path.isAbsolute(serverEntryTemplate)
              ? serverEntryTemplate
              : path.join(root, serverEntryTemplate),
            'utf8'
          )
          const pkg = require(path.join(root, 'package.json'))
          const config = new WebpackConfig()
          pages.forEach((page) => {
            const entryPath = path.join(cacheDir, page.chunkName +
              '-for-vue-server-renderer.js')
            writeEntrySync(entryPath, entry, page.name)
            config.entry(page.chunkName).add(entryPath)
          })

          config.module
            .rule('load-vue')
            .test(/\.vue$/)
            .use('vue')
            .loader('vue-loader')

          if (loaderForJS) {
            config.module
              .rule('load-js')
              .test(/\.js$/)
              .exclude.add(/node_modules(?!\/.cache)/).end()
              .use(loaderForJS)
              .loader(loaderForJS)
          }

          // https://www.npmjs.com/package/vue-server-renderer#externals-caveats
          config.externals(Object.keys(pkg.dependencies || {})
            .concat(Object.keys(pkg.devDependencies || {})))

          config.target('node')
          config.output
            .libraryTarget('commonjs2')
            .path(cacheDir)
            .filename('[name]-server-bundle.js')
          config.resolve
            .extensions.add('*').add('.js').add('.vue')

          config
            .plugin('define')
            .use(DefinePlugin, [{
              'process.env.NODE_ENV': '"production"',
              'process.env.VUE_ENV': '"server"'
            }])

          config.merge(serverConfig)

          webpack(config.toConfig()).run(cb)
        })
        // do not emit manifest; it's going to be inlined (if needed) in html
        compiler.plugin('emit', (compilation, cb) => {
          delete compilation.assets['manifest.json']
          cb()
        })
        // for every emitted page take an app, pipe it through vue-server-renderer
        // and inject pre-rendered html
        compiler.plugin('compilation', (compilation) => {
          // trim hash (checksum)
          compilation.mainTemplate.render = ((original) => {
            return function (...args) {
              args[0] = args[1].hash.slice(12)
              return original.apply(this, args)
            }
          })(compilation.mainTemplate.render)
          compilation.plugin('html-webpack-plugin-after-html-processing',
            (htmlPluginData, cb) => {
              const {
                html, plugin: {options: {page: {chunkName: page}, route}}
              } = htmlPluginData
              const bundlePath = path.join(cacheDir,
                `${page}-server-bundle.js`)
              const bundleRenderer = createBundleRenderer(bundlePath)
              const context = {url: route || '/'}
              bundleRenderer.renderToString(context, (err, str) => {
                if (err) {
                  return cb(err)
                }
                const onDocumentReady = context.onDocumentReady
                let result = html
                if (onDocumentReady) {
                  const window = dom.createWindow(result)
                  const document = window.document
                  onDocumentReady(document)
                  result = document.outerHTML
                }
                if (minify) {
                  result = htmlMinifier.minify(result, htmlMinifierConfig)
                }
                htmlPluginData.html = result.replace(injectionPlaceholder, str)
                cb(null, htmlPluginData)
              })
            })
        })
      }
    }

    config
      .plugin('vue-server-renderer')
      .use(VueServerRendererPlugin)
  } else
  if (hmr) {
    config
      .plugin('hmr')
      .use(HotModuleReplacementPlugin)
    // print more readable module names in the browser console on HMR updates
    config
      .plugin('named-modules')
      .use(NamedModulesPlugin)
  }

  if (vendorBundle) {
    config
      .plugin('vendor')
      .use(SplitByNamePlugin, [{buckets: [
        {name: vendorBundle, regex: /node_modules(?!\/.cache)/}
      ]}])
  }

  config.resolve
    .alias
    // https://vuejs.org/v2/guide/installation.html#Standalone-vs-Runtime-only-Build
    .set('vue$', runtimeOnly
      ? 'vue/dist/vue.runtime.esm.js' : 'vue/dist/vue.esm.js')
    .end()
    .extensions.add('*').add('.js').add('.vue')

  config.devServer
    .hot(!!hmr)
    .noInfo(true)
    .when(staticDirExists,
      (config) => config.contentBase(path.join(root, staticSource)))

  config.performance
    .hints(process.env.NODE_ENV === 'production' ? 'error' : false)

  config.when(process.env.NODE_ENV === 'production',
    (config) => config.devtool(emitSourceMapsOnBuild
      ? 'hidden-source-map' : false),
    (config) => config.devtool('cheap-module-eval-source-map')
  )
}

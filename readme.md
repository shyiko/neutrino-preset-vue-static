# neutrino-preset-vue-static [![AppVeyor](https://img.shields.io/appveyor/ci/shyiko/neutrino-preset-vue-static.svg)]() [![npm](https://img.shields.io/npm/v/neutrino-preset-vue-static.svg)](https://www.npmjs.com/package/neutrino-preset-vue-static)

A minimalistic starter kit for building static sites using [Vue.js](https://vuejs.org/) (powered by [Neutrino](https://neutrino.js.org/)).  
Node.js 6+.

**Features**:
- zero upfront configuration;
- lightweight (only `vue` is included by default (add [vue-document](https://github.com/shyiko/vue-document), [vue-router](https://router.vuejs.org/en/), [vuex](https://vuex.vuejs.org/en/), etc. when you actually need them))\*;
- [pre-rendering (not SSR)](https://vuejs.org/v2/guide/ssr.html#SSR-vs-Prerendering) (which means you can 
serve your app with whatever you want, be it nginx, [caddy](https://caddyserver.com/) or one of the options linked in [deployment](#deployment));
- [ES2015](https://vue-loader.vuejs.org/en/features/es2015.html)+ (either `babel-loader` or `buble-loader` must be present) (both `*.vue` and `*.js` are transpiled); 
- [Hot Module Replacement](https://vue-loader.vuejs.org/en/features/hot-reload.html) (you can turn it off by adding `"neutrino":{"options":{"vue-static":{"hmr": false}}}` to the `package.json` if you don't need it);
- code splitting, css extraction, minification, cache-busting & source maps out of the box.

> \* A sample project with `vue-document` included is located in [test/fixture/sample-project](test/fixture/sample-project), `vue-document` & `vue-router` - [test/fixture/sample-project-with-vue-router](test/fixture/sample-project-with-vue-router). 

## Getting Started

```
npm init -y
npm install --save-dev neutrino neutrino-preset-vue-static vue

npm install --save-dev babel-core babel-loader babel-preset-es2015
echo '{"presets": [["es2015", {"modules": false}]]}' > .babelrc
# or
npm install --save-dev buble-loader
```

Update `package.json` to include: 

```
{
  "scripts": {
    "start": "neutrino start --use neutrino-preset-vue-static",
    "build": "neutrino build --use neutrino-preset-vue-static"
  }
}
```

> If you don't install `babel-loader` or `buble-loader` and yet you want minification
 to work with ES2015 code you'll need to `npm install --save-dev neutrino-middleware-minify` (which is using [babili](https://github.com/babel/babili) instead of uglifyjs). 
 `neutrino-preset-vue-static` will take it from there.

Create `src/index.vue`:

```vue
<template>
  <div id="app">
    {{ message }}
  </div>
</template>

<script>
  export default {
    data: {
      message: 'Hello Vue!'
    }
  }
</script>

<style>
  #app {
    background: #ffeb3b;
  }
</style>
```

You can put your assets ([favicon](https://realfavicongenerator.net/), custom 404 html page, images, fonts, etc) 
inside the `./public` directory. They will be automatically copied to the `./build` during the build.

That's it.  
To start a dev server - execute `npm start`.

```
✔ Development server running on: http://localhost:5000
✔ Build completed
```

Use `npm run build` to get a production build (by default 
output goes to `./build` directory (controlled by `neutrino.options.output` option)).

```
✔ Building project completed
Hash: 2dfc67b45f589e801243
Version: webpack 2.4.1
Time: 2695ms
                     Asset       Size  Chunks             Chunk Names
     index.bd21af09bea3.js  787 bytes       0  [emitted]  index
    vendor.c7864a2413ce.js      61 kB       1  [emitted]  vendor
    index.4232d91e4a58.css   24 bytes       0  [emitted]  index
 index.bd21af09bea3.js.map    6.45 kB       0  [emitted]  index
index.4232d91e4a58.css.map  266 bytes       0  [emitted]  index
vendor.c7864a2413ce.js.map     516 kB       1  [emitted]  vendor
                index.html  413 bytes          [emitted]  
```

## Customization

By default `neutrino-preset-vue-static` is going to generate html page for `src/index.vue` only (this can 
be changed by modifying `neutrino.options.source` (default value - `"src"`) and `neutrino.options.vue-static.sourceGlob` (`"index.vue"`) config options in your 
`package.json`). If you are building an app where each `vue` file represents a separate page (e.g. blog) - 
you might want to change the value of `neutrino.options.vue-static.sourceGlob` to something like `"**/*.vue"` or `["index.vue", "about.vue"]`. 

Below are the configuration options specific to `neutrino-preset-vue-static`:

> package.json

```json5
{
  "neutrino": {
    "options": {
      "vue-static": {
        // glob used to locate pages (relative to neutrino.options.source)
        "sourceGlob": ["index.vue"],        

        // directory containing static files (404.html, favicon.ico, etc.) 
        "staticSource": "public",

        // by default each page gets written as <page>/index.html (e.g.
        //   404.vue -> 404/index.html,
        //   posts/post-2017-01-26.vue -> posts/post-2017-01-26/index.html
        // ). This behavior can be overwritten with {
        //   "404": [{path: "/", output: "404.html"}],
        //   "posts/post-2017-01-26": [
        //      {path: "/", output: "posts/post-2017-01-26.html"}
        //   ]
        // }
        "routes": {},
        
        // path to a file that should be used as a template to generate pages 
        "pageTemplate": "page-template.html",
        
        // a placeholder for pre-rendered html (value must be present in pageTemplate)
        "injectionPlaceholder": "<div id=\"app\"></div>",
        
        // client-side entry
        "clientEntryTemplate": "entry-client.js",
        
        // server-side entry (for vue-server-renderer)
        "serverEntryTemplate": "entry-server.js",

        // name of the bundle that will contain 3rd party dependencies (like vue)          
        "vendorBundle": "vendor",
                
        // set this option to false if you need to compile Vue.js templates on the fly 
        // https://vuejs.org/v2/guide/installation.html#Runtime-Compiler-vs-Runtime-only
        "runtimeOnly": true,
        
        // set it to false if you don't need the Source Maps
        "emitSourceMapsOnBuild": true
      }
    }
  }
}
```

> For more information see https://neutrino.js.org/customization/.

## Deployment

All of options described in [create-react-app's deployment](https://github.com/facebookincubator/create-react-app/blob/master/packages/react-scripts/template/README.md#deployment)
section apply here too, including 
[web server of your choice (static or not)](https://github.com/facebookincubator/create-react-app/blob/master/packages/react-scripts/template/README.md#static-server), 
[Azure](https://github.com/facebookincubator/create-react-app/blob/master/packages/react-scripts/template/README.md#azure),
[Firebase](https://github.com/facebookincubator/create-react-app/blob/master/packages/react-scripts/template/README.md#firebase),
[GitHub Pages](https://github.com/facebookincubator/create-react-app/blob/master/packages/react-scripts/template/README.md#github-pages),
[GitLab Pages](https://gist.github.com/shyiko/d0550bd59d07695f99ba4b127d399bf0),
[Heroku](https://github.com/facebookincubator/create-react-app/blob/master/packages/react-scripts/template/README.md#heroku),
[Netlify](https://github.com/facebookincubator/create-react-app/blob/master/packages/react-scripts/template/README.md#netlify),
[Now](https://zeit.co/now),
[S3](https://github.com/facebookincubator/create-react-app/blob/master/packages/react-scripts/template/README.md#s3-and-cloudfront),
[Surge](https://github.com/facebookincubator/create-react-app/blob/master/packages/react-scripts/template/README.md#surge), etc.

## License

[MIT](https://opensource.org/licenses/mit-license.php)

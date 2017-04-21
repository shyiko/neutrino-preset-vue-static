# neutrino-preset-vue-static [![AppVeyor](https://img.shields.io/appveyor/ci/shyiko/neutrino-preset-vue-static.svg)]() [![npm](https://img.shields.io/npm/v/neutrino-preset-vue-static.svg)]()

A minimalistic starter kit for building static sites using [Vue.js](https://vuejs.org/) (powered by [Neutrino](https://neutrino.js.org/)).  
Node.js 6+.

**Features**:
- lightweight (only `vue` is included by default (add [vue-document](https://github.com/shyiko/vue-document), [vue-router](https://router.vuejs.org/en/), [vuex](https://vuex.vuejs.org/en/), etc. when you actually need them)) 
(a sample project with `vue-document` included can be found here - [test/fixture/sample-project](test/fixture/sample-project), `vue-document` & `vue-router` - [test/fixture/sample-project-with-vue-router](test/fixture/sample-project-with-vue-router));
- [pre-rendering (not SSR)](https://vuejs.org/v2/guide/ssr.html#SSR-vs-Prerendering) (which means you can 
serve your app with whatever you want, be it nginx, [caddy](https://caddyserver.com/) or one of the options linked in [deployment](#deployment));
- code splitting, css extraction, minification, cache-busting & source maps out of the box.

## Getting Started

```
npm init -y
npm install --save-dev neutrino neutrino-preset-vue-static vue 
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
```


That's it.  
To start a dev server - execute `npm start`.

```
✔ Development server running on: http://localhost:5000
✔ Build completed
```

Use `npm run build` to get a production build (by default 
output goes to `./build` directory).

```
✔ Building project completed
Hash: 5f19db17827d5b6bfe3e
Version: webpack 2.3.3
Time: 2332ms
                     Asset       Size  Chunks             Chunk Names
     index.f69f7ec4a2a3.js  739 bytes       0  [emitted]  index
    vendor.f73c3e88b161.js    53.5 kB       1  [emitted]  vendor
 index.f69f7ec4a2a3.js.map    5.75 kB       0  [emitted]  index
vendor.f73c3e88b161.js.map     434 kB       1  [emitted]  vendor
                index.html  340 bytes          [emitted]  
```

## Customization

By default `neutrino-preset-vue-static` is looking for `src/**/*.vue` (this can 
be changed by modifying `neutrino.options.source` (`./src`) and `neutrino.options.vue-static.sourceGlob` (`**/*.vue`) config options in your 
`package.json` (as shown at the end of this section)). As part of the build all generated assets together with
`./static/**` (`neutrino.options.vue-static.staticSource`) get copied to `./build` (`neutrino.options.output`).

Below are the configuration options specific to `neutrino-preset-vue-static`:

> package.json

```
{
  "neutrino": {
    "options": {
      "vue-static": {
        // glob used to locate pages (relative to neutrino.options.source)
        "sourceGlob": ["**/*.vue"],        

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
        "pageTemplate": "index.html",
        
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
        "runtimeOnly": true
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

# Change Log
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](http://keepachangelog.com/)
and this project adheres to [Semantic Versioning](http://semver.org/).

## [Unreleased](https://github.com/shyiko/neutrino-preset-vue-static/compare/0.2.0...HEAD)
## [0.2.0](https://github.com/shyiko/neutrino-preset-vue-static/compare/0.1.0...0.2.0) - 2014-04-28

### Added
- Hot Module Replacement support.
- Automatic detection of `buble-loader` & `babel-loader` (for `*.js`) (to be consistent with `vue-loader`).
- `babili` support.  

### Changed
- `neutrino.options.vue-static.sourceGlob` to `["index.vue"]` by default.
- `babel`'s scope to optional (`babel-*` were removed
 from `dependencies` list).
- `devServer.overlay` to true by default.

## Fixed
- Automatic `build` directory cleanup.
- CSS referencing in `page-template.html`. 

## 0.1.0 - 2014-04-21

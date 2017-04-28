# Change Log
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](http://keepachangelog.com/)
and this project adheres to [Semantic Versioning](http://semver.org/).

## [Unreleased](https://github.com/shyiko/neutrino-preset-vue-static/compare/0.1.0...HEAD)

### Added
- Hot Module Replacement support.
- Automatic detection of `buble-loader` & `babel-loader` (for `*.js`) (to be consistent with `vue-loader`).  

### Changed
- `babel`'s scope to optional (`babel-*` were removed
 from `dependencies` list).
- `devServer.overlay` to true by default.

## 0.1.0 - 2014-04-21

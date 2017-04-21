const tap = require('tap')
process.on('uncaughtException', tap.threw).on('unhandledRejection', tap.threw)
module.exports = tap

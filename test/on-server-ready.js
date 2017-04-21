const phantom = require('phantom')
const fetch = require('node-fetch')

module.exports = (expect, renderedOnServer) => async (port) => {
  const instance = await phantom.create()
  try {
    const page = await instance.createPage()

    await page.open(`http://localhost:${port}/`)
    const content = await page.property('content')
    expect.ok(~content.indexOf('<title>root title</title>'))
    expect.ok(~content.indexOf('root description'))
    expect.ok(~content.indexOf('<div id="app"><div>root content'))

    if (renderedOnServer) {
      const rawContent = await fetch(`http://localhost:${port}/`)
        .then((res) => res.text())
      expect.ok(~rawContent.indexOf(
        '<div id="app" server-rendered="true"><div>root content'))
    }

    await page.open(`http://localhost:${port}/foo/`)
    const fooContent = await page.property('content')
    expect.ok(~fooContent.indexOf('<title>foo title</title>'))
    expect.ok(~fooContent.indexOf('foo description'))
    expect.ok(~fooContent.indexOf('<div id="app"><div>foo content'))

    if (renderedOnServer) {
      const rawFooContent = await fetch(`http://localhost:${port}/foo/`)
        .then((res) => res.text())
      expect.ok(~rawFooContent.indexOf(
        '<div id="app" server-rendered="true"><div>foo content'))
    }

    await page.open(`http://localhost:${port}/foo/bar/`)
    const barContent = await page.property('content')
    expect.ok(~barContent.indexOf('<title>foobar title</title>'))
    expect.ok(~barContent.indexOf('foobar description'))
    expect.ok(~barContent.indexOf('<div id="app"><div>foobar content'))

    if (renderedOnServer) {
      const rawBarContent = await fetch(`http://localhost:${port}/foo/bar/`)
        .then((res) => res.text())
      expect.ok(~rawBarContent.indexOf(
        '<div id="app" server-rendered="true"><div>foobar content'))
    }
  } finally {
    await instance.exit()
  }
}

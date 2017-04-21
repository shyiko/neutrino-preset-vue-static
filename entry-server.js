import Vue from 'vue'
import App from '<%= entry %>'

export default function (context) {
  var app = new Vue(App)
  var initialState
  context.onDocumentReady = function (document) {
    // inject vuex initial state (if any)
    if (initialState) {
      var script = document.createElement('script')
      script.appendChild(document.createTextNode(
        'window.__INITIAL_STATE__ = ' + JSON.stringify(initialState)))
      const el = document.getElementById('app')
      el.parentNode.insertBefore(script, el.nextSibling)
    }
    // vue-document (if in use): inject document metadata
    app.$documentForceUpdate && app.$documentForceUpdate(document)
  }
  // vue-router (if in use): navigate to context.url
  var router = app.$router
  if (router) {
    return new Promise(function (resolve, reject) {
      router.push(context.url)
      router.onReady(function () {
        var match = router.getMatchedComponents()
        if (!match.length) {
          return reject(new Error('No route was found for "' + context.url + '"'))
        }
        // vuex (if in use): save store's state to the context for injection
        var store = app.$store
        if (store) {
          // pre-fetch store data (note that "preFetch" is just a convention)
          Promise.all(
            match.map(function (component) {
              return component.preFetch && component.preFetch(store)
            })
          ).then(function () {
              // state to be injected as window.__INITIAL_STATE__
              // dehydrated in client-entry.js
            initialState = store.state
            resolve(app)
          })
            .catch(reject)
        } else {
          resolve(app)
        }
      })
    })
  }
  return Promise.resolve(app)
}

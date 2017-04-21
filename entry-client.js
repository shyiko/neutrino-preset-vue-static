import Vue from 'vue'
import App from '<%= entry %>'

document.addEventListener('DOMContentLoaded', function () {
  var app = new Vue(App)
  // vuex (if in use): dehydrate initial state
  var store = app.$store
  if (store && window.__INITIAL_STATE__) {
    store.replaceState(window.__INITIAL_STATE__)
  }
  // vue-router (if in use): wait for initial navigation
  var router = app.$router
  if (router) {
    router.onReady(function () { app.$mount('#app') })
  } else {
    app.$mount('#app')
  }
})

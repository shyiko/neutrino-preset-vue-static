<template>
  <div id="app">
    <router-view></router-view>
    <p>
      <router-link to="/">root</router-link>
    </p>
  </div>
</template>

<script>
  import Vue from 'vue'
  import VueDocument, {titleInjector, metaInjector} from 'vue-document'
  import VueRouter from 'vue-router'

  Vue.use(VueDocument, {
    injector: [titleInjector, metaInjector]
  })

  Vue.use(VueRouter)

  var Root = {
    template: '<div>root content<router-link to="/foo/">foo</router-link></div>',
    document: {
      head: {
        title: 'root title',
        meta: [
          {name: 'description', content: 'root description'}
        ]
      }
    }
  }
  var Foo = {
    template: '<div>foo content <router-link to="/foo/bar/">foobar</router-link></div>',
    document: {
      head: {
        title: 'foo title',
        meta: [
          {name: 'description', content: 'foo description'}
        ]
      }
    }
  }
  var FooBar = {
    template: '<div>foo{{ $route.params.bar }} content</div>',
    document: function() {
      return {
        head: {
          title: 'foo' + this.$route.params.bar + ' title',
          meta: [
            {name: 'description', content: 'foo' + this.$route.params.bar + ' description'}
          ]
        }
      }
    }
  }

  export default {
    router: new VueRouter({
      mode: 'history',
      routes: [
        {path: '/', component: Root},
        {path: '/foo', component: Foo},
        {path: '/foo/:bar', component: FooBar}
      ]
    })
  }
</script>

<style>
  body {
    background: black;
    color: white;
  }
</style>

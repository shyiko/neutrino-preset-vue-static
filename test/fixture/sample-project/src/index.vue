<template>
  <div id="app"><div>{{ content }}<a href="/foo/">foo</a></div></div>
</template>

<script>
  import Vue from 'vue'
  import VueDocument, {titleInjector, metaInjector} from 'vue-document'

  Vue.use(VueDocument, {
    injector: [titleInjector, metaInjector]
  })

  export default {
    document: {
      head: {
        title: 'root title',
        meta: [
          {name: 'description', content: 'root description'}
        ]
      }
    },
    data: function () {
      return {
        content: 'root content'
      }
    }
  }
</script>

<style>
  body {
    background: black;
    color: white;
  }
</style>

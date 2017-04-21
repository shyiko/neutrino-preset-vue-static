<template>
  <div id="app"><div>{{ content }}<a href="/foo/bar/">foobar</a></div></div>
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
        title: 'foo title',
        meta: [
          {name: 'description', content: 'foo description'}
        ]
      }
    },
    data: function () {
      return {
        content: 'foo content'
      }
    }
  }
</script>

<template>
  <div id="app"><div>{{ content }}</div></div>
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
        title: 'foobar title',
        meta: [
          {name: 'description', content: 'foobar description'}
        ]
      }
    },
    data: function () {
      return {
        content: 'foobar content'
      }
    }
  }
</script>

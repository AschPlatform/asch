<template>
  <!-- if you want automatic padding use "layout-padding" class -->
    <q-tabs inverted align="justify"  class="tab-container">
      <q-route-tab default  name="delegates" :to="routerConfig('delegates')"  slot="title" icon="people outline" :label="$t('DELEGATE_LIST')" />
      <q-route-tab name="voteRecords" :to="routerConfig('voteRecords')" slot="title"  icon="people" :label="$t('VOTE_RECORD')" />
      <q-route-tab name="supporters" slot="title" :to="routerConfig('supporters')" icon="face" :label="$t('MY_VOTERS')" />
      <router-view :userObj="user" />
    </q-tabs>
</template>

<script>
import { QTabs, QRouteTab } from 'quasar'
export default {
  props: ['userObj'],
  data() {
    return {}
  },
  components: {
    QTabs,
    QRouteTab
  },
  mounted() {},
  methods: {
    routerConfig(name) {
      return {
        name: name,
        params: {
          user: this.user
        }
      }
    }
  },
  computed: {
    user() {
      return this.userObj
    }
  },
  watch: {}
}
</script>

<style lang="stylus">
</style>

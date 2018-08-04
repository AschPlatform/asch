<template>
  <!-- if you want automatic padding use "layout-padding" class -->
    <q-tabs inverted align="justify" class="tab-container">
      <q-route-tab default  name="account" :to="routerConfig('account')"  slot="title" icon="web asset" :label="$t('ASSET_PROFILE')" />
      <q-route-tab name="publisher" :to="routerConfig('publisher')" slot="title"  icon="business" :label="$t('REGISTERED_PUBLISHER')" />
      <q-route-tab name="assets" slot="title" :to="routerConfig('addAssets')" icon="assessment" :label="$t('REGISTERED_ASSETS')" />
      <q-route-tab name="myAssets" slot="title" :to="routerConfig('list')"  icon="publish" :label="$t('MY_ASSETS')" />
      <q-route-tab name="records" slot="title" :to="routerConfig('records')"  icon="note" :label="$t('OPERATION_RECORD')" />
      <router-view :userObj="user" />
    </q-tabs>
</template>

<script>
import { QTabs, QRouteTab, QTabPane } from 'quasar'
export default {
  props: ['userObj'],
  components: {
    QTabs,
    QRouteTab,
    QTabPane
  },
  data() {
    return {}
  },
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
  mounted() {},
  watch: {},
  created() {
    // register event
  },
  beforeDestroy() {}
}
</script>

<style>

</style>

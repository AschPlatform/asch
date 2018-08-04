<template>
  <q-layout ref="layout" view="lHh Lpr fff">
    <q-layout-header>
  
      <q-toolbar>
        <q-btn flat @click="showLeft=!showLeft">
          <q-icon name="menu" />
        </q-btn>
  
        <q-toolbar-title>
        </q-toolbar-title>
        <q-btn flat @click="logout">
          <q-icon name="power settings new" />
        </q-btn>
      </q-toolbar>
    </q-layout-header>
  
  
    <q-layout-drawer v-model="showLeft" side="left">
      <!--
                    Use <q-item> component
                    instead of <q-item> for
                    internal vue-router navigation
                  -->
      <q-list no-border link inset-delimiter>
        <q-list-header><div class="menu-logo" /> </q-list-header>
        <q-item item :to="getRouterConf('home')">
          <q-item-side icon="home" />
          <q-item-main :label="$t('HOME')" />
        </q-item>
        <q-item item :to="getRouterConf('account')">
          <q-item-side icon="attach money" />
          <q-item-main :label="$t('ASSET')" />
        </q-item>
        <q-item item :to="getRouterConf('personal')">
          <q-item-side icon="person" />
          <q-item-main :label="$t('PERSONAL')" />
        </q-item>
        <q-item item :to="getRouterConf('applications')">
          <q-item-side icon="apps" />
          <q-item-main :label="$t('APPLICATIONS')" />
        </q-item>
        <q-item item :to="getRouterConf('forging')">
          <q-item-side icon="gavel" />
          <q-item-main :label="$t('FORGING')" />
        </q-item>
        <q-item item :to="getRouterConf('blocks')">
          <q-item-side icon="public" />
          <q-item-main :label="$t('BLOCKS')" />
        </q-item>
        <q-item item :to="getRouterConf('delegates')">
          <q-item-side icon="format list numbered" />
          <q-item-main :label="$t('VOTE')" />
        </q-item>
        <q-item item :to="getRouterConf('transfer')">
          <q-item-side icon="compare arrows"/>
          <q-item-main  :label="$t('TRANSFER')" />
        </q-item>
        <q-item item :to="getRouterConf('peers')">
          <q-item-side icon="blur on" />
          <q-item-main :label="$t('PEERS')" />
        </q-item>
        <q-item item :to="getRouterConf('about')">
          <q-item-side icon="info" />
          <q-item-main label="about" />
        </q-item>
      </q-list>
    </q-layout-drawer>
    <q-page-container >
      <transition appear enter-active-class="animated fadeIn" leave-active-class="animated fadeOut" mode="out-in" :duration="500">
        <router-view :userObj="user" />
      </transition>

      <!-- common component with event -->
    <account-info :show="accountShow" :account="accountInfo" @close="accountShow=false"/>
  
    <q-modal v-model="transShow" minimized no-backdrop-dismiss content-css="padding: 20px" >
        <trans-panel :showTitle="true" :assets="assets" :user="user" :address="address">
          <div slot="btns" slot-scope="props" class="row col-12 justify-between" >
            <q-btn big class="col-auto"  color="primary" @click="transShow=false;props.send()" :label="$t('SEND')" />
            <q-btn big class="col-auto"  color="orange" @click="transShow=false;props.cancel()" :label="$t('label.close')" />
        </div>
        </trans-panel>
    </q-modal>

    <float-menu v-if="this.showFloatBtns" :router="$router" :userObj="user" />
      
    </q-page-container>
     <q-ajax-bar ref="bar" position="top" color="orange" />  
  </q-layout>
</template>

<script>
import { api } from '../utils/api'
import { setCache, getCache, removeCache } from '../utils/util'
import FloatMenu from '../components/FloatMenu'
import TransPanel from '../components/TransPanel'
import AccountInfo from '../components/AccountInfo'
import logo from '../assets/logo.png'
const func = () => {}

export default {
  name: 'Home',
  components: { FloatMenu, TransPanel, AccountInfo },
  data() {
    return {
      user: null,
      showLeft: true,
      logo: logo,
      accountShow: false,
      accountInfo: {},
      assets: null,
      transShow: false,
      showFloatBtns: true,
      address: ''
    }
  },
  methods: {
    logout() {
      removeCache('user')
      this.$router.push('/login')
    },
    getRouterConf(name) {
      const conf = {
        name: name,
        params: {
          user: this.user
        }
      }
      return conf
    },
    async openTransactionDialog(assets = null, address = '') {
      this.assets = assets
      this.address = address
      this.transShow = true
    },
    async openAccountModal(address) {
      let res = await api.account({
        address: address
      })
      this.accountInfo = res.account
      this.accountShow = true
    },
    async refreshAccount(cb = func) {
      // refresh user balance
      console.log('event refreshAccount...')
      let res = await api.account({
        address: this.user.account.address
      })
      let user = this._.merge({}, this.user, res)
      this.user = user
      if (getCache('user')) setCache('user', user)
      this._.delay(() => cb(), 1500) // delay refresh
    },
    async getIssuer(cbOk = func, cbErr = func) {
      // get user issuer info
      let res = await api.issuer({
        address: this.user.account.address
      })
      if (res.success) {
        this.user.issuer = res.issuer
        let user = this._.merge({}, this.user, res)
        this.user = user
        if (getCache('user')) setCache('user', user)
        cbOk(res)
        // TODO
      } else {
        cbErr()
      }
    },
    async getAssetsList(cbOk = func, cbErr = func) {
      // get user issuer info
      let res = await api.uiaAssetListApi({})
      if (res.success) {
        let user = this._.merge({}, this.user, res)
        this.user = user
        if (getCache('user')) setCache('user', user)
        cbOk(res)
      } else {
        cbErr()
      }
    },
    showAjaxBar() {
      let bar = this.$refs.bar
      bar.start()
      this._.delay(() => bar.stop(), 10000)
    },
    changeFloatBtn() {
      this.showFloatBtns = !this.showFloatBtns
    }
  },
  async mounted() {
    let user = this.$route.params.user || getCache('user') || null
    if (!user) {
      console.log('no session data, please login...')
      this.$router.push('/login')
    } else {
      let res = await api.login({
        publicKey: user.account.publicKey
      })
      this.user = {
        ...user,
        ...res
      }
      window.CHPlugin.checkIn()
    }
  },
  computed: {
    secondSignature() {
      return this.user ? this.user.account.secondSignature : null
    }
  },
  created() {
    // register event
    this.$root.$on('refreshAccount', this.refreshAccount)
    this.$root.$on('getAssetsList', this.getAssetsList)
    this.$root.$on('getIssuer', () => {
      this.user && this.user.account ? this.getIssuer() : console.log('not init yet..')
    })
    this.$root.$on('openAccountModal', this.openAccountModal)
    this.$root.$on('openTransactionDialog', this.openTransactionDialog)
    this.$root.$on('showAjaxBar', this.showAjaxBar)
    this.$root.$on('changeFloatBtn', this.changeFloatBtn)
  },
  beforeDestroy() {
    this.$root.$off('refreshAccount', this.refreshAccount)
    this.$root.$off('refreshAccount', this.getAssetsList)
    this.$root.$off('getIssuer', this.getIssuer)
    this.$root.$off('openAccountModal', this.openAccountModal)
    this.$root.$off('openTransactionDialog', this.openTransactionDialog)
    this.$root.$off('showAjaxBar', this.showAjaxBar)
    this.$root.$off('changeFloatBtn', this.changeFloatBtn)
  }
}
</script>

<style lang="stylus">
.menu-logo {
  background: url('../assets/logo.png') no-repeat;
  background-size: 100%;
  width: 260px;
  height: 77px;
}

.q-field {
  margin-top: 10px;
}

#ch-plugin-launcher {
  display: none;
}
</style>

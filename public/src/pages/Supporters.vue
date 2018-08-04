<template>
  <div class="tab-panel-container row ">
    <transition appear enter-active-class="animated fadeIn" leave-active-class="animated fadeOut" mode="out-in">
    <div  class="col-12 shadow-1">
      <q-table :data="supports" :filter="filter" color="primary"
        :columns="columns"  @request="request" :pagination.sync="pagination" 
        :loading="loading" :title="$t('TOTAL_PEOPLES',{count:pagination.rowsNumber})"
        >
        
          <template slot="top-right" slot-scope="props">
            <q-btn flat round  icon="refresh" color="primary" @click="refresh" >
            </q-btn>
            <q-btn flat round  color="primary" :icon="props.inFullscreen ? 'fullscreen_exit' : 'fullscreen'" @click="props.toggleFullscreen" >
            </q-btn>
          </template>
           
          <q-td slot="body-cell-address"  slot-scope="props" :props="props">
            <div @click="viewAccountInfo(props.row)" class="text-primary">{{props.value}}</div>
          </q-td>
        </q-table>
    </div>
    </transition>
    </div>
</template>

<script>
import { api } from '../utils/api'

export default {
  props: ['userObj'],
  data() {
    return {
      delegates: null,
      pagination: {
        page: 1,
        rowsNumber: 0,
        rowsPerPage: 10
      },
      filter: '',
      loading: false,
      columns: [
        {
          name: 'address',
          field: 'address',
          label: this.$t('ADDRESS'),
          align: 'center'
        },
        {
          label: this.$t('USERNAME'),
          field: 'username',
          align: 'center'
        },
        {
          name: 'weight',
          label: this.$t('WEIGHT'),
          field: 'weight',
          align: 'left'
        }
      ],
      dialogShow: false,
      dialog: {
        title: '',
        message: ''
      },
      secondPwd: '',
      supports: []
    }
  },
  methods: {
    refresh() {
      this.pagination = this.paginationDeafult
      this.getSupporters()
    },
    async request(props) {
      await this.getSupporters(props.pagination, props.filter)
    },
    async getSupporters(pagination = {}, filter = '') {
      this.loading = true
      if (pagination.page) this.pagination = pagination
      let limit = this.pagination.rowsPerPage
      let pageNo = this.pagination.page
      let res = await api.votetome({
        publicKey: this.user.account.publicKey,
        orderBy: 'rate:asc',
        limit: limit,
        offset: (pageNo - 1) * limit
      })
      this.supports = res.accounts
      // set max
      this.pagination.rowsNumber = res.accounts.length
      this.loading = false
      return res
    },
    viewAccountInfo(row) {
      this.$root.$emit('openAccountModal', row.address)
    }
  },
  async mounted() {
    if (this.user) {
      this.getSupporters()
    }
  },
  computed: {
    user() {
      return this.userObj
    },
    paginationDeafult() {
      return {
        page: 1,
        rowsNumber: 0,
        rowsPerPage: 10
      }
    }
  },
  watch: {
    userObj(val) {
      if (val) {
        this.getSupporters()
      }
    },
    pageNo(val) {
      this.getSupporters()
    }
  }
}
</script>

<style lang="stylus">
pd-5 {
  padding: 5%;
}
</style>

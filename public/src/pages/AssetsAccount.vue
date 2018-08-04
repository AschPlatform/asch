<template>
  <q-page class="tab-panel-container row ">
    <transition 
    appear
    enter-active-class="animated fadeIn"
    leave-active-class="animated fadeOut" 
     mode="out-in">
      <div v-if="balancesData" class="col-12 shadow-1">
        <q-table :data="balancesData.balances" :filter="filter" 
        :columns="columns"  @request="request" :pagination.sync="pagination" 
        :loading="loading" :title="$t('DAPP_TRANSACTION_RECORD')"
        >
          
          <template slot="top-right" slot-scope="props">
            <q-btn flat round dense :icon="props.inFullscreen ? 'fullscreen_exit' : 'fullscreen'" @click="props.toggleFullscreen" />
          </template>

          <q-td slot="body-cell-opt"  slot-scope="props" :props="props">
              <q-btn @click="viewInfo(props.row)" icon="remove red eye" size="sm" flat color="primary" >
                <q-tooltip anchor="top middle" self="bottom middle" :offset="[0, 10]">{{$t('DAPP_DETAIL')}}</q-tooltip>
              </q-btn>
              <q-btn v-if="props.row.writeoff == 0" @click="getTransferParams(props)" icon="send" size="sm" flat color="primary" >
                <q-tooltip anchor="top middle" self="bottom middle" :offset="[0, 10]">{{$t('TRANSFER')}}</q-tooltip>
              </q-btn>
          </q-td>

          <q-td slot="body-cell-allowWriteoff"  slot-scope="props" :props="props">
            {{getAssetRule(props.row)}}
          </q-td>


        </q-table>
      </div>
      </transition>

     <q-modal minimized no-backdrop-dismiss  v-model="modalInfoShow" content-css="padding: 20px">
      <big>{{$t('DAPP_DETAIL')}}</big>
      <table v-if="modalInfoShow" class="q-table horizontal-separator highlight loose ">
        <tbody class='info-tbody'>
          <tr v-clipboard="row.currency" @success="info('copy name success...')">
            <td >{{$t('ASSET_NAME')}}</td>
            <td >{{row.currency}}</td>
          </tr>
          <tr v-clipboard="row.balanceShow" @success="info('copy balance success...')">
            <td >{{$t('BALANCE')}}</td>
            <td >{{row.balanceShow}}</td>
          </tr>
          <tr  v-clipboard="row.maximumShow" @success="info('copy maximum success...')">
            <td >{{$t('MAXIMUM')}}</td>
            <td >{{row.maximumShow}}</td>
          </tr>
          <tr v-clipboard="row.precision" @success="info('copy precision success...')">
            <td >{{$t('PRECISION')}}</td>
            <td >{{row.precision}}</td>
          </tr>
          <tr v-clipboard="row.quantity" @success="info('copy quantity success...')">
            <td >{{$t('QUANTITY')}}</td>
            <td >{{row.quantityShow}}</td>
          </tr>
          <tr v-clipboard="row.writeoff?'normal':'writeoff'" @success="info('copy message success...')">
            <td >{{$t('REMARK')}}</td>
            <td >{{row.writeoff?'normal':'writeoff'}}</td>
          </tr>
          <tr>
            <td >{{$t('ALLOW_WWB')}}</td>
            <td >{{getAssetRule(row)}}</td>
          </tr>
        </tbody>
      </table>
      <br/>
      <q-btn
        color="primary"
        @click="()=>{
          this.modalInfoShow = false
          this.row = {}
          }"
        label="Close"
      />
    </q-modal>


    </q-page>
</template>

<script>
import { api } from '../utils/api'
import { toast } from '../utils/util'

export default {
  props: ['userObj'],
  data() {
    return {
      balancesData: null,
      pagination: {
        page: 1,
        rowsNumber: 0,
        rowsPerPage: 10
      },
      filter: '',
      loading: false,
      columns: [
        {
          name: 'opt',
          label: this.$t('OPERATION'),
          field: 'opt',
          align: 'center',
          width: '50px'
        },
        {
          name: 'currency',
          label: this.$t('ASSET_NAME'),
          field: 'currency',
          width: '100px',
          type: 'string',
          filter: true
        },
        {
          name: 'balance',
          label: this.$t('BALANCE'),
          field: 'balanceShow',
          width: '150px',
          sort: true,
          filter: true
        },
        {
          name: 'maximum',
          label: this.$t('MAXIMUM'),
          field: 'maximumShow',
          width: '250px',
          sort: true,
          filter: true
        },
        {
          name: 'precision',
          label: this.$t('PRECISION'),
          field: 'precision',
          align: 'center',
          type: 'number',
          width: '80px',
          sort: true
        },
        {
          name: 'quantity',
          label: this.$t('QUANTITY'),
          field: 'quantityShow',
          width: '150px',
          filter: true,
          sort: true
        },
        {
          name: 'writeoff',
          label: this.$t('CANCELLATION'),
          field: 'writeoff',
          align: 'center',
          width: '80px',
          format: val => {
            return val === 0 ? 'normal' : 'writeoff'
          }
        },
        {
          name: 'allowWriteoff',
          label: this.$t('ALLOW_WWB'),
          field: 'allowWriteoff',
          align: 'center',
          width: '200px'
        }
      ],
      row: {},
      modalInfoShow: false
    }
  },
  methods: {
    async request(props) {
      await this.getBalances(props.pagination, props.filter)
    },
    async getBalances(pagination = {}, filter = '') {
      this.loading = true
      if (pagination.page) this.pagination = pagination
      let limit = this.pagination.rowsPerPage
      let pageNo = this.pagination.page
      let res = await api.myBalances({
        address: this.user.account.address,
        limit: limit,
        offset: (pageNo - 1) * limit
      })
      this.balancesData = res
      // set max
      this.pagination.rowsNumber = res.count
      this.loading = false
      return res
    },
    viewInfo(row) {
      this.row = row
      this.modalInfoShow = true
    },
    getTransferParams(props) {
      this.$root.$emit('openTransactionDialog', props.row)
    },
    getAssetRule(props) {
      return `${props.allowWriteoff === 1 ? 'Y' : 'N'}/${props.allowWhitelist === 1 ? 'Y' : 'N'}/${
        props.allowBlacklist === 1 ? 'Y' : 'N'
      }`
    },
    info(msg) {
      toast(msg)
    }
  },
  async mounted() {
    if (this.user) {
      this.getBalances()
    }
  },
  computed: {
    user() {
      return this.userObj
    }
  },
  watch: {
    userObj(val) {
      if (val) {
        this.getBalances()
      }
    },
    pageNo(val) {
      this.getBalances()
    }
  }
}
</script>

<style lang="stylus">
pd-5 {
  padding: 5%;
}
</style>

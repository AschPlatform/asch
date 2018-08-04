<template>
  <!-- if you want automatic padding use "layout-padding" class -->
  <div v-if="user" class="layout-padding self-center">
    <div class="row gutter-xs col-12">
      <div class="col-lg-6 col-auto col-sm-12 col-xs-12">
        <q-card class="card-info" color="primary ">
          <q-card-title>
            {{$t('BALANCE')}}
            <!-- add balance refresh -->
            <div slot="right" class="row items-center">
              <q-btn size="xs" :loading="refreshLoading" flat round icon="refresh" @click="refreshBalance" />
            </div>
          </q-card-title>
          <q-card-main >
            <div class="justify-between">
              <big>{{user.account.balance | fee}} XAS</big><q-btn @click="$root.$emit('openTransactionDialog')" size="xs"  flat round icon="compare arrows" >
                <q-tooltip anchor="top middle" self="bottom middle" :offset="[0, 10]">{{$t('TRS_TYPE_TRANSFER')}}</q-tooltip>
              </q-btn>
            </div>
            <div>{{user.account.address}}<q-btn size="xs" v-clipboard="user.account.address" @success="info('copy success...')" flat round icon="content copy" /></div>
          </q-card-main>
  
        </q-card>
      </div>
      <div class="col">
        <q-card class="card-info" color="primary">
          <q-card-title>
            {{$t('LATEST_BLOCK_HEIGHT')}}
            <span slot="subtitle">{{user.latestBlock.timestamp | time}}</span>
          </q-card-title>
          <q-card-main>
            <big>
              {{user.latestBlock.height}}
            </big>
            <p class="text-faded"></p>
  
          </q-card-main>
        </q-card>
      </div>
      <div class="col">
        <q-card class="card-info" color="primary">
          <q-card-title>
            {{$t('VERSION_INFO')}}
            <span slot="subtitle">{{user.version.build}}</span>
          </q-card-title>
          <q-card-main>
            <big>
                            {{user.version.version}}
                          </big>
          </q-card-main>
        </q-card>
      </div>
    </div>
  
    <div class="row col shadow-1 trans-table">
      <transition appear enter-active-class="animated fadeIn" leave-active-class="animated fadeOut" mode="out-in">
        <div v-if="transData" class="col-12">
          <q-table :data="transData.transactions" 
          :columns="columns" row-key="id" :pagination.sync="pagination"
           @request="request" :loading="loading" :filter="filter" 
           :visible-columns="visibleColumns" :title="$t('DAPP_TRANSACTION_RECORD')">
  
            <!--  <template slot="top-left" slot-scope="props">
              <q-search
                hide-underline
                color="secondary"
                v-model="filter"
                class="col-8"
              />
</template>-->

            <template slot="top-right" slot-scope="props">
              <q-table-columns color="primary" class="q-mr-sm" v-model="visibleColumns" :columns="columns" />
              <q-btn flat round dense :icon="props.inFullscreen ? 'fullscreen_exit' : 'fullscreen'" @click="props.toggleFullscreen" />
            </template>

            

            <q-td slot="body-cell-id" slot-scope="props" :props="props">
              <div class="my-label" >
                {{props.value.substring(0,7)}}
                <q-tooltip>{{props.value}}</q-tooltip>
              </div>
            </q-td>
  
            <q-td slot="body-cell-opt"  slot-scope="props" :props="props">
              <q-btn @click="getDataInfo(props)" icon="remove red eye" size="sm" flat color="primary" >
                  <q-tooltip anchor="top middle" self="bottom middle" :offset="[0, 10]">{{$t('DAPP_DETAIL')}}</q-tooltip>
                </q-btn>
            </q-td>

            <q-td slot="body-cell-message" slot-scope="props" :props="props">
              {{props.value}}
              <q-popover v-if="props.value" ref="popover-msg">
                <div class="light-paragraph">{{props.value}}</div>
              </q-popover>
            </q-td>
  
            <q-td slot="body-cell-amount" slot-scope="props" :props="props">
              {{getAmountNFee(props.row)}}
            </q-td>
  
            <q-td slot="body-cell-senderId" class="table-address" slot-scope="props" :props="props">
              <a @click="getAccountInfo(props.row.senderId)">
                      {{matchSelf(props.value)?'Me':props.value}}
                    </a>
              <q-tooltip v-if="!matchSelf(props.value)">{{props.value}}</q-tooltip>
            </q-td>
  
            <q-td slot="body-cell-recipientId" slot-scope="props" :props="props">
              <div v-if="props.value">
                <a @click="getAccountInfo(props.row.recipientId)">
                        {{matchSelf(props.value)?'Me':props.value}}
                      </a>
                <q-tooltip v-if="!matchSelf(props.value)" ref="popover-rec">
                  {{props.value}}
                </q-tooltip>
              </div>
              <div v-else>SYSTEM</div>
            </q-td>
  
  
          </q-table>
        </div>
      </transition>
    </div>
    <q-modal minimized no-backdrop-dismiss  v-model="modalInfoShow" content-css="padding: 20px">
      <big>{{$t('DAPP_DETAIL')}}</big>
      <table v-if="modalInfoShow" class="q-table horizontal-separator highlight loose ">
        <tbody class='info-tbody'>
          <tr v-clipboard="row.id" @success="info('copy ID success...')">
            <td >{{'ID'}}</td>
            <td >{{row.id}}</td>
          </tr>
          <tr>
            <td >{{$t('TYPE')}}</td>
            <td >{{getTransType(row.type)}}</td>
          </tr>
          <tr  v-clipboard="row.senderId" @success="info('copy senderId success...')">
            <td >{{$t('SENDER')}}</td>
            <td >{{row.senderId}}</td>
          </tr>
          <tr v-clipboard="row.recipientId" @success="info('copy recipientId success...')">
            <td >{{$t('RECIPIENT')}}</td>
            <td >{{row.recipientId}}</td>
          </tr>
          <tr v-clipboard="this.formatTimestamp(row.timestamp)" @success="info('copy date success...')">
            <td >{{$t('DATE')}}</td>
            <td >{{this.formatTimestamp(row.timestamp)}}</td>
          </tr>
          <tr v-clipboard="getAmountNFee(row)" @success="info('copy amount success...')">
            <td >{{this.$t('AMOUNTS') + '(' + this.$t('FEES') + ')'}}</td>
            <td >{{getAmountNFee(row)}}</td>
          </tr>
          <tr v-clipboard="row.message" @success="info('copy message success...')">
            <td >{{$t('REMARK')}}</td>
            <td >{{row.message}}</td>
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
  </div>
</template>

<script>
import { api } from '../utils/api'
import { transTypes } from '../utils/constants'
import { fullTimestamp, convertFee } from '../utils/asch'

export default {
  props: ['userObj'],
  components: {},
  data() {
    return {
      transData: null,
      loading: false,
      refreshLoading: false,
      pagination: {
        page: 1,
        rowsNumber: 0,
        rowsPerPage: 10
      },
      columns: [
        {
          name: 'opt',
          label: this.$t('OPERATION'),
          field: 'opt',
          align: 'center'
        },
        {
          name: 'id',
          label: 'ID',
          field: 'id'
        },
        {
          name: 'type',
          label: this.$t('TYPE'),
          field: 'type',
          align: 'center',
          filter: true,
          format: value => {
            return this.getTransType(value)
          }
        },
        {
          name: 'senderId',
          label: this.$t('SENDER'),
          field: 'senderId',
          align: 'center',
          format: value => {
            let isMySelf = this.matchSelf(value)
            return isMySelf ? 'Me' : value
          }
        },
        {
          name: 'recipientId',
          label: this.$t('RECIPIENT'),
          field: 'recipientId',
          align: 'center',
          format: value => {
            if (value === '') {
              return 'SYSTEM'
            }
            let isMySelf = this.matchSelf(value)
            return isMySelf ? 'Me' : value
          }
        },
        {
          name: 'timestamp',
          label: this.$t('DATE'),
          field: 'timestamp',
          width: '180px',
          format: value => {
            return this.formatTimestamp(value)
          },
          type: 'number'
        },
        {
          name: 'amount',
          label: this.$t('AMOUNTS') + '(' + this.$t('FEES') + ')',
          field: 'amount',
          filter: true,
          classes: 'text-right',
          // sortable: true,
          type: 'number',
          width: '100px'
        },
        {
          name: 'message',
          label: this.$t('REMARK'),
          field: 'message',
          filter: true,
          // sortable: true,
          type: 'string',
          width: '120px'
        }
      ],
      filter: '',
      visibleColumns: [
        'opt',
        'id',
        'type',
        'senderId',
        'recipientId',
        'timestamp',
        'amount',
        'message'
      ],
      accountInfo: {
        address: '',
        publicKey: '',
        balance: ''
      },
      row: null,
      modalInfoShow: false
    }
  },
  methods: {
    async request(props) {
      await this.getTrans(props.pagination, props.filter)
    },
    refreshBalance(e, done) {
      this.refreshLoading = true
      this.$root.$emit('refreshAccount', () => (this.refreshLoading = false))
    },
    formatTimestamp(timestamp) {
      return fullTimestamp(timestamp)
    },
    getDataInfo(props) {
      let { row } = props
      this.row = row
      this.modalInfoShow = true
    },
    async getAccountInfo(address) {
      this.$root('openAccountModal', address)
    },
    info(message) {
      this.$q.notify({
        type: 'positive',
        color: 'positive',
        timeout: 2000,
        message
      })
    },
    // get transactions
    async getTrans(pagination = {}, filter = '') {
      this.loading = true
      if (pagination.page) this.pagination = pagination
      let limit = this.pagination.rowsPerPage
      let pageNo = this.pagination.page
      let res = await api.transactions({
        recipientId: this.user.account.address,
        senderPublicKey: this.user.account.publicKey,
        orderBy: 't_timestamp:desc',
        limit: limit,
        offset: (pageNo - 1) * limit
      })
      this.transData = res
      // set max
      this.pagination.rowsNumber = res.count
      this.loading = false
      return res
    },
    getAmountNFee(data) {
      const { amount, fee } = data
      return `${convertFee(amount)}(${convertFee(fee)})`
    },
    matchSelf(address) {
      return this.user.account.address === address
    },
    resetTable() {
      this.pageNo = 1
    },
    getTransType(val) {
      return this.$t(transTypes[val])
    }
  },
  mounted() {
    if (this.user) {
      this.getTrans()
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
        this.getTrans()
      }
    }
  }
}
</script>

<style lang="stylus">
.trans-table {
  margin-top: 3%;
}

.card-info {
  height: 150px;
}

.info-tbody {
  tr {
    cursor: text;
  }
}

.link-cursor {
  cursor: point;
}
</style>

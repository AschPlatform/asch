<template>
  <div class="tab-panel-container row ">
    <transition appear enter-active-class="animated fadeIn" leave-active-class="animated fadeOut" mode="out-in">
      <div class="col-12 shadow-1">
        <q-table :data="appsData?appsData.dapps:[]" :columns="columns" @request="request" :pagination.sync="pagination" :loading="loading" :title="$t('DAPP_LIST')">
  
          <template slot="top-right" slot-scope="props">
             <q-toggle v-model="installed" :label="$t('DAPP_INSTALL_LIST')" color="secondary" @change="(val)=>console.log(val)" />
              <q-btn flat round dense :icon="props.inFullscreen ? 'fullscreen_exit' : 'fullscreen'" @click="props.toggleFullscreen" />
          </template>

          <q-td slot="body-cell-opt"  slot-scope="props" :props="props">
              <q-btn v-if="!installed" @click="viewAppBanlance(props.row)" icon="account balance wallet" size="sm" flat color="primary" >
                <q-tooltip anchor="top middle" self="bottom middle" :offset="[0, 10]">{{$t('DAPP_BANLANCE_DETAIL')}}</q-tooltip>
              </q-btn>
              <q-btn v-if="installed" @click="viewMyBanlance(props.row)" icon="account balance wallet" size="sm" flat color="primary" >
                <q-tooltip anchor="top middle" self="bottom middle" :offset="[0, 10]">{{$t('DAPP_BANLANCE_DETAIL')}}</q-tooltip>
              </q-btn>
              <q-btn @click="deposit(props.row)" icon="shopping cart" size="sm" flat color="primary" >
                <q-tooltip anchor="top middle" self="bottom middle" :offset="[0, 10]">{{$t('DAPP_DEPOSIT')}}</q-tooltip>
              </q-btn>
              <q-btn @click="download(props.row)" icon="file download" size="sm" flat color="primary" >
                <q-tooltip anchor="top middle" self="bottom middle" :offset="[0, 10]">{{$t('DAPP_DOWNLOAD')}}</q-tooltip>
              </q-btn>
              <q-fab v-if="installed" flat color="orange" icon="settings" direction="right" size="sm" >
                <q-tooltip slot="tooltip" anchor="top middle" self="bottom middle"  :offset="[0, 10]" >
                  {{$t('TRS_TYPE_UIA_FLAGS')}}
                </q-tooltip>
                <q-fab-action @click="withDraw(props.row)" icon="monetization on" size="sm"  color="primary" >
                  <q-tooltip anchor="top middle" self="bottom middle" :offset="[0, 10]">{{$t('TRS_TYPE_WITHDRAWAL')}}</q-tooltip>
                </q-fab-action>
                <q-fab-action @click="innerTrans(props.row)" icon="swap horiz" size="sm" color="primary" >
                  <q-tooltip anchor="top middle" self="bottom middle" :offset="[0, 10]">{{$t('TRS_TYPE_TRANSFER')}}</q-tooltip>
                </q-fab-action>
              </q-fab>
          </q-td>

          <q-td slot="body-cell-id"  slot-scope="props" :props="props">
            <div class="my-label" >
              {{props.value.substring(0,7)}}
              <q-tooltip>{{props.value}}</q-tooltip>
            </div>
          </q-td>
          <q-td slot="body-cell-icon"  slot-scope="props" :props="props">
            <img v-if="props.row.icon" :src="props.row.icon" style="height:40px" :onerror="props.row.icon = defaultIcon">
          </q-td>
          <q-td slot="body-cell-desc"  slot-scope="props" :props="props">
            <div class="my-label" >
              {{props.value.substring(0,20)}}
              <q-tooltip>{{props.value}}</q-tooltip>
            </div>
          </q-td>
          <q-td slot="body-cell-category"  slot-scope="props" :props="props">
            {{props.value | category($t)}}
          </q-td>

        </q-table>
      </div>
     
      </transition>

    <q-modal minimized no-backdrop-dismiss  v-model="modalInfoShow" content-css="padding: 20px">
      <big>{{$t('DAPP_DETAIL')}}</big>
        <table class="q-table horizontal-separator highlight loose ">
          <thead>
            <tr v-if="balanceType==0">
              <th>{{$t('DAPP_SUPPORT_COIN')}}</th>
              <th>{{$t('DAPP_COIN_CURRENT_QUANTITY')}}</th>
              <th>{{'DAPP'+$t('BALANCE')}}</th>
            </tr>
            <tr v-if="balanceType==1">
              <th>{{$t('DAPP_SUPPORT_COIN')}}</th>
              <th>{{'DAPP'+$t('BALANCE')}}</th>
            </tr>
          </thead>
          <tbody v-if="balanceType==0" class='info-tbody'>
            <tr v-for="b in dappBalances" :key="b.currency" >
              <td >{{b.currency}}</td>
              <td >
                {{b.quantityShow | unit($t)}} 
                
              </td>
              <td >{{b.balanceShow}}</td>
            </tr>
          </tbody>
          <tbody v-if="balanceType==1" class='info-tbody'>
            <tr v-for="b in dappBalances" :key="b.currency" >
              <td >{{b.currency}}</td>
              <td >{{b.balance | fee}}</td>
            </tr>
          </tbody>
          
        </table>
      <br/>
      <q-btn
        color="primary"
        @click="()=>{
          this.modalInfoShow = false
          this.dappBalances = {}
          }"
        :label="$t('label.close')"
      />
    </q-modal>

    <q-dialog
      v-model="dialogShow"
      prevent-close
      @ok="onOk"
      @cancel="onCancel"
    >
      <!-- This or use "title" prop on <q-dialog> -->
      <span slot="title">{{dialog.title}}</span>
      <span slot="message">{{dialog.message}}</span>

      <div class="row" slot="body">
        <q-field 
          class="col-12"
          :label-width="4">
          <q-select :float-label="$t('ASSET')" filter v-model="form.depositName" 
          :options="assetsOpt"  :error="$v.form.depositName.$error" error-label="error" />
        </q-field>
        <q-field 
            :label-width="4"
            class="col-12"
          >
            <q-input :float-label="$t('AMOUNTS')"  @blur="$v.form.amount.$touch" 
            v-model="form.amount" type="number" :decimals="0" :error="$v.form.amount.$error" error-label="error" />
        </q-field>
        <q-field 
            v-if="dialog.form==3"
            :label-width="4"
            class="col-12"
          >
            <q-input :float-label="$t('ADDRESS')"  @blur="validateAddr" 
            v-model="form.address" :error="this.addressError" :error-label="$t('ERR_TOAST_ACCOUNT_INVALID_RECIPIENT')" />
        </q-field>
        <q-field v-if="secondSignature"
          class="col-12"
          :error-label="$t('ERR_TOAST_SECONDKEY_WRONG')"
          :error="secondPwdError"
          :label-width="2"
        >
          <q-input :float-label="$t('SECOND_PASSWORD')" v-model="form.secondPwd" type="password" @blur="validateSecondPwd" />
        </q-field>
      </div>
      <template slot="buttons" slot-scope="props">
        <q-btn flat color="primary" :label="$t('label.cancel')" @click="props.cancel" />
        <q-btn flat color="primary" :label="$t('label.ok')" @click="props.ok" />
      </template>
    </q-dialog>
    </div>
</template>

<script>
import { api, translateErrMsg } from '../utils/api'
import { toast, toastWarn } from '../utils/util'
import { createInTransfer, createInnerTransaction, check58 } from '../utils/asch'
import { required, minValue, numeric } from 'vuelidate/lib/validators'
import { secondPwdReg } from '../utils/validators'
import defaultIcon from '../assets/dapps.png'
export default {
  props: ['userObj'],
  components: {},
  data() {
    return {
      appsData: null,
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
          align: 'center'
        },
        {
          name: 'icon',
          label: this.$t('DAPP_ICON'),
          field: 'icon',
          type: 'string',
          align: 'center'
        },
        {
          label: this.$t('DAPP_NAME'),
          field: 'name',
          align: 'center'
        },
        {
          name: 'desc',
          label: this.$t('DAPP_DESCRIPTION'),
          field: 'description',
          align: 'center'
        },
        {
          label: 'ID',
          name: 'id',
          field: 'transactionId'
        },
        {
          name: 'category',
          label: this.$t('TYPE'),
          field: 'category',
          align: 'center'
        }
      ],
      modalInfoShow: false,
      row: {},

      dialogShow: false,
      dialog: {
        title: '',
        message: '',
        form: 1 // 1 deposit; 2 withDraw
      },
      dappBalances: [],
      balanceType: 0, // 0 dapp, 1 user
      form: {
        depositName: '',
        amount: null,
        address: null,
        secondPwd: ''
      },
      addressError: false,
      secondPwdError: false,
      installed: false,
      defaultIcon: defaultIcon
    }
  },
  validations: {
    form: {
      amount: {
        required,
        numeric,
        minValue: minValue(1)
      },
      depositName: {
        required
      }
    }
  },
  methods: {
    async request(props) {
      await this.getDapps(props.pagination, props.filter, this.installed)
    },
    async getDapps(pagination = {}, filter = '', installed = false) {
      this.loading = true
      if (pagination && pagination.page) this.pagination = pagination
      let limit = this.pagination.rowsPerPage
      let pageNo = this.pagination.page
      let res = {}
      if (installed) {
        res = await api.appInstalled({
          limit: limit,
          offset: (pageNo - 1) * limit
        })
      } else {
        res = await api.appList({
          limit: limit,
          offset: (pageNo - 1) * limit
        })
      }
      this.appsData = res
      // set max
      this.pagination.rowsNumber = res.count && res.count.count ? res.count.count : 0
      this.loading = false
      return res
    },
    async viewAppBanlance(row) {
      await this.getBalance(row)
      this.modalInfoShow = true
    },
    async viewMyBanlance(row) {
      await this.getBalance(row, true)
      this.modalInfoShow = true
    },
    async getBalance(row, userFlag = false) {
      let res
      if (!userFlag) {
        res = await api.appBalance({
          appId: row.transactionId
        })
        this.balanceType = 0
      } else {
        res = await api.dappMyBalance(row.transactionId, this.user.account.address)
        this.balanceType = 1
      }
      if (res.success === true) {
        let balences = res.balances.map(b => {
          // init XAS data
          if (b.currency === 'XAS') b.quantityShow = 100000000
          return b
        })
        this.dappBalances = balences
        return balences
      } else {
        translateErrMsg(this.$t, res.error)
        return []
      }
    },
    async innerTrans(row) {
      await this.getBalance(row)
      const t = this.$t
      this.form.depositName = name
      this.modalInfoShow = false
      this.dialog = {
        title: t('TRS_TYPE_TRANSFER'),
        message: t('OPERATION_REQUIRES_FEE') + '0.1 XAS',
        form: 3
      }
      this.row = row
      this.dialogShow = true
    },
    async withDraw(row) {
      await this.getBalance(row)
      const t = this.$t
      this.form.depositName = name
      this.modalInfoShow = false
      this.dialog = {
        title: t('TRS_TYPE_WITHDRAWAL'),
        message: t('OPERATION_REQUIRES_FEE') + '0.1 XAS',
        form: 2
      }
      this.row = row
      this.dialogShow = true
    },
    deposit(row) {
      const t = this.$t
      this.dialog = {
        title: t('DAPP_DEPOSIT'),
        message: t('DAPP_COIN_FEE'),
        form: 1
      }
      this.row = row
      this.dialogShow = true
    },
    async onOk() {
      this.$v.form.$touch()
      if (this.$v.form.$error || (this.secondSignature && this.secondPwdError)) {
        toastWarn('error')
        this.dialogShow = true
        return
      }
      const { transactionId } = this.row
      const assets = this.selectedAssets
      const form = this.dialog.form
      let amount = parseFloat((this.form.amount * Math.pow(10, assets.precision)).toFixed(0))
      let res, trans

      if (form === 1) {
        trans = createInTransfer(
          transactionId,
          this.form.depositName,
          amount,
          this.user.secret,
          this.form.secondPwd
        )
        res = await api.broadcastTransaction(trans)
      } else if (form === 2) {
        let type = 2 // 这里的type指的是合约标号，而非主链的交易类型
        let options = {
          fee: '10000000',
          type: type,
          args: `["${this.form.depositName}", "${amount}"]`
        }
        trans = createInnerTransaction(options, this.user.secret)
        res = await api.dappContract(trans, this.row.transactionId)
      } else if (form === 3) {
        if (this.addressError) {
          toastWarn(this.$t('ERR_RECIPIENT_ADDRESS_FORMAT'))
          return
        }
        let type = 3 // 这里的type指的是合约标号，而非主链的交易类型
        let options = {
          fee: '10000000',
          type: type,
          args: `["${this.form.depositName}", "${amount}","${this.form.address}"]`
        }
        trans = createInnerTransaction(options, this.user.secret)
        res = await api.dappContract(trans, this.row.transactionId)
      }

      if (res.success === true) {
        toast(this.$t('INF_OPERATION_SUCCEEDED'))
      } else {
        translateErrMsg(this.$t, res.error)
      }
      this.resetFrom()
    },
    onCancel() {
      this.dialogShow = false
      this.dialog = this.dialogDefault
    },
    close() {
      this.dialogShow = false
      this.row = {}
    },
    validateSecondPwd(val) {
      let isValid = this.pwdValid
      this.secondPwdError = isValid
      return isValid
    },
    resetFrom() {
      this.form = {
        depositName: '',
        amount: null
      }
      this.$v.$reset()
    },
    validateAddr() {
      let validated = check58(this.form.address)
      this.addressError = !validated
      return validated
    },
    noError(props) {
      props.value = defaultIcon
    }
  },
  async mounted() {
    if (this.user) {
      this.getDapps()
      this.$root.$emit('getAssetsList')
    }
  },
  computed: {
    user() {
      return this.userObj
    },
    secondSignature() {
      return this.user && this.user.account ? this.user.account.secondSignature : null
    },
    pwdValid() {
      return !secondPwdReg.test(this.form.secondPwd)
    },
    assets() {
      return this.user.assets
    },
    dialogDefault() {
      return {
        title: '',
        message: ''
      }
    },
    paginationDeafult() {
      return {
        page: 1,
        rowsNumber: 0,
        rowsPerPage: 10
      }
    },
    selectedAssets() {
      let depositName = this.form.depositName
      if (depositName === 'XAS') {
        return {
          precision: 10,
          name: depositName
        }
      } else {
        let obj = null
        this.user.assets.forEach(a => {
          if (a.name === depositName) obj = a
        })
        return obj
      }
    },
    assetsOpt() {
      if (this.user && this.user.assets) {
        let assets = []
        const formType = this.dialog.form
        if (formType === 1) {
          assets = [
            {
              key: 0,
              value: 'XAS',
              label: 'XAS'
            }
          ].concat(
            this.user.assets.map((item, idx) => {
              return {
                key: idx + 1,
                label: item.name,
                value: item.name
              }
            })
          )
        } else {
          assets = this.dappBalances.map((item, idx) => {
            return {
              key: idx + 1,
              label: item.currency,
              value: item.currency
            }
          })
        }

        return assets
      } else {
        return []
      }
    }
  },
  watch: {
    userObj(val) {
      if (val) {
        this.getDapps()
        if (!val.assets) this.$root.$emit('getAssetsList')
      }
    },
    pageNo(val) {
      this.getDapps()
    },
    installed(val) {
      if (val) {
        this.getDapps(null, null, true)
      }
    }
  }
}
</script>

<style lang="stylus">
</style>

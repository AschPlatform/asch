<template>
  <q-page class="tab-panel-container row ">
    <transition  
    appear
    enter-active-class="animated fadeIn"
    leave-active-class="animated fadeOut"
    mode="out-in">
      <div class="col-12 shadow-1">
        <q-table :data="assetsData?assetsData.assets:[]" :columns="columns" @request="request" :pagination.sync="pagination" 
        :loading="loading" :title="$t('MY_ASSETS')">
          
         <template slot="top-right" slot-scope="props">
            <q-btn flat round dense :icon="props.inFullscreen ? 'fullscreen_exit' : 'fullscreen'" @click="props.toggleFullscreen" />
          </template>

          <q-td slot="body-cell-opt"  slot-scope="props" :props="props">
            <div v-if="props.row.writeoff == 0">
              <q-btn @click="viewInfo(props.row)" icon="remove red eye" size="sm" flat color="primary" >
                <q-tooltip anchor="top middle" self="bottom middle" :offset="[0, 10]">{{$t('DAPP_DETAIL')}}</q-tooltip>
              </q-btn>
              <q-btn @click="getTransferParams(props)" icon="send" size="sm" flat color="primary" >
                <q-tooltip anchor="top middle" self="bottom middle" :offset="[0, 10]">{{$t('TRANSFER')}}</q-tooltip>
              </q-btn>
              <q-btn @click="publish(props.row)" icon="publish" size="sm" flat color="primary" >
                <q-tooltip anchor="top middle" self="bottom middle" :offset="[0, 10]">{{$t('TRS_TYPE_UIA_ISSUE')}}</q-tooltip>
              </q-btn>
              <q-fab flat color="orange" icon="settings" direction="right" size="sm" >
                <q-tooltip slot="tooltip" anchor="top middle" self="bottom middle"  :offset="[0, 10]" >
                  {{$t('TRS_TYPE_UIA_FLAGS')}}
                </q-tooltip>
                <q-fab-action color="primary" @click="changeModal(props.row)" icon="transform">
                  <q-tooltip anchor="top middle" self="bottom middle" :offset="[0, 10]">{{$t('CHANGE_ACL_MODAL')}}</q-tooltip>
                </q-fab-action>
                <q-fab-action color="primary" @click="addACL(props.row)" icon="add">
                  <q-tooltip anchor="top middle" self="bottom middle" :offset="[0, 10]">{{$t('label.create') + ACLStr(props.row.acl)}}</q-tooltip>
                </q-fab-action>
                <q-fab-action color="primary" @click="removeACL(props.row)" icon="remove">
                  <q-tooltip anchor="top middle" self="bottom middle" :offset="[0, 10]">{{$t('label.remove') + ACLStr(props.row.acl)}}</q-tooltip>
                </q-fab-action>
                <q-fab-action color="negative" @click="writeoff(props.row)" icon="delete">
                  <q-tooltip anchor="top middle" self="bottom middle" :offset="[0, 10]">{{$t('DELETE')}}</q-tooltip>
                </q-fab-action>
              </q-fab>
            </div>
            <div v-else>
              <q-btn @click="viewInfo(props.row)" icon="remove red eye" size="sm" flat color="primary" >
                <q-tooltip anchor="top middle" self="bottom middle" :offset="[0, 10]">{{$t('DAPP_DETAIL')}}</q-tooltip>
              </q-btn>
            </div>
          </q-td>

          <q-td slot="body-cell-allowWriteoff"  slot-scope="props" :props="props">
            {{getAssetRule(props.row)}}
          </q-td>

        </q-table>
      </div>
     
      </transition>

      <q-modal minimized no-backdrop-dismiss   v-model="modalInfoShow" content-css="padding: 20px">
        <big>{{$t('DAPP_DETAIL')}}</big>
        <table class="q-table horizontal-separator highlight loose ">
          <tbody class='info-tbody'>
            <tr v-clipboard="row.name" @success="info('copy name success...')">
              <td >{{$t('ASSET_NAME')}}</td>
              <td >{{row.name}}</td>
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
              <td >{{$t('CANCELLATION')}}</td>
              <td >{{row.writeoff?'writeoff':'normal'}}</td>
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

    <q-dialog
      v-model="dialogShow"
      prevent-close
      @ok="onOk"
      @cancel="onCancel"
    >
      <!-- This or use "title" prop on <q-dialog> -->
      <span slot="title">{{dialog.title}}</span>

      <!-- This or use "message" prop on <q-dialog> -->
      <span slot="message">{{dialog.message}}</span>

      <div slot="body">
        <div v-if="dialog.form == 2 ">
          <q-field 
            :label="$t('ISSUE_NUMBER')"
            error-label="error"
            :label-width="4"
          >
            <q-input  @blur="$v.issuerNum.$touch" v-model="form.issuerNum" error-label="error"
            type="number" :decimals="0" :error="$v.issuerNum.$error"   />
        </q-field>
        </div>
        <div v-if="dialog.form == 3">
          <q-field 
            :label="$t('TYPE')"
            :label-width="4"
          >
            <q-input disable v-model="form.type" />
        </q-field>
        <q-field 
          :label="$t('CHANGE_TO')"
            :label-width="4"
          >
            <q-input disable :value="ACLStr(row.acl ? 0 : 1)" />
        </q-field>
        </div>
        <q-field v-if="secondSignature"
          :label="$t('TRS_TYPE_SECOND_PASSWORD')"
          :error-label="$t('ERR_TOAST_SECONDKEY_WRONG')"
          :label-width="4"
        >
          <q-input v-model="secondPwd" type="password" />
        </q-field>
      </div>

      <template slot="buttons" slot-scope="props">
          <q-btn  flat color="primary" :label="$t('label.cancel')" @click="props.cancel" />
          <q-btn  flat color="primary" :label="$t('label.ok')" @click="props.ok" />
      </template>
    </q-dialog>
    </q-page>
</template>

<script>
import { api, translateErrMsg } from '../utils/api'
import { toast, toastWarn } from '../utils/util'
import { secondPwdReg } from '../utils/validators'
import { createFlags, createIssue, dealBigNumber } from '../utils/asch'
import { required, numeric, minValue } from 'vuelidate/lib/validators'

export default {
  props: ['userObj'],
  components: {},
  data() {
    return {
      assetsData: null,
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
          label: this.$t('ASSET_NAME'),
          field: 'name',
          type: 'string',
          filter: true
        },
        {
          label: this.$t('MAXIMUM'),
          field: 'maximumShow',
          sort: true,
          filter: true
        },
        {
          label: this.$t('PRECISION'),
          field: 'precision',
          classes: 'text-center',
          type: 'number',
          sort: true
        },
        {
          label: this.$t('QUANTITY'),
          field: 'quantityShow',
          filter: true,
          sort: true
        },
        {
          label: this.$t('CANCELLATION'),
          field: 'writeoff',
          align: 'center',
          format: val => {
            return val === 0 ? 'normal' : 'writeoff'
          }
        },
        {
          name: 'allowWriteoff',
          label: this.$t('ALLOW_WWB'),
          field: 'allowWriteoff',
          align: 'center'
        }
      ],
      modalInfoShow: false,
      row: {},
      secondPwd: '',
      dialogShow: false,
      dialog: {
        title: '',
        message: '',
        form: 0 // 1 writeoff ; 2 publish ; 3 setting
      },
      form: {
        issuerNum: '',
        type: 'ACL'
      }
    }
  },
  validations: {
    issuerNum: {
      required,
      numeric,
      minValue: minValue(1)
    }
  },
  methods: {
    async request(props) {
      await this.getAssets(props.pagination, props.filter)
    },
    async getAssets(pagination = {}, filter = '') {
      this.loading = true
      if (pagination.page) this.pagination = pagination
      let limit = this.pagination.rowsPerPage
      let pageNo = this.pagination.page
      let res = await api.myAssets({
        name: this.user.issuer.name,
        limit: limit,
        offset: (pageNo - 1) * limit
      })
      this.assetsData = res
      // set max
      this.pagination.rowsNumber = res.count
      this.loading = false
      return res
    },
    viewInfo(row) {
      this.row = row
      this.modalInfoShow = true
    },
    getTransferParams(cell) {
      return { name: 'transfer', params: { user: this.user, data: cell } }
    },
    getAssetRule(props) {
      return `${props.allowWriteoff === 1 ? 'Y' : 'N'}/${props.allowWhitelist === 1 ? 'Y' : 'N'}/${
        props.allowBlacklist === 1 ? 'Y' : 'N'
      }`
    },
    writeoff(row) {
      const t = this.$t
      const issuer = this.user.issuer
      const assetsName = issuer.name + '.' + row.name

      this.dialog = {
        title: t('WRITEOFF'),
        message: `${t('WRITEOFF')} ${assetsName}, ${t('CANT_ROLLBACK')}, ${t(
          'REQUIRES_FEE'
        )} 0.1 XAS`,
        form: 1
      }
      this.row = row
      this.dialogShow = true
    },
    publish(row) {
      const t = this.$t

      this.dialog = {
        title: t('TRS_TYPE_UIA_ISSUE'),
        message: `${row.name}, ${t('CANT_ROLLBACK')}, ${t('REQUIRES_FEE')} 0.1 XAS`,
        form: 2
      }
      this.row = row
      this.dialogShow = true
    },
    changeModal(row) {
      const t = this.$t
      this.dialog = {
        title: t('TRS_TYPE_UIA_FLAGS'),
        message: `${row.name} ${t('TRS_TYPE_UIA_FLAGS')}, ${t('CANT_ROLLBACK')}, ${t(
          'REQUIRES_FEE'
        )} 0.1 XAS`,
        form: 3
      }
      this.row = row
      this.dialogShow = true
    },

    addACL(row) {
      this.$router.push({ name: 'addACL', params: { user: this.user, assets: row } })
    },
    removeACL(row) {
      this.$router.push({ name: 'reduceACL', params: { user: this.user, assets: row } })
    },
    async onOk() {
      const t = this.$t
      let formType = this.dialog.form
      if (formType === 1) {
        // write off
        if (this.secondSignature && this.pwdValid) {
          toastWarn(t('ERR_TOAST_SECONDKEY_WRONG'))
        } else {
          const flagType = 2 // write off assets
          let trans = createFlags(this.row.name, flagType, 1, this.user.secret, this.secondPwd)
          let res = await api.broadcastTransaction(trans)
          if (res.success) {
            this.pagination = this.paginationDeafult
            await this.getAssets()
            toast(t('INF_OPERATION_SUCCEEDED'))
            this.close()
          } else {
            translateErrMsg(t, res.error)
            this.close()
          }
        }
      } else if (formType === 2) {
        if (this.secondSignature && this.pwdValid) {
          toastWarn(t('ERR_TOAST_SECONDKEY_WRONG'))
        } else {
          this.$v.issuerNum.$touch()
          if (this.$v.issuerNum.$error) {
          }
          let realAmount = dealBigNumber(
            parseInt(this.form.issuerNum) * Math.pow(10, this.row.precision)
          )

          let trans = createIssue(this.row.name, realAmount, this.user.secret, this.secondPwd)
          let res = await api.broadcastTransaction(trans)
          if (res.success) {
            this.pagination = this.paginationDeafult
            await this.getAssets()
            toast(t('INF_OPERATION_SUCCEEDED'))
            this.close()
          } else {
            translateErrMsg(t, res.error)
            this.close()
          }
        }
      } else if (formType === 3) {
        if (this.secondSignature && this.pwdValid) {
          toastWarn(t('ERR_TOAST_SECONDKEY_WRONG'))
        } else {
          const flagType = 1 // change black/white modal
          let trans = createFlags(
            this.row.name,
            flagType,
            this.row.acl === 0 ? 1 : 0,
            this.user.secret,
            this.secondPwd
          )
          let res = await api.broadcastTransaction(trans)
          if (res.success) {
            this.pagination = this.paginationDeafult
            await this.getAssets()
            toast(t('INF_OPERATION_SUCCEEDED'))
            this.close()
          } else {
            translateErrMsg(t, res.error)
            this.close()
          }
        }
      }
    },
    onCancel() {
      this.dialogShow = false
      this.dialog = this.dialogDefault
    },
    close() {
      this.dialogShow = false
      this.row = {}
    },
    info(msg) {
      toast(msg)
    },
    ACLStr(acl) {
      const t = this.$t
      return acl === 1 ? t('WHITELIST') : t('BLACKLIST')
    }
    // formValid(type) {
    //   let formWithPwd = this.secondSignature ? this.pwdValid : false
    //   switch (type) {
    //     case 1:
    //       return formWithPwd
    //     case 2:
    //       return this.secondSignature
    //         ? this.$v.issuerNum.$error || this.pwdValid
    //         : this.$v.issuerNum.$error
    //     case 3:
    //       return formWithPwd
    //   }
    // }
  },
  async mounted() {
    if (this.user) this.getAssets()
  },
  computed: {
    user() {
      if (this.userObj) return this.userObj
    },
    secondSignature() {
      return this.user ? this.user.account.secondSignature : null
    },
    pwdValid() {
      return !secondPwdReg.test(this.secondPwd)
    },
    dialogDefault() {
      return {
        title: '',
        message: '',
        form: 0 // 1 writeoff ; 2 publish ; 3 setting
      }
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
      if (val) this.getAssets()
      if (val.issuer) {
        this.issuer = val.issuer
      } else {
        this.$root.$emit('getIssuer', issuer => {
          if (issuer) this.issuer = issuer
        })
      }
    },
    pageNo(val) {
      this.getAssets()
    }
  }
}
</script>

<style lang="stylus">
</style>

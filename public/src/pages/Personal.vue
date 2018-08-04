<template>
  <!-- if you want automatic padding use "layout-padding" class -->
  <div class="layout-padding">
    <q-list v-if="user.account" separator>
      <q-collapsible group="info" opened icon="account circle" :label="$t('ACCOUNT_INFO')">
        <q-card>
          <q-card-title>
            {{$t('BASIC_INFO')}}
          </q-card-title>
          <q-card-main class="row col-12 card-table-container">
            <table class="q-table bordered highlight responsive ">
              <tbody class='info-tbody'>
                <tr>
                  <td>{{$t('TOTAL')+$t('BALANCE')}}</td>
                  <td>{{user.account.balance | fee}} {{' XAS'}}</td>
                </tr>
                <tr>
                  <td>{{$t('ADDRESS')}}</td>
                  <td>{{user.account.address}}</td>
                </tr>
                <tr>
                  <td>{{$t('SECOND_PASSWORD')}}</td>
                  <td>{{secondSignature?$t('ALREADY_SET'):$t('NOT_SET')}}</td>
                </tr>
                <tr>
                  <td>{{$t('POSITIONLOCK_INFO')}}</td>
                  <td>{{lockState?$t('ERR_TOAST_ACCOUNT_ALREADY_LOCKED'):$t('NOT_SET_BLOCKHEIGHT')}}</td>
                </tr>
                <tr>
                  <td>{{$t('PUBLIC_KEY')}}</td>
                  <td>{{user.account.publicKey}}</td>
                </tr>
                <tr>
                  <td>{{$t('QRCODE')}}</td>
                  <td>
                    <q-btn icon="open with" flat @click="()=>showQrcode('secret')">
                      <q-tooltip anchor="top middle" self="bottom middle" :offset="[0, 10]">{{$t('CLICK_TO_SHOW')}}</q-tooltip>
                    </q-btn>
                  </td>
                </tr>
                <tr>
                  <td>{{$t('QRCODE_ADDRESS')}}</td>
                  <td>
                    <q-btn icon="open with" flat @click="()=>showQrcode('address')">
                      <q-tooltip anchor="top middle" self="bottom middle" :offset="[0, 10]">{{$t('CLICK_TO_SHOW')}}</q-tooltip>
                    </q-btn>
                  </td>
                </tr>
              </tbody>
            </table>
          </q-card-main>
        </q-card>
      </q-collapsible>
      <q-collapsible group="info" icon="fingerprint" :label="$t('SECOND_PASSWORD')">
        <q-card>
          <q-card-title>
            {{$t('SET_SECOND_PASSWORD')}}
          </q-card-title>
          <q-card-main v-if="secondSignature || seted">
            {{$t('ALREADY_SET_TPI')}}
          </q-card-main>
          <div v-else>
            <q-card-main class="row justify-center">
              <q-field class="col-8" :label="$t('PASSWORD')" :label-width="2" :error="$v.password.$error" :error-label="$t('ERR_SECOND_PASSWORD_FORMAT')">
                <q-input @blur="$v.password.$touch" type="password" v-model="password" />
              </q-field>
              <q-field class="col-8" :label="$t('CONFIRM')" :label-width="2" :error="$v.confirmPassword.$error" :error-label="$t('ERR_TWO_INPUTS_NOT_EQUAL')">
                <q-input @blur="$v.confirmPassword.$touch" type="password" v-model="confirmPassword" />
              </q-field>
  
            </q-card-main>
            <q-card-separator />
            <q-card-main class="row justify-center">
              <q-btn class="col-3 self-lef" color="primary" flat @click="setPwd">
                {{$t('SUBMIT')}}
              </q-btn>
            </q-card-main>
          </div>
  
        </q-card>
      </q-collapsible>
      <q-collapsible group="info" icon="lock" :label="$t('TRS_TYPE_LOCK')">
        <q-card>
          <q-card-title>
            {{$t('LOCK_POSITION_TITLE')}}
          </q-card-title>
          <q-card-main v-if="lockState || locked">
            {{$t('ALREADY_SET_POSITIONLOCK')}}
          </q-card-main>
          <div v-else>
            <q-card-main class="row justify-center">
              <q-field class="col-8" :label="$t('HEIGHT')" :label-width="3" :error="lockError" :helper="tip">
                <q-input @input="validateLockHeight" type="number" v-model="lockHeight" :decimals="0" />
              </q-field>
              <q-field v-show="secondSignature" class="col-8" :label="$t('TRS_TYPE_SECOND_PASSWORD')" :error="secondPwdError" :label-width="3" :error-label="$t('ERR_TOAST_SECONDKEY_WRONG')">
                <q-input @blur="validateSecondPwd" type="password" v-model="secondPwd" />
              </q-field>
            </q-card-main>
            <q-card-separator />
            <q-card-main class="row justify-center">
              <q-btn class="col-3 " color="primary" flat @click="setLock">
                {{$t('SUBMIT')}}
              </q-btn>
            </q-card-main>
          </div>
  
        </q-card>
      </q-collapsible>
    </q-list>
    <q-dialog v-model="dialogShow" >
      <span slot="title">{{type=='secret'?$t('QRCODE'):$t('QRCODE_ADDRESS')}}</span>
      <div slot="body" class="row justify-center" @click="dialogShow=false">
        <vue-qr :text="qrValue"></vue-qr>
      </div>
    </q-dialog>
  
  </div>
</template>

<script>
import VueQr from 'vue-qr'
import { required, sameAs } from 'vuelidate/lib/validators'
import { secondPwd, secondPwdReg } from '../utils/validators'
import { toastWarn, toast, toastError } from '../utils/util'
import { signature, createLock } from '../utils/asch'
import { api, translateErrMsg } from '../utils/api'

export default {
  props: ['userObj'],
  components: {
    VueQr
  },
  data() {
    return {
      dialogShow: false,
      qrValue: '',
      type: 0,
      password: '',
      confirmPassword: '',
      seted: false,
      lockHeight: null,
      lockError: false,
      lockErrorMsg: 'error',
      secondPwd: '',
      secondPwdError: false,
      tip: this.$t('ACCOUNT_LOCK_TIP'),
      locked: false
    }
  },
  validations: {
    password: {
      required,
      secondPwd: secondPwd()
    },
    confirmPassword: {
      sameAsPassword: sameAs('password')
    }
  },
  methods: {
    async setLock() {
      if (this.lockError) {
        return
      }
      if (this.secondSignature && this.isValid) {
        toastError(this.$t('ERR_SECOND_PASSWORD_FORMAT'))
        return
      }
      let trans = createLock(this.lockHeight, this.user.secret, this.secondPwd)
      let res = await api.broadcastTransaction(trans)
      if (res.success === true) {
        console.log(res)
        toast(this.$t('INF_POSITIONLOCK_SET_SUCCESS'))
        this.locked = true
      } else {
        console.log(res)
        translateErrMsg(this.$t, res.error)
      }
    },
    async setPwd() {
      this.$v.$touch()
      const isValid = this.$v.$error
      if (isValid) {
        toastWarn(this.$t('ERR_SECOND_PASSWORD_FORMAT'))
      } else {
        let trans = signature(this.user.secret, this.password)
        let res = await api.broadcastTransaction(trans)
        if (res.success === true) {
          toast(this.$t('INF_SECND_PASSWORD_SET_SUCCESS'))
          this.seted = true
        } else {
          translateErrMsg(this.$t, res.error)
        }
      }
    },
    showQrcode(type) {
      this.type = type
      if (type === 'secret') {
        this.qrValue = this.user.secret
      } else {
        this.qrValue = this.user.account.address
      }
      this.dialogShow = true
    },
    validateSecondPwd(val) {
      let isValid = this.pwdValid
      this.secondPwdError = isValid
      return isValid
    },
    validateLockHeight(val) {
      const t = this.$t
      if (!val) {
        return
      }
      const lockHeight = Number(val)
      const diffHeight = lockHeight - this.user.latestBlock.height
      let sec = diffHeight * 10
      let min = 0
      let hou = 0
      let day = 0
      const ab = t('FRAGIL_ABOUT')
      const d = t('FRAGIL_DAY')
      const h = t('FRAGIL_HOUR')
      const m = t('FRAGIL_MIN')
      const s = t('FRAGIL_SEC')
      const r = t('FRAGIL_RANGE')
      const u = t('FRAGIL_UNLOCK')
      if (diffHeight > 0 && diffHeight < 10000000) {
        if (sec > 60) {
          min = sec / 60
          sec = sec % 60
          if (min > 60) {
            hou = min / 60
            min = min % 60
            if (hou > 24) {
              day = hou / 24
              hou = hou % 24
            }
          }
        }
        this.lockError = false
        this.tip =
          ab + parseInt(day) + d + parseInt(hou) + h + parseInt(min) + m + parseInt(sec) + s + u
      } else {
        this.lockError = true
        this.tip = r
      }
    }
  },
  async mounted() {
    this.userInfo = this.$route.params.user
    console.log(this.$route.params.user)
  },
  computed: {
    user() {
      return this.userObj
    },
    secondSignature() {
      return this.user ? this.user.account.secondSignature : null
    },
    lockState() {
      if (this.user && this.user.account) {
        return this.user.account.lockHeight > this.user.latestBlock.height
      }
    },
    pwdValid() {
      return !secondPwdReg.test(this.secondPwd)
    }
  },
  watch: {
    userObj(val) {
    },
    pageNo(val) {}
  }
}
</script>

<style>

</style>

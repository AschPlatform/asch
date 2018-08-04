<template>
  <q-card v-if="user" class="row col shadow-1">
    <q-card-title>
      {{user.issuer?$t('PUBLISHER_ALREADY_REGISTERED'):$t('REGISTERED_PUBLISHER')}}
      <div slot="subtitle"> </div>
    </q-card-title>
    <q-card-main class="row col-12 justify-center ">
      <q-field class="col-8" :label="$t('ASSET_NAME')" :label-width="3" :error="$v.assets.name.$error" :error-label="$t('ERR_ASSET_NAME_3_TO_6_CAPITAL_LETTERS')" :count="6">
        <q-input @blur="$v.assets.name.$touch" upper-case v-model="assets.name" clearable />
      </q-field>
      <q-field class="col-8" :label="$t('DESCRIBE')" :label-width="3" :error="$v.assets.desc.$error" :row="6" :count="500" :error-label="$t('ERR_MISSING_ASSET_DESCRIPTION')">
        <q-input @blur="$v.assets.desc.$touch" type="textarea" v-model="assets.desc" clearable />
      </q-field>
      <q-field class="col-8" :label="$t('TOPLIMIT')" :label-width="3" :error="$v.assets.maximum.$error"  :error-label="$t('ERR_ASSET_TOPLIMIT_NOT_CORRECT')">
        <q-input @blur="$v.assets.maximum.$touch" v-model="assets.maximum" :decimals="0" type="number" />
      </q-field>
      <q-field class="col-8" :label="$t('PRECISION')" :helper="$t('ERR_ASSET_PRECISION_MUST_BE_INTEGER_BETWEEN_0_16')" :error="$v.assets.precision.$error" :label-width="3"  :error-label="$t('ERR_ASSET_PRECISION_NOT_CORRECT')">
        <q-input @blur="$v.assets.precision.$touch" v-model="assets.precision" :decimals="0" :step="1"  type="number"/>
      </q-field>
      <q-field class="col-8" :label="$t('STRATEGY')" :helper="$t('STRATEGY_WARNING')"  :label-width="3" >
        <q-input v-model="assets.strategy"  type="textarea"  :row="6" />
      </q-field>
      <q-field class="col-8" :label="$t('ALLOW_WRITEOFF')"  :label-width="3" >
        <q-radio v-model="assets.allowWriteoff" :val="0" color="faded" :label="notAllow" />
      <q-radio v-model="assets.allowWriteoff" :val="1" color="positive" :label="allow" style="margin-left: 10px" />
      </q-field>
      <q-field class="col-8" :label="$t('ALLOW_WHITELIST')"  :label-width="3"  >
        <q-radio v-model="assets.allowWhitelist" :val="0" color="faded" :label="notAllow" />
        <q-radio v-model="assets.allowWhitelist" :val="1" color="positive" :label="allow" style="margin-left: 10px" />
      </q-field>
      <q-field class="col-8" :label="$t('ALLOW_BLACKLIST')"  :label-width="3" >
        <q-radio v-model="assets.allowBlacklist" :val="0" color="faded" :label="notAllow" />
      <q-radio v-model="assets.allowBlacklist" :val="1" color="positive" :label="allow" style="margin-left: 10px" />
      </q-field>
      <q-field v-show="secondSignature" class="col-8" :label="$t('TRS_TYPE_SECOND_PASSWORD')" :error="secondPwdError" :label-width="3"  :error-label="$t('ERR_TOAST_SECONDKEY_WRONG')">
        <q-input @blur="validateSecondPwd" type="password" v-model="secondPwd"  />
      </q-field>
    </q-card-main>
    <q-card-separator />
    <q-card-main class="row col-12 justify-center ">
      <div class="row col-10 justify-end">
        <q-btn :loading="loading" big class="col-auto " color="primary" @click="submit">
          {{$t('SUBMIT')}}
        </q-btn>
      </div>
    </q-card-main>
  </q-card>
</template>

<script>
import {
  QField,
  QInput,
  QCard,
  QIcon,
  QCardTitle,
  QCardSeparator,
  QCardMain,
  QBtn,
  QRadio
} from 'quasar'
import { api, translateErrMsg } from '../utils/api'
import { required, maxLength, between, numeric, minValue } from 'vuelidate/lib/validators'
import { assetName, secondPwdReg } from '../utils/validators'
import { confirm, toastError, toast } from '../utils/util'
import { createAsset, dealBigNumber } from '../utils/asch'

export default {
  props: ['userObj'],
  components: {
    QField,
    QInput,
    QCard,
    QIcon,
    QCardTitle,
    QCardSeparator,
    QCardMain,
    QBtn,
    QRadio
  },
  data() {
    return {
      assets: {
        name: '',
        desc: '',
        maximum: '',
        precision: '',
        strategy: '',
        allowWriteoff: 0,
        allowWhitelist: 0,
        allowBlacklist: 0
      },
      secondPwd: '',
      secondPwdError: false,
      issuer: null,
      loading: false
    }
  },
  validations: {
    // TODO figure out why vuelidate can not bind vue 'this' in rule config
    assets: {
      name: {
        required,
        assetName: assetName()
      },
      desc: {
        required,
        maxLength: maxLength(500)
      },
      maximum: {
        required,
        numeric,
        minValue: minValue(1)
      },
      precision: {
        required,
        numeric,
        between: between(0, 16)
      },
      allowWriteoff: {
        required
      },
      allowWhitelist: {
        required
      },
      allowBlacklist: {
        required
      }
    }
  },
  methods: {
    submit(e) {
      this.loading = true
      const t = this.$t
      if (!this.user.issuer) {
        toastError(t('ERR_NO_PUBLISHER_REGISTERED_YET'))
        this.done()
        return
      }
      let pwdValid = false
      if (this.secondSignature) {
        pwdValid = this.validateSecondPwd()
      }
      this.$v.assets.$touch()
      const isValid = this.$v.assets.$invalid
      if (isValid || pwdValid) {
        this.done()
      } else {
        const { secret, issuer } = this.user
        const {
          name,
          desc,
          maximum,
          precision,
          strategy,
          allowWriteoff,
          allowWhitelist,
          allowBlacklist
        } = this.assets

        let assetName = issuer.name + '.' + name
        let realMaximum = dealBigNumber(parseInt(maximum) * Math.pow(10, precision))

        confirm(
          {
            title: t('CONFIRM'),
            message: t('OPERATION_REQUIRES_FEE') + '500 XAS',
            cancel: t('CANCEL'),
            confirm: t('CONFIRM')
          },
          () => {
            this.done()
          },
          async () => {
            let trans = createAsset(
              String(assetName),
              String(desc),
              String(realMaximum),
              precision,
              strategy,
              allowWriteoff,
              allowWhitelist,
              allowBlacklist,
              secret,
              this.secondPwd
            )
            let res = await api.broadcastTransaction(trans)
            if (res.success) {
              this.assets = this.default
              this.$v.assets.$reset()
              this.secondPwd = ''
              toast('succes...')
              this.done()
            } else {
              translateErrMsg(this.$t, res.error)
              this.done()
            }
          }
        )
      }
    },
    validateSecondPwd(val) {
      let isValid = this.pwdValid
      this.secondPwdError = isValid
      return isValid
    },
    done() {
      this.loading = false
    }
  },
  computed: {
    user() {
      return this.userObj
    },
    secondSignature() {
      return this.user ? this.user.account.secondSignature : null
    },
    allow() {
      return this.$t('ALLOW')
    },
    notAllow() {
      return this.$t('NOT_ALLOW')
    },
    default() {
      return {
        name: '',
        desc: '',
        maximum: '',
        precision: '',
        strategy: '',
        writeoff: '',
        allowWriteoff: 0,
        allowWhitelist: 0,
        allowBlacklist: 0
      }
    },
    pwdValid() {
      return !secondPwdReg.test(this.secondPwd)
    }
  },
  mounted() {
    this.$root.$emit('getIssuer', issuer => {
      this.issuer = issuer
    })
  },
  watch: {
    userObj(val) {
      if (val.issuer) {
        this.issuer = val.issuer
      } else {
        this.$root.$emit('getIssuer', issuer => {
          if (issuer) this.issuer = issuer
        })
      }
    }
  }
}
</script>

<style>

</style>

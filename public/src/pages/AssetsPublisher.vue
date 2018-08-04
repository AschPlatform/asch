<template>
  <q-card v-if="user" class="row col shadow-1">
    <q-card-title>
      {{user.issuer?$t('PUBLISHER_ALREADY_REGISTERED'):$t('ERR_NO_PUBLISHER_REGISTERED_YET')}}
      <div slot="subtitle"> </div>
    </q-card-title>
    <q-card-main  class="row col-12 justify-center ">
      <q-field class="col-8" :label="$t('DAPP_NAME')" :label-width="2" :error="$v.issuer.name.$error" error-label="error" :count="15">
        <q-input @blur="$v.issuer.name.$touch" v-model="issuer.name" clearable :disable="!!user.issuer" />
      </q-field>
      <q-field class="col-8" :label="$t('DESCRIBE')" :label-width="2" :error="$v.issuer.desc.$error" :row="5" :count="500" error-label="error">
        <q-input @blur="$v.issuer.desc.$touch" type="textarea" v-model="issuer.desc" clearable  :disable="!!user.issuer"/>
      </q-field>
      <q-field v-show="!user.issuer && secondSignature" class="col-8" :label="$t('TRS_TYPE_SECOND_PASSWORD')" :error="secondPwdError" :label-width="2"  :error-label="$t('ERR_TOAST_SECONDKEY_WRONG')">
        <q-input @blur="validateSecondPwd" type="password" v-model="secondPwd"  />
      </q-field>
    </q-card-main>
    <q-card-separator />
    <q-card-main v-if="!user.issuer" class="row col-12 justify-center ">
      <div class="row col-10 justify-end">
        <q-btn :loading="loading" big class="col-auto " color="primary" @click="submit">
          {{$t('SUBMIT')}}
        </q-btn>
      </div>
    </q-card-main>
  </q-card>
</template>

<script>
import { QField, QInput, QCard, QIcon, QCardTitle, QCardSeparator, QCardMain, QBtn } from 'quasar'
import { api, translateErrMsg } from '../utils/api'
import { required, maxLength } from 'vuelidate/lib/validators'
import { confirm, toastWarn } from '../utils/util'
import { createIssuer } from '../utils/asch'
import { secondPwdReg } from '../utils/validators'

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
    QBtn
  },
  data() {
    return {
      issuer: {
        name: '',
        desc: ''
      },
      secondPwd: null,
      secondPwdError: false,
      loading: false
    }
  },
  validations: {
    // TODO figure out why vuelidate can not bind vue 'this' in rule config
    issuer: {
      name: {
        required,
        maxLength: maxLength(15)
      },
      desc: {
        required,
        maxLength: maxLength(500)
      }
    }
  },
  methods: {
    submit(e) {
      this.loading = true
      const t = this.$t
      this.$v.issuer.$touch()
      const isValid = this.$v.issuer.$error
      let pwdValid = false

      if (this.secondSignature) {
        pwdValid = this.pwdValid
        this.secondPwdError = pwdValid
      }

      if (isValid || pwdValid) {
        toastWarn(t('ERR_PUBLISHER_NOT_EMPTY'))
        this.done()
      } else {
        this.secondPwdError = false
        const { secret } = this.user
        const { name, desc } = this.issuer
        confirm(
          {
            title: t('CONFIRM'),
            message: t('OPERATION_REQUIRES_FEE') + '100 XAS',
            cancel: t('CANCEL'),
            confirm: t('CONFIRM')
          },
          () => {
            this.done()
          },
          async () => {
            let trans = createIssuer(name, desc, secret, this.secondPwd)
            let res = await api.broadcastTransaction(trans)
            if (res.success) {
              this.user.issuer = true
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
    pwdValid() {
      return !secondPwdReg.test(this.secondPwd)
    }
  },
  mounted() {
    if (this.userObj.issuer) this.issuer = this.userObj.issuer
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

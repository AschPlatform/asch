<template>
  <div class="col-12">
    <div v-if="showTitle">
      <big>{{$t('TRS_TYPE_TRANSFER')}}</big><br/>
      <span>{{$t('PAY_TIP')}}</span>
    </div>
    <div v-if="user && user.account" >
      <q-field class="col-12">
        <q-input v-if="currency" disable :float-label="$t('DAPP_CATEGORY')" v-model="currency" />
      </q-field>
      <q-field class="col-12">
        <q-input v-if="authorAddr" :float-label="$t('RECIPIENT')" @blur="$v.form.receiver.$touch" v-model="authorAddr"  />
        <q-input v-else :float-label="$t('RECIPIENT')" @blur="$v.form.receiver.$touch" v-model="form.receiver" :error="$v.form.receiver.$error" :error-label="$t('ERR_RECIPIENT_ADDRESS_FORMAT')" />
      </q-field>
      <q-field class="col-12">
        <q-input :float-label="$t('AMOUNTS')" @blur="$v.form.amount.$touch" v-model="form.amount" type="number" :decimals="1" :error="$v.form.amount.$error" :error-label="$t('ERR_AMOUNT_INVALID')" />
      </q-field>
  
      <q-field v-if="secondSignature" class="col-12">
        <q-input :float-label="$t('SECOND_PASSWORD')" v-model="secondPwd" type="password" @blur="$v.secondPwd.$touch" :error-label="$t('ERR_TOAST_SECONDKEY_WRONG')" :error="$v.secondPwd.$error" />
      </q-field>
      <q-field class="col-12">
        <q-input disable :float-label="$t('FEES')" v-model="form.fee" />
      </q-field>
      <q-field class="col-12">
        <q-input :float-label="$t('REMARK')" :helper="$t('REMARK_TIP')+'0 ~ 255'" @blur="$v.form.remark.$touch" v-model="form.remark" :error="$v.form.remark.$error" :error-label="$t('ERR_INVALID_REMARK')" />
      </q-field>
      <div class="panelBtn">
        <slot name="btns" :send="send" :cancel="cancel" />
      </div>
    </div>
  </div>
</template>

<script>
import { api, translateErrMsg } from '../utils/api'
import { toastWarn, toast } from '../utils/util'
import { createTransaction, createTransfer } from '../utils/asch'
import { address, secondPwd } from '../utils/validators'
import { required, maxLength, minValue } from 'vuelidate/lib/validators'

export default {
  props: ['user', 'assets', 'showTitle', 'address'],
  data() {
    return {
      form: {
        from: '',
        receiver: '',
        amount: '',
        fee: '0.1',
        remark: '',
        precision: 8
      },
      secondPwd: ''
    }
  },
  validations: {
    form: {
      amount: {
        required,
        minValue: minValue(1)
      },
      receiver: {
        required,
        address: address()
      },
      remark: {
        maxLength: maxLength(255)
      }
    },
    secondPwd: {
      secondPwd: secondPwd()
    }
  },
  methods: {
    async send() {
      this.$v.form.$touch()
      let invlaidPwd = false
      if (this.secondSignature) {
        this.$v.secondPwd.$touch()
        invlaidPwd = this.$v.secondPwd.$error
      }
      if (invlaidPwd || this.$v.form.$error) {
        return false
      }
      if (this.form.receiver === this.user.account.address) {
        toastWarn(this.$t('ERR_RECIPIENT_EQUAL_SENDER'))
        return false
      }
      let trans
      let { amount, receiver, remark, precision } = this.form
      amount = (amount * Math.pow(10, precision)).toFixed(0)
      if (!this.currency) {
        trans = createTransaction(
          receiver,
          Number(amount),
          remark,
          this.user.secret,
          this.secondPwd
        )
      } else {
        trans = createTransfer(
          this.currency,
          amount,
          receiver,
          remark,
          this.user.secret,
          this.secondPwd
        )
      }
      let res = await api.broadcastTransaction(trans)
      if (res.success === true) {
        toast(this.$t('INF_TRANSFER_SUCCESS'))
        this.resetForm()
        return true
      } else {
        translateErrMsg(this.$t, res.error)
        return false
      }
    },
    cancel() {
      this.resetForm()
    },
    resetForm() {
      this.form = {
        currency: '',
        receiver: '',
        amount: '',
        secondPwd: '',
        fee: '0.1',
        remark: ''
      }
      this.$v.form.$reset()
      this.$v.secondPwd.$reset()
    }
  },
  mounted() {},
  computed: {
    secondSignature() {
      return this.user ? this.user.account.secondSignature : null
    },
    currency() {
      if (this.assets && this.assets.currency) {
        return this.assets.currency
      } else {
        return ''
      }
    },
    authorAddr() {
      return this.address
    }
  }
}
</script>

<style lang="stylus">
.panelBtn {
  margin-top: 30px;
}
</style>

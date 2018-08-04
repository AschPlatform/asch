<template>
  <q-modal minimized no-backdrop-dismiss v-model="show" content-css="padding: 20px">
    <big>{{$t('DAPP_DETAIL')}}</big>
    <table class="q-table horizontal-separator highlight loose ">
      <tbody class='info-tbody'>
        <tr disable v-clipboard="account.address" @success="info('copy address success...')">
          <td>{{$t('ADDRESS')}}</td>
          <td>{{account.address}}</td>
        </tr>
        <tr v-clipboard="account.publicKey" @success="info('copy publicKey success...')">
          <td>{{$t('PUBLIC_KEY')}}</td>
          <td>{{account.publicKey}}</td>
        </tr>
        <tr id='detail-amount' v-clipboard="account.balance" @success="info('copy balance success...')">
          <td>{{$t('BALANCE')}}</td>
          <td>{{account.balance | fee}}</td>
        </tr>
      </tbody>
    </table>
    <br/>
    <q-btn color="primary" @click="close" :label="$t('label.close')" />
  </q-modal>
</template>

<script>
export default {
  props: ['show', 'account'],
  data() {
    return {}
  },
  methods: {
    close() {
      this.$emit('close')
    }
  },
  computed: {},
  mounted() {}
}
</script>

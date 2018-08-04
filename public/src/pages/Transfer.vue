<template>
  <q-card class="row col shadow-1">
    <q-card-title>
      {{$t('TRS_TYPE_TRANSFER')}}
      <div slot="subtitle">{{$t('PAY_TIP')}}</div>
    </q-card-title>
    <q-card-main class="row col-12 justify-center ">
      <trans-panel  :user="user" >
        <div slot="btns" slot-scope="props">
        <q-btn big  color="primary" @click="props.send" :label="$t('SEND')" />
        </div>
      </trans-panel>
    </q-card-main>
  </q-card>
</template>

<script>
import TransPanel from '../components/TransPanel'

export default {
  props: ['userObj'],
  components: {
    TransPanel
  },
  data() {
    return {}
  },
  methods: {},
  computed: {
    user() {
      return this.userObj
    }
  },
  mounted() {},
  watch: {}
}
</script>

<style>

</style>

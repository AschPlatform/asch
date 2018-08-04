<template>
  <q-table 
    class="col-12"
    ref="table"
    color="primary"
    :title="$t('OPERATION_RECORD')"
    :data="recordData.transactions"
    :columns="columns"
    :filter="filter"
    row-key="id"
    :pagination.sync="pagination"
    @request="request"
    :loading="loading"
  >
    <q-td slot="body-cell-content"  slot-scope="props" :props="props">
        {{props.row | assetsRecord}}
      </q-td>
  </q-table>
</template>

<script>
import { api } from '../utils/api'

export default {
  props: ['userObj'],
  data() {
    return {
      recordData: {
        transactions: []
      },
      pagination: {
        page: 1,
        rowsNumber: 0,
        rowsPerPage: 20
      },
      columns: [
        {
          name: 'content',
          required: true,
          label: this.$t('OPERATION'),
          align: 'left',
          field: 'id'
        }
      ],
      loading: false,
      filter: ''
    }
  },
  methods: {
    async request(props) {
      this.loading = true
      this.pagination = props.pagination
      this.filter = props.filter
      await this.getRecord()
      this.loading = false
    },
    async getRecord() {
      this.loading = true
      let limit = this.pagination.rowsPerPage
      let pageNo = this.pagination.page
      let res = await api.myAssetTransactions({
        address: this.user.account.address,
        orderBy: 't_timestamp:desc',
        limit: limit,
        offset: (pageNo - 1) * limit
      })
      this.recordData = res
      // set max
      this.pagination.rowsNumber = res.count
      this.loading = false
      return res
    }
  },
  computed: {
    user() {
      return this.userObj
    }
  },
  mounted() {
    if (this.user) this.getRecord()
  },
  watch: {
    page(val) {
      this.getRecord()
    },
    userObj(val) {
      if (val) this.getRecord()
    }
  }
}
</script>

<style>

</style>

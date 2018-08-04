<template>
  <q-card v-if="this.assets" class="row col shadow-1">
    <q-card-title class="col-12">
      {{$t('UPDATE_ACL')}}
      <div slot="subtitle">{{ACLStr(assets.acl)}}</div>
      <div slot="right" class="row items-center" >
       <a class="text-primary link-cursor " @click="goBack" >{{$t('CANCEL')}}</a>
      </div>
    </q-card-title>
    <q-card-main class="row col-12 justify-center ">
  
      <q-field v-if="editType==1" class="col-12"  :label-width="2" :row="10">
        <q-chips-input :float-label="$t('ADD_LIST')" v-model="list" :placeholder="$t('ADDRESS')" add-icon="add" />
      </q-field>
  
      <q-field v-if="editType==1"  class="col-12" :label="$t('CURRENT_LIST')" :label-width="1">
        <q-option-group readonly inline type="checkbox" color="secondary" v-model="selectList" :options="listOpts" />
      </q-field>
       <q-table v-if="editType==0"
        class="col-12"
        ref="table"
        color="primary"
        :title="$t('CURRENT_LIST')"
        :data="listOpts"
        :columns="columns"
        :filter="filter"
        selection="multiple"
        :selected.sync="selected"
        row-key="value"
        :pagination.sync="pagination"
        @request="request"
        :loading="loading"
      >
        <template slot="top-right" slot-scope="props">
          <q-btn flat round :loading="loading" icon="refresh" @click="refresh"/> 
        </template>
      </q-table>
      <q-field class="col-8" label=" ">
        <q-pagination class="col-8" v-model="pagination.page" input :min="1" :max="pagination.pageCount" />
      </q-field>
      <q-field v-show="secondSignature" class="col-12" :label="$t('TRS_TYPE_SECOND_PASSWORD')" :label-width="2">
        <q-input type="password" v-model="secondPwd" />
      </q-field>
    </q-card-main>
    <q-card-separator />
    <q-card-main class="row col-12 justify-center ">
      <div class="row col-12 justify-end">
        <q-btn big class="col-auto " color="primary" @click="validateForm">
          {{$t('SUBMIT')}}
        </q-btn>
      </div>
    </q-card-main>

    <q-dialog v-model="dialogShow" prevent-close @ok="onOk" @cancel="onCancel">
      <!-- This or use "message" prop on <q-dialog> -->
      <span slot="message">{{$t('OPERATION_REQUIRES_FEE')+'0.2 XAS'}}</span>
  
      <template slot="buttons" slot-scope="props">
              <q-btn  flat color="primary" :label="$t('label.cancel')" @click="props.cancel" />
              <q-btn  flat color="primary" :label="$t('label.ok')" @click="props.ok" />
      </template>
    </q-dialog>
  </q-card>
</template>

<script>
import { createAcl } from '../utils/asch'
import { api, translateErrMsg } from '../utils/api'
import { toast, toastError } from '../utils/util'
import { secondPwdReg } from '../utils/validators'

export default {
  props: ['userObj'],
  data() {
    return {
      assets: null,
      aclData: null,
      secondPwd: '',
      list: [],
      dialogShow: false,
      selectList: [],
      pagination: {
        page: 1,
        rowsNumber: 0,
        rowsPerPage: 20
      },
      columns: [
        {
          name: 'address',
          required: true,
          label: this.$t('ADDRESS'),
          align: 'center',
          field: 'value'
        }
      ],
      filter: '',
      selected: [],
      loading: false
    }
  },
  methods: {
    refresh() {
      this.pagination.page = 1
      this.getAcl()
    },
    async request(props) {
      this.loading = true
      this.pagination = props.pagination
      this.filter = props.filter
      await this.getAcl()
      this.loading = false
    },
    async getAcl() {
      this.loading = true
      let limit = this.pagination.rowsPerPage
      let pageNo = this.pagination.page
      let res = await api.assetAcl({
        name: this.assets.name,
        flag: this.assets.acl,
        limit: limit,
        offset: (pageNo - 1) * limit
      })
      this.aclData = res
      // set max
      this.pagination.rowsNumber = res.count
      this.pagination.pageCount = Math.ceil(res.count / limit)
      this.loading = false
      return res
    },
    validateForm() {
      if (this.editType === 1) {
        if (this.list.length === 0) {
          toastError('Addresses empty... ')
          return
        }
      } else {
        if (this.selected.length === 0) {
          toastError('Selected addresses empty... ')
          return
        }
      }
      this.dialogShow = true
    },
    ACLStr(acl) {
      const t = this.$t
      return acl === 1 ? t('WHITELIST') : t('BLACKLIST')
    },
    reduceAcl() {},
    async onOk() {
      const { name, acl } = this.assets
      const opt = this.editType === 1 ? '+' : '-'
      let list = []
      if (this.editType === 1) {
        list = this.list
      } else {
        list = this.selected.map(add => add.value)
      }
      // let list = this.list.split('\n') || []
      const trans = createAcl(name, opt, acl, list, this.user.secret, this.secondPwd)
      let res = await api.broadcastTransaction(trans)
      if (res.success) {
        toast(this.$t('INF_OPERATION_SUCCEEDED'))
        this.goBack()
      } else {
        translateErrMsg(this.$t, res.error)
      }
    },
    onCancel() {
      this.resetForm()
    },
    goBack() {
      this.$router.go(-1)
    },
    resetForm() {
      this.list = []
      this.secondPwd = ''
      this.dialogShow = false
      this.selectList = []
    }
  },
  mounted() {
    const assets = this.$route.params.assets
    if (!assets) {
      this.$router.go(-1)
      return
    }
    this.assets = assets
    if (this.editType === 2) {
    }
  },
  computed: {
    user() {
      return this.userObj
    },
    secondSignature() {
      return this.user ? this.user.account.secondSignature : null
    },
    editType() {
      let type = this.$route.name === 'addACL' ? 1 : 0
      this.getAcl()
      return type // 1 add ACL; 0 reduce ACL
    },
    pwdValid() {
      return !secondPwdReg.test(this.secondPwd)
    },
    listOpts() {
      if (!!this.aclData && this.aclData.list.length) {
        return this.aclData.list.map(item => {
          return {
            label: item.address,
            value: item.address
          }
        })
      } else {
        return []
      }
    }
  },
  watch: {
    page() {
      this.getAcl()
    }
  }
}
</script>

<style>

</style>

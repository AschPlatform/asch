<template>
  <q-page padding class="flex flex-center">
    <q-card inline class="q-ma-sm col-6">
      <q-item>
        <q-item-side :avatar="avatar" />
        <q-item-main>
          <q-item-tile label>Caos</q-item-tile>
          <q-item-tile sublabel>Javascript developer at Asch</q-item-tile>
        </q-item-main>
      </q-item>
      <q-card-actions>
        <q-btn class="col-auto" color="positive" flat @click="vote">Vote</q-btn>
        <q-btn class="col-auto" color="secondary" flat @click="star">Star</q-btn>
        <q-btn class="col-auto" color="orange" flat @click="donate">Donate</q-btn>
        <q-btn class="col-auto" color="orange" flat @click="contact">Contact</q-btn>
      </q-card-actions>
      <q-card-separator/>
      
    </q-card>
    <q-card>
      <q-card-main>
        <q-timeline color="primary">
      <q-timeline-entry heading>
        Road Map
      </q-timeline-entry>
  
      <q-timeline-entry title="Start project" subtitle="2018-01" side="right" icon="lightbulb outline">
        <div>
          Plan to build a DApps platform and make Asch wallet more easy to use .
        </div>
      </q-timeline-entry>
      <q-timeline-entry title="Enhance wallet UI" subtitle="2018-02" side="left" icon="battery charging full">
        <div>
          Use new framework develop Asch wallet that can run on PC and mobile platform, open source on github.
        </div>
      </q-timeline-entry>
      <q-timeline-entry title="Release beta" subtitle="2018-03-13" side="right" icon="flag">
        <div>
          Web wallet Release, start beta test, and use channel plugin to collect bugs.
        </div>
      </q-timeline-entry>
      <q-timeline-entry title="New DApp new feature" subtitle="now" side="left" color="orange" icon="bug report">
        <div>
          New Dapp is developing, frontend page will build in new wallet, before release the new Dapp, Asch wallet will 
        </div>
      </q-timeline-entry>
      <q-timeline-entry title="..." subtitle="future" side="right" color="positive" icon="mood">
        <div>
        </div>
      </q-timeline-entry>
    </q-timeline>
      </q-card-main>
    </q-card>
  </q-page>
</template>

<style>

</style>

<script>
import avatar from '../assets/caos.jpg'
import { api, translateErrMsg } from '../utils/api'
import { createVote } from '../utils/asch'
import { toast } from '../utils/util'
import {
  QCard,
  QCardTitle,
  QCardMain,
  QCardSeparator,
  QCardActions,
  QItemTile,
  openURL,
  QTimeline,
  QTimelineEntry
} from 'quasar'
export default {
  props: ['userObj'],
  components: {
    QCard,
    QCardTitle,
    QCardMain,
    QCardSeparator,
    QCardActions,
    QItemTile,
    QTimeline,
    QTimelineEntry
  },
  data() {
    return {
      avatar: avatar,
      secondPwd: '',
      delegate: null,
      channelShow: false,
      publicKey: '4394d8bd88ccaf972ede118934728590a8f31d3390372850464b11d930c31766',
      address: 'A6JYoorqrmdrPMzFtUoR6ADmjUVNswiK6v'
    }
  },
  methods: {
    vote() {
      let dialogConf = {
        title: 'Thanks',
        message: `Vote me directly or vote with others ? \n peer name: ${
          this.delegate.username
        } at rank ${this.delegate.rate}`,
        ok: 'Vote',
        cancel: 'Later'
      }
      if (this.secondSignature) {
        dialogConf.prompt = {
          model: '',
          type: 'password'
        }
      }
      this.$q
        .dialog(dialogConf)
        .then(async data => {
          let trans = createVote(['+' + this.publicKey], this.user.secret, data)
          let res = await api.broadcastTransaction(trans)
          if (res.success === true) {
            toast(this.$t('INF_VOTE_SUCCESS') + ' Thx ;-)')
          } else {
            translateErrMsg(this.$t, res.error + ' ;-(')
          }
        })
        .catch(() => {})
    },
    star() {
      openURL('https://github.com/CaosBad/asch-wallet')
    },
    donate() {
      this.$root.$emit('openTransactionDialog', {}, this.address)
    },
    async getForgingStatus() {
      let res = await api.blockforging({
        publicKey: this.publicKey
      })
      if (res.success === true) {
        this.delegate = res.delegate
      }
      return res
    },
    contact() {
      this.channelShow = !this.channelShow
    }
  },
  mounted() {
    this.getForgingStatus()
  },
  computed: {
    user() {
      return this.userObj
    },
    secondSignature() {
      return this.user ? this.user.account.secondSignature : null
    }
  },
  watch: {
    channelShow(val) {
      if (val) {
        window.CHPlugin.show()
      } else {
        window.CHPlugin.hide()
      }
    }
  }
}
</script>

<style lang="stylus">
</style>


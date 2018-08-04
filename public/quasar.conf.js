// Configuration for your app

module.exports = ctx => {
  return {
    plugins: ['i18n', 'axios', 'vuelidate', 'clipboards', 'filters', 'tools', 'channel'],
    css: ['app.styl'],
    extras: [
      ctx.theme.mat ? 'roboto-font' : null,
      'material-icons'
      // 'ionicons',
      // 'mdi',
      // 'fontawesome'
    ],
    supportIE: true,
    vendor: {
      add: [],
      remove: []
    },
    build: {
      scopeHoisting: true,
      vueRouterMode: 'history',
      distDir: 'dist',
      // gzip: true,
      // analyze: true,
      // extractCSS: false,
      // useNotifier: false,
      extendWebpack(cfg) {
        cfg.module.rules.push({
          enforce: 'pre',
          test: /\.(js|vue)$/,
          loader: 'eslint-loader',
          exclude: /(node_modules|quasar)/
        })
      }
    },
    devServer: {
      // https: true,
      // port: 8080,
      open: true // opens browser window automatically
    },
    // framework: 'all' --- includes everything; for dev only!
    framework: {
      components: [
        'QCard',
        'QCardMain',
        'QCardSeparator',
        'QIcon',
        'QCardTitle',
        'QBtn',
        'QTooltip',
        'QPopover',
        'QPagination',
        'QInnerLoading',
        'QToolbar',
        'QToolbarTitle',
        'QList',
        'QListHeader',
        'QItem',
        'QItemSide',
        'QItemMain',
        'QLayout',
        'QPageContainer',
        'QPage',
        'QLayoutHeader',
        'QLayoutFooter',
        'QLayoutDrawer',
        'QTable',
        'QTd',
        'QSearch',
        'QTableColumns',
        'QModal',
        'QFab',
        'QFabAction',
        'QDialog',
        'QField',
        'QInput',
        'QChipsInput',
        'QOptionGroup',
        'QCollapsible',
        'QSelect',
        'QToggle',
        'QAjaxBar'
      ],
      directives: ['Ripple'],
      plugins: ['Notify', 'SessionStorage', 'Dialog']
    },
    // animations: 'all' --- includes all animations
    animations: ['fadeIn', 'fadeOut'],
    pwa: {
      cacheExt:
        'js,html,css,ttf,eot,otf,woff,woff2,json,svg,gif,jpg,jpeg,png,wav,ogg,webm,flac,aac,mp4,mp3',
      manifest: {
        // name: 'Quasar App',
        // short_name: 'Quasar-PWA',
        // description: 'Best PWA App in town!',
        display: 'standalone',
        orientation: 'portrait',
        background_color: '#ffffff',
        theme_color: '#027be3',
        icons: [
          {
            src: 'statics/icons/icon-128x128.png',
            sizes: '128x128',
            type: 'image/png'
          },
          {
            src: 'statics/icons/icon-192x192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'statics/icons/icon-256x256.png',
            sizes: '256x256',
            type: 'image/png'
          },
          {
            src: 'statics/icons/icon-384x384.png',
            sizes: '384x384',
            type: 'image/png'
          },
          {
            src: 'statics/icons/icon-512x512.png',
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      }
    },
    cordova: {
      // id: 'org.cordova.quasar.app'
    },
    electron: {
      extendWebpack(cfg) {
        // do something with cfg
      },
      packager: {
        // OS X / Mac App Store
        // appBundleId: '',
        // appCategoryType: '',
        // osxSign: '',
        // protocol: 'myapp://path',
        // Window only
        // win32metadata: { ... }
      }
    },

    // leave this here for Quasar CLI
    starterKit: '1.0.0-beta.4'
  }
}

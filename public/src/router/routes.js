function load(component, path = false) {
  let comp = path
    ? () => import(`src/layouts/${component}.vue`)
    : () => import(`src/pages/${component}.vue`)
  return comp
}

export default [
  { path: '/login', component: load('login', true), name: 'login' },
  {
    path: '/',
    component: load('main', true),
    name: 'main',
    children: [
      {
        path: 'home',
        name: 'home',
        component: load('Home')
      },
      {
        path: 'assets',
        name: 'assets',
        component: load('Assets'),
        children: [
          {
            path: 'account',
            name: 'account',
            component: load('AssetsAccount')
          },
          {
            path: 'publisher',
            name: 'publisher',
            component: load('AssetsPublisher')
          },
          {
            path: 'addAssets',
            name: 'addAssets',
            component: load('AssetsRegister')
          },
          {
            path: 'list',
            name: 'list',
            component: load('AssetsPublished')
          },
          {
            path: 'records',
            name: 'records',
            component: load('AssetsRecords')
          }
        ]
      },
      {
        path: 'addACL',
        name: 'addACL',
        component: load('ACLEdit')
      },
      {
        path: 'reduceACL',
        name: 'reduceACL',
        component: load('ACLEdit')
      },
      {
        path: 'personal',
        name: 'personal',
        component: load('Personal')
      },
      {
        path: 'forging',
        name: 'forging',
        component: load('Forging')
      },
      {
        path: 'blocks',
        name: 'blocks',
        component: load('Blocks')
      },
      {
        path: 'vote',
        name: 'vote',
        component: load('Vote'),
        children: [
          {
            path: 'delegates',
            name: 'delegates',
            component: load('Delegates')
          },
          {
            path: 'voteRecords',
            name: 'voteRecords',
            component: load('VotesRecords')
          },
          {
            path: 'supporters',
            name: 'supporters',
            component: load('Supporters')
          }
        ]
      },
      {
        path: 'transfer',
        name: 'transfer',
        component: load('Transfer')
      },
      {
        path: 'peers',
        name: 'peers',
        component: load('Peers')
      },
      {
        path: 'applications',
        name: 'applications',
        component: load('Applications')
      },
      {
        path: 'about',
        name: 'about',
        component: load('About')
      }
    ]
  },
  // Always leave this last one
  { path: '*', component: load('Error404') } // Not found
]

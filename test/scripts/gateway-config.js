module.exports = {
  registerProposal: {
    title: 'Register bitcoinbash gateway',
    desc: 'This is a proposal about register bitcoincash gateway',
    topic: 'gateway_register',
    content: {
      name: 'bitcoincash',
      desc: 'bitcoincash gateway description',
      updateInterval: 86400,
      minimumMembers: 3,
      currency: {
        symbol: 'BCH',
        desc: 'BCH description',
        precision: 8,
      },
    },
  },
  validators: [
    {
      name: 'bchv1',
      innerAccount: {
        address: 'A28yFDa4vYUFafNDK9fZwBK3qhH2xYxxrz',
        secret: 'cabbage outdoor extend memory ketchup powder turtle trial interest ticket anchor season',
        publicKey: 'e15298801c30ca7ae6ca6033285b2eaf70896d70322988dc52c28ad230c7b16e',
      },
      outerAccount: {
        privateKey: 'cR41t5PH83okfAGzxqwCdW17SXXoUS2rjx5D9iSAcJ1SwrwvSWdS',
        publicKey: '03f87ea49b8d8a9d5391608306597c5908562ea6db54102fe4d9f1ba3dfb9c65d5',
        address: 'n2EcM17GyMSpJ1zFTx5cU8JRezH4VahD6A',
      },
    },
    {
      name: 'bchv2',
      innerAccount: {
        address: 'AMAwe1qp6qFpGkdJ2nugovXvtRzedprvqh',
        secret: 'shed fault water sick swift avoid choice speed evil door promote bonus',
        publicKey: 'a31e118d4c56d00639fda9c64c4bb60fe93d76f6b316c9b6de06461ada820297',
      },
      outerAccount: {
        privateKey: 'cTEGMdtezHq7jwkDwAHTL4M4RWDoRcrVpR1ufq3NTFtgttNESVhc',
        publicKey: '031ce8508999872438b0c59818aae6f0586716fd2d8f73451938704cd7b7ced200',
        address: 'n1Cu9qXuwNYY5GhFbCMGxWm6N839pSGvzE',
      },
    },
    {
      name: 'bchv3',
      innerAccount: {
        address: 'ABcur7keRpcZC2A1Y7qe2BV5VtKaYHt8ax',
        secret: 'inflict maple fun mercy amazing skin color cliff piano soda order one',
        publicKey: '474c4b06f66053405336a543f6a09fd97399ad792e9c83c79d334d9c4e35b918',
      },
      outerAccount: {
        privateKey: 'cNj2WNTCE4KS9jvbD8fb2CYhqreAWZ1wzkLNAe3ejMujxkXn5vja',
        publicKey: '0343cfcaa8799cdab9447e3146d631aea9acde7ac1d9d410ab4a71f44ebc0bd085',
        address: 'mme7SuKvrzRonHAZQRgkUtrfEYvrSzEbdb',
      },
    },
  ],
  initProposal: {
    title: 'Init bitcoincash gateway validators',
    desc: 'This is a proposal about init bitcoincash gateway',
    topic: 'gateway_init',
    content: {
      gateway: 'bitcoincash',
      members: [
        'A28yFDa4vYUFafNDK9fZwBK3qhH2xYxxrz',
        'AMAwe1qp6qFpGkdJ2nugovXvtRzedprvqh',
        'ABcur7keRpcZC2A1Y7qe2BV5VtKaYHt8ax',
      ],
    },
  },
  gatewayAccounts: [
    {
      address: 'A2obdyBVznxr15Xg7Bd4ua9MxTbjvL7RY8',
      secret: 'call lottery rack still erase that butter increase lamp system place fee',
      publicKey: '2867ff518caa6b8eb06ea92638e6589551f89de40bf041a8f67fa922de01ce1c',
    },
    {
      address: 'AGeWUoQL32J8U7BBhrpA1jDk9FXYsezD3P',
      secret: 'clump error priority veteran opinion recycle perfect throw taxi ramp large design',
      publicKey: 'd50b473dfca1c61cc24a539fbd2b41a9612885aa9d3c5d5ca16e1381ee4bfbab',
    },
  ],
}

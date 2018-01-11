if (!window.Translations) window.Translations = {};

window.Translations['en-us'] = {
  //PREV_PAGE: '上一页',
  //NEXT_PAGE: '下一页',

  //DAPP_ICON: 'Icon',
  //DAPP_DOWNLOAD: 'Download',
  //DAPP_LIST: 'Applications',
  //DAPP_INSTALL_LIST: 'Installed',
  
  // common
  PREV_PAGE: 'Prev',
  NEXT_PAGE: 'Next',

  TOTAL: 'Total',
  HEIGHT: 'Height',
  DATE: 'Date',
  PRODUCER: 'Producer',
  TRANSACTIONS: 'Transaction',
  AMOUNTS: 'Amount',
  FEES: 'Fee',
  REWARDS: 'Reward',
  TYPE: 'Type',
  SENDER: 'Sender',
  RECIPIENT: 'Recipient',
  SECOND_PASSWORD: 'Second Secret',
  REMARK: 'Remark',
  REMARK_TIP: 'Size range from:',
  

  // transaction type filter
  TRS_TYPE_TRANSFER: 'Transfer',
  TRS_TYPE_SECOND_PASSWORD: 'Second Secret',
  TRS_TYPE_DELEGATE: 'Delegate',
  TRS_TYPE_VOTE: 'Vote',
  TRS_TYPE_MULTISIGNATURE: 'Multiple Signature',
  TRS_TYPE_DAPP: 'Register Application',
  TRS_TYPE_DEPOSIT: 'Deposit',
  TRS_TYPE_WITHDRAWAL: 'Withdraw',
  TRS_TYPE_STORAGE: 'Storage',
  TRS_TYPE_UIA_ISSUER: 'Register Issuer',
  TRS_TYPE_UIA_ASSET: 'Register Asset',
  TRS_TYPE_UIA_FLAGS: 'Asset Flags',
  TRS_TYPE_UIA_ACL: 'Asset Acl',
  TRS_TYPE_UIA_ISSUE: 'Asset Issue',
  TRS_TYPE_UIA_TRANSFER: 'Asset Transfer',
  TRS_TYPE_LOCK: 'Position Lock',
 

  // application
  DAPP_ICON: 'Icon',
  DAPP_NAME: 'Name',
  DAPP_DESCRIPTION: 'Description',
  DAPP_CATEGORY: 'Type',
  DAPP_SOURCE_CODE: 'Source Code',
  DAPP_DOWNLOAD: 'Download',
  DAPP_LIST: 'Applications',
  DAPP_INSTALL_LIST: 'Installed',
  DAPP_TRANSACTION_RECORD: 'Transaction Record',
  DAPP_DEPOSIT: 'Deposit',
  DAPP_BANLANCE_DETAIL: 'Balance Detail',
  DAPP_DETAIL: 'Detail',
  DAPP_BILLION: ' Billion',
  DAPP_MILLION: ' Million',
  // dapp category filter
  DAPP_CATEGORY_COMMON: 'General',
  DAPP_CATEGORY_BUSINESS: 'Business',
  DAPP_CATEGORY_SOCIAL: 'Social',
  DAPP_CATEGORY_EDUCATION: 'Education',
  DAPP_CATEGORY_ENTERTAINMENT: 'Entertainment',
  DAPP_CATEGORY_NEWS: 'News',
  DAPP_CATEGORY_LIFE: 'Life',
  DAPP_CATEGORY_UTILITIES: 'Utilities',
  DAPP_CATEGORY_GAMES: 'Games',

  // blockchain browser
  LATEST_BLOCK: 'Latest Block',
  INPUT_SEARCH_CONTENT: 'type the searching content',

  // block forging
  DELEGATE_INFO: 'Delegate Information',
  DELEGATE_REGISTER: 'Register Delegate',
  FORGING_ENABLE: 'Enabled',
  FORGING_DISABLE: 'Disabled',
  TOTAL_EARNINGS: 'Total Revenue',
  RANKING: 'Ranking',
  PRODUCTIVITY: 'Productivity',
  APPROVAL: 'Approval Rate',
  PRODUCED_BLOCKS: 'Produced Blocks',

  // header
  HOME: 'Home',
  PERSONAL: 'My Account',
  APPLICATIONS: 'Applications',
  FORGING: 'Block Forging',
  BLOCKS: 'Block Listing',
  VOTE: 'Vote',
  TRANSFER: 'Transfer',
  PEERS: 'Peers',
  ASSET: 'Asset',

  // home
  BALANCE: 'Balance',
  LATEST_BLOCK_HEIGHT: 'Latest Block Height',
  VERSION_INFO: 'Version',
  MY_TRSACTIONS: 'My Transactions',

  // login
  INPUT_PASSWORD: 'Type the master secret',
  KEEP_SESSION: 'Keep Login',
  LOGIN: 'Login',
  NEW_ACCOUNT: 'New Account',
  STEP: 'Step',
  CREATE_MASTER_PASSWORD: 'Create Master Secret',
  NEW_PASSWORD: 'New Master Secret',
  NEW_PWD_TIP_1: 'System has already generated a new secure secret, you need to re-type this secret in the next step to confirm.',
  NEXT_STEP: 'Next Step',
  SAVE_PASSWORD: 'Save Master Secret',
  CONFIRM_PASSWORD: 'Confirm master secret',
  INPUT_PASSWORD_AGAIN: 'Please re-type your master secret',
  NEW_PWD_TIP_2: 'Make sure you have saved your master secret in a safe place. If you lost it or forget it, your account will not be available and you will lost all your XAS.',
  CONFIRM: 'Confirm',
  CANCEL: 'Cancel',

  // transfer/pay
  SEND: 'Send',
  ALREADY_LOCKED: 'The transaction is rejected due to the account lock.',
  PAY_TIP: 'Please make sure you send XAS to the correct address. This operation cannot be cancelled.',

  // peers
  PEER_LIST: 'Peer List',
  OPERATING_SYSTEM: 'OS',
  VERSION: 'Version',
  // ASSET: '资产'
  REGISTERED_PUBLISHER:'Registered Publisher',
  REGISTERED_ASSETS:'Registered Assets',
  MY_ASSETS:'My Issued Assets',
  VALUE:'Value',
  ISSUE_NUMBER:'Issue Number',
  OPERATION_RECORD:'Operation Record',
  ASSET_NAME:'Asset Name',
  ACCESS_CONTROL:'Access Control',
  ASSET_PROFILE:'Asset Profile',
  MAXIMUM:'Maximum',
  CANCELLATION:'Cancellation',
  PRECISION:'Precision',
  QUANTITY:'Quantity',
  OPERATION:'Operation',
  DESCRIBE:'Describe',
  TOPLIMIT:'Top Limit',
  ACCURACY:'Accuracy',
  STRATEGY:'Strategy',
  CURRENT_MODE:'Current Mode',
  ADD_LIST:'Add List',
  CURRENT_LIST:'Current List',
  UPDATE_ACL:'Update ACL',
  PUBLISHER_ALREADY_REGISTERED: 'You have already registered this publisher',
  NO_ASSET_RELATED_INFORMATION: 'No asset related information',
  STRATEGY_WARNING: 'If you do not know how to use it, do not arbitrarily set this field',
  // personal
  ACCOUNT_INFO: 'Account Info',
  ACCOUNT_LOCK_TIP: 'Unlock after the blockheight reach this number',
  LOCK_POSITION: 'Lock Position',
  ACCOUNT_TYPE_HINT: 'How many blocks?',
  ACCOUNT_TYPE2_HINT: 'Type your second password',
  LOCK_POSITION_TITLE: 'Set Position Lock',
  QUIT: 'Quit',
  BASIC_INFO: 'General Information',
  ADDRESS: 'Address',
  PUBLIC_KEY: 'Public Key',
  ALREADY_SET_TPI: 'You have already set the second secret.',
  ALREADY_SET_POSITIONLOCK: 'You have already set the block height.',
  SET_SECOND_PASSWORD: 'Set the second secret',
  PASSWORD_RULE_TIP: 'Second secret must be from 8 to 16 alphanumeric characters',
  INPUT_AGAIN: 'Enter Again',
  PASSWORD: 'Secret',
  SUBMIT_SECOND_PASSWORD_TIP: 'Make sure you have saved your second secret in a safe place. If you lost it, you will not be able to recover your assets in Asch system. You will be charged in XAS when you reset the second password.',
  SUBMIT: 'Submit',
  ALREADY_SET: 'Already Set',
  NOT_SET: 'Not set yet',
  NOT_SET_BLOCKHEIGHT: 'Not lock your height yet',
  NOT_SET_ALREADYUNBLOCK: 'Already unlocked',
  POSITIONLOCK_INFO: 'Lock status',

  // vote
  DELETE: 'Delete',
  DELEGATE_LIST: 'Delegate List',
  VOTE_RECORD: 'Vote Record',
  MY_VOTERS: 'My Voters',
  DELEGATE: 'Delegate',
  PRODUCED_NUMBER: 'Number of produced blocks',
  USERNAME: 'User Name',
  WEIGHT: 'Weight',
  TOTAL_PEOPLES: 'Totally {{count}} people',

  // model - account detail
  ACCOUNT_DETAIL: 'Account Detail',

  // model - delegate register
  REGISTER_DELEGATE: 'Register as Delegate',
  DELEGATE_NAME: 'Delegate\'s Name',
  INPUT_DELEGATE_NAME: 'Please type the delegate name',
  DELEGATE_NAME_RULE_TIP: 'Name must be at least 8 alphanumeric characters.',
  REGISTER: 'Register',
  NEED_PAY: 'Payment Required',

  // model - block detail
  BLOCK_DETAIL: 'Block Detail',
  TIME: 'Time',
  PREVIOUS_BLOCK: 'Previous Block',
  TRANSACTIONS_COUNT: 'Transaction Count',
  TOTAL_AMOUNTS: 'Total Amount',
  PAYLOAD_HASH: 'Payload Hash',
  PRODUCER_PUBKEY: 'Producer Public Key',

  // model - transaction detail/dealinfo
  TRANSACTION_INFO: 'Transaction Inforamtion',
  CONFIRMATIONS: 'Confirmation Count',

  // model - delete vote
  DELETE_VOTE_TITLE: 'Delete vote for delegate',
  DELETE_VOTE_TIP: 'You can delete vote for up to 33 delegates at a time.',

  // model - vote
  VOTE_TITLE: 'Vote for delegate',
  VOTE_TIP: 'Please confirm your vote. You can choose up to 33 people in one vote.',

  // toast errors
  ERR_INPUT_PASSWORD: 'Please input secret',
  ERR_VIOLATE_BIP39: 'The password format does not comply with BIP39 safety regulations',
  ERR_SERVER_ERROR: 'Server error !',
  ERR_PASSWORD_NOT_EQUAL: 'The master password you entered is not consistent',
  ERR_DELEGATE_NAME_EMPTY: 'Delegate name should not empty',
  ERR_DELEGATE_NAME_ADDRESS: 'Delegate name should not be address',
  ERR_DELEGATE_NAME_FORMAT: 'Incorrect delegate name format',
  ERR_SECOND_PASSWORD_FORMAT: 'The secondary password input format is incorrect',
  ERR_NO_RECIPIENT_ADDRESS: 'You must enter the receiving address',
  ERR_RECIPIENT_ADDRESS_FORMAT: 'Receiving address format is incorrect',
  ERR_RECIPIENT_EQUAL_SENDER: 'Receiving address and send address can not be the same',
  ERR_AMOUNT_INVALID: 'Send amount incorrectly entered',
  ERR_BALANCE_NOT_ENOUGH: 'Insufficient balance',
  ERR_NO_SECND_PASSWORD: 'You must enter the secondary password',
  ERR_TWO_INPUTS_NOT_EQUAL: 'The two inputs are not equal',
  ERR_PASSWORD_INVALID_FORMAT: 'Incorrect password format',
  ERR_AT_LEAST_SELECT_ONE_DELEGATE: 'Please select at least one delegate',
  ERR_DELETE_NO_MORE_THAN_33: 'Remove up to 33 delegates at a time',
  ERR_VOTE_NO_MORE_THAN_33: 'Vote for up to 33 candidates at a time',
  ERR_POSITIONLOCK_EMPTY: 'Please type in',
  ERR_POSITIONLOCK_NOT_NUM: 'Please confirm the number you typed',
  ERR_INVALID_REMARK: 'Ensure your remark is right',
  ERR_NO_BALANCE: 'No balance, Please Deposit',
  ERR_NO_DEPOSIT_COIN: 'No choose coin, Please Choose',
  ERR_PUBLISHER_NOT_EMPTY: 'You must enter the publishers name and description',
  ERR_NO_PUBLISHER_REGISTERED_YET: 'You have not registered a publisher yet',
  ERR_ASSET_NAME_3_TO_6_CAPITAL_LETTERS: 'Please enter 3-6 capital letters for the asset name',
  ERR_MISSING_ASSET_DESCRIPTION: 'Please enter an asset description',
  ERR_ASSET_TOPLIMIT_NOT_CORRECT: 'The top limit you entered is not correct',
  ERR_ASSET_PRECISION_NOT_CORRECT: 'The precision for the asset you entered is not correct',
  ERR_ASSET_PRECISION_MUST_BE_INTEGER_BETWEEN_0_16: 'The asset precision must be an integer between 0 and 16',
  // toast error was bound here
  ERR_TOAST_SECONDKEY_WRONG: 'Your second password is wrong',
  ERR_TOAST_TRANSACTION_AMOUNT_WRONG: 'Transaction amount wrong',
  ERR_TOAST_ASSET_NOTEXIST: 'Asset not exist',
  ERR_TOAST_ASSET_INSUFFICIENT: 'Asset amount not enought',
  ERR_TOAST_VOTE_LIMIT: 'Only less then 33 calenders are required',
  ERR_TOAST_ACCOUNT_ALREADY_LOCKED: 'Already locked',
  ERR_TOAST_ACCOUNT_INVALID_RECIPIENT: 'Wrong recipent address',
  ERR_TOAST_ACCOUNT_INVALID_TIMESTAMP: 'There is something wrong with your local time',

  // toast info
  INF_REGISTER_SUCCESS: 'Register success !',
  INF_DELETE_SUCCESS: 'Delete success !',
  INF_TRANSFER_SUCCESS: 'Transfer success !',
  INF_OPERATION_SUCCEEDED: 'Operation succeeded!',
  INF_VOTE_SUCCESS: 'Vote success !',
  INF_SECND_PASSWORD_SET_SUCCESS: 'Second secret set success !',
  INF_POSITIONLOCK_SET_SUCCESS: 'Set the position lock successfully !',

  // dialog
  OPERATION_REQUIRES_FEE: 'This operation requires a fee of',

  ALLOW_WWB: 'Allow Writeoff/Whitelist/Blacklist',
  ALLOW_WRITEOFF: 'Allow Writeoff',
  ALLOW_WHITELIST: 'Allow Whitelist',
  ALLOW_BLACKLIST: 'Allow Blacklist',
  ALLOW: 'Allow',
  NOT_ALLOW: 'Not Allow',

  // Fragil set
  FRAGIL_PRE: 'Account will be unlocked when the block height ',
  FRAGIL_LAT: ' has reached',
  FRAGIL_ABOUT: 'In about ',
  FRAGIL_DAY: ' Day ',
  FRAGIL_HOUR: ' Hour ',
  FRAGIL_MIN: ' Minute ',
  FRAGIL_SEC: ' Second to unlock',
  FRAGIL_INPUT: 'Lock height is not valid',
  FRAGIL_RANGE: 'The lock time should range from 1 to 10 000 000 block intervals',
  FRAGIL_UNLOCK: '',

  //deposit
  DEPOSIT_COIN_TYPE: 'Choose Coin Type',
  DEPOSIT_AMOUNT: 'Deposit Amount',
  DEPOSIT_FEES: 'Deposit Fees',
  DEPOSIT_SUCCESS: 'Deposit Success',

  DAPP_SUPPORT_COIN: 'Support Coin',
  DAPP_COIN_TOTAL_AMOUNT: 'Total Amount',
  DAPP_COIN_CURRENT_QUANTITY: 'Quantity',
  DAPP_COIN_BALANCE: 'DAPP Balance',
  DAPP_COIN_FEE: 'Fee: 0.1 XAS',


  // adjusting time
  ADJUST_TIME_YOURSELF: 'You should adjust system time by hand',
  ADJUST_TIME: 'We are adjusting time',

  // qrcode
  QRCODE: 'QRCode for secret',
  QRCODE_ADDRESS: 'QRCode for address',
  CLICK_TO_SHOW: 'Click to show',
  QRCODE_CLOSE: 'Click to close'
};
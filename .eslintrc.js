module.exports = {
  extends: ["airbnb-base"],
  env: {
    browser: true,
    mocha: true,
    node: true
  },
  rules: {
    semi: [2, "never"],
    "no-console": "off",
    "no-undef": 0,
    "no-new": 0,
    "no-alert": "off",
    "no-plusplus": "off",
    "no-restricted-syntax": 0,
    "no-await-in-loop": 0,
    "import/no-dynamic-require": 0,
    "global-require": 0,
    "default-case": "off",
    "prefer-destructuring": 0,
    "no-continue": 0,
    "no-param-reassign": 0
  }
};

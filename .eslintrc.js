module.exports = {
  extends: ["airbnb-base"],
  env: {
    browser: true,
    mocha: true
  },
  plugins: ["prettier"],
  rules: {
    "no-console": "off",
    "no-alert": "off",
    "no-plusplus": "off",
    "default-case": "off",
    "no-param-reassign": [
      "error",
      {
        props: false
      }
    ],
    "prettier/prettier": [
      "error",
      {
        singleQuote: true,
        tabWidth: 2,
        semi: false
      }
    ]
  }
};

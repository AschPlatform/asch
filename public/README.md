# Asch Wallet

## Development Dependencies

- nodejs
- npm
- bower (npm install bower -g)
- gulp (npm install gulp  -g)
- browserify (npm install browserify -g)

## Environment

- Linux

## Build

```
npm install
npm run build  // (just in case)
```

### Realtime build for local dev

```
sudo apt install ruby-sass
gulp serve
```

Then access localhost:8080 to debug the ui with static mock http interface

### Build for testnet

```
gulp build-test
```

### Build for mainnet

```
gulp build-main
```

## Notice (THIS BLOCK KEEP UPDATING)

TIME: Pull form this category before 1/17 may need delete node_modules and reinstall to make it function well

```bash
rm -rf node_modules/
npm install
```

####or
```bash
npm install bignumber.js
npm install
```

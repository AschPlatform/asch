# Asch Wallet

## Development Dependencies

- nodejs
- npm
- yarn (npm install yarn -g)
- gulp (npm install gulp  -g)
- browserify (npm install browserify -g)

## Environment

- Linux

## Build

```
yarn install
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

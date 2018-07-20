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

```bash
yarn install
```

### Realtime build for local development

```bash
sudo apt install ruby-sass
gulp serve
```
Then access localhost:8080 to debug the ui with static mock http interface

### Build for localnet

```bash
gulp build-local
```

### Build for testnet

```bash
gulp build-test
```

### Build for mainnet

```bash
gulp build-main
```

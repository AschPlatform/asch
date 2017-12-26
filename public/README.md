# Asch frontend

## Development dependency

- nodejs
- npm
- bower
- gulp

## Environment Needed

- Linux

## Install dependency

```
bower install
npm install
```

## Build

### Browserify

```
npm run build
```

### Realtime build for local dev

```
sudo apt install ruby-sass
gulp serve
# or
npm start serve
```

Then access localhost:8080 to debug the ui with statc mock http interface

### Build for testnet

```
gulp build-test
```

### Build for mainnet

```
gulp build-main
# or
npm start build-main
```
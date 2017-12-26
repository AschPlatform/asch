# angular-qr v0.2.0 [![Build Status](https://travis-ci.org/janantala/angular-qr.png?branch=master)](https://travis-ci.org/janantala/angular-qr)

QR code generator for AngularJS

### Demo

Check out http://janantala.github.io/angular-qr/demo/

# Requirements

- AngularJS v 1.0+
- [qrcode.js](https://github.com/janantala/qrcode) (`bower install qrcode` is installed with angular-qr as dependecy)

# Usage

We use [bower](http://twitter.github.com/bower/) for dependency management. Add

```json
dependencies: {
    "angular-qr": "latest"
}
```

To your `bower.json` file. Then run

    bower install

This will copy the angular-qr files into your `bower_components` folder, along with its dependencies. Load the script files in your application:

```html
<script type="text/javascript" src="bower_components/angular/angular.js"></script>
<script type="text/javascript" src="bower_components/qrcode/lib/qrcode.min.js"></script>
<script type="text/javascript" src="bower_components/angular-qr/angular-qr.min.js"></script>
```

Add the **ja.qr** module as a dependency to your application module:

```js
var myAppModule = angular.module('MyApp', ['ja.qr']);
```

## Directive    

```js
$scope.string = 'YOUR TEXT TO ENCODE';
```

```html
<qr text="string"></qr>
```

```html
<qr type-number="8" correction-level="'M'" size="200" input-mode="'ALPHA_NUM'" text="string" image="true"></qr>
```

### Required attributes

#### text
Your text to encode from variable in the scope. If you want to encode text directly you need to escape it `text="'YOUR TEXT TO ENCODE'"`.

### Optional attributes

#### type-number
- 1-40
- default value: `0` = minimal required version

#### correction-level
- `L` - Low
- `M` - Medium (default)
- `Q` - Quartile
- `H` - High
 
#### size
Size in pixels
- default value: 250

#### input-mode
- `NUMBER`: *0, 1, 2, 3, 4, 5, 6, 7, 8, 9*
- `ALPHA_NUM`: *0–9, A–Z (upper-case only), space, $, %, *, +, -, ., /, :*
- `8bit`: *[ISO 8859-1](http://en.wikipedia.org/wiki/ISO_8859-1)*
- default value: minimal required input mode based on input text

### image
- If you want to render qr code into image element set this attribute to `true`.

# Contributing

Contributions are welcome. Please make a pull request against canary branch and do not bump versions. Also include tests.

# Testing

We use karma and jshint to ensure the quality of the code. The easiest way to run these checks is to use grunt:

    npm install -g grunt-cli
    npm install
    bower install
    grunt

The karma task will try to open Chrome as a browser in which to run the tests. Make sure this is available or change the configuration in `test/test.config.js` 


# License

The MIT License

Copyright (c) 2014 [Jan Antala](http://www.janantala.com)

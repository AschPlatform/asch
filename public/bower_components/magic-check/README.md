# Magic-check
Beautify Radio and Checkbox with pure CSS.

### Demo

[Demo](http://forsigner.com/magic-check)

### Install
- bower: `bower install --save magic-check`
- npm: `npm install --save magic-check`

### Usage

```html
<link rel="stylesheet" href="bower_components/magic-check/css/magic-check.css">
```

**Checkbox**

```html
<div>
  <input class="magic-checkbox" type="checkbox" name="layout" id="1">
  <label for="1">Normal</label>
</div>

<div>
  <input class="magic-checkbox" type="checkbox" name="layout" id="2" checked="checked">
  <label for="2">Checked</label>
</div>

<div>
  <input class="magic-checkbox" type="checkbox" name="layout" id="3" disabled="disabled">
  <label for="3">
    Disabled
  </label>
</div>

<div>
  <input class="magic-checkbox" type="checkbox" name="layout" id="4" checked disabled="disabled">
  <label for="4">Checked && Disabled</label>
</div>
```

**Radio**

```html
<div>
  <input class="magic-radio" type="radio" name="radio" id="11">
  <label for="11">Normal</label>
</div>

<div>
  <input class="magic-radio" type="radio" name="radio" id="22" checked>
  <label for="22">Checked</label>
</div>

<div>
  <input class="magic-radio" type="radio" id="33" disabled="disabled">
  <label for="33">Disabled</label>
</div>

<div>
  <input class="magic-radio" type="radio" id="44" disabled="disabled" checked>
  <label for="44">Checked && Disabled</label>
</div>
```

### Browser compatibility

- Chrome
- Firefox
- Safari
- Opera
- IE9 && IE9+


### License

  [MIT](LICENSE)

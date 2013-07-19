# Vulcan

### Concatenate a set of Web Components into one file

>Named for the [Vulcanization](http://en.wikipedia.org/wiki/Vulcanization) process that turns polymers into more durable
materials.

## Getting Started
- Install the node dependencies with `npm install`
  - Depends on [cheerio](https://github.com/MatthewMueller/cheerio) and [nopt](https://github.com/isaacs/nopt)
- Give some input html files with the `--input` or `-i` flags
  - Input html should have `<link rel="import">` tags
- Specify an output html file with `--output` or `-o`
  - Defaults to `output.html` in the current directory
- URL paths are adjusted for the new output location automatically (execpt ones set in Javascript)
- Once finished, link the final output html into your app page with `<link rel="import">`.

## Example

Say we have three html files: `index.html`, `x-app.html`, and `x-dep.html`.

index.html:

```html
<!DOCTYPE html>
<link rel="import" href="app.html">
<x-app></x-app>
```

app.html:

```html
<link rel="import" href="path/to/x-dep.html">
<polymer-element name="x-app">
  <template>
    <x-dep></x-dep>
  </template>
  <script>Polymer('x-app')</script>
</polymer-element>
```

x-dep.html:

```html
<polymer-element name="x-dep">
  <template>
    <img src="x-dep-icon.jpg">
  </template>
  <script>
    Polymer('x-dep');
  </script>
</polymer-element>
```

Running vulcan on `index.html`, and specifying `build.html` as the output:

    node vulcan.js -i index.html -o build.html

Will result in `build.html` that appears as so:

```html
<polymer-element name="x-dep" assetpath="path/to/">
  <template>
    <img src="path/to/x-dep-icon.jpg">
  </template>
  <script>
    Polymer('x-dep');
  </script>
</polymer-element>
<polymer-element name="x-app" assetpath="">
  <template>
    <x-dep></x-dep>
  </template>
  <script>
    Polymer('x-app');
  </script>
</polymer-element>
```

To use this, make `build.html` the only import in `index.html`:

```html
<!DOCTYPE html>
<link rel="import" href="build.html">
<x-app></x-app>
```

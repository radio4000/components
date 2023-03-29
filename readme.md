[![Publish Package to npm](https://github.com/radio4000/components/actions/workflows/publish-to-npm-registry.yml/badge.svg)](https://github.com/radio4000/components/actions/workflows/publish-to-npm-registry.yml)

# Web components for Radio4000

These components can be inserted in the HTML of any web pages, and are made to interact with [Radio4000](https://radio4000.com) through the use of its
[@radio4000/sdk](https://github.com/radio4000/sdk), which talks to [@radio4000/supabase](https://github.com/radio4000/supabase).

- [View examples of all components](https://radio4000.github.io/components/examples/)

## Usage 

Depending on whether you have a build system or not, you can either import the module from NPM, from a CDN or download it locally.

All methods are available on the imported `sdk` module.

### With build system and NPM

```js
import sdk from '@radio4000/components'
// use any <r4-component*> in your templates
// use sdk methods as you please, ready to go
```

### With browser via CDN

```html
<script type="module">
  import from 'https://cdn.jsdelivr.net/npm/@radio4000/components/dist/index.min.js'
  // use any <r4-*> component in your HTML
</script>
```

## Development

The components are in the `./src` folder. Inside `./examples` you'll find demos of all components.

If you'd like to help out, clone the repository, install dependencies and start the local server.

```bash
git clone git@github.com:radio4000/components.git radio4000-components
cd radio4000-components
npm install
npm run dev
```

The local server will build `src/index.js` to `./index.js` while the server is running.

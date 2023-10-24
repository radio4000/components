[![Publish Package to npm](https://github.com/radio4000/components/actions/workflows/publish-to-npm-registry.yml/badge.svg)](https://github.com/radio4000/components/actions/workflows/publish-to-npm-registry.yml)

# Web components for Radio4000

These components can be inserted in the HTML of any web pages, and are made to interact with [Radio4000](https://radio4000.com) through the use of its
[@radio4000/sdk](https://github.com/radio4000/sdk), which talks to [@radio4000/supabase](https://github.com/radio4000/supabase).

- [View examples of all components](https://radio4000.github.io/components/examples/)
- [View example of the `<r4-app>` component](https://beta.radio4000.com)

## Usage 

Depending on whether you have a build system or not, you can either import the module from NPM, from a CDN or download it locally.

All methods are available on the imported `sdk` module.

### With build system and NPM

```js
import '@radio4000/components'
// use any <r4-component*> in your templates
```

### With browser via CDN

```html
<script type="module">
  import 'https://cdn.jsdelivr.net/npm/@radio4000/components'
  // use any <r4-*> component in your HTML
</script>
```

## Changelog

See https://github.com/radio4000/components/releases

## Development

- The components are in the `./src` folder
- Inside `./examples` you'll find demos of all components
- The `./index.html` file renders the `<r4-app>` component, which requires a SPA router.

If you'd like to help out, clone the repository, install dependencies and start the local server.

```bash
git clone git@github.com:radio4000/components.git radio4000-components
cd radio4000-components
npm install
npm run dev
```

### Themes
See the [themes github repo](https://github.com/4www/themes)

## Build and releases

To release this package under `@radio4000/components` on NPM, bump the version in package.json, create a commit, tag it. Create a new release on Github and let the Github action publish it.

To make sure the build workflows:
- npm run build
- npm run dev
- open http://localhost:4000/tests/dist-test.html

### Creating a new component

- create a `./src/components/r4-*.js` file
- export default HTMLElement
- import and export it in `./src/components/index.js`
- create an demo in `./examples/r4-*/index.html`
- reference the demo HTML page in `./vite.config.js`

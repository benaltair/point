# Baha'i Qiblih Locator

A progressive web app (PWA) using modern web APIs and a bit of math to point to the [Qiblih](https://en.wikipedia.org/wiki/Qiblih) of the [Baha'i Faith](https://bahai.org) in Bahji. This is a quick personal project to fulfil a need since other apps have been working less reliably. Issues and PRs are welcome.

The app is built using [Svelte Kit](https://kit.svelte.dev/), a modern application framework powered by [Svelte](https://svelte.dev/). The code was forked from [this article](https://dev.to/orkhanjafarovr/real-compass-on-mobile-browsers-with-javascript-3emi) by [@gigantz](https://github.com/gigantz).

## Developing

Once you've cloned the repo installed dependencies with `npm install` (or `pnpm install`), start a development server:

```bash
npm run dev

# or start the server and open the app in a new browser tab
npm run dev -- --open
```

> Options `--https` and `--host` are already enabled by default in `package.json` since this app leverages secure context mobile-only browser APIs. As such, you'll likely need to open the locally hosted dev server on your phone to test the app.

With Svelte, VSCode offers the most complete developer experience, but you can use any IDE.

## Building

Before creating a production version of your app, install an [adapter](https://kit.svelte.dev/docs#adapters) for your target environment. Then:

```bash
npm run build
```

> You can preview the built app with `npm run preview`. This should _not_ be used to serve your app in production.

## Deploying

This app is currently configured to use the [Netlify Adapter](https://github.com/sveltejs/kit/tree/master/packages/adapter-netlify) but can be easily configured to another platform by choosing a different [adapter](https://kit.svelte.dev/docs#adapters) and adjusting `svelte.config.js` as directed.

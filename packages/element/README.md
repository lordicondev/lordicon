# Element

This package offers developers a convenient method for embedding, controlling, and customizing
animated icons from [Lordicon](https://lordicon.com/) within web projects.

It offers the following features:

- Easily load and render animated icons using the HTML tag __lord-icon__.
- On-the-fly customization of stroke width, colors, and other supported properties.
- Control the animation details by accessing the player implementation and its internal API.
- Animation triggers that allow you to select built-in interactions such as: in, click, hover, morph, loop, loop-on-hover, boomerang, and sequence.

## Installation

```bash
$ npm install @lordicon/element
```

## Usage

This package should be used in pair with
[lottie-web](https://www.npmjs.com/package/lottie-web). We recommend using this
package with a module bundler such as
[Webpack](https://webpack.js.org/) or [Rollup](https://rollupjs.org/).

Example script module:

```js
import lottie from "lottie-web";
import { defineElement } from "@lordicon/element";

// define "lord-icon" custom element with default properties
defineElement(lottie.loadAnimation);
```

Example markup:

```html
<lord-icon trigger="hover" src="/my-icon.json"></lord-icon>
```
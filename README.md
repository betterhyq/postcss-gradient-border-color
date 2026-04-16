# postcss-gradient-border-color

A [PostCSS](https://postcss.org/) plugin that enables gradient colors for `border-color` using CSS background-like syntax.

Write `border-color: linear-gradient(...)` in your CSS and the plugin will automatically generate the necessary `::before` pseudo-element with mask techniques to render gradient borders — with full `border-radius` support.

## Installation

```bash
# npm
npm install postcss-gradient-border-color -D

# pnpm
pnpm add postcss-gradient-border-color -D

# yarn
yarn add postcss-gradient-border-color -D
```

## Usage

Add the plugin to your PostCSS config:

```js
// postcss.config.js
module.exports = {
  plugins: [require('postcss-gradient-border-color')],
}
```

Or with ESM:

```js
// postcss.config.js
import gradientBorderColor from 'postcss-gradient-border-color'

export default {
  plugins: [gradientBorderColor],
}
```

### With Vite

```js
// vite.config.js
import gradientBorderColor from 'postcss-gradient-border-color'

export default {
  css: {
    postcss: {
      plugins: [gradientBorderColor],
    },
  },
}
```

## How It Works

**Input CSS:**

```css
.box {
  border: 2px solid;
  border-color: linear-gradient(to right, red, blue);
  border-radius: 8px;
}
```

**Output CSS:**

```css
.box {
  border: 2px solid transparent;
  border-radius: 8px;
  position: relative;
}
.box::before {
  content: '';
  position: absolute;
  inset: 0;
  margin: -2px;
  padding: 2px;
  border-radius: inherit;
  background: linear-gradient(to right, red, blue);
  -webkit-mask:
    linear-gradient(#fff 0 0) content-box,
    linear-gradient(#fff 0 0) border-box;
  -webkit-mask-composite: xor;
  mask:
    linear-gradient(#fff 0 0) content-box,
    linear-gradient(#fff 0 0) border-box;
  mask-composite: exclude;
  pointer-events: none;
}
```

## Supported Gradient Types

- `linear-gradient()`
- `radial-gradient()`
- `conic-gradient()`
- `repeating-linear-gradient()`
- `repeating-radial-gradient()`
- `repeating-conic-gradient()`

## Options

| Option     | Type      | Default | Description                                                  |
| ---------- | --------- | ------- | ------------------------------------------------------------ |
| `preserve` | `boolean` | `false` | Whether to preserve the original `border-color` declaration. |

```js
gradientBorderColor({ preserve: true })
```

## Important Notes

- The element must have a `border-width` set (via `border` shorthand or `border-width` property). Defaults to `1px` if not specified.
- The plugin adds `position: relative` to the element if no `position` is already declared.
- The plugin uses a `::before` pseudo-element — if you already use `::before` on the same element, you may need to adjust your approach.
- Non-gradient `border-color` values (e.g., `red`, `#fff`, `rgba(...)`) are left untouched.

## Browser Support

This plugin relies on CSS `mask` and `mask-composite` properties. Modern browsers support these features:

- Chrome 120+
- Firefox 53+
- Safari 15.4+
- Edge 120+

## Development

```bash
# Install dependencies
pnpm install

# Development mode
pnpm dev

# Build
pnpm build

# Run unit tests
pnpm test

# Run E2E tests
pnpm test:e2e

# Lint
pnpm lint

# Format
pnpm format

# Type check
pnpm typecheck
```

## Contributing

1. Fork this repository
2. Create your feature branch (`git checkout -b feat/amazing-feature`)
3. Commit your changes (`git commit -m 'feat: add amazing feature'`)
4. Push to the branch (`git push origin feat/amazing-feature`)
5. Open a Pull Request

This project uses [Conventional Commits](https://www.conventionalcommits.org/) for commit messages and [Changesets](https://github.com/changesets/changesets) for version management.

## License

[MIT](./LICENSE)

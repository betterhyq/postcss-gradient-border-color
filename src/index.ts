import type { PluginCreator } from 'postcss'

export interface GradientBorderColorOptions {
  /**
   * Whether to preserve the original `border-color` declaration.
   * @default false
   */
  preserve?: boolean
}

const GRADIENT_RE =
  /(?:linear|radial|conic|repeating-linear|repeating-radial|repeating-conic)-gradient\s*\(/i

const PLUGIN_NAME = 'postcss-gradient-border-color'

/**
 * PostCSS plugin that enables gradient colors for `border-color`.
 *
 * Input CSS:
 * ```css
 * .box {
 *   border: 2px solid;
 *   border-color: linear-gradient(to right, red, blue);
 * }
 * ```
 *
 * Output CSS:
 * ```css
 * .box {
 *   border: 2px solid;
 *   border-image: linear-gradient(to right, red, blue) 1;
 * }
 * ```
 */
const plugin: PluginCreator<GradientBorderColorOptions> = (
  opts: GradientBorderColorOptions = {},
) => {
  const { preserve = false } = opts

  return {
    postcssPlugin: PLUGIN_NAME,

    Declaration(decl) {
      // Only process border-color declarations that contain a gradient function
      if (decl.prop.toLowerCase() !== 'border-color')
        return

      const value = decl.value
      if (!GRADIENT_RE.test(value))
        return

      // Insert border-image shorthand (gradient + slice) after border-color
      decl.cloneAfter({
        prop: 'border-image',
        value: `${value} 1`,
      })

      if (!preserve) {
        decl.remove()
      }
    },
  }
}

plugin.postcss = true

export default plugin
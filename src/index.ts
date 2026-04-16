import type { PluginCreator, Rule } from 'postcss'
import postcss from 'postcss'

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
const PROCESSED = Symbol('processed')

/**
 * PostCSS plugin that enables gradient colors for `border-color`.
 * Uses a `::before` pseudo-element with mask to support `border-radius`.
 *
 * Input CSS:
 * ```css
 * .box {
 *   border: 2px solid;
 *   border-color: linear-gradient(to right, red, blue);
 *   border-radius: 8px;
 * }
 * ```
 *
 * Output CSS:
 * ```css
 * .box {
 *   border: 2px solid transparent;
 *   border-radius: 8px;
 *   position: relative;
 * }
 * .box::before {
 *   content: "";
 *   position: absolute;
 *   inset: 0;
 *   padding: 2px;
 *   border-radius: inherit;
 *   background: linear-gradient(to right, red, blue);
 *   -webkit-mask:
 *     linear-gradient(#fff 0 0) content-box,
 *     linear-gradient(#fff 0 0) border-box;
 *   -webkit-mask-composite: xor;
 *   mask:
 *     linear-gradient(#fff 0 0) content-box,
 *     linear-gradient(#fff 0 0) border-box;
 *   mask-composite: exclude;
 *   pointer-events: none;
 * }
 * ```
 */
const plugin: PluginCreator<GradientBorderColorOptions> = (
  opts: GradientBorderColorOptions = {},
) => {
  const { preserve = false } = opts

  return {
    postcssPlugin: PLUGIN_NAME,

    Rule(rule) {
      // Prevent re-processing
      if ((rule as any)[PROCESSED]) return

      // Collect relevant declarations
      let gradientValue: string | undefined
      let borderWidths: string | undefined
      let gradientDecl: import('postcss').Declaration | undefined

      rule.walkDecls((decl) => {
        const prop = decl.prop.toLowerCase()

        if (prop === 'border-color' && GRADIENT_RE.test(decl.value)) {
          gradientValue = decl.value
          gradientDecl = decl
        }

        // Extract border-width from shorthand `border` (e.g. "2px solid")
        if (prop === 'border' && !borderWidths) {
          const match = decl.value.match(/^([\d.]+\w+)/)
          if (match) borderWidths = match[1]
        }

        if (prop === 'border-width') {
          borderWidths = decl.value
        }
      })

      if (!gradientValue || !gradientDecl) return

      // Default border width fallback
      const bw = borderWidths || '1px'

      // ---- Modify the original rule ----

      // Ensure position: relative exists
      const hasPosition = rule.some(
        (node) =>
          node.type === 'decl' && node.prop.toLowerCase() === 'position',
      )
      if (!hasPosition) {
        rule.append({ prop: 'position', value: 'relative' })
      }

      // Make border color transparent so the pseudo-element gradient shows through
      gradientDecl.value = 'transparent'
      if (!preserve) {
        // keep it as transparent
      }

      // ---- Create ::before pseudo-element rule ----
      const selector = rule.selectors.map((s) => `${s}::before`).join(', ')

      const pseudoCss = `${selector} {
  content: "";
  position: absolute;
  inset: 0;
  margin: -${bw};
  padding: ${bw};
  border-radius: inherit;
  background: ${gradientValue};
  -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0) border-box;
  -webkit-mask-composite: xor;
  mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0) border-box;
  mask-composite: exclude;
  pointer-events: none;
}`

      const pseudoRule = postcss.parse(pseudoCss).first as Rule
      ;(pseudoRule as any)[PROCESSED] = true
      rule.parent!.insertAfter(rule, pseudoRule)
    },
  }
}

plugin.postcss = true

export default plugin

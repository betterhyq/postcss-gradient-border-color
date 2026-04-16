import { describe, expect, it } from 'vitest'
import postcss from 'postcss'
import plugin from './index'

function run(input: string, opts: Parameters<typeof plugin>[0] = {}) {
  return postcss([plugin(opts)]).process(input, { from: undefined }).then(r => r.css)
}

// ============================================================
// Helper: extracts rule blocks from CSS string for easier assertion
// ============================================================

describe('postcss-gradient-border-color', () => {
  // ----------------------------------------------------------
  // 1. Basic linear-gradient transformation
  // ----------------------------------------------------------
  describe('basic linear-gradient', () => {
    it('should transform border-color with linear-gradient', async () => {
      const input = `.box {
  border: 2px solid;
  border-color: linear-gradient(to right, red, blue);
}`
      const output = await run(input)

      // Original rule should have border-color: transparent
      expect(output).toContain('border-color: transparent')
      // Should add position: relative
      expect(output).toContain('position: relative')
      // Should generate ::before pseudo-element
      expect(output).toContain('.box::before')
      // Pseudo should have gradient as background
      expect(output).toContain('background: linear-gradient(to right, red, blue)')
      // Pseudo should have correct padding matching border-width
      expect(output).toContain('padding: 2px')
      expect(output).toContain('margin: -2px')
      // Should include mask properties
      expect(output).toContain('mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0) border-box')
      expect(output).toContain('mask-composite: exclude')
      // Should include webkit prefix
      expect(output).toContain('-webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0) border-box')
      expect(output).toContain('-webkit-mask-composite: xor')
    })
  })

  // ----------------------------------------------------------
  // 2. Supports border-radius (core use case)
  // ----------------------------------------------------------
  describe('border-radius support', () => {
    it('should preserve border-radius and use inherit in pseudo-element', async () => {
      const input = `.card {
  border: 3px solid;
  border-color: linear-gradient(45deg, #ff0000, #0000ff);
  border-radius: 12px;
}`
      const output = await run(input)

      // Original rule keeps border-radius
      expect(output).toContain('border-radius: 12px')
      // Pseudo-element inherits border-radius
      expect(output).toContain('border-radius: inherit')
    })
  })

  // ----------------------------------------------------------
  // 3. Different gradient types
  // ----------------------------------------------------------
  describe('gradient types', () => {
    it('should support radial-gradient', async () => {
      const input = `.box {
  border: 1px solid;
  border-color: radial-gradient(circle, red, blue);
}`
      const output = await run(input)

      expect(output).toContain('border-color: transparent')
      expect(output).toContain('background: radial-gradient(circle, red, blue)')
    })

    it('should support conic-gradient', async () => {
      const input = `.box {
  border: 1px solid;
  border-color: conic-gradient(red, yellow, green, blue, red);
}`
      const output = await run(input)

      expect(output).toContain('border-color: transparent')
      expect(output).toContain('background: conic-gradient(red, yellow, green, blue, red)')
    })

    it('should support repeating-linear-gradient', async () => {
      const input = `.box {
  border: 2px solid;
  border-color: repeating-linear-gradient(45deg, red 0px, blue 10px);
}`
      const output = await run(input)

      expect(output).toContain('border-color: transparent')
      expect(output).toContain('background: repeating-linear-gradient(45deg, red 0px, blue 10px)')
    })

    it('should support repeating-radial-gradient', async () => {
      const input = `.box {
  border: 2px solid;
  border-color: repeating-radial-gradient(circle, red 0px, blue 10px);
}`
      const output = await run(input)

      expect(output).toContain('border-color: transparent')
      expect(output).toContain('background: repeating-radial-gradient(circle, red 0px, blue 10px)')
    })

    it('should support repeating-conic-gradient', async () => {
      const input = `.box {
  border: 2px solid;
  border-color: repeating-conic-gradient(red 0deg, blue 30deg);
}`
      const output = await run(input)

      expect(output).toContain('border-color: transparent')
      expect(output).toContain('background: repeating-conic-gradient(red 0deg, blue 30deg)')
    })
  })

  // ----------------------------------------------------------
  // 4. Border-width extraction
  // ----------------------------------------------------------
  describe('border-width extraction', () => {
    it('should extract border-width from border shorthand', async () => {
      const input = `.box {
  border: 4px solid;
  border-color: linear-gradient(to right, red, blue);
}`
      const output = await run(input)

      expect(output).toContain('padding: 4px')
      expect(output).toContain('margin: -4px')
    })

    it('should use explicit border-width property', async () => {
      const input = `.box {
  border: 1px solid;
  border-width: 5px;
  border-color: linear-gradient(to right, red, blue);
}`
      const output = await run(input)

      expect(output).toContain('padding: 5px')
      expect(output).toContain('margin: -5px')
    })

    it('should default to 1px when no border-width is specified', async () => {
      const input = `.box {
  border-color: linear-gradient(to right, red, blue);
}`
      const output = await run(input)

      expect(output).toContain('padding: 1px')
      expect(output).toContain('margin: -1px')
    })

    it('should handle decimal border widths', async () => {
      const input = `.box {
  border: 0.5px solid;
  border-color: linear-gradient(to right, red, blue);
}`
      const output = await run(input)

      expect(output).toContain('padding: 0.5px')
      expect(output).toContain('margin: -0.5px')
    })
  })

  // ----------------------------------------------------------
  // 5. Position handling
  // ----------------------------------------------------------
  describe('position handling', () => {
    it('should add position: relative when no position exists', async () => {
      const input = `.box {
  border: 2px solid;
  border-color: linear-gradient(to right, red, blue);
}`
      const output = await run(input)

      expect(output).toContain('position: relative')
    })

    it('should NOT override existing position declaration', async () => {
      const input = `.box {
  position: absolute;
  border: 2px solid;
  border-color: linear-gradient(to right, red, blue);
}`
      const output = await run(input)

      // Should keep existing position: absolute
      expect(output).toContain('position: absolute')
      // Should NOT add another position: relative
      const matches = output.match(/position:/g)
      // One in the original rule (absolute) + one in ::before (absolute from pseudo)
      // The original rule should not have position: relative appended
      expect(output).not.toMatch(/position: absolute[\s\S]*position: relative/)
    })
  })

  // ----------------------------------------------------------
  // 6. Preserve option
  // ----------------------------------------------------------
  describe('preserve option', () => {
    it('should set border-color to transparent when preserve is false (default)', async () => {
      const input = `.box {
  border: 2px solid;
  border-color: linear-gradient(to right, red, blue);
}`
      const output = await run(input)

      expect(output).toContain('border-color: transparent')
      expect(output).not.toContain('border-color: linear-gradient')
    })

    it('should set border-color to transparent when preserve is true', async () => {
      const input = `.box {
  border: 2px solid;
  border-color: linear-gradient(to right, red, blue);
}`
      const output = await run(input, { preserve: true })

      // Even with preserve, border-color should be transparent
      expect(output).toContain('border-color: transparent')
    })
  })

  // ----------------------------------------------------------
  // 7. Non-gradient border-color should be ignored
  // ----------------------------------------------------------
  describe('non-gradient values', () => {
    it('should NOT transform plain color border-color', async () => {
      const input = `.box {
  border: 2px solid;
  border-color: red;
}`
      const output = await run(input)

      expect(output).toBe(input)
    })

    it('should NOT transform hex color border-color', async () => {
      const input = `.box {
  border: 2px solid;
  border-color: #ff0000;
}`
      const output = await run(input)

      expect(output).toBe(input)
    })

    it('should NOT transform rgba border-color', async () => {
      const input = `.box {
  border: 2px solid;
  border-color: rgba(255, 0, 0, 0.5);
}`
      const output = await run(input)

      expect(output).toBe(input)
    })
  })

  // ----------------------------------------------------------
  // 8. Multiple selectors
  // ----------------------------------------------------------
  describe('multiple selectors', () => {
    it('should generate ::before for each selector', async () => {
      const input = `.box, .card {
  border: 2px solid;
  border-color: linear-gradient(to right, red, blue);
}`
      const output = await run(input)

      expect(output).toContain('.box::before, .card::before')
    })
  })

  // ----------------------------------------------------------
  // 9. Multiple rules in the same stylesheet
  // ----------------------------------------------------------
  describe('multiple rules', () => {
    it('should transform only rules containing gradient border-color', async () => {
      const input = `.box {
  border: 2px solid;
  border-color: linear-gradient(to right, red, blue);
}
.plain {
  border: 1px solid red;
}`
      const output = await run(input)

      expect(output).toContain('.box::before')
      expect(output).not.toContain('.plain::before')
      // .plain should remain unchanged
      expect(output).toContain('border: 1px solid red')
    })
  })

  // ----------------------------------------------------------
  // 10. Pseudo-element structure completeness
  // ----------------------------------------------------------
  describe('pseudo-element structure', () => {
    it('should include all required pseudo-element declarations', async () => {
      const input = `.box {
  border: 2px solid;
  border-color: linear-gradient(to right, red, blue);
}`
      const output = await run(input)

      // content
      expect(output).toContain('content: ""')
      // positioning
      expect(output).toContain('position: absolute')
      expect(output).toContain('inset: 0')
      // border-radius inherit
      expect(output).toContain('border-radius: inherit')
      // pointer-events none so clicks pass through
      expect(output).toContain('pointer-events: none')
    })
  })

  // ----------------------------------------------------------
  // 11. Case insensitivity
  // ----------------------------------------------------------
  describe('case insensitivity', () => {
    it('should handle uppercase gradient function names', async () => {
      const input = `.box {
  border: 2px solid;
  border-color: Linear-Gradient(to right, red, blue);
}`
      const output = await run(input)

      expect(output).toContain('border-color: transparent')
      expect(output).toContain('background: Linear-Gradient(to right, red, blue)')
    })
  })
})
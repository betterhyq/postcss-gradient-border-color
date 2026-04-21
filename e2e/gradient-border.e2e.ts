import { expect, test } from "@playwright/test";

/**
 * Shared assertions that apply to every framework (vanilla / react / vue).
 * Each project renders 4 boxes:
 *   .box-linear   – linear-gradient  + border-radius: 12px
 *   .box-radial   – radial-gradient  + border-radius: 50%
 *   .box-conic    – conic-gradient   + border-radius: 12px
 *   .box-plain    – solid red border (should NOT be transformed)
 */

interface BoxSpec {
  testId: string;
  gradient: string;
  borderRadius: string;
}

const gradientBoxes: BoxSpec[] = [
  { testId: "box-linear", gradient: "linear-gradient", borderRadius: "12px" },
  { testId: "box-radial", gradient: "radial-gradient", borderRadius: "50%" },
  { testId: "box-conic", gradient: "conic-gradient", borderRadius: "12px" },
];

function suiteForProject(projectName: string, baseURL: string) {
  test.describe(`${projectName}`, () => {
    test.beforeEach(async ({ page }) => {
      await page.goto(baseURL);
      // Wait for all boxes to be visible
      await page.locator('[data-testid="box-linear"]').waitFor({ state: "visible" });
    });

    for (const { testId, gradient, borderRadius } of gradientBoxes) {
      test(`${testId}: border-color should be transparent`, async ({ page }) => {
        const el = page.locator(`[data-testid="${testId}"]`);
        const borderColor = await el.evaluate((e) => getComputedStyle(e).borderColor);
        // transparent = rgba(0, 0, 0, 0) or "transparent"
        expect(borderColor === "transparent" || borderColor === "rgba(0, 0, 0, 0)").toBe(true);
      });

      test(`${testId}: should have position: relative`, async ({ page }) => {
        const el = page.locator(`[data-testid="${testId}"]`);
        const position = await el.evaluate((e) => getComputedStyle(e).position);
        expect(position).toBe("relative");
      });

      test(`${testId}: ::before should exist and have gradient background`, async ({ page }) => {
        const el = page.locator(`[data-testid="${testId}"]`);

        const pseudo = await el.evaluate((e) => {
          const s = getComputedStyle(e, "::before");
          return {
            content: s.content,
            backgroundImage: s.backgroundImage,
            position: s.position,
            pointerEvents: s.pointerEvents,
          };
        });

        // ::before should exist (content not "none")
        expect(pseudo.content).not.toBe("none");
        // background should include the gradient keyword
        expect(pseudo.backgroundImage).toContain(gradient);
        // pseudo should be position: absolute
        expect(pseudo.position).toBe("absolute");
        // pointer-events should be none
        expect(pseudo.pointerEvents).toBe("none");
      });

      test(`${testId}: ::before should have mask set`, async ({ page }) => {
        const el = page.locator(`[data-testid="${testId}"]`);

        const maskImage = await el.evaluate((e) => {
          const s = getComputedStyle(e, "::before");
          // Different browsers may use webkitMaskImage or maskImage
          return (
            s.webkitMaskImage ||
            s.getPropertyValue("mask-image") ||
            s.getPropertyValue("-webkit-mask")
          );
        });

        // mask should contain linear-gradient (used for the mask technique)
        expect(maskImage).toContain("linear-gradient");
      });

      test(`${testId}: border-radius should be preserved on the element`, async ({ page }) => {
        const el = page.locator(`[data-testid="${testId}"]`);
        const br = await el.evaluate((e) => getComputedStyle(e).borderRadius);
        // borderRadius should match the expected value
        expect(br).toContain(borderRadius);
      });
    }

    // Plain box should NOT be transformed
    test("box-plain: should NOT be transformed (no ::before pseudo)", async ({ page }) => {
      const el = page.locator('[data-testid="box-plain"]');

      const borderColor = await el.evaluate((e) => getComputedStyle(e).borderColor);
      // Should keep its red border (rgb(255, 0, 0))
      expect(borderColor).toBe("rgb(255, 0, 0)");

      const pseudoContent = await el.evaluate((e) => getComputedStyle(e, "::before").content);
      // No ::before should exist (content should be "none" or "")
      expect(pseudoContent === "none" || pseudoContent === "" || pseudoContent === "normal").toBe(
        true,
      );
    });

    test("box-plain: should NOT have position: relative added", async ({ page }) => {
      const el = page.locator('[data-testid="box-plain"]');
      const position = await el.evaluate((e) => getComputedStyle(e).position);
      expect(position).toBe("static");
    });
  });
}

// ──────────────────────────────────────────────
// Test each project
// ──────────────────────────────────────────────
suiteForProject("Vanilla", "http://localhost:5180");
suiteForProject("React", "http://localhost:5181");
suiteForProject("Vue", "http://localhost:5182");

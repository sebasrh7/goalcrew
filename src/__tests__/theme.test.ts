import { darkTheme, lightTheme, resolveTheme } from "../lib/theme";

describe("resolveTheme", () => {
  it("returns dark theme for dark preference", () => {
    expect(resolveTheme("dark", false)).toBe(darkTheme);
    expect(resolveTheme("dark", true)).toBe(darkTheme);
  });

  it("returns light theme for light preference", () => {
    expect(resolveTheme("light", false)).toBe(lightTheme);
    expect(resolveTheme("light", true)).toBe(lightTheme);
  });

  it("follows system preference for auto", () => {
    expect(resolveTheme("auto", true)).toBe(darkTheme);
    expect(resolveTheme("auto", false)).toBe(lightTheme);
  });
});

describe("theme colors", () => {
  it("dark theme has dark background", () => {
    expect(darkTheme.bg).toBe("#0b0f1a");
  });

  it("light theme has light background", () => {
    expect(lightTheme.bg).toBe("#f8f9fc");
  });

  it("both themes have required gradient arrays", () => {
    expect(darkTheme.gradientPrimary).toHaveLength(2);
    expect(lightTheme.gradientPrimary).toHaveLength(2);
    expect(darkTheme.gradientHero).toHaveLength(3);
    expect(lightTheme.gradientHero).toHaveLength(3);
  });
});

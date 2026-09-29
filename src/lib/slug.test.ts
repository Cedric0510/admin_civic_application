import { describe, expect, it } from "vitest";
import { slugify } from "./slug";

describe("slugify", () => {
  it("lowercases and joins words with hyphens", () => {
    expect(slugify("Saint Martin de Belleville")).toBe(
      "saint-martin-de-belleville",
    );
  });

  it("strips accents", () => {
    expect(slugify("Île-de-Bréhat")).toBe("ile-de-brehat");
  });

  it("collapses repeated separators and trims leading/trailing hyphens", () => {
    expect(slugify("  Château-d'Œx !! ")).toBe("chateau-d-oex");
  });
});

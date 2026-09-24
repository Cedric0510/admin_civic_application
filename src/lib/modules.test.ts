import { describe, expect, it } from "vitest";
import {
  canEnableModule,
  isModuleEnabled,
  moduleLabel,
  toggleModule,
} from "./modules";

describe("toggleModule", () => {
  it("switches a module off, keeping the others as they were", () => {
    expect(toggleModule(["WEATHER"], "POLLS", false)).toEqual([
      "POLLS",
      "WEATHER",
    ]);
  });

  it("switches a module back on", () => {
    expect(toggleModule(["POLLS", "WEATHER"], "POLLS", true)).toEqual([
      "WEATHER",
    ]);
  });

  it("switches appointments off together with the services they depend on", () => {
    expect(toggleModule([], "SERVICES", false)).toEqual([
      "SERVICES",
      "APPOINTMENTS",
    ]);
  });

  it("leaves services on when only appointments are switched off", () => {
    expect(toggleModule([], "APPOINTMENTS", false)).toEqual(["APPOINTMENTS"]);
  });

  it("refuses to switch appointments on while services are off", () => {
    expect(toggleModule(["SERVICES", "APPOINTMENTS"], "APPOINTMENTS", true)).toEqual([
      "SERVICES",
      "APPOINTMENTS",
    ]);
  });

  it("lets appointments come back once services are back", () => {
    const withServices = toggleModule(["SERVICES", "APPOINTMENTS"], "SERVICES", true);

    expect(withServices).toEqual(["APPOINTMENTS"]);
    expect(toggleModule(withServices, "APPOINTMENTS", true)).toEqual([]);
  });

  it("returns modules in a stable order, once each", () => {
    expect(toggleModule(["WEATHER", "ARTICLES"], "ARTICLES", false)).toEqual([
      "ARTICLES",
      "WEATHER",
    ]);
  });
});

describe("canEnableModule and isModuleEnabled", () => {
  it("only conditions modules that depend on another", () => {
    expect(canEnableModule(["SERVICES"], "APPOINTMENTS")).toBe(false);
    expect(canEnableModule([], "APPOINTMENTS")).toBe(true);
    expect(canEnableModule(["SERVICES"], "POLLS")).toBe(true);
  });

  it("reads a module as on unless it is listed, or unknown", () => {
    expect(isModuleEnabled(["POLLS"], "POLLS")).toBe(false);
    expect(isModuleEnabled(["POLLS"], "ARTICLES")).toBe(true);
    expect(isModuleEnabled(undefined, "POLLS")).toBe(true);
  });
});

describe("moduleLabel", () => {
  it("gives the French name of a module", () => {
    expect(moduleLabel("APPOINTMENTS")).toBe("Rendez-vous et agenda");
    expect(moduleLabel("REPORTS")).toBe("Signalements");
  });
});

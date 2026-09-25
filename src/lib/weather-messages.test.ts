import { describe, expect, it } from "vitest";
import { describeWeatherResult, formatTemperature } from "./weather-messages";

describe("describeWeatherResult", () => {
  it("names the place that was found, so a wrong village can be spotted", () => {
    expect(
      describeWeatherResult(
        {
          status: "ok",
          placeName: "Ambeyrac",
          temperature: 29.39,
          description: "ciel dégagé",
        },
        "12260",
      ),
    ).toEqual({
      tone: "success",
      message: "Météo trouvée : Ambeyrac, 29,4 °C, ciel dégagé.",
    });
  });

  it("points at the postal code when nothing was found for it", () => {
    const notice = describeWeatherResult({ status: "not-found" }, "97400");

    expect(notice.tone).toBe("warning");
    expect(notice.message).toContain("code postal 97400");
  });

  it("asks for a postal code when there is none to blame", () => {
    const notice = describeWeatherResult({ status: "not-found" }, null);

    expect(notice.tone).toBe("warning");
    expect(notice.message).toContain("Renseignez son code postal");
  });

  it("says the server has no weather key, which no postal code can fix", () => {
    const notice = describeWeatherResult({ status: "not-configured" }, "12260");

    expect(notice.tone).toBe("warning");
    expect(notice.message).toContain("clé OpenWeatherMap");
    expect(notice.message).not.toContain("12260");
  });

  it("asks to retry when the provider does not answer", () => {
    const notice = describeWeatherResult({ status: "unavailable" });

    expect(notice.tone).toBe("warning");
    expect(notice.message).toContain("Réessayez");
  });
});

describe("formatTemperature", () => {
  it("uses the French decimal comma and at most one decimal", () => {
    expect(formatTemperature(21)).toBe("21");
    expect(formatTemperature(21.55)).toBe("21,6");
    expect(formatTemperature(-3.04)).toBe("-3");
  });
});

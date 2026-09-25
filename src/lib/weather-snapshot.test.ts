import { describe, expect, it } from "vitest";
import { toWeatherSnapshot } from "./weather-snapshot";

describe("toWeatherSnapshot", () => {
  it("keeps the cached weather of a commune", () => {
    expect(
      toWeatherSnapshot({
        weatherPlaceName: "Ambeyrac",
        weatherTemperature: 29.4,
        weatherDescription: "ciel dégagé",
        weatherUpdatedAt: "2026-09-25T15:00:00.000Z",
      }),
    ).toEqual({
      placeName: "Ambeyrac",
      temperature: 29.4,
      description: "ciel dégagé",
      updatedAt: "2026-09-25T15:00:00.000Z",
    });
  });

  it("is empty for a commune that never got any weather, even at 0 degrees", () => {
    const empty = {
      weatherPlaceName: null,
      weatherTemperature: null,
      weatherDescription: null,
      weatherUpdatedAt: null,
    };

    expect(toWeatherSnapshot(empty)).toBeNull();
    expect(
      toWeatherSnapshot({
        ...empty,
        weatherTemperature: 0,
        weatherUpdatedAt: "2026-09-25T15:00:00.000Z",
      }),
    ).not.toBeNull();
  });
});

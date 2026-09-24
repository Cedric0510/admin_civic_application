import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import AppError from "./error";

describe("AppError", () => {
  it("tells the user the server does not answer and offers to try again", () => {
    const reset = vi.fn();
    render(<AppError reset={reset} />);

    expect(
      screen.getByRole("heading", { name: "Le serveur ne répond pas" }),
    ).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Réessayer" }));
    expect(reset).toHaveBeenCalledTimes(1);
  });
});

import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const assignMock = vi.fn();
const unassignMock = vi.fn();
vi.mock("@/app/actions/commerces", () => ({
  assignCommerceManager: assignMock,
  unassignCommerceManager: unassignMock,
}));
vi.mock("sonner", () => ({ toast: { success: vi.fn(), error: vi.fn() } }));

const { CommerceManagerSection } = await import("./commerce-manager-section");
const { toast } = await import("sonner");

const managers = [
  { id: "c1", email: "martine@boulangerie.fr" },
  { id: "c2", email: "paul@boulangerie.fr" },
];

beforeEach(() => {
  assignMock.mockReset().mockResolvedValue(undefined);
  unassignMock.mockReset().mockResolvedValue(undefined);
  vi.mocked(toast.success).mockClear();
  vi.mocked(toast.error).mockClear();
});

describe("CommerceManagerSection", () => {
  it("lists every person linked to the commerce", () => {
    render(<CommerceManagerSection commerceId="shop-1" managers={managers} />);

    expect(screen.getByText("martine@boulangerie.fr")).toBeInTheDocument();
    expect(screen.getByText("paul@boulangerie.fr")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Retirer paul@boulangerie.fr" }),
    ).toBeInTheDocument();
  });

  it("says so when nobody is linked yet, and still offers to add someone", () => {
    render(<CommerceManagerSection commerceId="shop-1" managers={[]} />);

    expect(screen.getByText(/Aucun compte associé/)).toBeInTheDocument();
    expect(screen.getByLabelText("E-mail du compte à ajouter")).toBeInTheDocument();
  });

  it("keeps the add field available when people are already linked", () => {
    render(<CommerceManagerSection commerceId="shop-1" managers={managers} />);

    expect(screen.getByLabelText("E-mail du compte à ajouter")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Ajouter" })).toBeDisabled();
  });

  it("adds the typed address to this commerce and confirms", async () => {
    render(<CommerceManagerSection commerceId="shop-1" managers={managers} />);

    fireEvent.change(screen.getByLabelText("E-mail du compte à ajouter"), {
      target: { value: " nouveau@boulangerie.fr " },
    });
    fireEvent.click(screen.getByRole("button", { name: "Ajouter" }));

    await waitFor(() =>
      expect(assignMock).toHaveBeenCalledWith("shop-1", "nouveau@boulangerie.fr"),
    );
    await waitFor(() => expect(toast.success).toHaveBeenCalled());
    expect(screen.getByLabelText("E-mail du compte à ajouter")).toHaveValue("");
  });

  it("shows the reason when the API refuses the address", async () => {
    assignMock.mockRejectedValue(new Error("Aucun compte citoyen avec cet email."));
    render(<CommerceManagerSection commerceId="shop-1" managers={managers} />);

    fireEvent.change(screen.getByLabelText("E-mail du compte à ajouter"), {
      target: { value: "inconnu@x.fr" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Ajouter" }));

    await waitFor(() =>
      expect(toast.error).toHaveBeenCalledWith(
        "Aucun compte citoyen avec cet email.",
      ),
    );
  });

  it("asks for confirmation, then removes only the chosen person", async () => {
    render(<CommerceManagerSection commerceId="shop-1" managers={managers} />);

    fireEvent.click(
      screen.getByRole("button", { name: "Retirer paul@boulangerie.fr" }),
    );
    expect(await screen.findByText("Retirer cette personne ?")).toBeInTheDocument();
    expect(unassignMock).not.toHaveBeenCalled();

    fireEvent.click(screen.getByRole("button", { name: "Retirer" }));

    await waitFor(() => expect(unassignMock).toHaveBeenCalledWith("shop-1", "c2"));
    expect(unassignMock).toHaveBeenCalledTimes(1);
  });

  it("removes nobody when the confirmation is cancelled", async () => {
    render(<CommerceManagerSection commerceId="shop-1" managers={managers} />);

    fireEvent.click(
      screen.getByRole("button", { name: "Retirer martine@boulangerie.fr" }),
    );
    fireEvent.click(await screen.findByRole("button", { name: "Annuler" }));

    await waitFor(() =>
      expect(screen.queryByText("Retirer cette personne ?")).not.toBeInTheDocument(),
    );
    expect(unassignMock).not.toHaveBeenCalled();
  });
});

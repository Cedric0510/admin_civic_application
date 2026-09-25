import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const assignMock = vi.fn();
const unassignMock = vi.fn();
const cancelInvitationMock = vi.fn();
vi.mock("@/app/actions/commerces", () => ({
  assignCommerceManager: assignMock,
  unassignCommerceManager: unassignMock,
  cancelCommerceInvitation: cancelInvitationMock,
}));
vi.mock("sonner", () => ({ toast: { success: vi.fn(), error: vi.fn() } }));

const { CommerceManagerSection } = await import("./commerce-manager-section");
const { toast } = await import("sonner");

const managers = [
  { id: "c1", email: "martine@boulangerie.fr", isChief: true },
  { id: "c2", email: "paul@boulangerie.fr", isChief: false },
];

const invitations = [
  {
    id: "i1",
    email: "nouvelle@boulangerie.fr",
    sentAt: "2026-09-24T10:00:00.000Z",
    expiresAt: "2026-10-08T10:00:00.000Z",
  },
];

const linked = {
  status: "linked" as const,
  manager: { id: "c3", email: "nouveau@boulangerie.fr" },
};
const invited = {
  status: "invited" as const,
  invitation: invitations[0],
};

beforeEach(() => {
  assignMock.mockReset().mockResolvedValue(linked);
  unassignMock.mockReset().mockResolvedValue(undefined);
  cancelInvitationMock.mockReset().mockResolvedValue(undefined);
  vi.mocked(toast.success).mockClear();
  vi.mocked(toast.error).mockClear();
});

describe("CommerceManagerSection", () => {
  it("lists every person linked to the commerce", () => {
    render(<CommerceManagerSection commerceId="shop-1" managers={managers} invitations={[]} />);

    expect(screen.getByText("martine@boulangerie.fr")).toBeInTheDocument();
    expect(screen.getByText("paul@boulangerie.fr")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Retirer paul@boulangerie.fr" }),
    ).toBeInTheDocument();
  });

  it("marks the chief of the commerce, and only the chief", () => {
    render(
      <CommerceManagerSection
        commerceId="shop-1"
        managers={managers}
        invitations={[]}
      />,
    );

    const chiefRow = screen.getByText("martine@boulangerie.fr").closest("li")!;
    const collaboratorRow = screen
      .getByText("paul@boulangerie.fr")
      .closest("li")!;
    expect(within(chiefRow).getByText("Chef")).toBeInTheDocument();
    expect(within(collaboratorRow).queryByText("Chef")).not.toBeInTheDocument();
  });

  it("says so when nobody is linked yet, and still offers to add someone", () => {
    render(<CommerceManagerSection commerceId="shop-1" managers={[]} invitations={[]} />);

    expect(screen.getByText(/Aucune personne associée/)).toBeInTheDocument();
    expect(screen.getByLabelText("E-mail de la personne à ajouter")).toBeInTheDocument();
  });

  it("keeps the add field available when people are already linked", () => {
    render(<CommerceManagerSection commerceId="shop-1" managers={managers} invitations={[]} />);

    expect(screen.getByLabelText("E-mail de la personne à ajouter")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Ajouter" })).toBeDisabled();
  });

  it("adds the typed address to this commerce and confirms", async () => {
    render(<CommerceManagerSection commerceId="shop-1" managers={managers} invitations={[]} />);

    fireEvent.change(screen.getByLabelText("E-mail de la personne à ajouter"), {
      target: { value: " nouveau@boulangerie.fr " },
    });
    fireEvent.click(screen.getByRole("button", { name: "Ajouter" }));

    await waitFor(() =>
      expect(assignMock).toHaveBeenCalledWith("shop-1", "nouveau@boulangerie.fr"),
    );
    await waitFor(() =>
      expect(toast.success).toHaveBeenCalledWith(
        "Cette personne a déjà un compte : elle est associée au commerce.",
      ),
    );
    expect(screen.getByLabelText("E-mail de la personne à ajouter")).toHaveValue("");
  });

  it("says an invitation was sent when the address has no account yet", async () => {
    assignMock.mockResolvedValue(invited);
    render(<CommerceManagerSection commerceId="shop-1" managers={managers} invitations={[]} />);

    fireEvent.change(screen.getByLabelText("E-mail de la personne à ajouter"), {
      target: { value: "nouvelle@boulangerie.fr" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Ajouter" }));

    await waitFor(() =>
      expect(toast.success).toHaveBeenCalledWith(
        "Invitation envoyée à nouvelle@boulangerie.fr.",
      ),
    );
  });

  it("shows the reason when the API refuses the address", async () => {
    assignMock.mockRejectedValue(
      new Error("Ce compte n'appartient pas à la commune de ce commerce."),
    );
    render(<CommerceManagerSection commerceId="shop-1" managers={managers} invitations={[]} />);

    fireEvent.change(screen.getByLabelText("E-mail de la personne à ajouter"), {
      target: { value: "inconnu@x.fr" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Ajouter" }));

    await waitFor(() =>
      expect(toast.error).toHaveBeenCalledWith(
        "Ce compte n'appartient pas à la commune de ce commerce.",
      ),
    );
  });

  it("asks for confirmation, then removes only the chosen person", async () => {
    render(<CommerceManagerSection commerceId="shop-1" managers={managers} invitations={[]} />);

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
    render(<CommerceManagerSection commerceId="shop-1" managers={managers} invitations={[]} />);

    fireEvent.click(
      screen.getByRole("button", { name: "Retirer martine@boulangerie.fr" }),
    );
    fireEvent.click(await screen.findByRole("button", { name: "Annuler" }));

    await waitFor(() =>
      expect(screen.queryByText("Retirer cette personne ?")).not.toBeInTheDocument(),
    );
    expect(unassignMock).not.toHaveBeenCalled();
  });

  describe("pending invitations", () => {
    const resendLabel = "Renvoyer l'invitation à nouvelle@boulangerie.fr";
    const renderWithInvitation = () =>
      render(
        <CommerceManagerSection
          commerceId="shop-1"
          managers={managers}
          invitations={invitations}
        />,
      );

    it("shows nothing about invitations when none is waiting", () => {
      render(<CommerceManagerSection commerceId="shop-1" managers={managers} invitations={[]} />);

      expect(screen.queryByText("Invitations en attente")).not.toBeInTheDocument();
    });

    it("lists each waiting invitation with its send and expiry dates", () => {
      renderWithInvitation();

      expect(screen.getByText("Invitations en attente")).toBeInTheDocument();
      expect(screen.getByText("nouvelle@boulangerie.fr")).toBeInTheDocument();
      expect(screen.getByText(/Envoyée le 24\/09\/2026/)).toBeInTheDocument();
      expect(screen.getByText(/jusqu'au 08\/10\/2026/)).toBeInTheDocument();
    });

    it("sends the invitation again to the same address and confirms", async () => {
      assignMock.mockResolvedValue(invited);
      renderWithInvitation();

      fireEvent.click(screen.getByRole("button", { name: resendLabel }));

      await waitFor(() =>
        expect(assignMock).toHaveBeenCalledWith("shop-1", "nouvelle@boulangerie.fr"),
      );
      await waitFor(() =>
        expect(toast.success).toHaveBeenCalledWith(
          "Invitation renvoyée à nouvelle@boulangerie.fr.",
        ),
      );
    });

    it("tells the user when the person has created an account in the meantime", async () => {
      assignMock.mockResolvedValue(linked);
      renderWithInvitation();

      fireEvent.click(screen.getByRole("button", { name: resendLabel }));

      await waitFor(() =>
        expect(toast.success).toHaveBeenCalledWith(
          "Cette personne a déjà un compte : elle est associée au commerce.",
        ),
      );
    });

    it("shows the reason when the API refuses to resend", async () => {
      assignMock.mockRejectedValue(
        new Error("Une invitation vient d'être envoyée à cette adresse."),
      );
      renderWithInvitation();

      fireEvent.click(screen.getByRole("button", { name: resendLabel }));

      await waitFor(() =>
        expect(toast.error).toHaveBeenCalledWith(
          "Une invitation vient d'être envoyée à cette adresse.",
        ),
      );
    });

    it("cancels only the chosen invitation", async () => {
      renderWithInvitation();

      fireEvent.click(
        screen.getByRole("button", {
          name: "Annuler l'invitation de nouvelle@boulangerie.fr",
        }),
      );

      await waitFor(() =>
        expect(cancelInvitationMock).toHaveBeenCalledWith("shop-1", "i1"),
      );
      await waitFor(() =>
        expect(toast.success).toHaveBeenCalledWith("Invitation annulée."),
      );
      expect(unassignMock).not.toHaveBeenCalled();
    });
  });
});

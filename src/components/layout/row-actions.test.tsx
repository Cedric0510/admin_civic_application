import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { Pencil } from "lucide-react";
import { ConfirmDeleteButton, IconLink } from "./row-actions";
import { FormActions } from "./form-actions";
import { StatusSelect } from "./status-select";

describe("IconLink", () => {
  it("is a link that a screen reader can name", () => {
    render(<IconLink href="/articles/1/edit" label="Modifier Travaux" icon={Pencil} />);

    const link = screen.getByRole("link", { name: "Modifier Travaux" });
    expect(link).toHaveAttribute("href", "/articles/1/edit");
    expect(link).toHaveAttribute("title", "Modifier Travaux");
  });
});

describe("ConfirmDeleteButton", () => {
  const setup = (overrides: Partial<Parameters<typeof ConfirmDeleteButton>[0]> = {}) => {
    const onConfirm = vi.fn();
    render(
      <ConfirmDeleteButton
        label="Supprimer Travaux"
        title="Supprimer l'article ?"
        description="Cette action est irréversible."
        onConfirm={onConfirm}
        {...overrides}
      />,
    );
    return onConfirm;
  };

  it("asks before deleting anything", async () => {
    const onConfirm = setup();

    fireEvent.click(screen.getByRole("button", { name: "Supprimer Travaux" }));

    expect(await screen.findByText("Supprimer l'article ?")).toBeInTheDocument();
    expect(onConfirm).not.toHaveBeenCalled();
  });

  it("deletes only once confirmed, and closes", async () => {
    const onConfirm = setup();

    fireEvent.click(screen.getByRole("button", { name: "Supprimer Travaux" }));
    fireEvent.click(await screen.findByRole("button", { name: "Supprimer" }));

    expect(onConfirm).toHaveBeenCalledTimes(1);
    await waitFor(() =>
      expect(screen.queryByText("Supprimer l'article ?")).not.toBeInTheDocument(),
    );
  });

  it("deletes nothing when cancelled", async () => {
    const onConfirm = setup();

    fireEvent.click(screen.getByRole("button", { name: "Supprimer Travaux" }));
    fireEvent.click(await screen.findByRole("button", { name: "Annuler" }));

    await waitFor(() =>
      expect(screen.queryByText("Supprimer l'article ?")).not.toBeInTheDocument(),
    );
    expect(onConfirm).not.toHaveBeenCalled();
  });

  it("can be disabled for an account that must not be removed", () => {
    setup({ disabled: true });

    expect(screen.getByRole("button", { name: "Supprimer Travaux" })).toBeDisabled();
  });
});

describe("StatusSelect", () => {
  const options = { NOUVEAU: "Nouveau", EN_COURS: "En cours", TRAITE: "Traité" };

  it("lists every status and reports the chosen one", () => {
    const onChange = vi.fn();
    render(
      <StatusSelect
        value="NOUVEAU"
        options={options}
        label="Statut du signalement"
        onChange={onChange}
      />,
    );

    const select = screen.getByRole("combobox", { name: "Statut du signalement" });
    expect(screen.getAllByRole("option").map((o) => o.textContent)).toEqual([
      "Nouveau",
      "En cours",
      "Traité",
    ]);
    fireEvent.change(select, { target: { value: "TRAITE" } });
    expect(onChange).toHaveBeenCalledWith("TRAITE");
  });

  it("can be disabled while a change is saved", () => {
    render(
      <StatusSelect
        value="NOUVEAU"
        options={options}
        label="Statut"
        disabled
        onChange={() => undefined}
      />,
    );

    expect(screen.getByRole("combobox", { name: "Statut" })).toBeDisabled();
  });
});

describe("FormActions", () => {
  it("submits, and offers to cancel", () => {
    const onCancel = vi.fn();
    render(
      <FormActions
        pending={false}
        submitLabel="Enregistrer"
        pendingLabel="Sauvegarde…"
        onCancel={onCancel}
      />,
    );

    expect(screen.getByRole("button", { name: "Enregistrer" })).toHaveAttribute(
      "type",
      "submit",
    );
    fireEvent.click(screen.getByRole("button", { name: "Annuler" }));
    expect(onCancel).toHaveBeenCalled();
  });

  it("locks the submit button and says it is working while saving", () => {
    render(
      <FormActions
        pending
        submitLabel="Enregistrer"
        pendingLabel="Sauvegarde…"
        onCancel={() => undefined}
      />,
    );

    expect(screen.getByRole("button", { name: "Sauvegarde…" })).toBeDisabled();
  });
});

import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Inbox } from "lucide-react";
import { Input } from "@/components/ui/input";
import { EmptyState } from "./empty-state";
import { Field } from "./field";
import { PageHeader } from "./page-header";
import { Panel } from "./panel";
import { StatusBadge } from "./status-badge";

describe("PageHeader", () => {
  it("gives the page one level-one title, its description and its actions", () => {
    render(
      <PageHeader
        title="Actualités"
        description="Ce que voient les habitants."
        actions={<button>Nouvel article</button>}
      />,
    );

    expect(
      screen.getByRole("heading", { level: 1, name: "Actualités" }),
    ).toBeInTheDocument();
    expect(screen.getByText("Ce que voient les habitants.")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Nouvel article" }),
    ).toBeInTheDocument();
  });

  it("offers a way back only when asked to", () => {
    const { rerender } = render(<PageHeader title="Modifier" />);
    expect(screen.queryByRole("link")).not.toBeInTheDocument();

    rerender(
      <PageHeader title="Modifier" backHref="/articles" backLabel="Actualités" />,
    );
    expect(screen.getByRole("link", { name: "Actualités" })).toHaveAttribute(
      "href",
      "/articles",
    );
  });
});

describe("Panel", () => {
  it("shows its title as a level-two heading with the actions beside it", () => {
    render(
      <Panel title="Modules" actions={<button>Tout activer</button>}>
        <p>Contenu</p>
      </Panel>,
    );

    expect(
      screen.getByRole("heading", { level: 2, name: "Modules" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Tout activer" })).toBeInTheDocument();
    expect(screen.getByText("Contenu")).toBeInTheDocument();
  });

  it("has no header when it has neither title nor actions", () => {
    render(
      <Panel>
        <p>Seul</p>
      </Panel>,
    );

    expect(screen.queryByRole("heading")).not.toBeInTheDocument();
  });
});

describe("EmptyState", () => {
  it("says what is missing and offers the next step", () => {
    render(
      <EmptyState
        icon={Inbox}
        title="Aucun article"
        description="Publiez le premier."
        action={<a href="/articles/new">Nouvel article</a>}
      />,
    );

    expect(
      screen.getByRole("heading", { name: "Aucun article" }),
    ).toBeInTheDocument();
    expect(screen.getByText("Publiez le premier.")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Nouvel article" })).toBeInTheDocument();
  });
});

describe("Field", () => {
  it("links the label, the hint and the control", () => {
    render(
      <Field label="Titre" id="title" hint="Visible par les habitants.">
        <Input />
      </Field>,
    );

    const input = screen.getByLabelText("Titre");
    expect(input).toHaveAttribute("id", "title");
    expect(input).toHaveAccessibleDescription("Visible par les habitants.");
  });

  it("announces an error and flags the control as invalid", () => {
    render(
      <Field label="Titre" id="title" error="Le titre est requis.">
        <Input />
      </Field>,
    );

    expect(screen.getByRole("alert")).toHaveTextContent("Le titre est requis.");
    expect(screen.getByLabelText("Titre")).toBeInvalid();
    expect(screen.getByLabelText("Titre")).toHaveAccessibleDescription(
      "Le titre est requis.",
    );
  });

  it("leaves the control alone when there is neither hint nor error", () => {
    render(
      <Field label="Titre" id="title">
        <Input />
      </Field>,
    );

    expect(screen.getByLabelText("Titre")).not.toHaveAttribute(
      "aria-describedby",
    );
  });
});

describe("StatusBadge", () => {
  it("shows its text, with a decorative dot that screen readers skip", () => {
    const { container } = render(<StatusBadge tone="good">Actif</StatusBadge>);

    expect(screen.getByText("Actif")).toBeInTheDocument();
    expect(container.querySelector('[aria-hidden="true"]')).not.toBeNull();
  });
});

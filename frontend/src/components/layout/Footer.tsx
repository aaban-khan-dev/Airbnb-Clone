import { Container } from "@/components/ui/Container";
import { APP_NAME } from "@/lib/config";

const COLUMNS = [
  { title: "Support", links: ["Help Centre", "Safety information", "Cancellation options"] },
  { title: "Hosting", links: ["Host your home", "Hosting resources", "Community forum"] },
  { title: APP_NAME, links: ["Newsroom", "Careers", "Investors"] },
];

export function Footer() {
  return (
    <footer className="mt-16 border-t border-line bg-surface">
      <Container className="grid gap-8 py-12 text-sm md:grid-cols-3">
        {COLUMNS.map((column) => (
          <div key={column.title}>
            <h3 className="mb-3 font-semibold">{column.title}</h3>
            <ul className="space-y-3 text-muted">
              {column.links.map((link) => (
                <li key={link}>{link}</li>
              ))}
            </ul>
          </div>
        ))}
      </Container>
      <Container className="border-t border-line py-6 text-sm text-muted">
        © {new Date().getFullYear()} {APP_NAME} · A demo project · Privacy · Terms
      </Container>
    </footer>
  );
}

import Link from "next/link";

import { Container } from "@/components/ui/Container";

// Placeholder for sections the assignment allows to be mocked
export function ComingSoon({ title, description }: { title: string; description: string }) {
  return (
    <Container className="flex flex-col items-start py-16 md:py-24">
      <h1 className="text-3xl font-semibold">{title}</h1>
      <p className="mt-3 max-w-md text-muted">{description}</p>
      <span className="mt-6 rounded-full bg-surface px-3 py-1 text-xs font-semibold uppercase tracking-wide text-muted">
        Coming soon
      </span>
      <Link
        href="/"
        className="mt-8 rounded-lg border border-ink px-6 py-3 text-sm font-semibold hover:bg-surface"
      >
        Start searching
      </Link>
    </Container>
  );
}

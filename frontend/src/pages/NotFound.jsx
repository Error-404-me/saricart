import { Link } from "react-router-dom";
import Button from "../components/common/Button";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-[var(--color-paper)] px-4 text-center">
      <span className="font-display text-5xl">🏪</span>
      <h1 className="font-display text-2xl font-bold text-[var(--color-ink)]">
        Sarado — nothing here
      </h1>
      <p className="max-w-sm text-[var(--color-muted)]">
        This shelf is empty. The page you're looking for doesn't exist.
      </p>
      <Link to="/">
        <Button variant="secondary">Back to the store</Button>
      </Link>
    </div>
  );
}

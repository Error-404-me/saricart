import { Link } from "react-router-dom";
import Button from "../components/common/Button";

export default function Unauthorized() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-[var(--color-paper)] px-4 text-center">
      <span className="font-display text-5xl">🚫</span>
      <h1 className="font-display text-2xl font-bold text-[var(--color-ink)]">
        This page isn't for your account
      </h1>
      <p className="max-w-sm text-[var(--color-muted)]">
        You're signed in, but this area is reserved for a different account type.
      </p>
      <Link to="/">
        <Button variant="secondary">Back to safety</Button>
      </Link>
    </div>
  );
}

import { useState } from "react";
import { Mail, Phone, MapPin, Send } from "lucide-react";
import Input from "../components/common/Input";
import Button from "../components/common/Button";

export default function Contact() {
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [fieldErrors, setFieldErrors] = useState({});
  const [status, setStatus] = useState("idle");

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  function validate() {
    const errors = {};
    if (!form.name.trim()) errors.name = "Enter your name.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim()))
      errors.email = "Enter a valid email address.";
    if (!form.message.trim() || form.message.trim().length < 10)
      errors.message = "Message must be at least 10 characters.";
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  }

  function handleSubmit(e) {
    e.preventDefault();
    if (!validate()) return;
    setStatus("sending");
    // TODO: wire to a backend /api/contact endpoint when available.
    window.location.href = `mailto:support@saricart.app?subject=${encodeURIComponent(
      `Message from ${form.name}`,
    )}&body=${encodeURIComponent(`${form.message}\n\nReply to: ${form.email}`)}`;
    setStatus("sent");
    setForm({ name: "", email: "", message: "" });
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <h1 className="font-display text-3xl font-bold text-[var(--color-ink)]">
        Contact Us
      </h1>
      <p className="mt-2 text-sm text-[var(--color-muted)]">
        Have a question or need help with your account? Reach out.
      </p>

      <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-3">
        <div className="flex items-start gap-3">
          <Mail className="mt-0.5 h-4 w-4 shrink-0 text-[var(--color-storefront)]" />
          <div>
            <p className="text-sm font-medium text-[var(--color-ink)]">Email</p>
            <a
              href="mailto:support@saricart.app"
              className="text-sm text-[var(--color-muted)] hover:underline"
            >
              support@saricart.app
            </a>
          </div>
        </div>
        <div className="flex items-start gap-3">
          <Phone className="mt-0.5 h-4 w-4 shrink-0 text-[var(--color-storefront)]" />
          <div>
            <p className="text-sm font-medium text-[var(--color-ink)]">Phone</p>
            <p className="text-sm text-[var(--color-muted)]">
              +63 900 000 0000
            </p>
          </div>
        </div>
        <div className="flex items-start gap-3">
          <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-[var(--color-storefront)]" />
          <div>
            <p className="text-sm font-medium text-[var(--color-ink)]">
              Address
            </p>
            <p className="text-sm text-[var(--color-muted)]">
              Unit 000, Sample Business Center, Cebu City, Philippines
            </p>
          </div>
        </div>
      </div>

      <form
        onSubmit={handleSubmit}
        noValidate
        className="mt-10 flex flex-col gap-4 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6"
      >
        <Input
          id="name"
          name="name"
          label="Your name"
          value={form.name}
          onChange={handleChange}
          error={fieldErrors.name}
        />
        <Input
          id="email"
          name="email"
          type="email"
          label="Your email"
          value={form.email}
          onChange={handleChange}
          error={fieldErrors.email}
        />
        <div className="flex flex-col gap-1.5">
          <label
            htmlFor="message"
            className="text-sm font-medium text-[var(--color-ink)]"
          >
            Message
          </label>
          <textarea
            id="message"
            name="message"
            rows={5}
            value={form.message}
            onChange={handleChange}
            className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-paper)] px-3.5 py-2.5 text-sm text-[var(--color-ink)] outline-none transition focus:border-[var(--color-storefront)] focus:ring-2 focus:ring-[var(--color-storefront)]/20"
          />
          {fieldErrors.message && (
            <p className="text-sm text-[var(--color-crate)]" role="alert">
              {fieldErrors.message}
            </p>
          )}
        </div>
        {status === "sent" && (
          <p className="rounded-lg bg-[var(--color-storefront)]/10 px-3 py-2 text-sm text-[var(--color-storefront)]">
            Your email app should have opened with your message.
          </p>
        )}
        <Button
          type="submit"
          loading={status === "sending"}
          className="w-fit gap-1.5"
        >
          <Send className="h-4 w-4" />
          Send message
        </Button>
      </form>
    </div>
  );
}

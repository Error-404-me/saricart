import { useState } from "react";
import { User, Mail, ShieldCheck, Pencil, Check, X } from "lucide-react";
import { useAuth } from "../../hooks/useAuth";
import Input from "../../components/common/Input";
import Button from "../../components/common/Button";
import { isValidEmail, isValidUsername } from "../../utils/validators";
import { updateProfile } from "../../services/userService";

function InfoRow({ icon: Icon, label, value }) {
  return (
    <div className="flex items-center gap-3 py-3">
      <span className="rounded-lg bg-[var(--color-storefront)]/10 p-2 text-[var(--color-storefront)]">
        <Icon className="h-4 w-4" />
      </span>
      <div>
        <p className="text-xs text-[var(--color-muted)]">{label}</p>
        <p className="text-sm font-medium text-[var(--color-ink)]">{value}</p>
      </div>
    </div>
  );
}

export default function ProfileSettings() {
  const { user, updateUser } = useAuth();
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ username: user?.username || "", email: user?.email || "" });
  const [fieldErrors, setFieldErrors] = useState({});
  const [formError, setFormError] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  function startEditing() {
    setForm({ username: user?.username || "", email: user?.email || "" });
    setFieldErrors({});
    setFormError("");
    setEditing(true);
  }

  function validate() {
    const errors = {};
    if (!isValidUsername(form.username)) errors.username = "3-50 characters: letters, numbers, underscores.";
    if (!isValidEmail(form.email)) errors.email = "Enter a valid email address.";
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  }

  async function handleSave() {
    setFormError("");
    if (!validate()) return;
    setSaving(true);
    try {
      const updated = await updateProfile({ username: form.username.trim(), email: form.email.trim() });
      updateUser(updated);
      setEditing(false);
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (err) {
      setFormError(err.response?.data?.detail || "Couldn't save your profile. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-lg font-bold text-[var(--color-ink)]">Profile</h2>
        {!editing && (
          <Button variant="ghost" onClick={startEditing} className="gap-1.5 !px-3 !py-1.5 text-sm">
            <Pencil className="h-3.5 w-3.5" />
            Edit
          </Button>
        )}
      </div>

      {editing ? (
        <div className="mt-4 flex flex-col gap-4">
          <Input
            id="username"
            label="Username"
            value={form.username}
            onChange={(e) => setForm((f) => ({ ...f, username: e.target.value }))}
            error={fieldErrors.username}
          />
          <Input
            id="email"
            type="email"
            label="Email"
            value={form.email}
            onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
            error={fieldErrors.email}
          />

          {formError && (
            <p className="rounded-lg bg-[var(--color-crate)]/10 px-3 py-2 text-sm text-[var(--color-crate)]" role="alert">
              {formError}
            </p>
          )}

          <div className="flex gap-2">
            <Button variant="primary" loading={saving} onClick={handleSave} className="gap-1.5">
              <Check className="h-4 w-4" />
              Save changes
            </Button>
            <Button variant="ghost" onClick={() => setEditing(false)} className="gap-1.5">
              <X className="h-4 w-4" />
              Cancel
            </Button>
          </div>
        </div>
      ) : (
        <div className="mt-1 flex flex-col divide-y divide-[var(--color-border-subtle)]">
          <InfoRow icon={User} label="Username" value={user?.username} />
          <InfoRow icon={Mail} label="Email" value={user?.email} />
          <InfoRow icon={ShieldCheck} label="Account type" value={user?.role === "owner" ? "Store owner" : "Customer"} />
        </div>
      )}

      {saved && !editing && (
        <p className="mt-4 rounded-lg bg-[var(--color-storefront)]/10 px-3 py-2 text-sm text-[var(--color-storefront)]">
          Profile updated.
        </p>
      )}
    </div>
  );
}
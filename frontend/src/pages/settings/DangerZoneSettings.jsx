import { useState } from "react";
import { AlertTriangle, Trash2 } from "lucide-react";
import { useAuth } from "../../hooks/useAuth";
import Button from "../../components/common/Button";
import Modal from "../../components/common/Modal";
import PasswordInput from "../../components/common/PasswordInput";
import { deleteAccount } from "../../services/userService";

export default function DangerZoneSettings() {
  const { logout } = useAuth();
  const [modalOpen, setModalOpen] = useState(false);
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [deleting, setDeleting] = useState(false);

  function closeModal() {
    setModalOpen(false);
    setPassword("");
    setError("");
  }

  async function handleDelete() {
    if (!password) {
      setError("Enter your password to confirm.");
      return;
    }
    setDeleting(true);
    setError("");
    try {
      await deleteAccount(password);
      logout();
    } catch (err) {
      setError(
        err.response?.data?.detail ||
          "Couldn't delete your account. Please try again.",
      );
    } finally {
      setDeleting(false);
    }
  }

  return (
    <>
      <div className="rounded-2xl border border-[var(--color-crate)]/25 bg-[var(--color-crate)]/5 p-6">
        <h2 className="flex items-center gap-2 font-display text-lg font-bold text-[var(--color-crate)]">
          <AlertTriangle className="h-4 w-4" />
          Danger zone
        </h2>
        <p className="mt-1 text-sm text-[var(--color-muted)]">
          Deactivate and permanently delete your account. Your account is
          deactivated immediately and erased after 30 days, unless you log back
          in before then.
        </p>
        <p className="mt-2 text-xs text-[var(--color-muted)]">
          Accounts with existing products or order history can't be deleted
          automatically — you'll be asked to contact support instead.
        </p>

        <Button
          variant="primary"
          onClick={() => setModalOpen(true)}
          className="mt-4 gap-1.5 !bg-[var(--color-crate)] hover:!bg-[var(--color-crate-dark)]"
        >
          <Trash2 className="h-4 w-4" />
          Delete my account
        </Button>
      </div>

      <Modal
        open={modalOpen}
        onClose={closeModal}
        title="Delete your account?"
        footer={
          <>
            <Button variant="ghost" onClick={closeModal}>
              Cancel
            </Button>
            <Button
              variant="primary"
              loading={deleting}
              onClick={handleDelete}
              className="!bg-[var(--color-crate)] hover:!bg-[var(--color-crate-dark)]"
            >
              Permanently delete
            </Button>
          </>
        }
      >
        <div className="flex flex-col gap-3">
          <p>
            This signs you out immediately. Your account can be reactivated by
            logging back in within 30 days — after that, it's permanently
            deleted. Enter your password to confirm.
          </p>
          <PasswordInput
            id="delete-confirm-password"
            label="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
          />
          {error && (
            <p
              className="rounded-lg bg-[var(--color-crate)]/10 px-3 py-2 text-sm text-[var(--color-crate)]"
              role="alert"
            >
              {error}
            </p>
          )}
        </div>
      </Modal>
    </>
  );
}

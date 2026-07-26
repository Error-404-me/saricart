import Modal from "./Modal";
import Button from "./Button";

/**
 * Generic "are you sure?" dialog for actions that are hard to undo or easy
 * to trigger by accident (logout, cancelling an order, deleting a
 * notification). Wraps the existing Modal/Button primitives instead of
 * each call site hand-rolling its own footer, so every confirmation in the
 * app looks and behaves the same way.
 */
export default function ConfirmModal({
  open,
  onClose,
  onConfirm,
  title,
  children,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  loading = false,
}) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title={title}
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            {cancelLabel}
          </Button>
          <Button variant="primary" loading={loading} onClick={onConfirm}>
            {confirmLabel}
          </Button>
        </>
      }
    >
      {children}
    </Modal>
  );
}
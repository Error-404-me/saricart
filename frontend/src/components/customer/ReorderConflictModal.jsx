import Modal from "../common/Modal";
import Button from "../common/Button";

export default function ReorderConflictModal({ conflict, onClose }) {
  return (
    <Modal
      open={!!conflict}
      onClose={onClose}
      title="Start a new cart?"
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="primary" onClick={conflict?.retry}>
            Replace cart
          </Button>
        </>
      }
    >
      <p>
        Your cart has items from{" "}
        <strong className="text-[var(--color-ink)]">{conflict?.ownerUsername}'s store</strong>.
        Adding this item will clear your current cart, since pickup happens at one store.
      </p>
    </Modal>
  );
}
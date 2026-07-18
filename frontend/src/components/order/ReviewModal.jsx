import { useState } from "react";
import Modal from "../common/Modal";
import Button from "../common/Button";
import StarRating from "../store/StarRating";
import { createReview } from "../../services/reviewService";

export default function ReviewModal({ open, onClose, order, onReviewed }) {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  function handleClose() {
    setRating(0);
    setComment("");
    setError("");
    onClose();
  }

  async function handleSubmit() {
    if (rating === 0) {
      setError("Pick a star rating first.");
      return;
    }
    setSubmitting(true);
    setError("");
    try {
      const review = await createReview({ orderId: order.id, rating, comment });
      onReviewed(order.id, review.id);
      handleClose();
    } catch (err) {
      setError(err.response?.data?.detail || "Couldn't submit your review. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title={`Rate ${order?.owner_username ? `${order.owner_username}'s store` : "this order"}`}
      footer={
        <>
          <Button variant="ghost" onClick={handleClose}>
            Cancel
          </Button>
          <Button variant="primary" loading={submitting} onClick={handleSubmit}>
            Submit review
          </Button>
        </>
      }
    >
      <div className="flex flex-col gap-4">
        <div className="flex flex-col items-center gap-2 py-2">
          <StarRating value={rating} onChange={setRating} size="lg" />
          <p className="text-xs text-[var(--color-muted)]">
            {rating > 0 ? `${rating} out of 5` : "Tap a star to rate"}
          </p>
        </div>
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          rows={3}
          maxLength={500}
          placeholder="Anything you'd like to share? (optional)"
          className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-paper)] px-3.5 py-2.5 text-sm text-[var(--color-ink)] outline-none transition
            placeholder:text-[var(--color-muted)]/60
            focus:border-[var(--color-storefront)] focus:ring-2 focus:ring-[var(--color-storefront)]/20"
        />
        {error && (
          <p className="rounded-lg bg-[var(--color-crate)]/10 px-3 py-2 text-sm text-[var(--color-crate)]" role="alert">
            {error}
          </p>
        )}
      </div>
    </Modal>
  );
}

import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import ProductForm from "../../components/product/ProductForm";
import { createProduct, uploadProductImage } from "../../services/productService";

export default function AddProduct() {
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState("");

  async function handleSubmit({ imageFile, ...payload }) {
    setSubmitting(true);
    setFormError("");
    try {
      const product = await createProduct(payload);
      if (imageFile) {
        await uploadProductImage(product.id, imageFile);
      }
      navigate("/owner/products", { replace: true });
    } catch (err) {
      setFormError(err.response?.data?.detail || "Couldn't add this product. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="mx-auto flex max-w-xl flex-col gap-5">
      <Link
        to="/owner/products"
        className="flex items-center gap-1.5 text-sm text-[var(--color-muted)] hover:text-[var(--color-ink)]"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to products
      </Link>

      <div>
        <h1 className="font-display text-2xl font-bold text-[var(--color-ink)]">Add a product</h1>
        <p className="mt-1 text-sm text-[var(--color-muted)]">
          This will appear in your storefront once customer browsing is live (Phase 5).
        </p>
      </div>

      <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6">
        <ProductForm
          onSubmit={handleSubmit}
          submitting={submitting}
          formError={formError}
          submitLabel="Add product"
        />
      </div>
    </div>
  );
}

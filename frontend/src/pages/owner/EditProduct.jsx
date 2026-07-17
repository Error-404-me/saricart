import { useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import ProductForm from "../../components/product/ProductForm";
import Spinner from "../../components/common/Spinner";
import { useAuth } from "../../hooks/useAuth";
import {
  fetchProduct,
  updateProduct,
  uploadProductImage,
} from "../../services/productService";

export default function EditProduct() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState("");

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const data = await fetchProduct(id);
        if (cancelled) return;
        if (data.owner_id !== user?.id) {
          navigate("/unauthorized", { replace: true });
          return;
        }
        setProduct(data);
      } catch {
        if (!cancelled) setLoadError("Couldn't find that product.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [id, user?.id, navigate]);

  async function handleSubmit({ imageFile, ...payload }) {
    setSubmitting(true);
    setFormError("");
    try {
      await updateProduct(id, payload);
      if (imageFile) {
        await uploadProductImage(id, imageFile);
      }
      navigate("/owner/products", { replace: true });
    } catch (err) {
      setFormError(err.response?.data?.detail || "Couldn't save changes. Please try again.");
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
        <h1 className="font-display text-2xl font-bold text-[var(--color-ink)]">Edit product</h1>
      </div>

      {loading ? (
        <Spinner label="Loading product…" />
      ) : loadError ? (
        <p className="rounded-lg bg-[var(--color-crate)]/10 px-3 py-2 text-sm text-[var(--color-crate)]">
          {loadError}
        </p>
      ) : (
        <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6">
          <ProductForm
            initialValues={product}
            initialImageUrl={product.image}
            onSubmit={handleSubmit}
            submitting={submitting}
            formError={formError}
            submitLabel="Save changes"
          />
        </div>
      )}
    </div>
  );
}

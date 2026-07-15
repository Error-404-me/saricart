import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Plus, Package } from "lucide-react";
import SearchBar from "../../components/common/SearchBar";
import Spinner from "../../components/common/Spinner";
import Modal from "../../components/common/Modal";
import Button from "../../components/common/Button";
import ComingSoon from "../../components/common/ComingSoon";
import ProductTable from "../../components/product/ProductTable";
import { fetchMyProducts, deleteProduct } from "../../services/productService";

export default function ManageProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [error, setError] = useState("");
  const [productPendingDelete, setProductPendingDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const loadProducts = useCallback(async (searchTerm) => {
    setLoading(true);
    setError("");
    try {
      const data = await fetchMyProducts({ search: searchTerm || undefined });
      setProducts(data);
    } catch {
      setError("Couldn't load your products. Please try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timeout = setTimeout(() => loadProducts(search), 300);
    return () => clearTimeout(timeout);
  }, [search, loadProducts]);

  async function handleConfirmDelete() {
    if (!productPendingDelete) return;
    setDeleting(true);
    try {
      await deleteProduct(productPendingDelete.id);
      setProducts((prev) => prev.filter((p) => p.id !== productPendingDelete.id));
      setProductPendingDelete(null);
    } catch {
      setError("Couldn't delete that product. Please try again.");
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-[var(--color-ink)]">Products</h1>
          <p className="mt-1 text-sm text-[var(--color-muted)]">
            {products.length} {products.length === 1 ? "item" : "items"} in your catalog
          </p>
        </div>
        <Link to="/owner/products/add">
          <Button variant="secondary" className="gap-1.5">
            <Plus className="h-4 w-4" />
            Add product
          </Button>
        </Link>
      </div>

      <SearchBar value={search} onChange={setSearch} placeholder="Search your products…" className="max-w-sm" />

      {error && (
        <p className="rounded-lg bg-[var(--color-crate)]/10 px-3 py-2 text-sm text-[var(--color-crate)]" role="alert">
          {error}
        </p>
      )}

      {loading ? (
        <Spinner label="Loading your products…" />
      ) : products.length === 0 ? (
        <ComingSoon
          icon={Package}
          title={search ? "No matching products" : "No products yet"}
          description={
            search
              ? "Try a different search term, or clear the search to see everything."
              : "Add your first product to start building your storefront."
          }
        />
      ) : (
        <ProductTable products={products} onDeleteRequest={setProductPendingDelete} />
      )}

      <Modal
        open={!!productPendingDelete}
        onClose={() => setProductPendingDelete(null)}
        title="Delete this product?"
        footer={
          <>
            <Button variant="ghost" onClick={() => setProductPendingDelete(null)}>
              Cancel
            </Button>
            <Button variant="primary" loading={deleting} onClick={handleConfirmDelete}>
              Delete
            </Button>
          </>
        }
      >
        {productPendingDelete && (
          <p>
            <strong className="text-[var(--color-ink)]">{productPendingDelete.name}</strong> will
            be removed from your storefront. This can't be undone.
          </p>
        )}
      </Modal>
    </div>
  );
}

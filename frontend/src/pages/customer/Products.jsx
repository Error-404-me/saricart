import { useCallback, useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import SearchBar from "../../components/common/SearchBar";
import Spinner from "../../components/common/Spinner";
import ProductGrid from "../../components/product/ProductGrid";
import CategoryFilter from "../../components/product/CategoryFilter";
import { browseProducts, browseCategories } from "../../services/productService";

export default function Products() {
  const [searchParams, setSearchParams] = useSearchParams();
  const search = searchParams.get("search") || "";
  const category = searchParams.get("category") || "";

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    browseCategories().then(setCategories).catch(() => setCategories([]));
  }, []);

  const load = useCallback(async (searchTerm, categoryTerm) => {
    setLoading(true);
    setError("");
    try {
      const data = await browseProducts({
        search: searchTerm || undefined,
        category: categoryTerm || undefined,
      });
      setProducts(data);
    } catch {
      setError("Couldn't load products right now. Please try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timeout = setTimeout(() => load(search, category), 250);
    return () => clearTimeout(timeout);
  }, [search, category, load]);

  function updateParams(next) {
    const params = new URLSearchParams(searchParams);
    Object.entries(next).forEach(([key, value]) => {
      if (value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }
    });
    setSearchParams(params, { replace: true });
  }

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h1 className="font-display text-2xl font-bold text-[var(--color-ink)]">
          Browse products
        </h1>
        <p className="mt-1 text-sm text-[var(--color-muted)]">
          Everything currently available for pre-order.
        </p>
      </div>

      <SearchBar
        value={search}
        onChange={(value) => updateParams({ search: value })}
        placeholder="Search products…"
        className="max-w-sm"
      />

      <CategoryFilter
        categories={categories}
        selected={category}
        onSelect={(value) => updateParams({ category: value })}
      />

      {error && (
        <p className="rounded-lg bg-[var(--color-crate)]/10 px-3 py-2 text-sm text-[var(--color-crate)]" role="alert">
          {error}
        </p>
      )}

      {loading ? (
        <Spinner label="Loading products…" />
      ) : (
        <ProductGrid
          products={products}
          emptyTitle={search || category ? "No matching products" : "No products yet"}
          emptyDescription={
            search || category
              ? "Try a different search term or category."
              : "Check back soon — store owners are still stocking up."
          }
        />
      )}
    </div>
  );
}

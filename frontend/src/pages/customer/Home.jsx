import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Search } from "lucide-react";
import { useAuth } from "../../hooks/useAuth";
import Button from "../../components/common/Button";
import Spinner from "../../components/common/Spinner";
import ProductGrid from "../../components/product/ProductGrid";
import PersonalizedSuggestions from "../../components/customer/PersonalizedSuggestions";
import BuyAgainList from "../../components/customer/BuyAgainList";
import RecentlyBoughtStrip from "../../components/customer/RecentlyBoughtStrip";
import { browseProducts, browseCategories } from "../../services/productService";
import { fetchBuyAgain, fetchRecentlyBought, fetchSuggestions } from "../../services/customerService";

export default function Home() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [query, setQuery] = useState("");
  const [categories, setCategories] = useState([]);
  const [featured, setFeatured] = useState([]);
  const [loading, setLoading] = useState(true);

  const [buyAgain, setBuyAgain] = useState([]);
  const [recentlyBought, setRecentlyBought] = useState([]);
  const [suggestions, setSuggestions] = useState({ usually_buys: [], recommended: null });

  useEffect(() => {
    Promise.all([browseCategories(), browseProducts()])
      .then(([cats, products]) => {
        setCategories(cats);
        setFeatured(products.slice(0, 8));
      })
      .catch(() => {
        setCategories([]);
        setFeatured([]);
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    fetchBuyAgain().then(setBuyAgain).catch(() => setBuyAgain([]));
    fetchRecentlyBought().then(setRecentlyBought).catch(() => setRecentlyBought([]));
    fetchSuggestions()
      .then(setSuggestions)
      .catch(() => setSuggestions({ usually_buys: [], recommended: null }));
  }, []);

  function handleSearchSubmit(e) {
    e.preventDefault();
    navigate(query ? `/products?search=${encodeURIComponent(query)}` : "/products");
  }

  const hasPersonalization = suggestions.usually_buys.length > 0 || !!suggestions.recommended;

  return (
    <div className="flex flex-col gap-8">
      <div className="rounded-2xl bg-[var(--color-storefront)] px-6 py-10 text-center sm:px-10">
        <h1 className="font-display text-2xl font-bold text-white sm:text-3xl">
          Hi {user?.username}, what are you shopping for today?
        </h1>
        <p className="mt-2 text-sm text-white/75">
          Browse what's in stock, then pick it up in store.
        </p>
        <form onSubmit={handleSearchSubmit} className="mx-auto mt-5 flex max-w-md gap-2">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--color-muted)]" />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search products…"
              className="w-full rounded-lg border-2 border-amber-50 py-2.5 pl-9 pr-3.5 text-sm text-amber-50 outline-none
                focus:ring-2 focus:ring-[var(--color-awning)]"
            />
          </div>
          <Button
            type="submit"
            variant="secondary"
            className="!bg-[var(--color-awning)] !text-[var(--color-ink)] hover:!bg-[var(--color-awning-dark)]"
          >
            Search
          </Button>
        </form>
      </div>

      {hasPersonalization && (
        <PersonalizedSuggestions usuallyBuys={suggestions.usually_buys} recommended={suggestions.recommended} />
      )}

      {recentlyBought.length > 0 && (
        <div className="flex flex-col gap-3">
          <h2 className="font-display text-lg font-bold text-[var(--color-ink)]">Recently bought</h2>
          <RecentlyBoughtStrip items={recentlyBought} />
        </div>
      )}

      {buyAgain.length > 0 && (
        <div className="flex flex-col gap-3">
          <h2 className="font-display text-lg font-bold text-[var(--color-ink)]">Buy again</h2>
          <BuyAgainList items={buyAgain} />
        </div>
      )}

      {categories.length > 0 && (
        <div className="flex flex-col gap-3">
          <h2 className="font-display text-lg font-bold text-[var(--color-ink)]">Categories</h2>
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <Link
                key={category}
                to={`/products?category=${encodeURIComponent(category)}`}
                className="rounded-full bg-[var(--color-surface)] px-3.5 py-1.5 text-sm font-medium text-[var(--color-muted)] border border-[var(--color-border)] hover:border-[var(--color-storefront)]/40 hover:text-[var(--color-ink)]"
              >
                {category}
              </Link>
            ))}
          </div>
        </div>
      )}

      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-lg font-bold text-[var(--color-ink)]">
            {featured.length > 0 ? "Fresh in stock" : "Products"}
          </h2>
          {featured.length > 0 && (
            <Link to="/products" className="text-sm font-medium text-[var(--color-storefront)] hover:underline">
              See all
            </Link>
          )}
        </div>

        {loading ? (
          <Spinner label="Loading products…" />
        ) : (
          <ProductGrid
            products={featured}
            emptyTitle="No products yet"
            emptyDescription="Check back soon — store owners are still stocking up."
          />
        )}
      </div>
    </div>
  );
}
import { PackageSearch } from "lucide-react";
import ProductCard from "./ProductCard";
import ComingSoon from "../common/ComingSoon";

export default function ProductGrid({ products, emptyTitle, emptyDescription }) {
  if (products.length === 0) {
    return (
      <ComingSoon
        icon={PackageSearch}
        title={emptyTitle || "No products found"}
        description={emptyDescription || "Try a different search term or category."}
      />
    );
  }

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}

import { Link } from "react-router-dom";
import { ShoppingCart } from "lucide-react";
import { useCart } from "../../hooks/useCart";
import CartItem from "../../components/cart/CartItem";
import CartSummary from "../../components/cart/CartSummary";
import ComingSoon from "../../components/common/ComingSoon";
import Button from "../../components/common/Button";

export default function Cart() {
  const { items, itemCount, subtotal, updateQuantity, removeItem } = useCart();

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center gap-4">
        <ComingSoon
          icon={ShoppingCart}
          title="Your cart is empty"
          description="Browse the catalog and add something you'd like to pre-order."
        />
        <Link to="/products">
          <Button variant="secondary">Browse products</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
      <div className="lg:col-span-2">
        <h1 className="font-display text-2xl font-bold text-[var(--color-ink)]">Your cart</h1>
        <div className="mt-4 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] px-5">
          {items.map((item) => (
            <CartItem
              key={item.productId}
              item={item}
              onUpdateQuantity={updateQuantity}
              onRemove={removeItem}
            />
          ))}
        </div>
      </div>

      <div>
        <CartSummary
          itemCount={itemCount}
          subtotal={subtotal}
          storeName={items[0] ? `${items[0].ownerUsername}'s store` : null}
        />
      </div>
    </div>
  );
}

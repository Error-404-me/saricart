import { createContext, useCallback, useEffect, useMemo, useState } from "react";
import { useAuth } from "../hooks/useAuth";
import { loadCart, saveCart, clearStoredCart } from "../services/cartService";

export const CartContext = createContext(null);

export function CartProvider({ children }) {
  const { user } = useAuth();
  const [items, setItems] = useState([]);

  // Load the right cart whenever the logged-in user changes (login/logout/switch account).
  useEffect(() => {
    setItems(user ? loadCart(user.id) : []);
  }, [user?.id]);

  useEffect(() => {
    if (user) saveCart(user.id, items);
  }, [items, user]);

  /**
   * Adds a product to the cart.
   * Since pickup happens at one physical store, a cart can only hold items
   * from a single owner at a time. If the cart already has items from a
   * different store, this returns a "conflict" instead of adding — the
   * caller should confirm with the person, then retry with `force: true`.
   */
  const addItem = useCallback(
    (product, quantity = 1, { force = false } = {}) => {
      const currentOwnerId = items[0]?.ownerId;
      const conflict =
        !force && items.length > 0 && currentOwnerId !== product.owner_id;

      if (conflict) {
        return { status: "conflict", ownerUsername: items[0].ownerUsername };
      }

      setItems((prev) => {
        const base = force && currentOwnerId !== product.owner_id ? [] : prev;
        const existing = base.find((i) => i.productId === product.id);
        const maxQty = product.stock;

        if (existing) {
          return base.map((i) =>
            i.productId === product.id
              ? { ...i, quantity: Math.min(i.quantity + quantity, maxQty) }
              : i
          );
        }

        return [
          ...base,
          {
            productId: product.id,
            name: product.name,
            price: Number(product.price),
            image: product.image,
            stock: product.stock,
            ownerId: product.owner_id,
            ownerUsername: product.owner_username,
            quantity: Math.min(quantity, maxQty),
          },
        ];
      });

      return { status: "ok" };
    },
    [items]
  );

  const updateQuantity = useCallback((productId, quantity) => {
    setItems((prev) => {
      if (quantity <= 0) return prev.filter((i) => i.productId !== productId);
      return prev.map((i) =>
        i.productId === productId
          ? { ...i, quantity: Math.min(quantity, i.stock) }
          : i
      );
    });
  }, []);

  const removeItem = useCallback((productId) => {
    setItems((prev) => prev.filter((i) => i.productId !== productId));
  }, []);

  const clearCart = useCallback(() => {
    setItems([]);
    if (user) clearStoredCart(user.id);
  }, [user]);

  const itemCount = useMemo(() => items.reduce((sum, i) => sum + i.quantity, 0), [items]);
  const subtotal = useMemo(
    () => items.reduce((sum, i) => sum + i.price * i.quantity, 0),
    [items]
  );

  const value = {
    items,
    itemCount,
    subtotal,
    addItem,
    updateQuantity,
    removeItem,
    clearCart,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

import {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useAuth } from "../hooks/useAuth";
import { loadCart, saveCart, clearStoredCart } from "../services/cartService";
import {
  resolveTransactionUnit,
  getMaxQuantityInUnit,
} from "../utils/unitConversion";

export const CartContext = createContext(null);

export function CartProvider({ children }) {
  const { user } = useAuth();
  const [items, setItems] = useState([]);

  useEffect(() => {
    setItems(user ? loadCart(user.id) : []);
  }, [user?.id]);

  useEffect(() => {
    if (user) saveCart(user.id, items);
  }, [items, user]);

  /**
   * Adds a product to the cart in the given unit (defaults to the
   * product's primary unit). Since the same product can be bought in two
   * different units in one cart (e.g. 1 box + 3 loose pcs), lines are
   * keyed by `${productId}:${unit}` rather than productId alone.
   *
   * Since pickup happens at one physical store, a cart can only hold
   * items from a single owner at a time — a different owner returns a
   * "conflict" instead of adding; the caller should confirm, then retry
   * with `force: true`.
   */
  const addItem = useCallback(
    (product, quantity = 1, { force = false, unit } = {}) => {
      const requestedUnit = unit || product.unit;
      const resolved = resolveTransactionUnit(product, requestedUnit);
      if (!resolved) {
        return {
          status: "error",
          message: `This item isn't sold by ${requestedUnit}.`,
        };
      }
      const maxQuantity = getMaxQuantityInUnit(product, requestedUnit);
      const lineId = `${product.id}:${requestedUnit}`;

      const currentOwnerId = items[0]?.ownerId;
      const conflict =
        !force && items.length > 0 && currentOwnerId !== product.owner_id;
      if (conflict) {
        return { status: "conflict", ownerUsername: items[0].ownerUsername };
      }

      setItems((prev) => {
        const base = force && currentOwnerId !== product.owner_id ? [] : prev;
        const existing = base.find((i) => i.lineId === lineId);

        if (existing) {
          return base.map((i) =>
            i.lineId === lineId
              ? { ...i, quantity: Math.min(i.quantity + quantity, maxQuantity) }
              : i,
          );
        }

        return [
          ...base,
          {
            lineId,
            productId: product.id,
            name: product.name,
            image: product.image,
            ownerId: product.owner_id,
            ownerUsername: product.owner_username,
            unit: requestedUnit,
            unitPrice: resolved.unitPrice,
            maxQuantity,
            quantity: Math.min(quantity, maxQuantity),
          },
        ];
      });

      return { status: "ok" };
    },
    [items],
  );

  const updateQuantity = useCallback((lineId, quantity) => {
    setItems((prev) => {
      if (quantity <= 0) return prev.filter((i) => i.lineId !== lineId);
      return prev.map((i) =>
        i.lineId === lineId
          ? { ...i, quantity: Math.min(quantity, i.maxQuantity) }
          : i,
      );
    });
  }, []);

  const removeItem = useCallback((lineId) => {
    setItems((prev) => prev.filter((i) => i.lineId !== lineId));
  }, []);

  const clearCart = useCallback(() => {
    setItems([]);
    if (user) clearStoredCart(user.id);
  }, [user]);

  const itemCount = useMemo(
    () => items.reduce((sum, i) => sum + i.quantity, 0),
    [items],
  );
  const subtotal = useMemo(
    () => items.reduce((sum, i) => sum + i.unitPrice * i.quantity, 0),
    [items],
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

import { useCallback, useState } from "react";
import { useCart } from "./useCart";

export function useReorder() {
  const { addItem } = useCart();
  const [conflict, setConflict] = useState(null); // { ownerUsername, retry } | null
  const [addedId, setAddedId] = useState(null);

  const reorder = useCallback(
    (item, quantity = 1) => {
      if (!item.available || !item.product_id) return;

      const product = {
        id: item.product_id,
        name: item.product_name,
        price: Number(item.current_price),
        image: item.product_image,
        stock: item.current_stock,
        unit: item.current_unit,
        owner_id: item.owner_id,
        owner_username: item.owner_username,
      };

      function attempt(force) {
        const result = addItem(product, quantity, { force });
        if (result.status === "conflict") {
          setConflict({
            ownerUsername: result.ownerUsername,
            retry: () => {
              setConflict(null);
              attempt(true);
            },
          });
          return;
        }
        setAddedId(item.product_id);
        setTimeout(() => setAddedId(null), 1500);
      }

      attempt(false);
    },
    [addItem],
  );

  return {
    reorder,
    conflict,
    dismissConflict: () => setConflict(null),
    addedId,
  };
}

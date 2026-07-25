import { createContext, useCallback, useRef, useState } from "react";
import { uploadProductImage } from "../services/productService";

/**
 * Tracks product image uploads that were kicked off but not awaited —
 * e.g. AddProduct navigates to the product list right after creating the
 * product, rather than blocking on the photo upload too. This context is
 * how a page mounted *after* that navigation (ManageProducts) finds out
 * an upload is still in flight for a given product, and picks up the
 * finished result without needing to refetch the whole list.
 */
export const UploadQueueContext = createContext(null);

export function UploadQueueProvider({ children }) {
  // productId -> "uploading" | { error: string }
  const [pending, setPending] = useState({});
  // productId -> the updated product once its upload finishes, so an
  // already-mounted list can merge in the new image in place.
  const [completed, setCompleted] = useState({});

  // Kept outside state since it's just for a manual retry, not for render.
  const filesRef = useRef({});

  const runUpload = useCallback(async (productId, file) => {
    filesRef.current[productId] = file;
    setPending((prev) => ({ ...prev, [productId]: "uploading" }));
    try {
      const updated = await uploadProductImage(productId, file);
      setPending((prev) => {
        const next = { ...prev };
        delete next[productId];
        return next;
      });
      setCompleted((prev) => ({ ...prev, [productId]: updated }));
      delete filesRef.current[productId];
    } catch (err) {
      setPending((prev) => ({
        ...prev,
        [productId]: { error: err.response?.data?.detail || "Photo upload failed." },
      }));
    }
  }, []);

  const enqueueUpload = useCallback((productId, file) => runUpload(productId, file), [runUpload]);

  const retryUpload = useCallback(
    (productId) => {
      const file = filesRef.current[productId];
      if (file) runUpload(productId, file);
    },
    [runUpload],
  );

  const dismissCompleted = useCallback((productId) => {
    setCompleted((prev) => {
      if (!(productId in prev)) return prev;
      const next = { ...prev };
      delete next[productId];
      return next;
    });
  }, []);

  const value = { pending, completed, enqueueUpload, retryUpload, dismissCompleted };

  return <UploadQueueContext.Provider value={value}>{children}</UploadQueueContext.Provider>;
}
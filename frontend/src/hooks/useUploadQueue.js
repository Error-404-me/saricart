import { useContext } from "react";
import { UploadQueueContext } from "../context/UploadQueueContext";

export function useUploadQueue() {
  const context = useContext(UploadQueueContext);
  if (!context) {
    throw new Error("useUploadQueue must be used within an UploadQueueProvider");
  }
  return context;
}
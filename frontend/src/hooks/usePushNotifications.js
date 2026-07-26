import { useCallback, useEffect, useState } from "react";
import {
  fetchVapidPublicKey,
  registerPushSubscription,
  unregisterPushSubscription,
} from "../services/pushService";

function urlBase64ToUint8Array(base64String) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = window.atob(base64);
  return Uint8Array.from([...rawData].map((char) => char.charCodeAt(0)));
}

export function usePushNotifications() {
  const supported =
    typeof window !== "undefined" &&
    "serviceWorker" in navigator &&
    "PushManager" in window &&
    "Notification" in window;

  const [permission, setPermission] = useState(
    supported ? Notification.permission : "unsupported",
  );
  const [subscribed, setSubscribed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const checkSubscription = useCallback(async () => {
    if (!supported) return;
    try {
      const registration = await navigator.serviceWorker.ready;
      const existing = await registration.pushManager.getSubscription();
      setSubscribed(!!existing);
    } catch {
      // Service worker never activated — leave subscribed as false.
    }
  }, [supported]);

  useEffect(() => {
    checkSubscription();
  }, [checkSubscription]);

  async function enable() {
    if (!supported) {
      setError("Push notifications aren't supported in this browser.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const result = await Notification.requestPermission();
      setPermission(result);
      if (result !== "granted") {
        if (result === "denied") {
          setError(
            "Notifications are blocked for this site. Enable them in your browser's site settings, then try again.",
          );
        }
        return;
      }

      const publicKey = await fetchVapidPublicKey();
      if (!publicKey) {
        setError("Push notifications aren't configured on the server yet.");
        return;
      }

      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(publicKey),
      });
      await registerPushSubscription(subscription);
      setSubscribed(true);
    } catch (err) {
      console.error("Push subscribe failed:", err);
      setError("Couldn't turn on push notifications. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  async function disable() {
    if (!supported) return;
    setLoading(true);
    setError("");
    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();
      if (subscription) {
        await unregisterPushSubscription(subscription.endpoint);
        await subscription.unsubscribe();
      }
      setSubscribed(false);
    } catch (err) {
      console.error("Push unsubscribe failed:", err);
      setError("Couldn't turn off push notifications. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return { supported, permission, subscribed, loading, error, enable, disable };
}

"use client";

import { useEffect, useState, useContext } from "react";
import { AuthContext } from "@/contexts/auth-context";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase/firebase";

const VAPID_PUBLIC_KEY = "BDdIfx4EykmRrCBmI5Vp4fMzq2CVY8g3Qn9GTBJSnzqVQvR0J3gAMnRv5JZn0LHEnz5Xxy7xYZMxVzJ7J7X7j18";

export function PushNotificationManager() {
  const { user } = useContext(AuthContext);
  const [permission, setPermission] = useState<NotificationPermission>("default");
  const [subscribed, setSubscribed] = useState(false);

  useEffect(() => {
    if (!("Notification" in window)) return;
    setPermission(Notification.permission);
    if (Notification.permission === "granted" && user) {
      checkSubscription();
    }
  }, [user]);

  const checkSubscription = async () => {
    try {
      const reg = await navigator.serviceWorker.ready;
      const sub = await reg.pushManager.getSubscription();
      setSubscribed(!!sub);
    } catch {
      // service worker not ready
    }
  };

  useEffect(() => {
    const subscribe = async () => {
      if (!user) return;
      try {
        const reg = await navigator.serviceWorker.ready;
        const sub = await reg.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY) as any,
        });
        const subJson = sub.toJSON();
        await updateDoc(doc(db, "users", user.uid), {
          pushSubscription: subJson,
        });
        setSubscribed(true);
      } catch {
        // permission denied or failed
      }
    };

    if (permission === "granted" && !subscribed && user) {
      subscribe();
    }
  }, [permission, subscribed, user]);

  return null;
}

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = window.atob(base64);
  const output = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; i++) {
    output[i] = rawData.charCodeAt(i);
  }
  return output;
}

"use client";

import { useEffect, useState, useContext } from "react";
import { AuthContext } from "@/contexts/auth-context";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase/firebase";
import { BellRing } from "lucide-react";

const VAPID_PUBLIC_KEY = "BCyIqROE6j9cAdFTDhbGJSh8GZZZQSWIdY_XTYQER3eTQWy6F4kjbm0F9wFKnvrLTRfk71pFcfJ-A1BFN2eGCmE";

export function PushNotificationManager() {
  const { user } = useContext(AuthContext);
  const [permission, setPermission] = useState<NotificationPermission>("default");
  const [subscribed, setSubscribed] = useState(false);
  const [supported, setSupported] = useState(false);

  useEffect(() => {
    const canPush = "Notification" in window && "serviceWorker" in navigator && "PushManager" in window;
    setSupported(canPush);
    if (!canPush) return;
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

  if (!supported || subscribed || permission === "denied") return null;

  return (
    <button
      type="button"
      title="Enable push notifications"
      aria-label="Enable push notifications"
      onClick={async () => setPermission(await Notification.requestPermission())}
      className="decision-link grid h-10 w-10 place-items-center text-muted-foreground hover:bg-muted hover:text-foreground"
    >
      <BellRing className="h-4 w-4" />
    </button>
  );
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

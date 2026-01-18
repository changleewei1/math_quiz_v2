"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { supabaseClient } from "@/lib/supabaseClient";

const IDLE_TIMEOUT_MS = 2 * 60 * 1000;
const WARNING_DURATION_MS = 10 * 1000;
const LAST_ACTIVE_KEY = "idle:lastActiveAt";
const SIGNOUT_KEY = "idle:forceSignout";
const CHANNEL_NAME = "idle-logout";

const EXCLUDED_PATH_PREFIXES = [
  "/",
  "/login",
  "/teacher/login",
  "/admin/login",
  "/signup",
  "/register",
  "/forgot",
  "/reset-password",
];

const getLoginPath = (pathname: string) => {
  if (pathname.startsWith("/admin")) return "/admin/login";
  if (pathname.startsWith("/teacher")) return "/teacher/login";
  return "/login";
};

const isExcludedPath = (pathname: string) =>
  EXCLUDED_PATH_PREFIXES.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`));

const getLastActiveAt = () => {
  const raw = localStorage.getItem(LAST_ACTIVE_KEY);
  const parsed = raw ? Number(raw) : 0;
  return Number.isFinite(parsed) && parsed > 0 ? parsed : Date.now();
};

const setLastActiveAt = (value: number) => {
  localStorage.setItem(LAST_ACTIVE_KEY, String(value));
};

const throttle = (fn: () => void, waitMs: number) => {
  let last = 0;
  return () => {
    const now = Date.now();
    if (now - last < waitMs) return;
    last = now;
    fn();
  };
};

export default function IdleLogoutProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [showWarning, setShowWarning] = useState(false);
  const [countdown, setCountdown] = useState(10);
  const idleTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const warningTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const countdownTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const signingOutRef = useRef(false);
  const channelRef = useRef<BroadcastChannel | null>(null);

  const excluded = useMemo(() => isExcludedPath(pathname), [pathname]);

  const clearTimers = () => {
    if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
    if (warningTimerRef.current) clearTimeout(warningTimerRef.current);
    if (countdownTimerRef.current) clearInterval(countdownTimerRef.current);
    idleTimerRef.current = null;
    warningTimerRef.current = null;
    countdownTimerRef.current = null;
  };

  const closeWarning = () => {
    setShowWarning(false);
    setCountdown(10);
    if (warningTimerRef.current) clearTimeout(warningTimerRef.current);
    if (countdownTimerRef.current) clearInterval(countdownTimerRef.current);
    warningTimerRef.current = null;
    countdownTimerRef.current = null;
  };

  const scheduleIdleTimer = () => {
    if (signingOutRef.current) return;
    clearTimers();
    const lastActive = getLastActiveAt();
    const remaining = Math.max(0, IDLE_TIMEOUT_MS - (Date.now() - lastActive));
    idleTimerRef.current = setTimeout(() => {
      if (signingOutRef.current) return;
      setShowWarning(true);
      setCountdown(10);
      countdownTimerRef.current = setInterval(() => {
        setCountdown((prev) => Math.max(0, prev - 1));
      }, 1000);
      warningTimerRef.current = setTimeout(() => {
        void handleSignOut();
      }, WARNING_DURATION_MS);
    }, remaining);
  };

  const broadcast = (type: "USER_ACTIVE" | "FORCE_SIGNOUT") => {
    if (channelRef.current) {
      channelRef.current.postMessage({ type, at: Date.now() });
    }
  };

  const handleActivity = (source: "local" | "remote") => {
    if (signingOutRef.current) return;
    const now = Date.now();
    setLastActiveAt(now);
    if (source === "local") {
      broadcast("USER_ACTIVE");
    }
    if (showWarning) {
      closeWarning();
    }
    scheduleIdleTimer();
  };

  const handleSignOut = async () => {
    if (signingOutRef.current) return;
    signingOutRef.current = true;
    closeWarning();
    setShowWarning(false);
    setCountdown(10);
    clearTimers();
    try {
      localStorage.setItem(SIGNOUT_KEY, String(Date.now()));
      broadcast("FORCE_SIGNOUT");
      await supabaseClient.auth.signOut();
    } finally {
      setShowWarning(false);
      setCountdown(10);
      const loginPath = getLoginPath(pathname);
      router.replace(loginPath);
    }
  };

  useEffect(() => {
    if (excluded) {
      clearTimers();
      closeWarning();
      setShowWarning(false);
      return;
    }

    if (!localStorage.getItem(LAST_ACTIVE_KEY)) {
      setLastActiveAt(Date.now());
    }

    scheduleIdleTimer();

    const throttledActivity = throttle(() => handleActivity("local"), 1000);
    const onActivity = () => handleActivity("local");

    const handleVisibility = () => {
      if (!document.hidden) handleActivity("local");
    };

    window.addEventListener("mousemove", throttledActivity, { passive: true });
    window.addEventListener("scroll", throttledActivity, { passive: true });
    window.addEventListener("mousedown", onActivity, { passive: true });
    window.addEventListener("click", onActivity, { passive: true });
    window.addEventListener("keydown", onActivity, { passive: true });
    window.addEventListener("touchstart", onActivity, { passive: true });
    window.addEventListener("focus", onActivity);
    document.addEventListener("visibilitychange", handleVisibility);

    if ("BroadcastChannel" in window) {
      channelRef.current = new BroadcastChannel(CHANNEL_NAME);
      channelRef.current.onmessage = (event) => {
        if (event.data?.type === "USER_ACTIVE") {
          handleActivity("remote");
        }
        if (event.data?.type === "FORCE_SIGNOUT") {
          void handleSignOut();
        }
      };
    }

    const onStorage = (event: StorageEvent) => {
      if (event.key === LAST_ACTIVE_KEY && event.newValue) {
        handleActivity("remote");
      }
      if (event.key === SIGNOUT_KEY && event.newValue) {
        void handleSignOut();
      }
    };
    window.addEventListener("storage", onStorage);

    return () => {
      window.removeEventListener("mousemove", throttledActivity);
      window.removeEventListener("scroll", throttledActivity);
      window.removeEventListener("mousedown", onActivity);
      window.removeEventListener("click", onActivity);
      window.removeEventListener("keydown", onActivity);
      window.removeEventListener("touchstart", onActivity);
      window.removeEventListener("focus", onActivity);
      document.removeEventListener("visibilitychange", handleVisibility);
      window.removeEventListener("storage", onStorage);
      if (channelRef.current) {
        channelRef.current.close();
        channelRef.current = null;
      }
      clearTimers();
    };
  }, [excluded, pathname]);

  return (
    <>
      {children}
      {showWarning && !excluded && !signingOutRef.current && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-lg shadow-lg p-6 max-w-sm w-full text-center">
            <p className="text-gray-800 mb-2">
              您已閒置一段時間，即將登出。10 秒內若無操作將自動登出。
            </p>
            <p className="text-lg font-semibold text-gray-900 mb-4">{countdown}</p>
            <button
              type="button"
              onClick={() => handleActivity("local")}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              我還在使用
            </button>
          </div>
        </div>
      )}
    </>
  );
}



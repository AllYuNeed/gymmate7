import { useEffect } from "react";
import { App as CapacitorApp } from "@capacitor/app";
import { Browser } from "@capacitor/browser";
import type { PluginListenerHandle } from "@capacitor/core";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { completeSupabaseAuthFromUrl, getPostAuthRedirectPath } from "@/lib/authSession";
import { isAuthCallbackUrl, isNativeRuntime } from "@/lib/authRedirect";

export const NativeAuthRedirectHandler = () => {
  const navigate = useNavigate();

  useEffect(() => {
    if (!isNativeRuntime()) return;

    let isMounted = true;
    let appUrlOpenHandle: PluginListenerHandle | undefined;

    const finishNativeSignIn = async (url?: string | null) => {
      if (!url || !isAuthCallbackUrl(url)) return;

      try {
        await Browser.close().catch(() => undefined);

        const session = await completeSupabaseAuthFromUrl(url);
        if (!session?.user) throw new Error("Google sign-in finished without a user session.");

        const destination = await getPostAuthRedirectPath(session.user.id);
        if (isMounted) navigate(destination, { replace: true });
      } catch (error) {
        if (!isMounted) return;
        toast.error(error instanceof Error ? error.message : "Google sign-in failed");
        navigate("/auth", { replace: true });
      }
    };

    CapacitorApp.addListener("appUrlOpen", ({ url }) => {
      void finishNativeSignIn(url);
    }).then((handle) => {
      if (!isMounted) {
        void handle.remove();
        return;
      }
      appUrlOpenHandle = handle;
    }).catch(() => undefined);

    void CapacitorApp.getLaunchUrl().then((launchUrl) => {
      void finishNativeSignIn(launchUrl?.url);
    }).catch(() => undefined);

    return () => {
      isMounted = false;
      void appUrlOpenHandle?.remove();
    };
  }, [navigate]);

  return null;
};

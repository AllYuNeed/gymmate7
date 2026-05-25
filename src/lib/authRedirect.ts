import { Capacitor } from "@capacitor/core";

export const APP_DEEP_LINK_SCHEME = "com.mortalgyms.app";
export const MOBILE_AUTH_REDIRECT_TO = `${APP_DEEP_LINK_SCHEME}://auth/callback`;
export const WEB_AUTH_CALLBACK_PATH = "/auth/callback";

export const isNativeRuntime = () => Capacitor.isNativePlatform();

export const getWebAuthRedirectTo = (origin = window.location.origin) =>
  `${origin.replace(/\/$/, "")}${WEB_AUTH_CALLBACK_PATH}`;

export const getAuthRedirectTo = (isNative = isNativeRuntime()) =>
  isNative ? MOBILE_AUTH_REDIRECT_TO : getWebAuthRedirectTo();

export const getAuthUrlParams = (url: string) => {
  const params = new URLSearchParams();

  try {
    const parsedUrl = new URL(url);
    const queryParams = new URLSearchParams(parsedUrl.search);
    const hashParams = new URLSearchParams(parsedUrl.hash.replace(/^#/, ""));

    queryParams.forEach((value, key) => params.set(key, value));
    hashParams.forEach((value, key) => params.set(key, value));
  } catch {
    return params;
  }

  return params;
};

export const isAuthCallbackUrl = (url: string) => {
  try {
    const parsedUrl = new URL(url);
    const normalizedPath = parsedUrl.pathname.replace(/\/$/, "");

    if (parsedUrl.protocol === `${APP_DEEP_LINK_SCHEME}:`) {
      return parsedUrl.hostname === "auth" && normalizedPath === "/callback";
    }

    return normalizedPath === WEB_AUTH_CALLBACK_PATH;
  } catch {
    return false;
  }
};

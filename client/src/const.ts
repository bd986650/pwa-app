export const COOKIE_NAME = "app_session_id";
export const ONE_YEAR_MS = 1000 * 60 * 60 * 24 * 365;

// Категории товаров
export const PRODUCT_CATEGORIES = [
  'Без категории',
  'Овощи и фрукты',
  'Мясо и рыба',
  'Молочные продукты',
  'Хлеб и выпечка',
  'Крупы и макароны',
  'Напитки',
  'Сладости',
  'Бытовая химия',
  'Гигиена',
  'Другое',
] as const;

// Эмодзи для категорий
export const CATEGORY_EMOJIS: Record<string, string> = {
  'Без категории': '📦',
  'Овощи и фрукты': '🥕',
  'Мясо и рыба': '🥩',
  'Молочные продукты': '🥛',
  'Хлеб и выпечка': '🍞',
  'Крупы и макароны': '🌾',
  'Напитки': '🥤',
  'Сладости': '🍬',
  'Бытовая химия': '🧴',
  'Гигиена': '🧼',
  'Другое': '📦',
};

export const getLoginUrl = () => {
  const oauthPortalUrl = import.meta.env.VITE_OAUTH_PORTAL_URL;
  const appId = import.meta.env.VITE_APP_ID;
  const redirectUri = `${window.location.origin}/api/oauth/callback`;
  const state = btoa(redirectUri);

  const url = new URL(`${oauthPortalUrl}/app-auth`);
  url.searchParams.set("appId", appId);
  url.searchParams.set("redirectUri", redirectUri);
  url.searchParams.set("state", state);
  url.searchParams.set("type", "signIn");

  return url.toString();
};

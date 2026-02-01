// Assets and placeholders
export const ASSETS = {
  MENU_PLACEHOLDER: '/assets/menu-placeholder-green-transparent.webp',
  DISH_PLACEHOLDER: '/assets/dish-placeholder-green-transparent.webp',
  PROFILE_PLACEHOLDER: '/assets/profile-placeholder-green.webp',
  LOGO: '/assets/WeEat_logo_transparent.webp',
} as const;

// For backward compatibility
export const MENU_PLACEHOLDER = ASSETS.MENU_PLACEHOLDER;
export const DISH_PLACEHOLDER = ASSETS.DISH_PLACEHOLDER;
export const PROFILE_PLACEHOLDER = ASSETS.PROFILE_PLACEHOLDER;

// Routes
export const ROUTES = {
  HOME: '/home',
  LOGIN: '/login',
  CREATE_ACCOUNT: '/create-account',
  PASSWORD_RESET: '/password-reset',
  PROFILE: '/profile',
  EDIT_PROFILE: '/edit-profile',
  SEARCH: '/search',
  RECOMMENDATIONS: '/recommendations',
  CREATE_MENU: '/create-menu',
  PERSONALIZED_MENU: '/personalized-menu',
  ALL_RESTAURANTS: '/all-restaurants',
} as const;

// Public routes that don't require authentication
export const PUBLIC_ROUTES = [
  '/',
  ROUTES.LOGIN,
  ROUTES.CREATE_ACCOUNT,
  ROUTES.PASSWORD_RESET,
] as const;

// Session storage keys
export const STORAGE_KEYS = {
  REDIRECT_PATH: 'redirectPath',
} as const;

// Firestore collection names
export const COLLECTIONS = {
  USERS: 'users',
  RESTAURANTS: 'restaurants',
  SAVED_MENUS: 'savedMenus',
  CREATED_MENUS: 'createdMenus',
  PREFERRED_LOCATIONS: 'preferredLocations',
  MENU: 'menu',
  DISHES: 'dishes',
  ITEMS: 'items',
} as const;

// Image compression options
export const IMAGE_COMPRESSION = {
  MAX_SIZE_MB: 1,
  MAX_WIDTH_OR_HEIGHT: 500,
  USE_WEB_WORKER: true,
} as const;

// Search defaults
export const SEARCH_DEFAULTS = {
  RADIUS_MILES: 5,
  MAX_RADIUS_MILES: 50,
  PHOTO_MAX_WIDTH: 400,
} as const;

// UI defaults
export const UI_DEFAULTS = {
  TOAST_DURATION: 2000,
  RETRY_DELAY_MS: 500,
  MAX_RETRIES: 3,
} as const;

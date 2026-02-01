export { API_BASE, apiUrl, API_ENDPOINTS, getProxyUrl, getPhotoUrl, getGeocodeUrl } from './api';
export { fetchRestaurantsFromGooglePlaces, getCoordinatesFromAddress } from './googlePlacesService';
export { searchRestaurants, clearSearchCache } from './searchService';
export type { SearchResult } from './searchService';
export { uploadImage, compressImage } from './storageService';
export { setPreferredLocation } from './userService';
export { fetchFullMenuFromRestaurants } from './restaurantService';
export {
  fetchMenuData,
  getMenuByCategory,
  getRecommendations,
  addMenuToCreatedMenus,
  addMenuItemToCreatedMenus,
  updateMenuItemInCreatedMenus,
  updateNotesInCreatedMenus,
  deleteMenuItemFromCreatedMenus,
  getCreatedMenusForRestaurant,
  fetchCreatedMenus,
  deleteMenuItemFromSavedMenus,
  updateNotesInSavedMenus,
  getSavedMenusForRestaurant,
  updateMenuItemInSavedMenus,
  addMenuItemToSavedMenus,
  fetchSavedMenus,
} from './menuService';
export type { SavedMenu } from './menuService';
export {
  fetchUserData,
  fetchAllRestaurants,
  fetchFullMenuFromRestaurantById,
  fetchRestaurantMenus,
  filterAndRankRestaurants,
  getRecommendedMenus,
  filterMenuItemsByAllergens,
} from './recommendationService';
export { fetchYourMenusForHome } from './homeService';
export type { HomeMenuCard } from './homeService';

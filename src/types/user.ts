export interface AllergenState {
  eggs: boolean;
  wheat: boolean;
  dairy: boolean;
  soy: boolean;
  tree_nuts: boolean;
  fish: boolean;
  shellfish: boolean;
  peanuts: boolean;
  gluten: boolean;
  [key: string]: boolean;
}

export const DEFAULT_ALLERGENS_STATE: AllergenState = {
  eggs: false,
  wheat: false,
  dairy: false,
  soy: false,
  tree_nuts: false,
  fish: false,
  shellfish: false,
  peanuts: false,
  gluten: false,
};

export const ALLERGEN_LABELS: Record<keyof AllergenState, string> = {
  eggs: 'Eggs',
  wheat: 'Wheat',
  dairy: 'Dairy',
  soy: 'Soy',
  tree_nuts: 'Tree Nuts',
  fish: 'Fish',
  shellfish: 'Shellfish',
  peanuts: 'Peanuts',
  gluten: 'Gluten',
};

export interface Coordinates {
  latitude: number;
  longitude: number;
}

export interface PreferredLocation {
  name: string;
  address: string;
  coordinates: Coordinates;
  photoUrl?: string;
}

export interface CreatedMenuReference {
  restaurantName: string;
  restaurantId?: string;
  thumbnailUrl?: string;
}

export interface UserData {
  name?: string;
  lastName?: string;
  firstName?: string;
  email?: string;
  allergens: AllergenState;
  preferredLocations?: Record<string, PreferredLocation>;
  createdMenus?: Record<string, CreatedMenuReference>;
  profileImageUrl?: string;
  address?: string;
}

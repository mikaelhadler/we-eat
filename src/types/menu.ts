export interface MenuItem {
  id?: string;
  name: string;
  description: string;
  allergens: string[];
  note?: string;
  category: string;
  imageUrl?: string;
}

export interface MenuCategory {
  id?: string;
  category: string;
  items: MenuItem[];
  index: number;
}

export interface Dish {
  id?: string;
  category: string;
  name: string;
  description: string;
  allergens: string[];
  note: string;
  imageUrl?: string;
}

export interface BaseMenu {
  restaurantName: string;
  dishes: MenuItem[];
  photoUrl?: string;
  thumbnailUrl?: string;
  dishCount?: number;
  isCreated: boolean;
}

export interface Restaurant {
  id: string;
  name: string;
  menu: MenuCategory[];
  thumbnailUrl: string;
}

export interface SavedMenuData {
  restaurantName: string;
  restaurantId?: string;
  thumbnailUrl?: string;
  photoUrl?: string;
}

export interface CreatedMenuData {
  restaurantName: string;
  restaurantId?: string;
  thumbnailUrl?: string;
  photoUrl?: string;
}

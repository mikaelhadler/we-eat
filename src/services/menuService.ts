import {
  collection,
  getDocs,
  doc,
  addDoc,
  deleteDoc,
  query,
  where,
  updateDoc,
  DocumentReference,
} from 'firebase/firestore';
import { db, auth } from '../firebaseConfig';
import { MenuItem, MenuCategory } from '../types/menu';
import { safeDecode } from '../utils';
import { COLLECTIONS } from '../constants';

export interface SavedMenu {
  restaurantName: string;
  dishes: MenuItem[];
  restaurantId?: string;
  thumbnailUrl?: string;
}

const requireAuth = (): string => {
  if (!auth.currentUser) {
    throw new Error('No user is currently logged in.');
  }
  return auth.currentUser.uid;
};

const fetchMenuItems = async (menuDocRef: DocumentReference): Promise<MenuItem[]> => {
  const dishesSnapshot = await getDocs(collection(menuDocRef, COLLECTIONS.DISHES));
  return dishesSnapshot.docs.map(dishDoc => {
    const dishData = dishDoc.data();
    return {
      id: dishDoc.id,
      name: dishData.name,
      description: dishData.description,
      allergens: dishData.allergens,
      note: dishData.note,
      category: dishData.category,
      imageUrl: dishData.imageUrl,
    } as MenuItem;
  });
};

export const fetchMenuData = async (): Promise<{ savedMenus: SavedMenu[]; createdMenus: SavedMenu[] }> => {
  const savedMenus: SavedMenu[] = [];
  const createdMenus: SavedMenu[] = [];

  if (!auth.currentUser) {
    return { savedMenus, createdMenus };
  }

  const userDocRef = doc(db, COLLECTIONS.USERS, auth.currentUser.uid);

  const savedMenusSnapshot = await getDocs(collection(userDocRef, COLLECTIONS.SAVED_MENUS));
  for (const menuDoc of savedMenusSnapshot.docs) {
    const menuData = menuDoc.data();
    const dishes = await fetchMenuItems(menuDoc.ref);
    savedMenus.push({
      restaurantName: menuData.restaurantName,
      dishes,
    });
  }

  const createdMenusSnapshot = await getDocs(collection(userDocRef, COLLECTIONS.CREATED_MENUS));
  for (const menuDoc of createdMenusSnapshot.docs) {
    const menuData = menuDoc.data();
    const dishes = await fetchMenuItems(menuDoc.ref);
    createdMenus.push({
      restaurantName: menuData.restaurantName,
      dishes,
    });
  }

  return { savedMenus, createdMenus };
};

interface MenuData {
  dishes: MenuItem[];
}

const getAllMenuItemsByCategory = (
  menu: Record<string, MenuData> | undefined,
  category: string
): MenuItem[] => {
  if (!menu) return [];
  return Object.entries(menu).reduce((acc: MenuItem[], [cat, value]) => {
    if (cat === category) {
      acc.push(...value.dishes);
    }
    return acc;
  }, []);
};

export const getMenuByCategory = async (category: string): Promise<SavedMenu[]> => {
  const menusRef = collection(db, COLLECTIONS.RESTAURANTS);
  const snapshot = await getDocs(menusRef);

  const matchingMenus: SavedMenu[] = [];

  snapshot.forEach(docSnap => {
    const data = docSnap.data();
    const menuItems = getAllMenuItemsByCategory(data.menu, category);
    if (menuItems.length > 0) {
      matchingMenus.push({
        restaurantName: data.name,
        dishes: menuItems,
      });
    }
  });

  return matchingMenus;
};

export const getRecommendations = async (): Promise<SavedMenu[]> => {
  const { savedMenus, createdMenus } = await fetchMenuData();
  const userMenus = [...savedMenus, ...createdMenus];

  const categories = userMenus.flatMap(menu => menu.dishes.map(dish => dish.category));
  const uniqueCategories = Array.from(new Set(categories));

  let recommendations: SavedMenu[] = [];
  for (const category of uniqueCategories) {
    const menus = await getMenuByCategory(category);
    recommendations = [...recommendations, ...menus];
  }

  return recommendations;
};

export const addMenuToCreatedMenus = async (menu: SavedMenu): Promise<string | undefined> => {
  const userId = requireAuth();
  const userDocRef = doc(db, COLLECTIONS.USERS, userId);
  const createdMenusRef = collection(userDocRef, COLLECTIONS.CREATED_MENUS);

  const newMenuDocRef = await addDoc(createdMenusRef, {
    restaurantName: menu.restaurantName,
    restaurantId: menu.restaurantId || '',
    thumbnailUrl: menu.thumbnailUrl || '',
  });

  return newMenuDocRef.id;
};

export const addMenuItemToCreatedMenus = async (item: MenuItem, menuDocId: string): Promise<void> => {
  const userId = requireAuth();
  const userDocRef = doc(db, COLLECTIONS.USERS, userId);
  const menuDocRef = doc(userDocRef, COLLECTIONS.CREATED_MENUS, menuDocId);
  const dishesRef = collection(menuDocRef, COLLECTIONS.DISHES);
  await addDoc(dishesRef, item);
};

export const updateMenuItemInCreatedMenus = async (
  item: MenuItem,
  menuDocId: string,
  itemId: string
): Promise<void> => {
  const userId = requireAuth();
  const userDocRef = doc(db, COLLECTIONS.USERS, userId);
  const menuDocRef = doc(userDocRef, COLLECTIONS.CREATED_MENUS, menuDocId);
  const dishDocRef = doc(menuDocRef, COLLECTIONS.DISHES, itemId);
  await updateDoc(dishDocRef, { ...item });
};

export const updateNotesInCreatedMenus = async (
  itemId: string,
  newNotes: string,
  restaurantName: string
): Promise<void> => {
  const userId = requireAuth();
  const userDocRef = doc(db, COLLECTIONS.USERS, userId);
  const createdMenusRef = collection(userDocRef, COLLECTIONS.CREATED_MENUS);
  const menuSnapshot = await getDocs(createdMenusRef);

  let menuDocRef: DocumentReference | null = null;
  menuSnapshot.forEach(docSnap => {
    const data = docSnap.data();
    if (data.restaurantName === restaurantName) {
      menuDocRef = docSnap.ref;
    }
  });

  if (!menuDocRef) {
    throw new Error('Menu not found.');
  }

  const dishDocRef = doc(collection(menuDocRef, COLLECTIONS.DISHES), itemId);
  await updateDoc(dishDocRef, { note: newNotes });
};

export const deleteMenuItemFromCreatedMenus = async (
  itemId: string,
  menuDocId: string
): Promise<void> => {
  const userId = requireAuth();
  const userDocRef = doc(db, COLLECTIONS.USERS, userId);
  const menuDocRef = doc(userDocRef, COLLECTIONS.CREATED_MENUS, menuDocId);
  const dishDocRef = doc(menuDocRef, COLLECTIONS.DISHES, itemId);
  await deleteDoc(dishDocRef);
};

export const getCreatedMenusForRestaurant = async (
  restaurantName: string
): Promise<MenuCategory[]> => {
  if (!auth.currentUser) {
    return [];
  }

  const userDocRef = doc(db, COLLECTIONS.USERS, auth.currentUser.uid);
  const createdMenusSnapshot = await getDocs(
    query(collection(userDocRef, COLLECTIONS.CREATED_MENUS), where('restaurantName', '==', restaurantName))
  );

  const categories: MenuCategory[] = [];
  for (const categoryDoc of createdMenusSnapshot.docs) {
    const categoryData = categoryDoc.data();
    const itemsCollectionRef = collection(categoryDoc.ref, COLLECTIONS.DISHES);
    const itemsSnapshot = await getDocs(itemsCollectionRef);

    const items: MenuItem[] = itemsSnapshot.docs.map(itemDoc => {
      const itemData = itemDoc.data();
      return {
        id: itemDoc.id,
        name: itemData.name,
        description: itemData.description,
        allergens: itemData.allergens,
        note: itemData.note,
        category: itemData.category,
        imageUrl: itemData.imageUrl,
      };
    });

    categories.push({
      id: categoryDoc.id,
      category: categoryData.category,
      items,
      index: categoryData.index || 0,
    });
  }

  return categories;
};

export const fetchCreatedMenus = async (): Promise<SavedMenu[]> => {
  if (!auth.currentUser) {
    return [];
  }

  const createdMenus: SavedMenu[] = [];
  const userDocRef = doc(db, COLLECTIONS.USERS, auth.currentUser.uid);
  const createdMenusSnapshot = await getDocs(collection(userDocRef, COLLECTIONS.CREATED_MENUS));

  for (const menuDoc of createdMenusSnapshot.docs) {
    const menuData = menuDoc.data();
    const dishes = await fetchMenuItems(menuDoc.ref);
    createdMenus.push({
      restaurantName: menuData.restaurantName,
      dishes,
      thumbnailUrl: menuData.photoUrl || menuData.thumbnailUrl || '',
    });
  }

  return createdMenus;
};

export const deleteMenuItemFromSavedMenus = async (
  itemId: string,
  savedMenuDocId: string
): Promise<void> => {
  const userId = requireAuth();
  const userDocRef = doc(db, COLLECTIONS.USERS, userId);
  const savedMenuRef = doc(userDocRef, COLLECTIONS.SAVED_MENUS, savedMenuDocId);
  const dishDocRef = doc(savedMenuRef, COLLECTIONS.DISHES, itemId);
  await deleteDoc(dishDocRef);
};

export const updateNotesInSavedMenus = async (
  itemId: string,
  newNotes: string,
  restaurantName: string
): Promise<void> => {
  const userId = requireAuth();
  const userDocRef = doc(db, COLLECTIONS.USERS, userId);
  const savedMenusRef = collection(userDocRef, COLLECTIONS.SAVED_MENUS);
  const q = query(savedMenusRef, where('restaurantName', '==', restaurantName));
  const querySnapshot = await getDocs(q);

  if (querySnapshot.empty) {
    throw new Error(`Restaurant ${restaurantName} does not exist in saved menus.`);
  }

  const menuDocRef = querySnapshot.docs[0].ref;
  const dishesCollectionRef = collection(menuDocRef, COLLECTIONS.DISHES);
  const dishDocRef = doc(dishesCollectionRef, itemId);
  await updateDoc(dishDocRef, { note: newNotes });
};

export const getSavedMenusForRestaurant = async (
  restaurantName: string
): Promise<MenuCategory[]> => {
  if (!auth.currentUser) {
    return [];
  }

  const userDocRef = doc(db, COLLECTIONS.USERS, auth.currentUser.uid);
  const savedMenusSnapshot = await getDocs(
    query(collection(userDocRef, COLLECTIONS.SAVED_MENUS), where('restaurantName', '==', restaurantName))
  );

  const categories: MenuCategory[] = [];
  for (const menuDoc of savedMenusSnapshot.docs) {
    const menuData = menuDoc.data();
    const itemsCollectionRef = collection(menuDoc.ref, COLLECTIONS.DISHES);
    const itemsSnapshot = await getDocs(itemsCollectionRef);

    const items: MenuItem[] = itemsSnapshot.docs.map(itemDoc => {
      const itemData = itemDoc.data();
      return {
        id: itemDoc.id,
        name: itemData.name,
        description: itemData.description,
        allergens: itemData.allergens,
        note: itemData.note,
        category: itemData.category,
        imageUrl: itemData.imageUrl,
      };
    });

    categories.push({
      id: menuDoc.id,
      category: menuData.category,
      items,
      index: menuData.index,
    });
  }

  return categories;
};

export const updateMenuItemInSavedMenus = async (
  item: MenuItem,
  restaurantName: string,
  itemId: string
): Promise<void> => {
  const userId = requireAuth();
  const userDocRef = doc(db, COLLECTIONS.USERS, userId);
  const savedMenusRef = collection(userDocRef, COLLECTIONS.SAVED_MENUS);
  const q = query(savedMenusRef, where('restaurantName', '==', restaurantName));
  const querySnapshot = await getDocs(q);

  if (querySnapshot.empty) {
    throw new Error('Menu not found.');
  }

  const menuDocRef = querySnapshot.docs[0].ref;
  const dishDocRef = doc(collection(menuDocRef, COLLECTIONS.DISHES), itemId);
  await updateDoc(dishDocRef, { ...item });
};

export const addMenuItemToSavedMenus = async (
  item: MenuItem,
  restaurantName: string
): Promise<void> => {
  const userId = requireAuth();

  if (!item.category) {
    throw new Error('Menu item must have a category');
  }

  const userDocRef = doc(db, COLLECTIONS.USERS, userId);
  const savedMenusRef = collection(userDocRef, COLLECTIONS.SAVED_MENUS);
  const q = query(savedMenusRef, where('restaurantName', '==', restaurantName));
  const querySnapshot = await getDocs(q);

  if (!querySnapshot.empty) {
    const menuDocRef = querySnapshot.docs[0].ref;
    const dishesRef = collection(menuDocRef, COLLECTIONS.DISHES);
    const existingQuery = query(dishesRef, where('name', '==', item.name));
    const existingSnapshot = await getDocs(existingQuery);

    if (!existingSnapshot.empty) {
      return;
    }

    const { id: _id, ...itemWithoutId } = item;
    await addDoc(dishesRef, itemWithoutId);
  } else {
    const restaurantQuery = query(
      collection(db, COLLECTIONS.RESTAURANTS),
      where('name', '==', restaurantName)
    );
    const restaurantSnapshot = await getDocs(restaurantQuery);

    if (restaurantSnapshot.empty) {
      throw new Error(`Restaurant ${restaurantName} not found in database.`);
    }

    const restaurantId = restaurantSnapshot.docs[0].id;
    const newMenuDocRef = await addDoc(savedMenusRef, {
      restaurantName,
      restaurantId,
    });

    const dishesRef = collection(newMenuDocRef, COLLECTIONS.DISHES);
    await addDoc(dishesRef, { ...item });
  }
};

export const fetchSavedMenus = async (): Promise<SavedMenu[]> => {
  if (!auth.currentUser) {
    return [];
  }

  const savedMenus: SavedMenu[] = [];
  const userDocRef = doc(db, COLLECTIONS.USERS, auth.currentUser.uid);
  const savedMenusSnapshot = await getDocs(collection(userDocRef, COLLECTIONS.SAVED_MENUS));

  for (const menuDoc of savedMenusSnapshot.docs) {
    const menuData = menuDoc.data();
    const dishes = await fetchMenuItems(menuDoc.ref);
    savedMenus.push({
      restaurantName: safeDecode(menuData.restaurantName),
      dishes,
    });
  }

  return savedMenus;
};

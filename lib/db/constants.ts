import { ObjectId } from "mongodb";

export const COLLECTIONS = {
  admins: "admins",
  settings: "restaurant_settings",
  categories: "menu_categories",
  items: "menu_items",
} as const;

export const RESTAURANT_SETTINGS_ID = new ObjectId("000000000000000000000001");

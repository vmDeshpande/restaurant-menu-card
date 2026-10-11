export interface Admin {
  id: string;
  email: string;
  passwordHash: string;
  fullName: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface RestaurantSettings {
  id: string;
  name: string;
  logo: string | null;
  heroImage: string | null;
  description: string | null;
  address: string | null;
  phone: string | null;
  email: string | null;
  currency: string;
  facebookUrl: string | null;
  instagramUrl: string | null;
  youtubeUrl: string | null;
  whatsappUrl: string | null;
  twitterUrl: string | null;
  googleMapsUrl: string | null;
  openingHours: Record<string, { open?: string; close?: string; isClosed?: boolean }> | null;
  updatedAt: Date;
}

export interface MenuCategory {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image: string | null;
  displayOrder: number;
  active: boolean;
  published: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface MenuItem {
  id: string;
  categoryId: string | null;
  name: string;
  price: number;
  createdAt: Date;
  updatedAt: Date;
  category: MenuCategory | null;
}

export interface MenuCategoryWithCount extends MenuCategory {
  itemCount: number;
}

export interface DashboardMetrics {
  totalItems: number;
  totalCategories: number;
  recentItems: MenuItem[];
}

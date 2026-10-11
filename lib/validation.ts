import { z } from "zod";

export const DietaryLabelSchema = z.enum([
  "vegetarian",
  "vegan",
  "gluten-free",
  "dairy-free",
  "nut-free",
  "spicy",
  "seafood",
  "halal",
  "kosher",
]);

export const AllergenSchema = z.enum([
  "gluten",
  "nuts",
  "peanuts",
  "shellfish",
  "eggs",
  "milk",
  "soy",
  "sesame",
  "fish",
]);

export const BadgeSchema = z.enum([
  "chef-special",
  "popular",
  "new",
  "spicy",
  "signature",
  "bestseller",
]);

export const CurrencySchema = z.enum(["INR", "USD", "EUR", "GBP", "AED"]);

export const DaySchema = z.enum([
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
  "sunday",
]);

export const OpeningHoursSchema = z.object({
  open: z.string().optional(),
  close: z.string().optional(),
  isClosed: z.boolean().default(false),
});

export const VariantSchema = z.object({
  name: z.string().min(1, "Variant name is required"),
  price: z.number().min(0, "Price must be non-negative"),
});

export const ItemVariantSchema = z.object({
  name: z.string().min(1, "Variant name is required"),
  price: z.number().min(0, "Price must be non-negative"),
});

export const MenuItemSchema = z.object({
  name: z.string().trim().min(1, "Dish name is required").max(120, "Dish name must be 120 characters or fewer"),
  price: z.number().finite("Price must be a valid number").min(0, "Price must be non-negative"),
  categoryId: z.string().regex(/^[0-9a-f]{24}$/i, "Select a valid menu category.").nullable().optional(),
});

export const ObjectIdSchema = z.string().regex(/^[0-9a-f]{24}$/i, "A valid ID is required.");

const SOCIAL_URL_HOSTS = {
  instagram: ["instagram.com", "www.instagram.com"],
  facebook: ["facebook.com", "www.facebook.com", "m.facebook.com", "fb.com", "www.fb.com"],
  youtube: ["youtube.com", "www.youtube.com", "m.youtube.com", "youtu.be"],
  whatsapp: ["wa.me", "api.whatsapp.com", "chat.whatsapp.com", "web.whatsapp.com", "whatsapp.com", "www.whatsapp.com"],
  twitter: ["x.com", "www.x.com", "twitter.com", "www.twitter.com", "mobile.twitter.com"],
} as const;

export type SocialPlatform = keyof typeof SOCIAL_URL_HOSTS;

export function isSafeSocialUrl(platform: SocialPlatform, value: string): boolean {
  try {
    const url = new URL(value);
    return (
      (url.protocol === "https:" || url.protocol === "http:") &&
      !url.username &&
      !url.password &&
      !url.port &&
      SOCIAL_URL_HOSTS[platform].some((host) => host === url.hostname.toLowerCase())
    );
  } catch {
    return false;
  }
}

function socialUrlSchema(platform: SocialPlatform) {
  return z.string().trim().max(2048, "Social URLs must be 2048 characters or fewer")
    .refine((value) => value === "" || isSafeSocialUrl(platform, value), `Enter a valid ${platform} URL using HTTP or HTTPS.`);
}

export const CreateMenuItemSchema = MenuItemSchema;

export const UpdateMenuItemSchema = MenuItemSchema.partial().extend({
  id: ObjectIdSchema,
});

export const CategorySchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(80),
  description: z.string().max(500).optional().default(""),
  image: z.string().url().optional().or(z.literal("")),
  displayOrder: z.number().int().min(0).default(0),
  active: z.boolean().default(true),
  published: z.boolean().default(true),
});

export const CreateCategorySchema = CategorySchema;

export const UpdateCategorySchema = CategorySchema.partial().extend({
  id: ObjectIdSchema,
});

export const RestaurantSettingsSchema = z.object({
  name: z.string().min(2).max(120),
  logo: z.string().url().optional().or(z.literal("")),
  heroImage: z.string().url().optional().or(z.literal("")),
  description: z.string().max(2000).optional().default(""),
  address: z.string().max(500).optional().default(""),
  phone: z.string().max(40).optional().default(""),
  email: z.string().email().optional().or(z.literal("")),
  currency: CurrencySchema.default("INR"),
  facebookUrl: socialUrlSchema("facebook").optional().default(""),
  instagramUrl: socialUrlSchema("instagram").optional().default(""),
  youtubeUrl: socialUrlSchema("youtube").optional().default(""),
  whatsappUrl: socialUrlSchema("whatsapp").optional().default(""),
  twitterUrl: socialUrlSchema("twitter").optional().default(""),
  googleMapsUrl: z.string().url().optional().or(z.literal("")),
  openingHours: z.record(DaySchema, OpeningHoursSchema),
});

export type DietaryLabel = z.infer<typeof DietaryLabelSchema>;
export type Allergen = z.infer<typeof AllergenSchema>;
export type Badge = z.infer<typeof BadgeSchema>;
export type Currency = z.infer<typeof CurrencySchema>;
export type Day = z.infer<typeof DaySchema>;
export type OpeningHours = z.infer<typeof OpeningHoursSchema>;
export type Variant = z.infer<typeof VariantSchema>;
export type ItemVariant = z.infer<typeof ItemVariantSchema>;
export type MenuItem = z.infer<typeof MenuItemSchema>;
export type Category = z.infer<typeof CategorySchema>;
export type RestaurantSettings = z.infer<typeof RestaurantSettingsSchema>;
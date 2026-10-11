import { describe, expect, it } from "vitest";
import { CreateMenuItemSchema, RestaurantSettingsSchema, UpdateMenuItemSchema } from "./validation";

describe("dish validation", () => {
  it("accepts a trimmed name and finite non-negative price", () => {
    expect(CreateMenuItemSchema.parse({ name: "  Masala chai  ", price: 45.5 })).toEqual({
      name: "Masala chai",
      price: 45.5,
    });
  });

  it.each([
    { name: "", price: 50 },
    { name: "   ", price: 50 },
    { name: "Tea", price: Number.NaN },
    { name: "Tea", price: Number.POSITIVE_INFINITY },
    { name: "Tea", price: -0.01 },
  ])("rejects invalid dish data %#", (dish) => {
    expect(CreateMenuItemSchema.safeParse(dish).success).toBe(false);
  });

  it("validates edits and requires an ID", () => {
    const id = "0123456789abcdef01234567";
    const categoryId = "fedcba9876543210fedcba98";
    expect(UpdateMenuItemSchema.safeParse({ id, price: 0 }).success).toBe(true);
    expect(UpdateMenuItemSchema.safeParse({ id: "", name: "Tea" }).success).toBe(false);
    expect(UpdateMenuItemSchema.safeParse({ id, categoryId }).success).toBe(true);
    expect(UpdateMenuItemSchema.safeParse({ id, categoryId: "" }).success).toBe(false);
  });
});

describe("restaurant social URL validation", () => {
  it.each([
    { instagramUrl: "https://www.instagram.com/greenroom" },
    { facebookUrl: "https://m.facebook.com/greenroom" },
    { youtubeUrl: "https://youtu.be/example" },
    { whatsappUrl: "https://wa.me/911234567890" },
    { twitterUrl: "https://x.com/greenroom" },
    { instagramUrl: "" },
  ])("accepts valid or empty optional social URLs %#", (social) => {
    expect(RestaurantSettingsSchema.safeParse({ name: "Green Room", openingHours: {}, ...social }).success).toBe(true);
  });

  it.each([
    { instagramUrl: "javascript:alert(1)" },
    { facebookUrl: "data:text/html,unsafe" },
    { youtubeUrl: "https://youtube.com.attacker.example/channel" },
    { whatsappUrl: "https://wa.me.attacker.example/911234567890" },
    { twitterUrl: "https://x.com:8443/profile" },
  ])("rejects unsafe or unrelated social URLs %#", (social) => {
    expect(RestaurantSettingsSchema.safeParse({ name: "Green Room", openingHours: {}, ...social }).success).toBe(false);
  });

  it("does not include the legacy editable footer text field", () => {
    const result = RestaurantSettingsSchema.parse({
      name: "Green Room",
      openingHours: {},
      footerText: "Not editable",
    });
    expect(result).not.toHaveProperty("footerText");
  });
});

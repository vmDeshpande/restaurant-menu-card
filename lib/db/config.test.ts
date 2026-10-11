import { describe, expect, it } from "vitest";
import { getMongoConfig } from "./config";

describe("MongoDB server configuration", () => {
  it("requires both server-only MongoDB variables", () => {
    expect(() => getMongoConfig({})).toThrow(/MONGODB_URI must be configured/);
    expect(() => getMongoConfig({ MONGODB_URI: "mongodb://localhost:27017" })).toThrow(/MONGODB_DB_NAME must be configured/);
  });

  it("accepts standard and Atlas MongoDB connection strings", () => {
    expect(getMongoConfig({
      MONGODB_URI: "mongodb://localhost:27017",
      MONGODB_DB_NAME: "restaurant_menu",
    })).toEqual({
      uri: "mongodb://localhost:27017",
      databaseName: "restaurant_menu",
    });
    expect(getMongoConfig({
      MONGODB_URI: "mongodb+srv://user:password@cluster.example.net/",
      MONGODB_DB_NAME: "restaurant-menu",
    }).databaseName).toBe("restaurant-menu");
  });

  it.each([
    { MONGODB_URI: "file:///tmp/database", MONGODB_DB_NAME: "restaurant" },
    { MONGODB_URI: "mongodb://localhost", MONGODB_DB_NAME: "invalid/name" },
    { MONGODB_URI: " mongodb://localhost", MONGODB_DB_NAME: "restaurant" },
  ])("rejects invalid or unsafe configuration %#", (env) => {
    expect(() => getMongoConfig(env)).toThrow();
  });
});

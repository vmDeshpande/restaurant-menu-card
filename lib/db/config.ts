export interface MongoConfig {
  uri: string;
  databaseName: string;
}

export function getMongoConfig(env: Record<string, string | undefined> = process.env): MongoConfig {
  const uri = env.MONGODB_URI?.trim();
  const databaseName = env.MONGODB_DB_NAME?.trim();

  if (!uri) throw new Error("MONGODB_URI must be configured on the server.");
  if (!databaseName) throw new Error("MONGODB_DB_NAME must be configured on the server.");
  if (uri !== env.MONGODB_URI || databaseName !== env.MONGODB_DB_NAME) {
    throw new Error("MongoDB environment variables must not contain surrounding whitespace.");
  }

  let parsedUri: URL;
  try {
    parsedUri = new URL(uri);
  } catch {
    throw new Error("MONGODB_URI must be a valid MongoDB connection string.");
  }

  if (parsedUri.protocol !== "mongodb:" && parsedUri.protocol !== "mongodb+srv:") {
    throw new Error("MONGODB_URI must use mongodb:// or mongodb+srv://.");
  }
  if (/[/\\.$*"<>:|?\s]/.test(databaseName) || databaseName.includes("\0")) {
    throw new Error("MONGODB_DB_NAME contains characters that are not allowed in a database name.");
  }

  return { uri, databaseName };
}

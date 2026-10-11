# Environment variables

Copy `.env.example` to `.env` for local development.

- `MONGODB_URI` is the server-only MongoDB connection string.
- `MONGODB_DB_NAME` is the server-only application database name.
- `SESSION_SECRET` is server-only and must contain at least 32 characters.
- `SESSION_COOKIE_NAME` optionally overrides the HTTP-only administrator session cookie name.
- `NEXT_PUBLIC_APP_URL` and `APP_URL` are the public and server application URLs.
- `SQLITE_SOURCE_PATH` optionally selects the source file for the one-time SQLite import only.

Never place MongoDB credentials, `SESSION_SECRET`, or administrator credentials in a `NEXT_PUBLIC_*` variable. Do not commit `.env`.

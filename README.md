# SSK Khau Galli Restaurant Menu

A premium restaurant menu website with a public, searchable menu and a protected administrator dashboard. Dishes contain only a name and price, with an optional category relationship.

## Stack

- Next.js App Router, React, TypeScript, and Tailwind CSS
- MongoDB using the official MongoDB Node.js driver
- Zod validation, bcrypt password hashing, and HMAC-signed HTTP-only admin sessions

## Local setup

Use Node.js 20.19+ and npm. Copy `.env.example` to `.env`, then configure:

- `MONGODB_URI`: a MongoDB connection string, for example `mongodb+srv://<user>:<password>@<cluster-host>/`
- `MONGODB_DB_NAME`: the application database name
- `SESSION_SECRET`: a random secret of at least 32 characters

The URI and database name are server-only. Never prefix them with `NEXT_PUBLIC_` or commit `.env`.

```powershell
npm install
Copy-Item .env.example .env
npm run dev
```

The application creates the required indexes idempotently on first database access. It uses the same configured database for public menu reads and administrator writes. The production build does not connect to MongoDB; database access occurs at runtime.

## Import existing SQLite data once

The old local SQLite file is retained as the import source; the production application does not use it. Configure `MONGODB_URI` and `MONGODB_DB_NAME` in `.env`, stop the old app if it is using the database, and run:

```powershell
npm run db:import-sqlite
```

To select a different source file:

```powershell
npm run db:import-sqlite -- .\data\restaurant.db
```

The importer opens SQLite read-only, validates the source records and relationships, and creates deterministic MongoDB ObjectIds for legacy IDs so category references remain intact. It uses `$setOnInsert`: records already present in MongoDB are left unchanged, and the import can be safely rerun after an interrupted attempt. It verifies imported record counts and reports inserted, unchanged, and verified counts for each collection. It does not delete or modify the SQLite source. Review those counts and verify the site before archiving or removing the old database yourself.

Existing password hashes are preserved; administrators continue to sign in with their existing credentials. Existing signed-in browsers must sign in again because the administrator IDs change to MongoDB ObjectIds.

The SQLite driver is a development dependency used only by this one-time import script. It is not part of the production dependency set or runtime database layer.

## Administrator

There is no public administrator registration. Create an administrator from a private terminal after configuring MongoDB:

```powershell
$env:ADMIN_EMAIL = "admin@example.com"
$env:ADMIN_PASSWORD = "a-long-unique-password"
npm run db:create-admin
Remove-Item Env:ADMIN_EMAIL, Env:ADMIN_PASSWORD
```

The password is hashed with bcrypt before it is stored. If that email already exists, the command refuses to overwrite the administrator. It does not print the supplied password or stored hash. Open `/admin/login` to sign in.

The dashboard supports menu item and category CRUD, category assignment, restaurant settings, social links, and password changes. Server actions require an authenticated administrator and validate user input. Public queries expose only active and published categories and their visible menu dishes.

## MongoDB Atlas and Vercel

1. Create an Atlas cluster and database user with only the permissions the application needs on the application database.
2. In Atlas Network Access, allow only the application host's known outbound IP addresses. For local development, use the developer's current IP. For Vercel, configure static outbound IPs or private networking where available, then add those addresses in Atlas. Do not use `0.0.0.0/0` as the default access rule.
3. Configure `MONGODB_URI`, `MONGODB_DB_NAME`, and `SESSION_SECRET` as server-side environment variables in Vercel and in every deployment environment. Do not use `NEXT_PUBLIC_` for these values.
4. Deploy with the Node.js runtime. The application uses a reusable MongoDB client and a bounded connection pool suitable for Next.js serverless instances.
5. Run the one-time SQLite import from a trusted environment with access to both the source file and Atlas, then verify the imported records before removing any local backup.

This application does not require a writable local database file in production and does not depend on SQLite at runtime.

## Checks

```powershell
npm ci
npm run typecheck
npm test
npm run lint
npm run build
```

GitHub Actions runs linting, type checking, tests, and a production build for pushes and pull requests. These checks do not require production credentials. The regular test suite does not connect to a production database. Any MongoDB integration test must use an explicitly isolated test database.

To run the MongoDB persistence integration test, set `MONGODB_TEST_URI` to a test-only MongoDB deployment and `MONGODB_TEST_DB_NAME` to a prefix beginning with `test_`, then run `npm test`. The test creates a uniquely named temporary database, exercises authentication and CRUD/persistence, and drops only that generated database. The test URI must not point at production.

## Contributing

1. Use a supported Node.js version (`20.19+`) and install dependencies with `npm ci`.
2. Copy `.env.example` to `.env` and use a dedicated development MongoDB database.
3. Run the checks above before opening a pull request.
4. Never include `.env`, database files, credentials, or administrator passwords in a commit or issue.

Deployment requires a MongoDB database and the server-side variables documented in `.env.example`. See [MongoDB Atlas and Vercel](#mongodb-atlas-and-vercel) for production configuration and access-control guidance.

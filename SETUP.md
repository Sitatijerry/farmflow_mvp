# FarmFlow MVP - Local Development Setup Guide

This guide provides step-by-step instructions to set up and run the FarmFlow agricultural decision support system locally.

## Prerequisites

Before you begin, ensure you have the following installed on your system:

- **Node.js** 18+ ([Download](https://nodejs.org/))
- **pnpm** 10+ (install via `npm install -g pnpm`)
- **Git** ([Download](https://git-scm.com/))
- **MySQL** 8.0+ or **MariaDB** 10.5+ ([Download](https://www.mysql.com/downloads/))
- **Docker** (optional, for containerized MySQL)

## Step 1: Clone the Repository

```bash
git clone https://github.com/Sitatijerry/farmflow_mvp.git
cd farmflow_mvp
```

## Step 2: Install Dependencies

Install all project dependencies using pnpm:

```bash
pnpm install
```

This will install:
- Frontend dependencies (React, Tailwind, shadcn/ui)
- Backend dependencies (Express, tRPC, Drizzle ORM)
- Development tools (TypeScript, Vite, Vitest)

## Step 3: Set Up the Database

### Option A: Local MySQL Installation

1. **Start MySQL Server**
   ```bash
   # macOS (Homebrew)
   brew services start mysql

   # Linux (Ubuntu/Debian)
   sudo systemctl start mysql

   # Windows
   # Start MySQL from Services or MySQL Workbench
   ```

2. **Create Database and User**
   ```bash
   mysql -u root -p
   ```
   
   Then run:
   ```sql
   CREATE DATABASE farmflow;
   CREATE USER 'farmflow_user'@'localhost' IDENTIFIED BY 'farmflow_password_123';
   GRANT ALL PRIVILEGES ON farmflow.* TO 'farmflow_user'@'localhost';
   FLUSH PRIVILEGES;
   EXIT;
   ```

### Option B: Docker MySQL (Recommended)

1. **Start MySQL in Docker**
   ```bash
   docker run -d \
     --name farmflow-mysql \
     -e MYSQL_ROOT_PASSWORD=root_password \
     -e MYSQL_DATABASE=farmflow \
     -e MYSQL_USER=farmflow_user \
     -e MYSQL_PASSWORD=farmflow_password_123 \
     -p 3306:3306 \
     mysql:8.0
   ```

2. **Verify Connection**
   ```bash
   mysql -h 127.0.0.1 -u farmflow_user -p farmflow_password_123 -e "SELECT 1;"
   ```

## Step 4: Configure Environment Variables

Create a `.env.local` file in the project root:

```bash
# Database Configuration
DATABASE_URL="mysql://farmflow_user:farmflow_password_123@localhost:3306/farmflow"

# Authentication (Manus OAuth)
VITE_APP_ID="your_manus_app_id"
OAUTH_SERVER_URL="https://api.manus.im"
VITE_OAUTH_PORTAL_URL="https://manus.im/login"
JWT_SECRET="your_jwt_secret_key_min_32_chars_long"

# Owner Information
OWNER_NAME="Your Name"
OWNER_OPEN_ID="your_manus_open_id"

# API Configuration
VITE_FRONTEND_FORGE_API_URL="https://api.manus.im"
VITE_FRONTEND_FORGE_API_KEY="your_forge_api_key"
BUILT_IN_FORGE_API_URL="https://api.manus.im"
BUILT_IN_FORGE_API_KEY="your_forge_api_key"

# Analytics (Optional)
VITE_ANALYTICS_ENDPOINT="https://analytics.manus.im"
VITE_ANALYTICS_WEBSITE_ID="your_website_id"
```

### Getting Manus OAuth Credentials

1. Go to [Manus Dashboard](https://manus.im)
2. Create a new application
3. Copy the `APP_ID` and `OPEN_ID`
4. Generate API keys for `FORGE_API_KEY`
5. Use a strong random string for `JWT_SECRET` (minimum 32 characters)

## Step 5: Initialize the Database Schema

Run Drizzle migrations to create all tables:

```bash
pnpm db:push
```

This will:
- Generate migration files from `drizzle/schema.ts`
- Apply all migrations to your database
- Create tables for farms, fields, tasks, recommendations, weather, uploads, and assignments

Verify the schema was created:
```bash
mysql -u farmflow_user -p farmflow_password_123 farmflow -e "SHOW TABLES;"
```

## Step 6: Start the Development Server

Start both the frontend and backend development servers:

```bash
pnpm dev
```

This will:
- Start the Express backend on `http://localhost:3000`
- Start the Vite frontend dev server on `http://localhost:5173`
- Enable hot module replacement (HMR) for both frontend and backend

You should see output like:
```
Server running on http://localhost:3000/
[vite] ✨ new dependencies optimized
```

## Step 7: Access the Application

Open your browser and navigate to:

- **Frontend:** http://localhost:3000
- **API Documentation:** http://localhost:3000/api/trpc (tRPC endpoint)

### Login

1. Click "Login" on the home page
2. Use your Manus account credentials
3. You'll be redirected to the dashboard based on your role:
   - **Admin/Manager:** `/manager` - Full farm management dashboard
   - **Worker:** `/worker` - Mobile-optimized task management

## Step 8: Run Tests

Execute the test suite to verify everything is working:

```bash
pnpm test
```

Expected output:
```
✓ server/auth.logout.test.ts (1 test)
✓ server/farmflow.test.ts (14 tests)
Test Files  2 passed (2)
Tests  15 passed (15)
```

## Development Workflow

### File Structure

```
farmflow_mvp/
├── client/                    # Frontend React application
│   ├── src/
│   │   ├── pages/            # Page components
│   │   ├── components/       # Reusable UI components
│   │   ├── contexts/         # React contexts
│   │   ├── lib/              # Utilities and helpers
│   │   ├── App.tsx           # Main app router
│   │   └── index.css         # Global styles
│   └── index.html
├── server/                    # Backend Express application
│   ├── routers.ts            # tRPC procedure definitions
│   ├── db.ts                 # Database query helpers
│   ├── auth.logout.test.ts   # Tests
│   └── _core/                # Framework internals
├── drizzle/                   # Database schema and migrations
│   ├── schema.ts             # Table definitions
│   └── migrations/           # Generated SQL migrations
├── shared/                    # Shared types and constants
│   └── types.ts              # TypeScript interfaces
├── package.json
├── tsconfig.json
├── vite.config.ts
└── drizzle.config.ts
```

### Making Changes

**Frontend Changes:**
1. Edit files in `client/src/`
2. Changes auto-reload via Vite HMR
3. Check browser console for errors

**Backend Changes:**
1. Edit files in `server/`
2. Server auto-restarts via tsx watch
3. Check terminal for errors

**Database Schema Changes:**
1. Edit `drizzle/schema.ts`
2. Run `pnpm drizzle-kit generate` to create migration
3. Review the generated SQL in `drizzle/migrations/`
4. Run `pnpm db:push` to apply

**Component Changes:**
1. Edit components in `client/src/components/`
2. Update imports in pages as needed
3. Test with different screen sizes

## Common Development Tasks

### Add a New tRPC Procedure

1. **Define in `server/routers.ts`:**
   ```typescript
   export const appRouter = router({
     myFeature: router({
       create: protectedProcedure
         .input(z.object({ name: z.string() }))
         .mutation(async ({ ctx, input }) => {
           // Implementation
           return { success: true };
         }),
     }),
   });
   ```

2. **Use in Frontend:**
   ```typescript
   const createMutation = trpc.myFeature.create.useMutation();
   await createMutation.mutateAsync({ name: "Test" });
   ```

### Add a New Database Table

1. **Add to `drizzle/schema.ts`:**
   ```typescript
   export const myTable = mysqlTable("my_table", {
     id: int("id").autoincrement().primaryKey(),
     name: varchar("name", { length: 255 }).notNull(),
     createdAt: timestamp("createdAt").defaultNow(),
   });
   ```

2. **Generate and Apply Migration:**
   ```bash
   pnpm drizzle-kit generate
   pnpm db:push
   ```

### Add a New UI Component

1. **Create `client/src/components/MyComponent.tsx`**
2. **Use shadcn/ui components for consistency:**
   ```typescript
   import { Button } from "@/components/ui/button";
   import { Card } from "@/components/ui/card";
   ```
3. **Import in your page:**
   ```typescript
   import { MyComponent } from "@/components/MyComponent";
   ```

### Run Tests for Your Changes

```bash
# Run all tests
pnpm test

# Run specific test file
pnpm test server/farmflow.test.ts

# Run in watch mode
pnpm test --watch
```

## Debugging

### Enable Debug Logging

Set environment variables:
```bash
# Enable tRPC logging
DEBUG=trpc:*

# Enable Drizzle logging
DEBUG=drizzle:*
```

### Browser DevTools

1. Open browser DevTools (F12)
2. **Network Tab:** Monitor API calls to `/api/trpc`
3. **Console Tab:** Check for JavaScript errors
4. **React DevTools:** Inspect component state and props

### Backend Debugging

1. Add `console.log()` statements in `server/` files
2. Check terminal output while running `pnpm dev`
3. Use VS Code debugger:
   ```json
   {
     "type": "node",
     "request": "attach",
     "name": "Attach to Server",
     "port": 9229
   }
   ```

## Troubleshooting

### Database Connection Error

**Error:** `Error: connect ECONNREFUSED 127.0.0.1:3306`

**Solution:**
- Verify MySQL is running: `mysql -u root -p -e "SELECT 1;"`
- Check `DATABASE_URL` in `.env.local`
- Ensure database and user were created correctly

### Port Already in Use

**Error:** `Error: listen EADDRINUSE :::3000`

**Solution:**
```bash
# Find process using port 3000
lsof -i :3000

# Kill the process
kill -9 <PID>

# Or use a different port
PORT=3001 pnpm dev
```

### TypeScript Errors

**Error:** `Type 'X' is not assignable to type 'Y'`

**Solution:**
```bash
# Check TypeScript errors
pnpm check

# Fix common issues
pnpm format
```

### Module Not Found

**Error:** `Cannot find module '@/components/...'`

**Solution:**
- Verify file exists at the correct path
- Check `tsconfig.json` for path aliases
- Ensure import path matches file location exactly

## Production Build

To create an optimized production build:

```bash
pnpm build
```

This will:
- Build frontend with Vite (optimized bundle)
- Build backend with esbuild (single executable)
- Output to `dist/` directory

Start the production server:
```bash
pnpm start
```

## Deployment

### Deploy to Manus Platform

1. Ensure all changes are committed and pushed to GitHub
2. Log in to Manus Dashboard
3. Click "Publish" button in the project management UI
4. Wait for deployment to complete
5. Access your live application at the provided URL

### Deploy to Other Platforms

The project can be deployed to any platform supporting Node.js:

- **Railway:** `railway up`
- **Render:** Connect GitHub repo in Render dashboard
- **Vercel:** `vercel deploy` (frontend only)
- **Heroku:** `git push heroku main`

## Environment Setup for Team

### For Team Members

1. Clone repository
2. Copy `.env.example` to `.env.local` (ask team lead for values)
3. Run `pnpm install`
4. Run `pnpm db:push`
5. Run `pnpm dev`

### Share Configuration Safely

- Never commit `.env.local` to git
- Use `.env.example` as template
- Share actual values through secure channels (1Password, LastPass, etc.)

## Performance Optimization

### Frontend

- Use React DevTools Profiler to identify slow components
- Enable code splitting for large pages
- Use lazy loading for images

### Backend

- Monitor tRPC procedure performance
- Add database indexes for frequently queried fields
- Use query caching where appropriate

## Additional Resources

- **tRPC Documentation:** https://trpc.io/docs
- **Drizzle ORM:** https://orm.drizzle.team
- **React Documentation:** https://react.dev
- **Tailwind CSS:** https://tailwindcss.com
- **shadcn/ui:** https://ui.shadcn.com

## Getting Help

- Check existing issues on GitHub
- Review error messages carefully
- Search documentation for similar problems
- Ask in team Slack/Discord channel
- Create a new GitHub issue with detailed description

## Next Steps

After setup, consider:

1. **Integrate FastAPI Intelligence Layer** for AI recommendations
2. **Implement Real-time Updates** using Supabase or WebSockets
3. **Add Offline Support** with IndexedDB and Service Workers
4. **Set Up CI/CD Pipeline** with GitHub Actions
5. **Configure Monitoring** with Sentry or similar service
6. **Load Test** with k6 or Artillery

---

**Happy coding! 🚀**

For questions or issues, please refer to the GitHub repository or contact the development team.

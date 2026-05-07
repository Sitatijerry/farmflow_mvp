# FarmFlow MVP - Quick Start Guide

Get FarmFlow running in 5 minutes!

## TL;DR - Fast Setup

### 1. Prerequisites
```bash
# Install Node.js 18+ and pnpm
node --version  # Should be v18+
npm install -g pnpm
```

### 2. Clone & Install
```bash
git clone https://github.com/Sitatijerry/farmflow_mvp.git
cd farmflow_mvp
pnpm install
```

### 3. Database (Choose One)

**Option A: Docker (Easiest)**
```bash
docker run -d --name farmflow-mysql \
  -e MYSQL_ROOT_PASSWORD=root \
  -e MYSQL_DATABASE=farmflow \
  -e MYSQL_USER=farmflow_user \
  -e MYSQL_PASSWORD=password123 \
  -p 3306:3306 mysql:8.0
```

**Option B: Local MySQL**
```bash
mysql -u root -p
# CREATE DATABASE farmflow;
# CREATE USER 'farmflow_user'@'localhost' IDENTIFIED BY 'password123';
# GRANT ALL PRIVILEGES ON farmflow.* TO 'farmflow_user'@'localhost';
# FLUSH PRIVILEGES;
```

### 4. Environment Setup
```bash
# Copy and edit .env.local
cat > .env.local << 'EOF'
DATABASE_URL="mysql://farmflow_user:password123@localhost:3306/farmflow"
VITE_APP_ID="dev-app-id"
OAUTH_SERVER_URL="https://api.manus.im"
VITE_OAUTH_PORTAL_URL="https://manus.im/login"
JWT_SECRET="dev-secret-key-minimum-32-characters-long"
OWNER_NAME="Developer"
OWNER_OPEN_ID="dev-user-id"
VITE_FRONTEND_FORGE_API_URL="https://api.manus.im"
VITE_FRONTEND_FORGE_API_KEY="dev-key"
BUILT_IN_FORGE_API_URL="https://api.manus.im"
BUILT_IN_FORGE_API_KEY="dev-key"
EOF
```

### 5. Initialize Database
```bash
pnpm db:push
```

### 6. Start Development
```bash
pnpm dev
```

### 7. Open Browser
```
http://localhost:3000
```

## What You Get

✅ **Manager Dashboard** - Farm overview, recommendations, weather, field map  
✅ **Worker Mobile App** - Task management, photo uploads, field observations  
✅ **Full Backend** - tRPC API with role-based access control  
✅ **Database** - Pre-configured MySQL schema  
✅ **Tests** - 15 passing unit tests  

## Default Login

The app uses Manus OAuth. For development:
- Use your Manus account credentials
- Or configure test credentials in `.env.local`

## Common Commands

```bash
# Start development server
pnpm dev

# Run tests
pnpm test

# Build for production
pnpm build

# Start production server
pnpm start

# Format code
pnpm format

# Type check
pnpm check

# Database migration
pnpm db:push
```

## Project Structure

```
farmflow_mvp/
├── client/           # React frontend
├── server/           # Express backend
├── drizzle/          # Database schema
├── shared/           # Shared types
└── package.json
```

## Troubleshooting

| Problem | Solution |
|---------|----------|
| Port 3000 in use | `PORT=3001 pnpm dev` |
| DB connection error | Verify MySQL running: `mysql -u root -p -e "SELECT 1;"` |
| Module not found | Run `pnpm install` again |
| TypeScript errors | Run `pnpm check` to see all errors |

## Next Steps

1. **Explore the Code**
   - Check out `client/src/pages/ManagerDashboard.tsx`
   - Review `server/routers.ts` for API procedures
   - Look at `drizzle/schema.ts` for database structure

2. **Make Changes**
   - Edit components in `client/src/components/`
   - Add new procedures in `server/routers.ts`
   - Modify database schema in `drizzle/schema.ts`

3. **Test Your Changes**
   - Run `pnpm test` to verify
   - Check browser console for errors
   - Use browser DevTools to debug

## Full Documentation

See [SETUP.md](./SETUP.md) for comprehensive setup guide with:
- Detailed prerequisites
- Environment variable explanation
- Database setup options
- Development workflow
- Debugging tips
- Troubleshooting guide

## Need Help?

- 📖 Check [SETUP.md](./SETUP.md)
- 🐛 Review GitHub issues
- 💬 Ask in team chat
- 📝 Create GitHub issue

---

**You're all set! Happy coding! 🚀**

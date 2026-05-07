# FarmFlow MVP - Development Guide

This guide covers development best practices, architecture decisions, and common workflows for the FarmFlow project.

## Project Architecture

### Frontend Architecture

**Technology Stack:**
- React 19 - UI framework
- Tailwind CSS 4 - Utility-first styling
- shadcn/ui - Pre-built accessible components
- tRPC - End-to-end type-safe API
- React Query - Data fetching and caching
- Wouter - Lightweight routing

**Key Directories:**
```
client/src/
├── pages/              # Page-level components (ManagerDashboard, WorkerApp)
├── components/         # Reusable UI components
├── contexts/           # React contexts (ThemeContext)
├── hooks/              # Custom React hooks
├── lib/                # Utilities (tRPC client, helpers)
├── App.tsx             # Main router
├── main.tsx            # Entry point
└── index.css           # Global styles
```

### Backend Architecture

**Technology Stack:**
- Express 4 - HTTP server
- tRPC 11 - Type-safe API framework
- Drizzle ORM - SQL query builder
- MySQL 8 - Database
- Zod - Schema validation

**Key Directories:**
```
server/
├── routers.ts          # tRPC procedure definitions
├── db.ts               # Database query helpers
├── _core/              # Framework internals
│   ├── context.ts      # tRPC context
│   ├── trpc.ts         # tRPC setup
│   ├── auth.ts         # Authentication
│   └── index.ts        # Server entry point
└── *.test.ts           # Tests
```

### Database Architecture

**Schema Organization:**
```
drizzle/
├── schema.ts           # All table definitions
└── migrations/         # Generated SQL migrations
```

**Tables:**
- `users` - User accounts and roles
- `farms` - Farm entities
- `fields` - Field/plot information
- `tasks` - Worker tasks
- `recommendations` - AI recommendations
- `weather` - Weather data
- `uploads` - Field observation images
- `workerAssignments` - Worker-to-farm/field assignments

## Development Workflow

### 1. Adding a New Feature

**Step 1: Plan the Data Model**
- Identify what data needs to be stored
- Add tables to `drizzle/schema.ts`
- Define TypeScript types in `shared/types.ts`

**Step 2: Create Database Migration**
```bash
pnpm drizzle-kit generate
pnpm db:push
```

**Step 3: Implement Backend Logic**
- Add query helpers in `server/db.ts`
- Create tRPC procedures in `server/routers.ts`
- Write tests in `server/feature.test.ts`

**Step 4: Build Frontend UI**
- Create components in `client/src/components/`
- Build page in `client/src/pages/`
- Wire up tRPC calls using `trpc.*.useQuery/useMutation`

**Step 5: Test and Verify**
```bash
pnpm test
pnpm dev
# Test in browser
```

### 2. Database Schema Changes

**Adding a New Table:**

1. **Edit `drizzle/schema.ts`:**
   ```typescript
   export const myTable = mysqlTable("my_table", {
     id: int("id").autoincrement().primaryKey(),
     name: varchar("name", { length: 255 }).notNull(),
     farmId: int("farm_id").references(() => farms.id),
     createdAt: timestamp("created_at").defaultNow(),
   });
   
   export type MyTable = typeof myTable.$inferSelect;
   export type InsertMyTable = typeof myTable.$inferInsert;
   ```

2. **Generate Migration:**
   ```bash
   pnpm drizzle-kit generate
   ```

3. **Review Generated SQL:**
   ```bash
   cat drizzle/migrations/0001_*.sql
   ```

4. **Apply Migration:**
   ```bash
   pnpm db:push
   ```

**Modifying an Existing Table:**

1. Update the table definition in `drizzle/schema.ts`
2. Generate migration: `pnpm drizzle-kit generate`
3. Review and apply: `pnpm db:push`

### 3. Creating tRPC Procedures

**Public Procedure (no auth required):**
```typescript
export const appRouter = router({
  public: router({
    getData: publicProcedure
      .input(z.object({ id: z.string() }))
      .query(async ({ input }) => {
        // Implementation
        return data;
      }),
  }),
});
```

**Protected Procedure (requires auth):**
```typescript
export const appRouter = router({
  protected: router({
    updateData: protectedProcedure
      .input(z.object({ id: z.string(), name: z.string() }))
      .mutation(async ({ ctx, input }) => {
        // ctx.user is available
        // Implementation
        return { success: true };
      }),
  }),
});
```

**Admin-Only Procedure:**
```typescript
const adminProcedure = protectedProcedure.use(({ ctx, next }) => {
  if (ctx.user.role !== 'admin') {
    throw new TRPCError({ code: 'FORBIDDEN' });
  }
  return next({ ctx });
});

export const appRouter = router({
  admin: router({
    deleteUser: adminProcedure
      .input(z.object({ userId: z.number() }))
      .mutation(async ({ input }) => {
        // Only admins can call this
        return { success: true };
      }),
  }),
});
```

### 4. Frontend Data Fetching

**Query (GET):**
```typescript
const { data, isLoading, error } = trpc.farm.list.useQuery();

if (isLoading) return <div>Loading...</div>;
if (error) return <div>Error: {error.message}</div>;

return <div>{data?.map(farm => <div key={farm.id}>{farm.name}</div>)}</div>;
```

**Mutation (POST/PUT/DELETE):**
```typescript
const createFarm = trpc.farm.create.useMutation({
  onSuccess: () => {
    toast.success("Farm created!");
    // Invalidate cache to refetch
    trpc.useUtils().farm.list.invalidate();
  },
  onError: (error) => {
    toast.error(`Error: ${error.message}`);
  },
});

const handleCreate = async () => {
  await createFarm.mutateAsync({
    name: "New Farm",
    location: "Test Location",
  });
};
```

**Optimistic Updates:**
```typescript
const updateTask = trpc.task.update.useMutation({
  onMutate: async (newData) => {
    // Cancel outgoing refetches
    await trpc.useUtils().task.list.cancel();
    
    // Snapshot previous data
    const previousData = trpc.useUtils().task.list.getData();
    
    // Update cache optimistically
    trpc.useUtils().task.list.setData(undefined, (old) =>
      old?.map((task) =>
        task.id === newData.id ? { ...task, ...newData } : task
      )
    );
    
    return { previousData };
  },
  onError: (error, newData, context) => {
    // Rollback on error
    if (context?.previousData) {
      trpc.useUtils().task.list.setData(undefined, context.previousData);
    }
  },
  onSuccess: () => {
    trpc.useUtils().task.list.invalidate();
  },
});
```

### 5. Component Best Practices

**Use shadcn/ui Components:**
```typescript
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

export function MyComponent() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>My Component</CardTitle>
      </CardHeader>
      <CardContent>
        <Input placeholder="Enter text..." />
        <Button>Submit</Button>
      </CardContent>
    </Card>
  );
}
```

**Handle Loading States:**
```typescript
export function MyComponent() {
  const { data, isLoading } = trpc.getData.useQuery();
  
  if (isLoading) {
    return <Skeleton className="h-12 w-full" />;
  }
  
  return <div>{data}</div>;
}
```

**Handle Empty States:**
```typescript
export function MyComponent() {
  const { data } = trpc.getData.useQuery();
  
  if (!data || data.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">No data available</p>
      </div>
    );
  }
  
  return <div>{/* Render data */}</div>;
}
```

## Testing

### Running Tests

```bash
# Run all tests
pnpm test

# Run specific test file
pnpm test server/farmflow.test.ts

# Run in watch mode
pnpm test --watch

# Run with coverage
pnpm test --coverage
```

### Writing Tests

**Example Test:**
```typescript
import { describe, it, expect } from "vitest";
import { appRouter } from "./routers";

describe("Farm procedures", () => {
  it("should list farms", async () => {
    const ctx = createContext(mockUser);
    const caller = appRouter.createCaller(ctx);
    
    const result = await caller.farm.list();
    
    expect(Array.isArray(result)).toBe(true);
  });
});
```

### Test Coverage

- **Unit Tests:** Test individual functions and procedures
- **Integration Tests:** Test tRPC procedures with database
- **Component Tests:** Test React components (optional)
- **E2E Tests:** Test full user workflows (optional)

## Styling Guidelines

### Color Palette (Agricultural Theme)

```css
/* Primary Colors */
--primary: #16a34a;        /* Green */
--primary-foreground: #ffffff;

/* Secondary Colors */
--secondary: #8b5cf6;      /* Purple */
--accent: #f59e0b;         /* Amber */

/* Neutral Colors */
--background: #ffffff;
--foreground: #1f2937;
--muted: #f3f4f6;
--muted-foreground: #6b7280;
--border: #e5e7eb;
```

### Spacing System

```
xs: 0.5rem (8px)
sm: 1rem (16px)
md: 1.5rem (24px)
lg: 2rem (32px)
xl: 3rem (48px)
```

### Typography

```
h1: 2.25rem (36px) - Bold
h2: 1.875rem (30px) - Semibold
h3: 1.5rem (24px) - Semibold
body: 1rem (16px) - Regular
small: 0.875rem (14px) - Regular
```

## Performance Optimization

### Frontend

1. **Code Splitting:**
   - Use lazy loading for pages
   - Split large components

2. **Image Optimization:**
   - Use appropriate image formats
   - Compress before uploading
   - Use lazy loading for images

3. **Caching:**
   - Leverage React Query caching
   - Set appropriate stale times
   - Invalidate strategically

### Backend

1. **Database Queries:**
   - Add indexes for frequently queried columns
   - Use pagination for large datasets
   - Avoid N+1 queries

2. **API Response:**
   - Return only necessary fields
   - Use pagination
   - Compress responses

## Security Best Practices

1. **Authentication:**
   - Use Manus OAuth (already configured)
   - Never store passwords
   - Use secure session cookies

2. **Authorization:**
   - Check user role in procedures
   - Validate user ownership of resources
   - Use `protectedProcedure` for sensitive operations

3. **Input Validation:**
   - Use Zod for schema validation
   - Validate on both frontend and backend
   - Sanitize user input

4. **Secrets Management:**
   - Never commit `.env.local`
   - Use environment variables
   - Rotate secrets regularly

## Debugging Tips

### Browser DevTools

1. **Network Tab:**
   - Monitor `/api/trpc` requests
   - Check request/response payloads
   - Verify authentication headers

2. **Console Tab:**
   - Check for JavaScript errors
   - Use `console.log()` for debugging
   - Check React warnings

3. **React DevTools:**
   - Inspect component hierarchy
   - Check props and state
   - Profile component renders

### Backend Debugging

1. **Console Logging:**
   ```typescript
   console.log("Debug info:", data);
   console.error("Error:", error);
   ```

2. **Database Logging:**
   ```bash
   DEBUG=drizzle:* pnpm dev
   ```

3. **tRPC Logging:**
   ```bash
   DEBUG=trpc:* pnpm dev
   ```

## Common Patterns

### Conditional Rendering

```typescript
export function MyComponent() {
  const { user } = useAuth();
  
  // Only show for managers
  if (user?.role !== 'admin') {
    return null;
  }
  
  return <div>Manager-only content</div>;
}
```

### Form Handling

```typescript
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

const schema = z.object({
  name: z.string().min(1, "Name required"),
  email: z.string().email("Invalid email"),
});

export function MyForm() {
  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
  });
  
  const onSubmit = (data) => {
    console.log(data);
  };
  
  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input {...register("name")} />
      {errors.name && <span>{errors.name.message}</span>}
      <button type="submit">Submit</button>
    </form>
  );
}
```

## Deployment Checklist

- [ ] All tests passing
- [ ] No TypeScript errors
- [ ] Environment variables configured
- [ ] Database migrations applied
- [ ] Code reviewed and merged
- [ ] No console errors in browser
- [ ] Performance acceptable
- [ ] Security review completed
- [ ] Backup created
- [ ] Deployment plan documented

## Resources

- **tRPC Docs:** https://trpc.io/docs
- **Drizzle ORM:** https://orm.drizzle.team
- **React Docs:** https://react.dev
- **Tailwind CSS:** https://tailwindcss.com
- **shadcn/ui:** https://ui.shadcn.com
- **Express.js:** https://expressjs.com

## Getting Help

1. Check existing documentation
2. Search GitHub issues
3. Review similar code patterns
4. Ask in team chat
5. Create detailed GitHub issue

---

**Happy developing! 🚀**

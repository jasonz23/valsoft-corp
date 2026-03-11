---
name: clean-fullstack-code
description: >
  Produces clean, secure, production-ready code for full-stack JavaScript/TypeScript repositories.
  Covers frontend (React, Next.js), mobile (React Native, Expo), and backend (NestJS-style modular TypeScript).
  Enforces design patterns from Refactoring.Guru, security best practices, SOLID principles, proper project structure,
  Swagger/OpenAPI type safety, test-driven development with Jest, structured logging for cloud platforms (GCP/AWS),
  and DevOps configuration. Use this skill whenever the user asks you to write, review, refactor, debug, or scaffold
  any code — not just new projects but also bug fixes, feature additions, API endpoints, components, services,
  database models, CI/CD configs, Docker setups, or any code-adjacent work in a JS/TS stack. Trigger on ANY coding
  task: "build me an API", "fix this component", "refactor this service", "set up my project", "add authentication",
  "create a React component", "write a migration", "review this code", "scaffold a new feature", etc. If the user is
  writing or touching code in a JavaScript/TypeScript full-stack context, use this skill.
---

# Clean Full-Stack Code

You are a senior full-stack engineer writing production code. Every line you produce should be something a teammate would thank you for — readable, secure, and easy to extend. This skill gives you the principles and patterns to make that happen consistently.

## Core Philosophy

Good code communicates intent. Before writing anything, ask yourself: "If someone reads this six months from now with no context, will they understand what it does and why?" If the answer is no, restructure until it is yes.

Three pillars guide every decision:

1. **Clarity over cleverness** — Readable code beats compact code. Name things precisely. A function called `calculateMonthlyRevenue` is better than `calc`. A boolean called `isAuthenticated` is better than `auth`.

2. **Security by default** — Every input is hostile until validated. Every endpoint needs auth and rate limiting. Every secret lives in environment variables. This isn't paranoia — it's professionalism.

3. **Composition over inheritance** — Favor small, focused modules that compose together. A service that does one thing well is more valuable than a god-class that does everything poorly.

## Before Writing Code

Before generating any code, mentally walk through this checklist:

- What design pattern fits this problem? (Check `references/design-patterns-guide.md` for the right match)
- What security considerations apply? (Check `references/security-checklist.md`)
- Where does this code live in the project structure? (Check `references/project-structure.md`)
- Does the project have a `PRODUCT.md`? If yes, read it — it's the mandatory spec that overrides defaults
- Does the target folder have a `SPEC.md`? If yes, follow its boundaries
- Does similar code already exist that I should reuse or extend?
- Can I extract any shared logic into a helper rather than writing it inline?

If you're scaffolding a new project or adding significant infrastructure, read `references/project-structure.md` for the canonical folder layout and DevOps setup.

**For backend code, always follow the TDD sequence:**
1. **Map** the feature — outline endpoints, service methods, edge cases, error scenarios in the SPEC.md
2. **Write tests first** — `.spec.ts` files with failing tests that describe what the code should do
3. **Implement** the minimum code to make tests pass
4. **Refactor** with the tests as your safety net — extract helpers, improve names, optimize
5. Present both the tests and the implementation to the user

## Modular Architecture — Spec-Driven Development

Every codebase this skill produces follows a spec-driven modular architecture. The key idea: folders are modules, and every module has a contract.

### PRODUCT.md — The Root Spec

Every project has a `PRODUCT.md` at the root. This file defines the core product goals and mandatory coding standards that every module must follow. It is strict and non-negotiable. When writing any code, check for PRODUCT.md first and treat its rules as law.

If a project doesn't have a PRODUCT.md yet, offer to create one using the template in `references/project-structure.md`. It should capture: the product vision, non-negotiable coding standards (TypeScript strictness, architecture rules, security requirements), the module registry, tech stack, and API conventions.

### SPEC.md — Module Contracts

Every feature folder (module) has a `SPEC.md` that defines:
- **Purpose**: What this module does and why it exists
- **Responsibilities**: What it owns
- **Does NOT Handle**: What explicitly doesn't belong (prevents scope creep)
- **Dependencies**: Internal and external
- **Exports**: What it exposes to other modules
- **File Organization**: How files are named and arranged
- **Testing Requirements**: What must be tested
- **Security Considerations**: Module-specific security concerns

When adding code to an existing module, read its SPEC.md first. If the new code doesn't fit the spec, either it belongs in a different module or the spec needs updating (with the user's approval).

When creating a new module, write the SPEC.md before writing any code. The spec forces you to think about boundaries upfront.

### Breakdown Files

For complex domains, modules can contain additional `.md` files that break down sub-concerns:

```
modules/payments/
├── SPEC.md                    # Module contract
├── ARCHITECTURE.md            # Detailed architecture decisions for this module
├── payments.service.ts
├── payments.controller.ts
├── providers/
│   ├── SPEC.md                # Sub-module spec for payment providers
│   ├── stripe.adapter.ts
│   └── paypal.adapter.ts
└── webhooks/
    ├── SPEC.md                # Sub-module spec for webhook handlers
    └── stripe-webhook.ts
```

The main SPEC.md links to sub-specs. An AI agent or developer working in `providers/` reads both the parent SPEC.md and the sub-SPEC.md to understand the full context.

## Code Quality Standards

### Naming

Names are the most important documentation. Follow these conventions:

- **Files**: kebab-case for files (`user-service.ts`, `auth-middleware.ts`), PascalCase for React components (`UserProfile.tsx`)
- **Variables/functions**: camelCase, descriptive. Booleans start with `is`, `has`, `can`, `should`
- **Constants**: UPPER_SNAKE_CASE for true constants (`MAX_RETRY_COUNT`), camelCase for config-like values
- **Types/Interfaces**: PascalCase, no `I` prefix. Use `User` not `IUser`. Suffix DTOs: `CreateUserDto`
- **Enums**: PascalCase name, PascalCase members (`enum UserRole { Admin, Editor, Viewer }`)

### Functions

- Each function does one thing. If you're writing "and" in the function name, split it
- Keep functions under 30 lines. If longer, extract helpers
- Pure functions when possible — same input, same output, no side effects
- Always type parameters and return values explicitly in TypeScript
- Use early returns to reduce nesting:

```typescript
// Good — flat and readable
async function getUser(id: string): Promise<User> {
  if (!id) throw new BadRequestError('User ID is required');

  const user = await userRepository.findById(id);
  if (!user) throw new NotFoundError('User not found');

  return user;
}

// Avoid — nested and harder to follow
async function getUser(id: string): Promise<User> {
  if (id) {
    const user = await userRepository.findById(id);
    if (user) {
      return user;
    } else {
      throw new NotFoundError('User not found');
    }
  } else {
    throw new BadRequestError('User ID is required');
  }
}
```

### Library Selection — Reputable, Lightweight, Purpose-Built

Don't reinvent the wheel, but don't add bloat either. When a well-maintained, lightweight library solves the problem better than hand-rolled code, use it. The key criteria:

**Evaluation checklist before recommending any package:**
1. **Does it actually exist?** Check npmjs.com. AI-suggested packages sometimes don't exist — verify before installing
2. **Is it actively maintained?** Check last publish date, open issues, and GitHub stars. Prefer packages updated within the last 6 months
3. **Is it lightweight?** Check bundle size at bundlephobia.com. Don't add a 500KB library for one helper function
4. **Is it secure?** Run `npm audit` after installing. Check for known vulnerabilities
5. **Is the newer version available?** Always recommend the latest stable version, not an outdated one

**Recommended libraries by domain (use these over hand-rolling):**

| Domain | Library | Why |
|--------|---------|-----|
| Animations (web) | `react-spring`, `framer-motion` | Physics-based, declarative, performant |
| 3D / WebGL | `three.js`, `@react-three/fiber` | Industry standard, massive ecosystem |
| Scheduling (NestJS) | `@nestjs/schedule` (wraps `cron`) | Native NestJS integration, decorator-based |
| Validation | `class-validator` + `class-transformer` | NestJS-native, decorator-based, Swagger-compatible |
| HTTP client | `axios` or native `fetch` | Axios for interceptors/retries, fetch for simplicity |
| Date handling | `date-fns` or `dayjs` | Tree-shakeable, lightweight (not moment.js) |
| State management | `zustand` or `@tanstack/react-query` | Minimal boilerplate, excellent DX |
| Forms | `react-hook-form` + `zod` | Performant, validation-integrated |
| Testing | `jest` + `@nestjs/testing` + `supertest` | NestJS-native, excellent mocking support |
| Logging | `pino` + `nestjs-pino` | Fastest Node.js logger, JSON structured output |
| Queue/Jobs | `bullmq` | Redis-backed, battle-tested, NestJS integration |
| Email | `@nestjs-modules/mailer` or Resend SDK | Templating built-in, provider-agnostic |
| File storage | `@aws-sdk/client-s3` or provider SDK | Direct SDK, no wrapper bloat |

**When NOT to use a library:**
- The task is simple enough for a 5-line helper function
- The library would be the only import from a large package
- You only need one function from a utility library (copy the implementation instead)
- The library hasn't been updated in over a year and has open security issues

### DRY Code — Helpers, Not Duplication

Duplicate code is a maintenance nightmare. If you're writing the same logic twice, extract it into a helper. The rule: if a block of logic appears in two or more places (or would naturally be reused), it becomes a shared utility or a module-level helper.

**Where helpers live depends on scope:**
- **Module-scoped helpers** → `[module]/helpers/` directory (e.g., `users/helpers/format-user-response.ts`). Used only within that module
- **Cross-module helpers** → `shared/utils/` directory. Used across multiple modules
- **Test helpers** → `test/helpers/` or `test/factories/`. Test data builders, assertion helpers, setup utilities

**What makes a good helper:**
- Pure function — same input, same output, no side effects
- Single responsibility — does one thing, named after what it does
- Typed — explicit input and return types
- Tested — helpers are logic, logic gets tests

```typescript
// shared/utils/pagination.helper.ts — used across all list endpoints
export function buildPaginationMeta(
  total: number,
  page: number,
  pageSize: number,
): PaginationMeta {
  return {
    total,
    page,
    pageSize,
    hasMore: page * pageSize < total,
    totalPages: Math.ceil(total / pageSize),
  };
}

// shared/utils/slug.helper.ts — used by multiple modules
export function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_]+/g, '-')
    .replace(/-+/g, '-');
}
```

**Anti-patterns to catch:**
- If two services both calculate a total with the same formula → extract to helper
- If three controllers all format dates the same way → extract to helper
- If multiple test files build the same mock object → extract to test factory
- If an interceptor and a service both parse the same header → extract to helper

Before writing any new function, scan the existing `shared/utils/` and module `helpers/` directories. The function you need might already exist.

### Error Handling

- Use NestJS's built-in exception classes (`NotFoundException`, `BadRequestException`, `ConflictException`, etc.) or extend `HttpException` for custom errors
- Catch errors at the boundary — use a global `ExceptionFilter` for consistent error responses
- Log errors with context (user ID, request ID, action attempted) via the structured logger — never just the message
- Never swallow errors silently. If you catch it, either handle it meaningfully or rethrow
- Use typed error response DTOs so the frontend knows exactly what happened

```typescript
// Custom exception filter for consistent error responses
@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  constructor(private readonly logger: AppLoggerService) {}

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    const request = ctx.getRequest();

    const status = exception instanceof HttpException
      ? exception.getStatus()
      : HttpStatus.INTERNAL_SERVER_ERROR;

    const message = exception instanceof HttpException
      ? exception.message
      : 'Internal server error';

    this.logger.error('Unhandled exception', {
      statusCode: status,
      path: request.url,
      method: request.method,
      message,
      requestId: request.headers['x-request-id'],
      stack: exception instanceof Error ? exception.stack : undefined,
    });

    response.status(status).json({
      statusCode: status,
      code: this.getErrorCode(status),
      message,
      timestamp: new Date().toISOString(),
      path: request.url,
    });
  }
}
```

### Structured Logging — Cloud-Native, No console.log

`console.log` is banned. It produces unstructured text that's nearly impossible to search, filter, or alert on in cloud platforms. Instead, use a structured JSON logger that integrates with GCP Cloud Logging, AWS CloudWatch, or any log aggregation platform.

Use NestJS's built-in `Logger` service (which you can swap to any provider) or use **Pino** for high-performance structured JSON output:

```typescript
// logger.module.ts — structured JSON logging for cloud platforms
@Module({
  providers: [
    {
      provide: AppLoggerService,
      useFactory: () => {
        const pinoLogger = pino({
          level: process.env.LOG_LEVEL || 'info',
          // JSON format for GCP/AWS log ingestion
          formatters: {
            level: (label) => ({ severity: label.toUpperCase() }), // GCP uses 'severity'
          },
          // Redact sensitive fields automatically
          redact: ['req.headers.authorization', 'password', 'token', 'apiKey'],
        });
        return new AppLoggerService(pinoLogger);
      },
    },
  ],
  exports: [AppLoggerService],
})
export class LoggerModule {}
```

```typescript
// app-logger.service.ts — injectable, testable, structured
@Injectable()
export class AppLoggerService {
  constructor(private readonly pino: pino.Logger) {}

  log(message: string, context?: Record<string, unknown>): void {
    this.pino.info({ ...context, msg: message });
  }

  warn(message: string, context?: Record<string, unknown>): void {
    this.pino.warn({ ...context, msg: message });
  }

  error(message: string, context?: Record<string, unknown>): void {
    this.pino.error({ ...context, msg: message });
  }

  debug(message: string, context?: Record<string, unknown>): void {
    this.pino.debug({ ...context, msg: message });
  }
}
```

Logging rules:
- **Inject `AppLoggerService`** via constructor — never import a global logger directly. This makes it mockable in tests
- **Always include context** — `userId`, `requestId`, `action`, `module`. A log line without context is useless in production
- **Use log levels correctly**: `debug` for development details, `info` for business events (user signed up, order completed), `warn` for recoverable issues (retry succeeded, rate limit approaching), `error` for failures that need attention
- **Redact sensitive data** — passwords, tokens, API keys must never appear in logs, not even in debug mode. Configure redaction at the logger level so it's impossible to accidentally log secrets
- **Correlation IDs** — inject a `requestId` (from the `x-request-id` header or auto-generated) into every log line. This lets you trace a single request across microservices in cloud logging dashboards

### TypeScript Usage

- Enable `strict: true` in tsconfig — always. No exceptions
- Avoid `any`. Use `unknown` when the type is genuinely unknown, then narrow with type guards
- Use discriminated unions for state management instead of optional fields
- Prefer `interface` for object shapes that might be extended, `type` for unions and computed types
- Use `as const` assertions for literal types instead of enums when appropriate
- Leverage utility types: `Pick`, `Omit`, `Partial`, `Required`, `Record`

```typescript
// Discriminated union — the compiler enforces exhaustive handling
type ApiResponse<T> =
  | { status: 'success'; data: T }
  | { status: 'error'; error: { code: string; message: string } }
  | { status: 'loading' };

// The compiler will warn if you forget a case
function handleResponse<T>(response: ApiResponse<T>) {
  switch (response.status) {
    case 'success':
      return response.data;
    case 'error':
      throw new Error(response.error.message);
    case 'loading':
      return null;
  }
}
```

### React & React Native Components

- Functional components only. No class components
- One component per file. Co-locate styles, types, and tests
- Extract hooks for reusable logic (`useAuth`, `useDebounce`, `usePagination`)
- Props interfaces go in the same file, exported if shared
- Use composition — pass children and render props instead of building mega-components
- Memoize expensive computations with `useMemo`, not every value
- Avoid inline function definitions in JSX where they cause unnecessary re-renders

```tsx
// Clean component pattern
interface UserCardProps {
  user: User;
  onEdit: (userId: string) => void;
}

export function UserCard({ user, onEdit }: UserCardProps) {
  const handleEdit = useCallback(() => {
    onEdit(user.id);
  }, [user.id, onEdit]);

  return (
    <div className="rounded-lg border p-4">
      <h3 className="text-lg font-semibold">{user.name}</h3>
      <p className="text-gray-600">{user.email}</p>
      <button onClick={handleEdit} className="mt-2 btn-primary">
        Edit Profile
      </button>
    </div>
  );
}
```

### Backend Architecture — NestJS Style

The backend follows NestJS's modular architecture. Every feature is a self-contained module with its own controller, service, repository, DTOs, and tests. This structure enforces separation of concerns through dependency injection and decorators.

Core NestJS patterns to follow:
- **Modules** encapsulate a feature domain (users, auth, orders). Each module declares its controllers, providers, and imports
- **Controllers** handle HTTP concerns only — parse requests, call services, return responses. No business logic
- **Services** contain all business logic. They're injectable and testable in isolation
- **Repositories** handle data access. Services call repositories, never the database directly
- **DTOs** (Data Transfer Objects) define the shape of request/response data with class-validator decorators
- **Pipes** handle validation and transformation. Use `ValidationPipe` globally
- **Guards** handle authentication and authorization. Apply via decorators
- **Interceptors** handle cross-cutting concerns (logging, caching, response transformation)

```typescript
// users.module.ts — clean module registration
@Module({
  imports: [TypeOrmModule.forFeature([User])],
  controllers: [UsersController],
  providers: [UsersService, UsersRepository],
  exports: [UsersService],
})
export class UsersModule {}
```

### Swagger / OpenAPI — Type Safety as Documentation

Swagger is not optional — it's the contract between your backend and every consumer (frontend, mobile, third-party). Every endpoint must be fully documented with decorators.

Set up Swagger globally in `main.ts`:

```typescript
// main.ts
const config = new DocumentBuilder()
  .setTitle('API')
  .setDescription('API Documentation')
  .setVersion('1.0')
  .addBearerAuth()
  .build();
const document = SwaggerModule.createDocument(app, config);
SwaggerModule.setup('api/docs', app, document);
```

Decorate every controller and DTO:

```typescript
// create-user.dto.ts — DTOs ARE the Swagger schema
export class CreateUserDto {
  @ApiProperty({ example: 'jane@example.com', description: 'User email address' })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({ example: 'Jane Doe', minLength: 2, maxLength: 100 })
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  name: string;

  @ApiProperty({ enum: UserRole, example: UserRole.Editor })
  @IsEnum(UserRole)
  role: UserRole;
}

// users.controller.ts — every endpoint documented
@ApiTags('users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new user' })
  @ApiResponse({ status: 201, description: 'User created', type: UserResponseDto })
  @ApiResponse({ status: 400, description: 'Validation error' })
  @ApiResponse({ status: 409, description: 'Email already exists' })
  async create(@Body() createUserDto: CreateUserDto): Promise<UserResponseDto> {
    return this.usersService.create(createUserDto);
  }

  @Get()
  @ApiOperation({ summary: 'List users with pagination' })
  @ApiResponse({ status: 200, description: 'Paginated user list', type: PaginatedResponseDto })
  async findAll(@Query() paginationDto: PaginationDto): Promise<PaginatedResponseDto<UserResponseDto>> {
    return this.usersService.findAll(paginationDto);
  }
}
```

The Swagger decorators serve three purposes: they auto-generate interactive API docs at `/api/docs`, they enforce type safety between backend and frontend (generate client SDKs with `openapi-generator`), and they act as living documentation that never drifts from the implementation because it IS the implementation.

### API Response Consistency

All endpoints return the same response shape. The frontend should never guess:

```typescript
// Shared response wrapper
export class PaginatedResponseDto<T> {
  @ApiProperty()
  data: T[];

  @ApiProperty()
  pagination: {
    total: number;
    page: number;
    pageSize: number;
    hasMore: boolean;
  };
}

// Error responses are also consistent
export class ErrorResponseDto {
  @ApiProperty({ example: 400 })
  statusCode: number;

  @ApiProperty({ example: 'VALIDATION_ERROR' })
  code: string;

  @ApiProperty({ example: 'Validation failed' })
  message: string;

  @ApiPropertyOptional()
  details?: Record<string, string>;
}
```

### Database & Data Access

- Use an ORM or query builder (Prisma, Drizzle, Knex) — never raw string queries
- Migrations for every schema change. Never modify the database manually
- Index fields you query on frequently. Always index foreign keys
- Use transactions for operations that must succeed or fail together
- Parameterized queries always — this is non-negotiable for SQL injection prevention
- Separate your data access layer from business logic. Services call repositories, not the database directly

### Test-Driven Development (TDD) — Tests First, Always

The backend follows strict TDD. The workflow is: **map it out → write failing tests → implement until tests pass → refactor.** No backend code gets written without a test that demands it.

#### The TDD Cycle

1. **Map the feature.** Before touching any code, outline what the module does: the endpoints, the service methods, the edge cases, the error scenarios. Write this in the module's SPEC.md
2. **Write the tests first.** For each service method and controller endpoint, write the test that describes what it should do. These tests will fail — that's the point
3. **Implement the minimum code** to make the tests pass. Nothing more. No speculative features, no "while I'm here" additions
4. **Refactor with confidence.** The tests are your safety net. Clean up the implementation, extract helpers, improve naming — the tests tell you instantly if you break anything
5. **Repeat** for the next piece of functionality

#### Jest Testing Patterns

Test files live next to their source: `users.service.ts` → `users.service.spec.ts`. Use `.spec.ts` extension (NestJS convention).

```typescript
// users.service.spec.ts — test the service in isolation
describe('UsersService', () => {
  let service: UsersService;
  let repository: jest.Mocked<UsersRepository>;
  let logger: jest.Mocked<Logger>;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: UsersRepository,
          useValue: {
            findById: jest.fn(),
            findByEmail: jest.fn(),
            create: jest.fn(),
            update: jest.fn(),
          },
        },
        {
          provide: Logger,
          useValue: {
            log: jest.fn(),
            error: jest.fn(),
            warn: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get(UsersService);
    repository = module.get(UsersRepository);
    logger = module.get(Logger);
  });

  describe('create', () => {
    const createUserDto: CreateUserDto = {
      email: 'jane@example.com',
      name: 'Jane Doe',
      role: UserRole.Editor,
    };

    it('should create a user and return the response DTO', async () => {
      const savedUser = buildUser({ ...createUserDto, id: 'uuid-123' });
      repository.findByEmail.mockResolvedValue(null);
      repository.create.mockResolvedValue(savedUser);

      const result = await service.create(createUserDto);

      expect(repository.findByEmail).toHaveBeenCalledWith('jane@example.com');
      expect(repository.create).toHaveBeenCalledWith(createUserDto);
      expect(result).toEqual(expect.objectContaining({ id: 'uuid-123', email: 'jane@example.com' }));
    });

    it('should throw ConflictException if email already exists', async () => {
      repository.findByEmail.mockResolvedValue(buildUser({ email: 'jane@example.com' }));

      await expect(service.create(createUserDto)).rejects.toThrow(ConflictException);
      expect(repository.create).not.toHaveBeenCalled();
    });
  });
});
```

#### Mocking Strategy

- **Mock repositories and external services** — these are the boundaries of your unit. The service doesn't care if the database is Postgres or MongoDB, it cares that `repository.findById(id)` returns a user or null
- **Use `jest.Mocked<T>`** for type-safe mocks. This catches interface changes at compile time — if the repository method signature changes, your mock setup will show a TypeScript error
- **Use test factories** (like the `buildUser()` helper above) to create test data. Never hardcode UUIDs, timestamps, or other values across tests. A factory function with sensible defaults keeps tests readable and DRY:

```typescript
// test/factories/user.factory.ts — reusable across all test files
let counter = 0;

export function buildUser(overrides: Partial<User> = {}): User {
  counter++;
  return {
    id: `user-${counter}`,
    email: `user${counter}@test.com`,
    name: `Test User ${counter}`,
    role: UserRole.Viewer,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
    ...overrides,
  };
}
```

- **Integration tests** use NestJS's `Test.createTestingModule` with a real (test) database to verify the full request-response cycle:

```typescript
// users.controller.integration.spec.ts
describe('UsersController (integration)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = module.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('POST /users → 201 with valid data', () => {
    return request(app.getHttpServer())
      .post('/users')
      .send({ email: 'new@test.com', name: 'New User', role: 'viewer' })
      .expect(201)
      .expect((res) => {
        expect(res.body.data).toHaveProperty('id');
        expect(res.body.data.email).toBe('new@test.com');
      });
  });

  it('POST /users → 400 with invalid email', () => {
    return request(app.getHttpServer())
      .post('/users')
      .send({ email: 'not-an-email', name: 'Bad', role: 'viewer' })
      .expect(400);
  });
});
```

#### What Gets Tested

| Layer | What to test | Mock what |
|-------|-------------|-----------|
| Service | Business logic, validation, error cases | Repository, external APIs, logger |
| Controller | Request parsing, response shapes, status codes | Service |
| Repository | Query correctness, edge cases | Database (use test DB for integration) |
| Guards | Auth/authz logic | Request context |
| Pipes | Transformation and validation | Nothing (pure logic) |

## Design Patterns — When to Reach for Them

Don't apply patterns for their own sake. Apply them when the problem calls for it. Read `references/design-patterns-guide.md` for the full catalog, but here's a quick decision guide for the most common full-stack scenarios:

| Scenario | Pattern | Why |
|----------|---------|-----|
| Multiple payment providers | Strategy | Swap Stripe/PayPal/custom at runtime |
| Building complex query objects | Builder | Step-by-step construction with validation |
| Notification system (email, push, SMS) | Observer | Decouple triggers from delivery channels |
| Request validation pipeline | Chain of Responsibility | Each validator handles one concern |
| Database connection pool | Singleton | One pool instance, globally accessible |
| Wrapping third-party SDKs | Adapter | Isolate your code from external APIs |
| Complex UI component trees | Composite | Treat single items and groups uniformly |
| Adding logging/caching to services | Decorator | Layer behavior without modifying originals |
| Simplifying complex subsystems | Facade | One clean interface for the rest of your app |
| Undo/redo functionality | Command + Memento | Encapsulate and snapshot operations |

## Security — Every Line of Code

Security isn't a feature you add later. It's baked into every decision. Read `references/security-checklist.md` for the complete 30-point checklist, but internalize these non-negotiables:

1. **Auth uses Supabase Auth (GoTrue).** Use Supabase Auth for authentication — it handles signup, login, JWT issuance, refresh rotation, MFA, and OAuth providers. Locally, run the `supabase/gotrue` Docker image alongside your dev database. NestJS guards validate the JWT on every request
2. **Secrets live in `.env` files, nowhere else.** Never hardcode API keys, database URLs, or tokens. `.gitignore` is the first file in every project
3. **Validate everything server-side.** UI checks are for UX, not security. Every input is sanitized, every query is parameterized
4. **Rate limit from day one.** 100 req/hour per IP is a reasonable starting point. Password reset routes get 3 per email/hour
5. **CORS locks down to your domain.** Never use wildcard (`*`) in production. List your exact allowed origins
6. **Row-Level Security on.** Users should only see and touch their own data. Enforce this at the database level
7. **Remove console.log before shipping.** Logs can leak sensitive data. Use a proper logging library with levels

## Reviewing, Refactoring, and Restructuring Code

This skill is just as much about improving existing code as writing new code. Whether it's a quick review, a function-level refactor, or a full repo restructure, here's how to approach it.

### Code Review Lenses (apply in this order)

1. **Security audit** — Exposed secrets? Missing validation? SQL injection vectors? Auth gaps?
2. **Readability** — Can someone new understand this in 5 minutes? Are names clear? Is the flow obvious?
3. **Patterns** — Is there a design pattern that would simplify this? Is a pattern being misused?
4. **Performance** — N+1 queries? Missing indexes? Unnecessary re-renders? Memory leaks?
5. **Testing** — Is this testable? Are there tests? Do they test the right things?

Don't just point out problems — fix them. Show the before and after. Explain why the change matters.

### Refactoring an Existing Repo

When asked to refactor or restructure a repo, follow this sequence:

1. **Audit first.** Read the existing codebase. Understand the domain boundaries that already exist, even if they're implicit
2. **Create PRODUCT.md.** This is step one — define what the codebase should look like. Get the user to agree on the mandatory standards before touching code
3. **Map modules.** Identify the natural domain boundaries. List them in a module registry
4. **Write SPEC.md files.** For each module, write the spec before moving code. The spec defines what goes where and what doesn't
5. **Move one module at a time.** Restructure incrementally. Each move should leave the codebase in a working state
6. **Add re-exports.** Maintain backward compatibility with re-exports from old import paths during transition
7. **Add tests before changing behavior.** If code doesn't have tests, write characterization tests first (tests that capture what the code currently does, so you'll know if your refactor breaks something)
8. **Fix security fundamentals early.** .gitignore, env vars, input validation — quick wins, high impact

The full refactoring checklist and PRODUCT.md template are in `references/project-structure.md`.

## Project Structure & DevOps

For new projects or significant restructuring, read `references/project-structure.md` for the canonical layout covering:

- Monorepo structure (Turborepo/Nx)
- Frontend, backend, and shared package organization
- Environment configuration hierarchy
- Docker and docker-compose setup
- CI/CD pipeline templates (GCP Cloud Build)
- Essential config files (.gitignore, tsconfig, ESLint, Prettier)

### Docker Compose — Local Dev + Test Databases

Every project starts with a `docker-compose.yml` that spins up:
1. **`db`** — Development PostgreSQL on port 54322 with a persistent volume
2. **`db-test`** — Test PostgreSQL on port 54323 with NO persistent volume (clean state per test run)
3. **`supabase-auth`** — Local GoTrue instance for Supabase Auth, connected to the dev database
4. **`supabase-gateway`** — Nginx reverse proxy for the auth service

The test database is intentionally ephemeral — no volume mount means it starts fresh. This guarantees test isolation. The dev database uses a volume so your data persists between restarts.

An `init-db.sql` script in `scripts/` creates the auth schema and any extensions needed (like `uuid-ossp`, `pgcrypto`). Both databases run this init script on first boot.

See `references/project-structure.md` for the complete docker-compose.yml template.

### Environment Management — .env and .env.test

Two environment files, strictly separated:

- **`.env`** — Development environment. Points at the local dev database (port 54322) and local GoTrue
- **`.env.test`** — Test environment. Points at the test database (port 54323). Loaded by dotenv in the Jest setup

```typescript
// test/setup.ts — load .env.test BEFORE anything else
import * as dotenv from 'dotenv';
import { resolve } from 'path';

dotenv.config({ path: resolve(__dirname, '../.env.test') });
```

```json
// jest config in package.json or jest.config.ts
{
  "setupFiles": ["./test/setup.ts"]
}
```

Both files follow the same schema (validated by Zod at startup) but with different values. Never share a database between dev and test — a test that corrupts data should never affect your development workflow.

### Secrets Management — Public vs Private

Environment variables fall into two categories, and the distinction matters for CI/CD:

**Public env vars** (safe to store in the repo or CI config):
- `NODE_ENV`, `PORT`, `LOG_LEVEL`
- `CORS_ALLOW_LIST`, `API_VERSION`
- Feature flags, non-sensitive config

**Private secrets** (must be stored in a secrets manager — GCP Secret Manager, AWS Secrets Manager, Vault):
- `DATABASE_URL`, `DIRECT_URL`
- `JWT_SECRET`, `SUPABASE_SERVICE_ROLE_KEY`
- API keys for third-party services (Stripe, SendGrid, OpenAI)
- OAuth client secrets
- Encryption keys

In CI/CD pipelines, public vars are set directly in the build config. Private secrets are referenced from GCP Secret Manager (or equivalent) and injected at runtime — never written to files or build logs.

### Package.json Scripts — Reusable Commands

Every project includes a standard set of scripts that developers (and CI) use consistently:

```json
{
  "scripts": {
    "docker:up": "docker compose up -d",
    "docker:down": "docker compose down",
    "docker:reset": "docker compose down -v && docker compose up -d",
    "db:migrate": "npx prisma migrate deploy",
    "db:migrate:dev": "npx prisma migrate dev",
    "db:seed": "npx prisma db seed",
    "db:studio": "npx prisma studio",
    "start:dev": "nest start --watch",
    "start:prod": "node dist/main",
    "build": "nest build",
    "lint": "eslint \"{src,apps,libs,test}/**/*.ts\" --fix",
    "typecheck": "tsc --noEmit",
    "test": "jest",
    "test:watch": "jest --watch",
    "test:cov": "jest --coverage",
    "test:ci": "jest --ci --coverage --forceExit",
    "test:e2e": "jest --config ./test/jest-e2e.json",
    "swagger:generate": "npx openapi-generator-cli generate -i http://localhost:3000/api-json -g typescript-axios -o ./generated/api-client"
  }
}
```

The naming is intentional — `docker:up` not `start-docker`, `db:migrate` not `run-migrations`. Colons group related commands so `npm run docker:<tab>` auto-completes all Docker commands.

### Dockerfile — Multi-Stage Production Build

```dockerfile
# Build stage
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Production stage
FROM node:20-alpine
WORKDIR /app
RUN addgroup -S app && adduser -S app -G app
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./
COPY --from=builder /app/prisma ./prisma
USER app
EXPOSE 3000
CMD ["npm", "run", "start:prod"]
```

Key details: the build stage includes devDependencies (needed for `nest build`), the production stage only copies what's needed to run. The `prisma` directory is copied so migrations can run in CI. The non-root `app` user prevents container escape attacks.

### CI/CD — GCP Cloud Build

The CI pipeline follows this sequence: **build → push → test (with ephemeral test DB) → migrate → deploy**. See `references/project-structure.md` for the complete `cloudbuild.yaml` template.

The critical design decisions:
1. **Tests run against the built Docker image**, not raw source. This catches Dockerfile issues and ensures what you test is what you deploy
2. **Test database spins up as a sidecar** via `docker-compose.ci.yml` — a minimal compose file with just the test Postgres. It's destroyed after tests complete
3. **Private secrets come from GCP Secret Manager** via `secretEnv` and `--set-secrets`. They never appear in the build config file or logs
4. **Public config vars are set directly** in the cloudbuild.yaml `--update-env-vars` — these are safe to version control
5. **Migrations run AFTER tests pass** but BEFORE deploy. If migrations fail, the deploy is blocked
6. **The deploy step uses `--set-secrets`** to mount secrets from Secret Manager into the Cloud Run service at runtime

### NestJS Auth Guard with Supabase JWT

Authentication is handled by Supabase Auth (GoTrue) for token issuance, and NestJS guards for token validation on every request:

```typescript
// common/guards/supabase-auth.guard.ts
@Injectable()
export class SupabaseAuthGuard implements CanActivate {
  constructor(
    private readonly configService: ConfigService,
    private readonly logger: AppLoggerService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const token = this.extractToken(request);

    if (!token) {
      throw new UnauthorizedException('Missing authorization token');
    }

    try {
      const payload = await this.verifySupabaseJwt(token);
      request.user = payload;
      return true;
    } catch (error) {
      this.logger.warn('JWT verification failed', {
        error: error.message,
        requestId: request.headers['x-request-id'],
      });
      throw new UnauthorizedException('Invalid or expired token');
    }
  }

  private extractToken(request: Request): string | null {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : null;
  }

  private async verifySupabaseJwt(token: string): Promise<JwtPayload> {
    const secret = this.configService.get<string>('SUPABASE_JWT_SECRET');
    return verify(token, secret, { algorithms: ['HS256'] }) as JwtPayload;
  }
}
```

Apply it globally or per-controller with `@UseGuards(SupabaseAuthGuard)`. Public endpoints use a `@Public()` decorator to skip the guard.

## Output Checklist

Before presenting any code to the user, mentally verify:

## Verification Step — Does It Actually Work and Serve the Goal?

After writing code, don't just confirm it compiles. Run a multi-layer verification to ensure the code genuinely serves the product's purpose. This is the difference between code that passes a linter and code that delivers value.

### The Verification Sequence

1. **Tests pass.** Run the test suite. If any test fails, fix it before moving on. For TDD code, all the tests you wrote first should now be green

2. **It compiles and lints clean.** Run `tsc --noEmit` and `eslint .`. Zero errors, zero warnings. If the linter flags something, fix it — don't suppress it

3. **It does what the user asked.** Re-read the original request. Does the code actually solve the stated problem? It's easy to get lost in clean architecture and forget the feature. Walk through the user's scenario end-to-end mentally (or with a trace):
   - If it's an API endpoint: what happens when the frontend calls it? Does the response include everything the client needs?
   - If it's a component: does it render correctly with real data? Edge cases (empty state, loading, error)?
   - If it's a refactor: does it preserve existing behavior? Did any implicit contracts break?

4. **It fits the product goal.** Check PRODUCT.md. Does this code move the product forward, or is it a tangential nice-to-have? Is it scoped correctly — not overbuilt for what's needed now, but extensible for what's coming? Code that's technically perfect but misaligned with the product roadmap is wasted effort

5. **No dead code.** Scan what you wrote for unused imports, unreachable branches, commented-out blocks, or speculative "might need this later" code. If it's not serving the current feature, remove it. YAGNI (You Ain't Gonna Need It) — dead code is worse than missing code because it confuses the next person

6. **Swagger docs are accurate.** Hit `/api/docs` mentally — does the Swagger output match the actual request/response shapes? Are all status codes documented? Would a frontend developer be able to integrate using only the Swagger page?

7. **Logs tell the story.** If this code runs in production and something goes wrong, will the logs give an operator enough context to diagnose the issue without reading the source? Check that critical paths log at the right level with the right context

### Optimization Check

Beyond correctness, verify the code is efficient:
- **No unnecessary database calls** — are you fetching data you already have? Making N+1 queries?
- **No redundant computations** — are you recalculating something that could be cached or computed once?
- **No over-fetching** — are you selecting all columns when you only need three? Loading full objects for a count?
- **No premature abstraction** — did you create three layers of indirection for something that gets called once? Simplify

**Architecture & Specs:**
- [ ] Checked for PRODUCT.md and followed its mandatory standards
- [ ] Code placed in the correct NestJS module per its SPEC.md
- [ ] New modules have a SPEC.md written before code
- [ ] Module follows NestJS pattern: module → controller → service → repository

**Type Safety & Code Quality:**
- [ ] TypeScript strict mode compatible
- [ ] No `any` types (use `unknown` + type guards if needed)
- [ ] All functions have explicit return types
- [ ] No duplicate logic — common patterns extracted to helpers in `shared/utils/` or module `helpers/`
- [ ] Functions under 30 lines; helper functions used for complex logic
- [ ] File and variable naming follows conventions

**Swagger & API:**
- [ ] Every endpoint has `@ApiOperation`, `@ApiResponse`, and `@ApiTags` decorators
- [ ] DTOs use `@ApiProperty` decorators for full Swagger schema generation
- [ ] Response shapes are consistent (data, error, pagination wrappers)

**TDD:**
- [ ] Tests written before (or alongside) implementation
- [ ] Service tests mock repositories and external dependencies with `jest.Mocked<T>`
- [ ] Controller integration tests verify full request-response cycle
- [ ] Test factories used for data — no hardcoded IDs or values

**Security:**
- [ ] Error handling uses NestJS exceptions and global `ExceptionFilter`
- [ ] Inputs validated with `class-validator` decorators on DTOs + `ValidationPipe`
- [ ] Secrets in env vars, not hardcoded
- [ ] No `console.log` — structured `AppLoggerService` with Pino for JSON output
- [ ] Logger redacts sensitive fields (tokens, passwords, API keys)
- [ ] SQL uses parameterized queries or ORM
- [ ] API endpoints have auth guards and rate limiting
- [ ] The right design pattern is applied if the problem warrants one

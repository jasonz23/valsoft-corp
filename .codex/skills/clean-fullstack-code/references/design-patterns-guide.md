# Design Patterns Guide

A practical reference for selecting and applying the right design pattern. Based on the 22 classic patterns from Refactoring.Guru, adapted for JavaScript/TypeScript full-stack development.

## Table of Contents

1. [Creational Patterns](#creational-patterns) — Object creation mechanisms
2. [Structural Patterns](#structural-patterns) — Assembling objects into larger structures
3. [Behavioral Patterns](#behavioral-patterns) — Communication between objects

## How to Use This Guide

Before generating code, identify your problem category, scan the "When to use" sections, and pick the pattern that fits. Don't force a pattern — if none match, simple procedural code is fine.

---

## Creational Patterns

These control how objects are created — increasing flexibility and reducing tight coupling to specific classes.

### Factory Method

**Problem it solves:** You need to create objects but don't know the exact type until runtime.

**When to use:**
- The exact type depends on configuration or user input
- You want library consumers to extend creation logic via subclasses
- You want to reuse existing objects from a pool instead of creating new ones

**JS/TS example scenario:** A notification service that creates EmailNotification, PushNotification, or SMSNotification based on user preferences.

```typescript
// The factory method pattern
interface Notification {
  send(message: string): Promise<void>;
}

abstract class NotificationFactory {
  abstract createNotification(channel: string): Notification;

  async notify(channel: string, message: string): Promise<void> {
    const notification = this.createNotification(channel);
    await notification.send(message);
  }
}
```

**Trade-offs:** Decouples creation from usage (good), but adds class hierarchy (keep it justified).

**Full reference:** https://refactoring.guru/design-patterns/factory-method

---

### Abstract Factory

**Problem it solves:** You need to create families of related objects that must work together.

**When to use:**
- Multiple product families (e.g., themed UI kits: light/dark buttons, inputs, modals)
- Products from one family must be used together — mixing is a bug
- You want to hide implementation details from consumers

**JS/TS example scenario:** A component library that produces consistent themed components — you pick "material" or "custom" and get a matching set.

**Trade-offs:** Ensures consistency across product families, but adding new product types requires changing every factory.

**Full reference:** https://refactoring.guru/design-patterns/abstract-factory

---

### Builder

**Problem it solves:** Complex objects with many optional parameters become unreadable with constructors.

**When to use:**
- Objects have 5+ configuration options, many optional
- The construction process has logical steps or validation between steps
- You need different representations of the same object

**JS/TS example scenario:** Building a complex database query, an email template, or an API request with many optional headers/params.

```typescript
class QueryBuilder {
  private query: QueryConfig = { table: '', conditions: [], orderBy: [], limit: undefined };

  from(table: string): this { this.query.table = table; return this; }
  where(condition: string, value: unknown): this { this.query.conditions.push({ condition, value }); return this; }
  orderBy(field: string, direction: 'asc' | 'desc' = 'asc'): this { this.query.orderBy.push({ field, direction }); return this; }
  limit(count: number): this { this.query.limit = count; return this; }
  build(): QueryConfig { if (!this.query.table) throw new Error('Table is required'); return { ...this.query }; }
}
```

**Trade-offs:** Very readable construction code, but overkill for simple objects.

**Full reference:** https://refactoring.guru/design-patterns/builder

---

### Prototype

**Problem it solves:** Creating objects by copying existing ones is cheaper than constructing from scratch.

**When to use:**
- Objects are expensive to initialize (heavy DB lookups, complex defaults)
- You need many variations of a base configuration
- You want runtime cloning without knowing the exact class

**JS/TS implementation note:** JavaScript has built-in prototype support. Use `structuredClone()` for deep copies or spread operators for shallow copies. For class instances, implement a `clone()` method.

**Trade-offs:** Fast creation of variants, but deep vs shallow copy bugs are common. Always be explicit about which you're doing.

**Full reference:** https://refactoring.guru/design-patterns/prototype

---

### Singleton

**Problem it solves:** Exactly one instance of a class should exist globally.

**When to use:**
- Database connection pool
- Configuration manager
- Logger instance
- Cache layer

**JS/TS implementation note:** In Node.js, module-level instances are effectively singletons because of the module cache. Prefer module exports over class-based singletons.

```typescript
// Preferred in Node.js — module-level singleton
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
export default pool;

// If you need lazy initialization
let instance: ConfigManager | null = null;
export function getConfig(): ConfigManager {
  if (!instance) instance = new ConfigManager();
  return instance;
}
```

**Trade-offs:** Simple global access, but introduces global state that's hard to test. Use dependency injection when testing matters (it usually does).

**Full reference:** https://refactoring.guru/design-patterns/singleton

---

## Structural Patterns

These define how to compose objects and classes into larger, flexible structures.

### Adapter

**Problem it solves:** You need to use a class whose interface doesn't match what your code expects.

**When to use:**
- Wrapping third-party SDKs (Stripe, Twilio, AWS) behind your own interface
- Integrating legacy code with new systems
- Unifying multiple services behind a common contract

```typescript
// Your clean interface
interface PaymentGateway {
  charge(amount: number, currency: string, token: string): Promise<PaymentResult>;
}

// Adapter wraps the messy third-party SDK
class StripeAdapter implements PaymentGateway {
  constructor(private stripe: Stripe) {}

  async charge(amount: number, currency: string, token: string): Promise<PaymentResult> {
    const result = await this.stripe.charges.create({ amount: amount * 100, currency, source: token });
    return { id: result.id, status: result.status === 'succeeded' ? 'success' : 'failed' };
  }
}
```

**Trade-offs:** Isolates external dependencies perfectly. The indirection is almost always worth it.

**Full reference:** https://refactoring.guru/design-patterns/adapter

---

### Bridge

**Problem it solves:** A class has multiple orthogonal dimensions that would cause a class explosion if combined via inheritance.

**When to use:**
- Platform-specific implementations (web vs mobile) with shared abstractions
- Rendering engines with different output targets
- Separating API clients from transport layers

**Trade-offs:** Strong separation of concerns, but initial complexity is higher. Worth it when dimensions genuinely vary independently.

**Full reference:** https://refactoring.guru/design-patterns/bridge

---

### Composite

**Problem it solves:** You need to treat individual objects and groups of objects uniformly.

**When to use:**
- File/folder tree structures
- UI component hierarchies (menus with submenus)
- Organization charts
- Permission trees

**Trade-offs:** Simplifies client code enormously. Can make the design overly general if applied where a simple list would do.

**Full reference:** https://refactoring.guru/design-patterns/composite

---

### Decorator

**Problem it solves:** You need to add behavior to objects dynamically without modifying their class.

**When to use:**
- Adding logging, caching, or retry logic to services
- Composing middleware in Express/Fastify
- Extending React components with HOCs or hooks (the hook is the modern decorator)

```typescript
// Service decorator pattern
class CachedUserService implements UserService {
  constructor(private inner: UserService, private cache: Cache) {}

  async findById(id: string): Promise<User> {
    const cached = await this.cache.get(`user:${id}`);
    if (cached) return cached;
    const user = await this.inner.findById(id);
    await this.cache.set(`user:${id}`, user, { ttl: 300 });
    return user;
  }
}
```

**Trade-offs:** Incredibly flexible composition. Can lead to many small wrapper classes — keep the decorator chain short and obvious.

**Full reference:** https://refactoring.guru/design-patterns/decorator

---

### Facade

**Problem it solves:** A complex subsystem needs a simple interface for most consumers.

**When to use:**
- Simplifying a multi-step process (order processing, user onboarding)
- Wrapping a complex library with a simple API
- Creating a service layer over multiple repositories

**Trade-offs:** Reduces coupling beautifully. Risk: the facade becomes a "god object" if it grows unchecked — split it if it handles more than one domain.

**Full reference:** https://refactoring.guru/design-patterns/facade

---

### Flyweight

**Problem it solves:** Massive numbers of similar objects eat all your memory.

**When to use:**
- Rendering thousands of map markers with shared icon data
- Game entities sharing sprite/texture data
- Document editors with character formatting

**JS/TS note:** Less common in web apps, but relevant in canvas/WebGL rendering and React Native list optimization.

**Trade-offs:** Huge memory savings when applicable. Increases code complexity and requires careful management of shared vs unique state.

**Full reference:** https://refactoring.guru/design-patterns/flyweight

---

### Proxy

**Problem it solves:** You need to control access to an object — lazily load it, cache it, log access, or restrict it.

**When to use:**
- Lazy loading heavy resources (images, large datasets)
- Access control (check permissions before delegating)
- Logging and monitoring (wrap API clients to log every call)
- Caching (return cached result if available)

**JS/TS note:** JavaScript's `Proxy` object is a built-in language feature for this pattern. Use it for reactive state, validation proxies, and API mocking.

**Trade-offs:** Transparent to consumers (good). Slight performance overhead per access.

**Full reference:** https://refactoring.guru/design-patterns/proxy

---

## Behavioral Patterns

These manage communication and responsibility distribution between objects.

### Chain of Responsibility

**Problem it solves:** Multiple handlers should process a request, each deciding whether to handle it or pass it along.

**When to use:**
- Middleware pipelines (Express, Fastify)
- Request validation chains (auth → rate limit → input validation → handler)
- Event processing with multiple potential handlers

**JS/TS note:** Express middleware IS this pattern. Every `app.use()` adds a link in the chain.

**Trade-offs:** Very flexible, easy to add/remove handlers. Risk: request goes unhandled if no handler matches — always have a fallback.

**Full reference:** https://refactoring.guru/design-patterns/chain-of-responsibility

---

### Command

**Problem it solves:** You need to parameterize, queue, log, or undo operations.

**When to use:**
- Undo/redo functionality
- Job queues (background task processing)
- Macro recording
- Decoupling UI actions from business logic

**Trade-offs:** Enables undo/redo and queuing elegantly. Adds a class per command — worth it for complex operation management.

**Full reference:** https://refactoring.guru/design-patterns/command

---

### Iterator

**Problem it solves:** Traversing a collection without exposing its internal structure.

**When to use:**
- Custom data structures with multiple traversal strategies
- Paginated API results (lazy iteration)

**JS/TS note:** JavaScript has built-in iterators via `Symbol.iterator` and generators (`function*`). Use these instead of rolling custom iterator classes.

**Full reference:** https://refactoring.guru/design-patterns/iterator

---

### Mediator

**Problem it solves:** Many objects communicate chaotically — the mediator centralizes their interaction.

**When to use:**
- Complex form interactions where fields depend on each other
- Chat room / event bus architectures
- UI components that need to coordinate without knowing about each other

**Trade-offs:** Dramatically reduces coupling between components. Risk: mediator becomes a monolith — keep it focused on coordination, not logic.

**Full reference:** https://refactoring.guru/design-patterns/mediator

---

### Memento

**Problem it solves:** Save and restore object state without breaking encapsulation.

**When to use:**
- Undo/redo with full state snapshots
- Form draft autosave
- Game save states

**JS/TS note:** `structuredClone()` or `JSON.parse(JSON.stringify(...))` for simple state snapshots. For complex objects, implement a deliberate snapshot method.

**Trade-offs:** Clean encapsulation of state history. High memory usage if states are large — consider storing diffs instead.

**Full reference:** https://refactoring.guru/design-patterns/memento

---

### Observer

**Problem it solves:** One object changes and many others need to know about it.

**When to use:**
- Event systems (user signs up → send email, create profile, log analytics)
- Real-time updates (WebSocket message → update multiple UI components)
- State management (Redux, Zustand, MobX are all Observer implementations)

```typescript
// Simple typed event emitter
type EventMap = {
  'user:created': { userId: string; email: string };
  'order:completed': { orderId: string; total: number };
};

class TypedEventEmitter {
  private listeners = new Map<string, Set<Function>>();

  on<K extends keyof EventMap>(event: K, handler: (data: EventMap[K]) => void): void {
    if (!this.listeners.has(event)) this.listeners.set(event, new Set());
    this.listeners.get(event)!.add(handler);
  }

  emit<K extends keyof EventMap>(event: K, data: EventMap[K]): void {
    this.listeners.get(event)?.forEach(handler => handler(data));
  }
}
```

**Trade-offs:** Excellent decoupling. Risk: forgotten subscriptions cause memory leaks — always unsubscribe in cleanup.

**Full reference:** https://refactoring.guru/design-patterns/observer

---

### State

**Problem it solves:** An object's behavior changes based on its internal state, and you have sprawling if/switch statements managing it.

**When to use:**
- Order lifecycle (pending → paid → shipped → delivered)
- UI wizards with step-dependent behavior
- Connection managers (disconnected → connecting → connected → error)

**Trade-offs:** Eliminates messy state conditionals. Adds a class per state — worth it when states have distinct behavior.

**Full reference:** https://refactoring.guru/design-patterns/state

---

### Strategy

**Problem it solves:** You have multiple algorithms that do the same thing differently, and you need to swap between them.

**When to use:**
- Multiple payment providers (Stripe, PayPal, crypto)
- Different sorting/filtering algorithms
- Authentication strategies (JWT, session, API key)
- Notification channels (email, SMS, push)

```typescript
// Strategy via dependency injection
interface AuthStrategy {
  authenticate(request: Request): Promise<AuthResult>;
}

class JwtStrategy implements AuthStrategy { /* ... */ }
class ApiKeyStrategy implements AuthStrategy { /* ... */ }

class AuthService {
  constructor(private strategy: AuthStrategy) {}

  async authenticate(request: Request): Promise<AuthResult> {
    return this.strategy.authenticate(request);
  }
}
```

**Trade-offs:** Runtime algorithm swapping is powerful. Client code needs to know which strategies exist — consider combining with Factory.

**Full reference:** https://refactoring.guru/design-patterns/strategy

---

### Template Method

**Problem it solves:** Several classes share the same algorithm structure but differ in specific steps.

**When to use:**
- Data import pipelines (parse → validate → transform → save) with different sources
- Report generators with different formats but the same structure
- Test fixtures with common setup/teardown

**JS/TS note:** In TypeScript, abstract classes work well here. In more functional styles, pass step functions as arguments instead.

**Trade-offs:** Great code reuse for algorithmic skeletons. Subclasses are tightly coupled to the template — if the algorithm changes, all subclasses feel it.

**Full reference:** https://refactoring.guru/design-patterns/template-method

---

### Visitor

**Problem it solves:** You need to add new operations to a structure without modifying its classes.

**When to use:**
- AST processing (linters, formatters, transpilers)
- Exporting data in multiple formats (JSON, XML, CSV) from the same object graph
- Applying operations to complex object hierarchies

**Trade-offs:** Easy to add new operations, hard to add new element types. Best when the element hierarchy is stable.

**Full reference:** https://refactoring.guru/design-patterns/visitor

---

## Quick Decision Matrix

When choosing a pattern, start with the problem:

| Problem | First pattern to consider |
|---------|--------------------------|
| "I need to create objects without knowing the exact type" | Factory Method |
| "I need families of related objects" | Abstract Factory |
| "This constructor has too many parameters" | Builder |
| "I need to clone complex objects" | Prototype |
| "There must be exactly one instance" | Singleton |
| "This third-party API doesn't match my interface" | Adapter |
| "This class has too many responsibilities" | Bridge or Facade |
| "I need to treat items and groups the same way" | Composite |
| "I need to add behavior without modifying the class" | Decorator |
| "This subsystem is too complex for consumers" | Facade |
| "Too many similar objects are using too much memory" | Flyweight |
| "I need lazy loading / access control / caching" | Proxy |
| "Multiple handlers should process this request" | Chain of Responsibility |
| "I need undo/redo or queued operations" | Command |
| "I need to traverse a complex collection" | Iterator |
| "Too many objects are talking to each other" | Mediator |
| "I need state snapshots" | Memento |
| "One change should notify many objects" | Observer |
| "Behavior changes based on state" | State |
| "I need to swap algorithms at runtime" | Strategy |
| "Classes share an algorithm but differ in steps" | Template Method |
| "I need to add operations without changing classes" | Visitor |

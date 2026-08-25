# ApexHR Developer Documentation

> **Version:** 1.0 — Phase 1 MVP | **Status:** In Development | **Last Updated:** February 2026

ApexHR is a multi-tenant SaaS HRMS built for SMBs (50–1,000 employees). This document covers **Phase 1** of the MVP, which includes:

- Multi-tenant Authentication
- Employee & Department CRUD
- Leave Type Configuration

---

## Table of Contents

1. [Getting Started](#1-getting-started)
2. [Architecture Overview](#2-architecture-overview)
3. [Authentication & RBAC](#3-authentication--rbac)
4. [Database Schema](#4-database-schema)
5. [API Reference](#5-api-reference)
6. [Key Modules](#6-key-modules)
7. [Multi-Tenancy Strategy](#7-multi-tenancy-strategy)
8. [Deployment](#8-deployment)

---

## 1. Getting Started

### 1.1 Prerequisites

| Tool    | Version      | Purpose                          |
| ------- | ------------ | -------------------------------- |
| Node.js | >= 20.x      | Runtime for frontend and backend |
| MariaDB | >= 10.11 LTS | Primary relational database      |
| Redis   | >= 7.x       | Session management and caching   |
| pnpm    | Latest       | Package management               |

### 1.2 Repository Structure

```
apexhr/
├── apps/
│   ├── web/                  # Next.js 15 frontend (App Router)
│   └── api/                  # NestJS backend (Modular Monolith)
│       └── src/
│           ├── auth/         # Auth module (Phase 1)
│           ├── tenants/      # Tenant management module (Phase 1)
│           ├── employees/    # Employee CRUD module (Phase 1)
│           ├── departments/  # Department CRUD module (Phase 1)
│           ├── leave-types/  # Leave type config module (Phase 1)
│           └── common/       # Guards, interceptors, shared utilities
├── packages/
│   └── shared/               # Shared TypeScript types and DTOs
├── docker-compose.yml
└── .env.example
```

### 1.3 Environment Variables

Copy `.env.example` to `.env` and fill in all values before running the app:

```bash
cp .env.example .env
```

**Backend (`apps/api/.env`)**

```env
# Application
NODE_ENV=development
PORT=3001

# MariaDB
DB_HOST=localhost
DB_PORT=3306
DB_NAME=apexhr
DB_USER=apexhr_user
DB_PASSWORD=your_password

# Redis (Sessions)
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=

# Auth
JWT_SECRET=your_jwt_secret_min_32_chars
JWT_EXPIRES_IN=7d

# Encryption
ENCRYPTION_KEY=your_aes_256_key_32_chars
```

**Frontend (`apps/web/.env.local`)**

```env
NEXT_PUBLIC_API_URL=https://apex-hr-gray.vercel.app/
```

### 1.4 Running Locally

**1. Start infrastructure with Docker:**

```bash
docker-compose up -d   # starts MariaDB and Redis
```

**2. Install dependencies:**

```bash
pnpm install
```

**3. Run database migrations:**

```bash
cd apps/api
pnpm migration:run
```

**4. Seed initial data (optional):**

```bash
pnpm seed
```

**5. Start both apps:**

```bash
# From root
pnpm dev
# Frontend: http://localhost:3000
# Backend:  http://localhost:3001
```

---

## 2. Architecture Overview

### 2.1 System Diagram (Phase 1)

```
┌─────────────────────────────────────────────┐
│              Client (Browser)               │
│         Next.js 15 — App Router             │
│       Tailwind CSS + shadcn/ui              │
└──────────────────────┬──────────────────────┘
                       │ HTTPS / REST
┌──────────────────────▼──────────────────────┐
│           NestJS API (Port 3001)            │
│          Modular Monolith                   │
│                                             │
│  [Auth] [Tenants] [Employees]               │
│  [Departments] [Leave Types]                │
│                                             │
│  TenantInterceptor (injects tenant_id       │
│  into every request context)                │
└──────────┬──────────────────┬───────────────┘
           │                  │
┌──────────▼──────┐  ┌────────▼────────┐
│    MariaDB      │  │     Redis        │
│  (Primary DB)   │  │ (Session Cache)  │
└─────────────────┘  └─────────────────┘
```

### 2.2 Modular Monolith Design

The backend is a **NestJS Modular Monolith** — all modules live in a single deployable service, but are structured to be extracted into microservices in future phases without major refactoring.

**Phase 1 Modules:**

| Module              | Responsibility                            |
| ------------------- | ----------------------------------------- |
| `AuthModule`        | JWT login, registration, session handling |
| `TenantsModule`     | Tenant provisioning, subdomain resolution |
| `EmployeesModule`   | Employee CRUD, profile management         |
| `DepartmentsModule` | Department hierarchy (parent-child)       |
| `LeaveTypesModule`  | Leave policy configuration per tenant     |
| `CommonModule`      | Global guards, interceptors, utilities    |

---

## 3. Authentication & RBAC

### 3.1 Authentication Flow

ApexHR uses **JWT-based authentication** with Redis-backed session invalidation.

```
1. POST /auth/login  →  Validates credentials
2. Server issues signed JWT (contains: userId, tenantId, role)
3. Client stores JWT (httpOnly cookie recommended)
4. Every request passes through JwtAuthGuard
5. TenantInterceptor extracts tenantId from JWT and injects into request context
6. RolesGuard checks role against required permission for the route
```

### 3.2 Roles & Permissions

There are five roles in ApexHR. Phase 1 establishes the full RBAC foundation even though not all permissions are exercised until later phases.

| Role           | Description                           | Phase 1 Permissions                      |
| -------------- | ------------------------------------- | ---------------------------------------- |
| `EMPLOYEE`     | Standard staff member                 | View own profile, view own department    |
| `COMMENTER`    | Team Lead — adds context to requests  | All Employee permissions                 |
| `APPROVER`     | Dept Head — approves/rejects requests | All Commenter permissions                |
| `HR_ADMIN`     | Full HR access across the tenant      | Employee & Dept CRUD, Leave Type config  |
| `TENANT_ADMIN` | Superuser for the tenant              | All HR_ADMIN permissions + tenant config |

> **Note:** `COMMENTER` and `APPROVER` roles are configured in Phase 1 but their workflow-specific actions are activated in Phase 2.

### 3.3 Implementing Guards

Use the `@Roles()` decorator with `RolesGuard` to protect any route:

```typescript
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '../common/enums/role.enum';

@Controller('employees')
@UseGuards(JwtAuthGuard, RolesGuard)
export class EmployeesController {

  @Get()
  @Roles(Role.HR_ADMIN, Role.TENANT_ADMIN)
  findAll() { ... }

  @Get(':id')
  @Roles(Role.EMPLOYEE, Role.HR_ADMIN, Role.TENANT_ADMIN)
  findOne(@Param('id') id: string) { ... }
}
```

### 3.4 Auth Endpoints

| Method | Endpoint                | Description                            | Access        |
| ------ | ----------------------- | -------------------------------------- | ------------- |
| `POST` | `/auth/register-tenant` | Provision a new tenant + admin account | Public        |
| `POST` | `/auth/login`           | Authenticate and receive JWT           | Public        |
| `POST` | `/auth/logout`          | Invalidate session in Redis            | Authenticated |
| `GET`  | `/auth/me`              | Get current user profile               | Authenticated |

---

## 4. Database Schema

> MariaDB does **not** support Row Level Security (RLS). Multi-tenancy is enforced at the **application layer** — every query is scoped by `tenant_id`. See [Section 7: Multi-Tenancy Strategy](#7-multi-tenancy-strategy) for details.

### 4.1 Schema Diagram (Phase 1)

```
tenants
  └── employees  (tenant_id FK)
  └── departments (tenant_id FK)
        └── employees (department_id FK)
  └── leave_types (tenant_id FK)
```

### 4.2 Table Definitions

#### `tenants`

Represents a single company/organization using ApexHR.

```sql
CREATE TABLE tenants (
  id            CHAR(36)      NOT NULL DEFAULT (UUID()),
  name          VARCHAR(255)  NOT NULL,
  subdomain     VARCHAR(100)  NOT NULL UNIQUE,
  is_active     BOOLEAN       NOT NULL DEFAULT TRUE,
  created_at    DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at    DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id)
);
```

| Column      | Type           | Notes                                                |
| ----------- | -------------- | ---------------------------------------------------- |
| `id`        | `CHAR(36)`     | UUID primary key                                     |
| `name`      | `VARCHAR(255)` | Company display name                                 |
| `subdomain` | `VARCHAR(100)` | Unique subdomain (e.g. `acme` for `acme.apexhr.com`) |
| `is_active` | `BOOLEAN`      | Soft disable without deletion                        |

---

#### `employees`

Core employee profile. Every employee belongs to exactly one tenant.

```sql
CREATE TABLE employees (
  id                CHAR(36)      NOT NULL DEFAULT (UUID()),
  tenant_id         CHAR(36)      NOT NULL,
  department_id     CHAR(36)      NULL,
  first_name        VARCHAR(100)  NOT NULL,
  last_name         VARCHAR(100)  NOT NULL,
  email             VARCHAR(255)  NOT NULL,
  password_hash     VARCHAR(255)  NOT NULL,
  role              ENUM('EMPLOYEE','COMMENTER','APPROVER','HR_ADMIN','TENANT_ADMIN') NOT NULL DEFAULT 'EMPLOYEE',
  phone             VARCHAR(30)   NULL,
  date_of_birth     DATE          NULL,
  hire_date         DATE          NULL,
  job_title         VARCHAR(150)  NULL,
  is_active         BOOLEAN       NOT NULL DEFAULT TRUE,
  created_at        DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at        DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_employee_email_tenant (email, tenant_id),
  CONSTRAINT fk_employee_tenant     FOREIGN KEY (tenant_id)     REFERENCES tenants(id)     ON DELETE CASCADE,
  CONSTRAINT fk_employee_department FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE SET NULL
);
```

| Column          | Notes                                                   |
| --------------- | ------------------------------------------------------- |
| `email`         | Unique per tenant — same email can exist across tenants |
| `password_hash` | Bcrypt hash; never store plaintext                      |
| `role`          | Drives RBAC throughout the system                       |
| `department_id` | Nullable — employee may not yet be assigned to a dept   |

---

#### `departments`

Supports parent-child hierarchy for nested org structures.

```sql
CREATE TABLE departments (
  id            CHAR(36)      NOT NULL DEFAULT (UUID()),
  tenant_id     CHAR(36)      NOT NULL,
  parent_id     CHAR(36)      NULL,
  name          VARCHAR(150)  NOT NULL,
  description   TEXT          NULL,
  created_at    DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at    DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_dept_name_tenant (name, tenant_id),
  CONSTRAINT fk_dept_tenant  FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE,
  CONSTRAINT fk_dept_parent  FOREIGN KEY (parent_id) REFERENCES departments(id) ON DELETE SET NULL
);
```

| Column      | Notes                                            |
| ----------- | ------------------------------------------------ |
| `parent_id` | Self-referencing FK — null means root department |

---

#### `leave_types`

Configurable leave policies per tenant (Annual, Sick, Unpaid, Custom).

```sql
CREATE TABLE leave_types (
  id                    CHAR(36)       NOT NULL DEFAULT (UUID()),
  tenant_id             CHAR(36)       NOT NULL,
  name                  VARCHAR(100)   NOT NULL,
  description           TEXT           NULL,
  accrual_type          ENUM('FIXED','ACCRUAL','UNLIMITED') NOT NULL DEFAULT 'FIXED',
  days_per_year         DECIMAL(5,2)   NULL,
  accrual_frequency     ENUM('MONTHLY','QUARTERLY','ANNUALLY') NULL,
  carry_over_allowed    BOOLEAN        NOT NULL DEFAULT FALSE,
  carry_over_max_days   DECIMAL(5,2)   NULL,
  requires_approval     BOOLEAN        NOT NULL DEFAULT TRUE,
  is_paid               BOOLEAN        NOT NULL DEFAULT TRUE,
  is_active             BOOLEAN        NOT NULL DEFAULT TRUE,
  created_at            DATETIME       NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at            DATETIME       NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_leave_type_name_tenant (name, tenant_id),
  CONSTRAINT fk_leave_type_tenant FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE
);
```

| Column                | Notes                                                                  |
| --------------------- | ---------------------------------------------------------------------- |
| `accrual_type`        | `FIXED` = lump sum, `ACCRUAL` = earned over time, `UNLIMITED` = no cap |
| `days_per_year`       | Used for `FIXED` and `ACCRUAL` types                                   |
| `accrual_frequency`   | Required when `accrual_type = ACCRUAL`                                 |
| `carry_over_max_days` | Null = unlimited carry-over (if `carry_over_allowed = true`)           |

---

#### `emergency_contacts`

Optional emergency contacts attached to an employee profile.

```sql
CREATE TABLE emergency_contacts (
  id            CHAR(36)     NOT NULL DEFAULT (UUID()),
  employee_id   CHAR(36)     NOT NULL,
  tenant_id     CHAR(36)     NOT NULL,
  name          VARCHAR(150) NOT NULL,
  relationship  VARCHAR(80)  NULL,
  phone         VARCHAR(30)  NOT NULL,
  email         VARCHAR(255) NULL,
  created_at    DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  CONSTRAINT fk_ec_employee FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE,
  CONSTRAINT fk_ec_tenant   FOREIGN KEY (tenant_id)   REFERENCES tenants(id)   ON DELETE CASCADE
);
```

---

## 5. API Reference

All endpoints are prefixed with `/api/v1`. All authenticated endpoints require:

```
Authorization: Bearer <jwt_token>
```

Responses follow this envelope format:

```json
{
  "success": true,
  "data": {},
  "message": "Optional message",
  "meta": { "page": 1, "limit": 20, "total": 150 }
}
```

Error responses:

```json
{
  "success": false,
  "error": {
    "code": "EMPLOYEE_NOT_FOUND",
    "message": "No employee found with the given ID",
    "statusCode": 404
  }
}
```

---

### 5.1 Auth

#### `POST /api/v1/auth/register-tenant`

Provisions a new tenant and creates the first `TENANT_ADMIN` account.

**Request Body:**

```json
{
  "companyName": "Acme Corp",
  "subdomain": "acme",
  "adminFirstName": "Jane",
  "adminLastName": "Doe",
  "adminEmail": "jane@acmecorp.com",
  "adminPassword": "SecureP@ss123"
}
```

**Response `201`:**

```json
{
  "success": true,
  "data": {
    "tenant": { "id": "uuid", "name": "Acme Corp", "subdomain": "acme" },
    "employee": {
      "id": "uuid",
      "email": "jane@acmecorp.com",
      "role": "TENANT_ADMIN"
    }
  }
}
```

---

#### `POST /api/v1/auth/login`

**Request Body:**

```json
{
  "email": "jane@acmecorp.com",
  "password": "SecureP@ss123",
  "subdomain": "acme"
}
```

> The `subdomain` field identifies which tenant to authenticate against.

**Response `200`:**

```json
{
  "success": true,
  "data": {
    "accessToken": "eyJhbGci...",
    "employee": {
      "id": "uuid",
      "firstName": "Jane",
      "lastName": "Doe",
      "role": "TENANT_ADMIN"
    }
  }
}
```

---

#### `GET /api/v1/auth/me`

Returns the authenticated user's profile. Requires valid JWT.

**Response `200`:**

```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "firstName": "Jane",
    "lastName": "Doe",
    "email": "jane@acmecorp.com",
    "role": "TENANT_ADMIN",
    "department": { "id": "uuid", "name": "Human Resources" }
  }
}
```

---

### 5.2 Employees

| Method   | Endpoint                | Description                    | Required Role                        |
| -------- | ----------------------- | ------------------------------ | ------------------------------------ |
| `GET`    | `/api/v1/employees`     | List all employees (paginated) | `HR_ADMIN`, `TENANT_ADMIN`           |
| `GET`    | `/api/v1/employees/:id` | Get single employee            | `EMPLOYEE`+ (own), `HR_ADMIN`+ (any) |
| `POST`   | `/api/v1/employees`     | Create a new employee          | `HR_ADMIN`, `TENANT_ADMIN`           |
| `PATCH`  | `/api/v1/employees/:id` | Update employee fields         | `HR_ADMIN`, `TENANT_ADMIN`           |
| `DELETE` | `/api/v1/employees/:id` | Soft-delete employee           | `TENANT_ADMIN`                       |

#### `POST /api/v1/employees`

**Request Body:**

```json
{
  "firstName": "John",
  "lastName": "Smith",
  "email": "john.smith@acmecorp.com",
  "password": "TempP@ss123",
  "role": "EMPLOYEE",
  "jobTitle": "Software Engineer",
  "departmentId": "uuid",
  "hireDate": "2026-03-01",
  "phone": "+233201234567"
}
```

**Response `201`:**

```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "firstName": "John",
    "lastName": "Smith",
    "email": "john.smith@acmecorp.com",
    "role": "EMPLOYEE",
    "jobTitle": "Software Engineer",
    "isActive": true,
    "createdAt": "2026-02-15T10:30:00Z"
  }
}
```

#### `GET /api/v1/employees` — Query Parameters

| Param          | Type      | Description                              |
| -------------- | --------- | ---------------------------------------- |
| `page`         | `number`  | Page number (default: 1)                 |
| `limit`        | `number`  | Results per page (default: 20, max: 100) |
| `departmentId` | `string`  | Filter by department                     |
| `role`         | `string`  | Filter by role                           |
| `isActive`     | `boolean` | Filter active/inactive (default: true)   |
| `search`       | `string`  | Search by name or email                  |

---

### 5.3 Departments

| Method   | Endpoint                  | Description                 | Required Role              |
| -------- | ------------------------- | --------------------------- | -------------------------- |
| `GET`    | `/api/v1/departments`     | List all departments (tree) | `EMPLOYEE`+                |
| `GET`    | `/api/v1/departments/:id` | Get department with members | `EMPLOYEE`+                |
| `POST`   | `/api/v1/departments`     | Create department           | `HR_ADMIN`, `TENANT_ADMIN` |
| `PATCH`  | `/api/v1/departments/:id` | Update department           | `HR_ADMIN`, `TENANT_ADMIN` |
| `DELETE` | `/api/v1/departments/:id` | Delete department           | `TENANT_ADMIN`             |

#### `POST /api/v1/departments`

**Request Body:**

```json
{
  "name": "Engineering",
  "description": "Product and platform engineering",
  "parentId": null
}
```

> Set `parentId` to a valid department UUID to create a nested (child) department.

**Response `201`:**

```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "name": "Engineering",
    "description": "Product and platform engineering",
    "parentId": null,
    "createdAt": "2026-02-15T10:30:00Z"
  }
}
```

#### `GET /api/v1/departments` — Response Structure

Returns departments as a nested tree:

```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "name": "Engineering",
      "children": [
        { "id": "uuid", "name": "Frontend", "children": [] },
        { "id": "uuid", "name": "Backend", "children": [] }
      ]
    }
  ]
}
```

---

### 5.4 Leave Types

| Method   | Endpoint                  | Description           | Required Role              |
| -------- | ------------------------- | --------------------- | -------------------------- |
| `GET`    | `/api/v1/leave-types`     | List all leave types  | `EMPLOYEE`+                |
| `GET`    | `/api/v1/leave-types/:id` | Get single leave type | `EMPLOYEE`+                |
| `POST`   | `/api/v1/leave-types`     | Create leave type     | `HR_ADMIN`, `TENANT_ADMIN` |
| `PATCH`  | `/api/v1/leave-types/:id` | Update leave type     | `HR_ADMIN`, `TENANT_ADMIN` |
| `DELETE` | `/api/v1/leave-types/:id` | Deactivate leave type | `TENANT_ADMIN`             |

#### `POST /api/v1/leave-types`

**Request Body — Fixed (Annual Leave):**

```json
{
  "name": "Annual Leave",
  "description": "Standard yearly leave entitlement",
  "accrualType": "FIXED",
  "daysPerYear": 21,
  "carryOverAllowed": true,
  "carryOverMaxDays": 5,
  "requiresApproval": true,
  "isPaid": true
}
```

**Request Body — Accrual-based:**

```json
{
  "name": "Sick Leave",
  "accrualType": "ACCRUAL",
  "daysPerYear": 12,
  "accrualFrequency": "MONTHLY",
  "carryOverAllowed": false,
  "requiresApproval": false,
  "isPaid": true
}
```

**Response `201`:**

```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "name": "Annual Leave",
    "accrualType": "FIXED",
    "daysPerYear": 21,
    "carryOverAllowed": true,
    "carryOverMaxDays": 5,
    "isActive": true
  }
}
```

---

### 5.5 Common Error Codes

| Code                   | HTTP Status | Meaning                                 |
| ---------------------- | ----------- | --------------------------------------- |
| `UNAUTHORIZED`         | 401         | Missing or invalid JWT                  |
| `FORBIDDEN`            | 403         | Valid JWT but insufficient role         |
| `TENANT_NOT_FOUND`     | 404         | Subdomain does not match any tenant     |
| `EMPLOYEE_NOT_FOUND`   | 404         | Employee ID not found within tenant     |
| `DEPARTMENT_NOT_FOUND` | 404         | Department not found within tenant      |
| `LEAVE_TYPE_NOT_FOUND` | 404         | Leave type not found within tenant      |
| `DUPLICATE_EMAIL`      | 409         | Email already registered in this tenant |
| `DUPLICATE_SUBDOMAIN`  | 409         | Subdomain already taken                 |
| `VALIDATION_ERROR`     | 422         | Request body failed DTO validation      |

---

## 6. Key Modules

### 6.1 Auth Module

**Responsibilities:** Tenant-aware login, JWT issuance, session management in Redis.

**Key files:**

```
apps/api/src/auth/
├── auth.module.ts
├── auth.controller.ts
├── auth.service.ts
├── strategies/
│   └── jwt.strategy.ts        # Extracts + validates JWT payload
└── guards/
    ├── jwt-auth.guard.ts      # Protects authenticated routes
    └── roles.guard.ts         # Enforces role-based access
```

**JWT Payload structure:**

```typescript
interface JwtPayload {
  sub: string; // employee.id
  tenantId: string; // tenant.id
  role: Role; // employee.role
  iat: number;
  exp: number;
}
```

**Session invalidation:**
When a user logs out, their JWT `sub` is added to a Redis blocklist with a TTL matching the token's remaining lifetime. `JwtAuthGuard` checks this blocklist on every request.

---

### 6.2 Employees Module

**Responsibilities:** Full CRUD for employee profiles, emergency contacts, and document metadata.

**Key files:**

```
apps/api/src/employees/
├── employees.module.ts
├── employees.controller.ts
├── employees.service.ts
├── dto/
│   ├── create-employee.dto.ts
│   └── update-employee.dto.ts
└── entities/
    └── employee.entity.ts
```

**Soft Delete:**
Employees are never hard-deleted. The `DELETE` endpoint sets `is_active = false`. This preserves historical data integrity for future leave request and audit records in later phases.

---

### 6.3 Departments Module

**Responsibilities:** Department CRUD and parent-child hierarchy management.

**Key consideration — Circular reference prevention:**
When updating a department's `parentId`, the service must validate that the new parent is not a descendant of the department being updated. Use a recursive query to walk the tree before committing the update:

```typescript
async isDescendant(ancestorId: string, candidateId: string, tenantId: string): Promise<boolean> {
  // Recursively fetch children of ancestorId and check if candidateId appears
}
```

---

### 6.4 Leave Types Module

**Responsibilities:** Tenant-scoped leave policy configuration. This module lays the data foundation for the Phase 2 accrual and approval engine.

**Accrual Logic (Phase 1 — Config only):**

Phase 1 stores the accrual configuration. The calculation engine that reads this config and computes employee balances is implemented in Phase 2. The fields to configure per type are:

| `accrualType` | Required Fields                   |
| ------------- | --------------------------------- |
| `FIXED`       | `daysPerYear`                     |
| `ACCRUAL`     | `daysPerYear`, `accrualFrequency` |
| `UNLIMITED`   | None — no balance tracking needed |

---

## 7. Multi-Tenancy Strategy

MariaDB does not support Row Level Security (RLS). Tenant isolation in ApexHR is enforced at the **NestJS application layer** using a `TenantInterceptor`.

### 7.1 How It Works

1. **Tenant resolution:** On every request, `TenantInterceptor` reads the `tenantId` from the decoded JWT and attaches it to the request context.
2. **Service layer enforcement:** Every service method that touches the database receives `tenantId` and appends it to all queries.
3. **No cross-tenant query is ever executed without an explicit `tenant_id` filter.**

```typescript
// TenantInterceptor — apps/api/src/common/interceptors/tenant.interceptor.ts
@Injectable()
export class TenantInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const user = request.user; // Set by JwtAuthGuard
    request.tenantId = user.tenantId;
    return next.handle();
  }
}
```

```typescript
// Example enforced query in EmployeesService
async findOne(id: string, tenantId: string): Promise<Employee> {
  const employee = await this.employeesRepository.findOne({
    where: { id, tenantId, isActive: true }
  });
  if (!employee) throw new NotFoundException('EMPLOYEE_NOT_FOUND');
  return employee;
}
```

### 7.2 Testing Tenant Isolation

Every service that queries the database must have an automated test that verifies a record from Tenant A is **not accessible** from Tenant B, even with a valid JWT.

```typescript
it("should not return an employee from a different tenant", async () => {
  const result = await employeesService.findOne(tenantAEmployee.id, tenantB.id);
  expect(result).toBeNull();
});
```

---

## 8. Deployment

### 8.1 Docker Compose (Local / Staging)

```yaml
version: "3.9"
services:
  db:
    image: mariadb:10.11
    environment:
      MYSQL_ROOT_PASSWORD: root_password
      MYSQL_DATABASE: apexhr
      MYSQL_USER: apexhr_user
      MYSQL_PASSWORD: your_password
    ports:
      - "3306:3306"
    volumes:
      - mariadb_data:/var/lib/mysql

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"

volumes:
  mariadb_data:
```

### 8.2 Security Checklist (Phase 1)

- [ ] All passwords stored as `bcrypt` hashes (min rounds: 12)
- [ ] JWT secret is at least 32 characters and stored in environment variables — never in code
- [ ] TLS 1.3 enforced on all API traffic in production
- [ ] All employee PII fields encrypted at rest using AES-256
- [ ] Redis password set in production
- [ ] Database user `apexhr_user` has only `SELECT, INSERT, UPDATE, DELETE` privileges — no `DROP` or `ALTER`
- [ ] `tenant_id` filter present in every database query (verified by tests)
- [ ] HTTP-only, Secure, SameSite cookies used for JWT storage on the client

### 8.3 Phase 1 MVP Scope Summary

| Feature                                     | Status     |
| ------------------------------------------- | ---------- |
| Multi-tenant auth (register, login, logout) | ✅ Phase 1 |
| JWT + Redis session management              | ✅ Phase 1 |
| RBAC (5 roles, guards, decorators)          | ✅ Phase 1 |
| Employee CRUD + emergency contacts          | ✅ Phase 1 |
| Department hierarchy (parent-child)         | ✅ Phase 1 |
| Leave Type configuration                    | ✅ Phase 1 |
| Leave Request & Approval Workflow           | 🔜 Phase 2 |
| Balance tracking & accrual engine           | 🔜 Phase 2 |
| Conflict detection                          | 🔜 Phase 2 |
| Notifications (in-app + email)              | 🔜 Phase 3 |
| Reporting dashboards                        | 🔜 Phase 3 |

---

_For questions about this documentation, contact the ApexHR engineering team._

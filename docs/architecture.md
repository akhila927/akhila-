# System Architecture & Design
## Project Task Management System (PTMS)

---

## 1. Overview

The Project Task Management System is a scoped ServiceNow application designed to manage project-level task assignments between two user types: Project Managers and Team Members. The architecture follows ServiceNow's recommended patterns for scoped applications.

---

## 2. Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│              ServiceNow Platform (Washington DC)                 │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │         Scoped Application: x_ptms                        │   │
│  │                                                           │   │
│  │  ┌─────────────┐   ┌──────────────┐   ┌──────────────┐  │   │
│  │  │   UI Layer  │   │  Logic Layer │   │  Data Layer  │  │   │
│  │  │             │   │              │   │              │  │   │
│  │  │ • Form Views│   │ • Bus. Rules │   │ • x_ptms_    │  │   │
│  │  │ • List Views│   │ • Client     │   │   project_   │  │   │
│  │  │ • Dashboard │   │   Scripts    │   │   task table │  │   │
│  │  │ • Reports   │   │ • Script     │   │              │  │   │
│  │  │ • Nav Menus │   │   Includes   │   │ (extends     │  │   │
│  │  └─────────────┘   │ • ACLs       │   │  task table) │  │   │
│  │                    └──────────────┘   └──────────────┘  │   │
│  │                                                           │   │
│  │  ┌──────────────────┐   ┌───────────────────────────┐   │   │
│  │  │ Automation Layer │   │    Notification Layer      │   │   │
│  │  │                  │   │                            │   │   │
│  │  │ Flow Designer:   │   │ • Task Assigned Email      │   │   │
│  │  │  • On Create     │──▶│ • Task Completed Email     │   │   │
│  │  │  • On Complete   │   │ • Task Overdue Email       │   │   │
│  │  │  • Daily Sched   │   │                            │   │   │
│  │  └──────────────────┘   └───────────────────────────┘   │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                  │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │               Security Layer (Cross-Cutting)             │    │
│  │  ACL Rules → sys_security_acl table                      │    │
│  │  Roles     → sys_user_role + sys_user_has_role tables    │    │
│  └─────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────┘
```

---

## 3. Data Model

### 3.1 Table Inheritance

```
task (platform base table)
 └── x_ptms_project_task (our custom table)
      Inherits: number, short_description, description,
                assigned_to, state, priority, work_notes,
                sys_created_by, sys_created_on
      Adds:     project_name, due_date
```

### 3.2 Entity Relationship Diagram

```
sys_user ────────────────────────────────────────────────┐
   │                                                      │
   │ (assigned_to reference)                              │
   │                                                      ▼
   │                                          x_ptms_project_task
   │                                          ┌─────────────────┐
   │                                          │ number (PK)     │
   │                                          │ project_name    │
   │                                          │ short_desc      │
   │                                          │ description     │
   │                                          │ assigned_to ────┘
   │                                          │ state           │
   │                                          │ priority        │
   │                                          │ due_date        │
   │                                          │ work_notes      │
   │                                          │ sys_created_by  │
   │                                          │ sys_created_on  │
   │                                          └─────────────────┘

sys_user_role
   ├── x_ptms.project_manager
   └── x_ptms.team_member

sys_user_has_role (junction table)
   ├── Alice → x_ptms.project_manager
   └── Bob   → x_ptms.team_member
```

---

## 4. Security Architecture

### 4.1 ACL Evaluation Chain

```
User Request (Read/Write/Create/Delete)
         │
         ▼
   Is user admin?  ─── YES ──▶ Access Granted
         │
        NO
         ▼
  Field-level ACL check
  (most specific — table.field)
         │
         ▼
  Record-level ACL check
  (table-level, with condition scripts)
         │
         ▼
  Role check
  (does user have the required role?)
         │
     YES │  NO
         │   └──▶ Access Denied (403)
         ▼
  Condition Script (if present)
  e.g., current.assigned_to == gs.getUserID()
         │
    TRUE │  FALSE
         │   └──▶ Access Denied
         ▼
  Access Granted ✅
```

### 4.2 Security Matrix (Full)

| Operation | Field | Project Manager | Team Member |
|---|---|---|---|
| READ | All fields | ✅ All records | ✅ Own tasks only |
| CREATE | All fields | ✅ | ❌ |
| WRITE | project_name | ✅ | ❌ Read-only |
| WRITE | short_description | ✅ | ❌ Read-only |
| WRITE | description | ✅ | ❌ Read-only |
| WRITE | assigned_to | ✅ | ❌ Read-only |
| WRITE | state (Status) | ✅ | ✅ Own tasks |
| WRITE | priority | ✅ | ❌ Read-only |
| WRITE | due_date | ✅ | ❌ Read-only |
| WRITE | work_notes | ✅ | ✅ Own tasks |
| DELETE | — | ✅ | ❌ |

---

## 5. Flow Designer Architecture

### 5.1 Flow 1: Task Assignment Notification

```
[Trigger: Record Created → x_ptms_project_task]
         │
         ▼
[Step 1: Look Up Assigned User]
  GlideRecord query: sys_user where sys_id = task.assigned_to
         │
         ▼
[Step 2: Send Notification]
  Notification: x_ptms_task_assigned
  To: assigned_user.email
```

### 5.2 Flow 2: Task Completion Notification

```
[Trigger: Record Updated → state changes_to 4]
         │
         ▼
[Step 1: Get All Project Managers]
  Query: sys_user_has_role where role.name = x_ptms.project_manager
         │
         ▼
[Step 2: Send Notification]
  Notification: x_ptms_task_completed
  To: all project manager emails (comma-separated)
```

### 5.3 Flow 3: Daily Overdue Check

```
[Trigger: Scheduled — 0 8 * * * (daily 08:00 AM)]
         │
         ▼
[Step 1: Find Overdue Tasks]
  Query: due_date < today AND state != 4
         │
         ▼
[Step 2: For Each Task (loop)]
         │
         ▼
[Step 2a: Send Overdue Notification]
  To: task.assigned_to.email
```

---

## 6. Application Module Structure

```
Application Navigator
└── Project Tasks (x_ptms application)
    ├── All Tasks          [Project Manager only]
    │     Filter: active=true
    │     View: Default (all fields visible)
    │
    ├── My Tasks           [Team Member only]
    │     Filter: assigned_to = current user
    │     View: team_member_view (restricted)
    │
    ├── Dashboard          [Project Manager only]
    │     Link: PA Dashboard → PTMS Overview
    │
    └── Reports            [Project Manager only]
          Link: sys_report filtered to x_ptms scope
```

---

## 7. Technology Decisions

| Decision | Choice | Rationale |
|---|---|---|
| App Architecture | Scoped Application | Isolates code, prevents collisions, enables portability |
| Table Base | Extends `task` | Inherits platform fields, reduces development effort |
| Automation | Flow Designer | Modern replacement for legacy Workflow; supported long-term |
| Security | ACL (server-side) | Cannot be bypassed by client-side code; authoritative |
| Reporting | PA Indicators | Real-time data; integrates natively with dashboards |
| Notifications | sysevent_email_action | Built-in platform support; HTML + text fallback |
| Scripts | Script Include class | Reusable, testable, and scope-safe |

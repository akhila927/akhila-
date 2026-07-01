# Project Task Management System
## Final Year Academic Project Report

---

| Field | Details |
|---|---|
| **Project Title** | Project Task Management System using ServiceNow |
| **Platform** | ServiceNow (Washington DC Release) |
| **Application Scope** | x_ptms |
| **Document Type** | Final Year Project Report |
| **Date** | July 2026 |
| **Version** | 1.0.0 |

---

## Table of Contents

1. [Abstract](#1-abstract)
2. [Introduction](#2-introduction)
3. [Objectives](#3-objectives)
4. [System Requirements](#4-system-requirements)
5. [Technology Overview — ServiceNow](#5-technology-overview--servicenow)
6. [Application Design](#6-application-design)
7. [Implementation Details](#7-implementation-details)
8. [Access Control & Security](#8-access-control--security)
9. [Automation with Flow Designer](#9-automation-with-flow-designer)
10. [Notifications](#10-notifications)
11. [Dashboard & Analytics](#11-dashboard--analytics)
12. [Reporting](#12-reporting)
13. [Testing & Verification](#13-testing--verification)
14. [ServiceNow Best Practices Applied](#14-servicenow-best-practices-applied)
15. [Challenges & Solutions](#15-challenges--solutions)
16. [Conclusion](#16-conclusion)
17. [References](#17-references)
18. [Appendix](#18-appendix)

---

## 1. Abstract

This report documents the design, implementation, testing, and deployment of the **Project Task Management System (PTMS)** — a fully-featured, role-based task management application built on the **ServiceNow** enterprise IT Service Management (ITSM) platform.

The application enables two types of users — **Project Managers** and **Team Members** — to create, track, and manage project tasks with differentiated access permissions enforced at the platform level using **Access Control Lists (ACLs)**. The system leverages **Flow Designer** for automated notifications, **Performance Analytics** for real-time dashboards, and **scoped application architecture** to ensure security and portability.

The PTMS demonstrates core enterprise application development principles including role-based access control (RBAC), event-driven automation, structured data modelling, and no-code/low-code platform development.

---

## 2. Introduction

### 2.1 Background

Modern organisations rely on structured task management systems to coordinate work, track progress, and ensure accountability across teams. While general-purpose tools (like Jira, Trello, or Asana) exist, enterprises that already operate ServiceNow as their ITSM platform benefit significantly from building custom task management applications natively — enabling deep integration with existing workflows, user directories, notification systems, and reporting infrastructure.

### 2.2 Problem Statement

A software development team faces the following challenges:
- No centralised system for tracking project-level tasks
- Project Managers cannot easily see task status across the team
- Team Members lack a structured way to receive assignments and report progress
- No automated notifications when tasks are created, completed, or overdue
- Inconsistent security — all users see all data regardless of their role

### 2.3 Proposed Solution

The **Project Task Management System** addresses these gaps by:
- Providing a **custom ServiceNow table** (`x_ptms_project_task`) as the data model
- Implementing **role-based access control** with custom scoped roles
- Enforcing **granular field-level ACLs** to restrict what each role can view and modify
- Automating **email notifications** via Flow Designer for task assignment, completion, and overdue alerts
- Providing **dashboard and reports** for managerial visibility

---

## 3. Objectives

### 3.1 Primary Objectives

| # | Objective | Met? |
|---|---|---|
| O1 | Create a scoped ServiceNow application (x_ptms) | ✅ |
| O2 | Design a custom "Project Tasks" table extending the platform task table | ✅ |
| O3 | Implement two custom roles: Project Manager and Team Member | ✅ |
| O4 | Create two test users (Alice — PM, Bob — TM) with role assignments | ✅ |
| O5 | Configure ACLs for CRUD permissions per role | ✅ |
| O6 | Create a Flow Designer flow for task assignment notification | ✅ |
| O7 | Create a Flow Designer flow for task completion notification | ✅ |
| O8 | Create a scheduled flow for daily overdue task notifications | ✅ |
| O9 | Define three HTML email notification templates | ✅ |
| O10 | Configure form and list views per role | ✅ |
| O11 | Build a dashboard with 5 KPI widgets | ✅ |
| O12 | Create 4 analytical reports | ✅ |
| O13 | Test all functionality with both users | ✅ |
| O14 | Follow ServiceNow development best practices throughout | ✅ |

### 3.2 Secondary Objectives

- Document all configuration with inline comments
- Provide a step-by-step deployment guide
- Produce update set XML files for one-click deployment
- Deliver an academic-quality project report

---

## 4. System Requirements

### 4.1 Functional Requirements

| ID | Requirement |
|---|---|
| FR-01 | The system shall allow Project Managers to Create, Read, Update, and Delete all project task records |
| FR-02 | The system shall restrict Team Members to reading only tasks assigned to them |
| FR-03 | The system shall allow Team Members to update only the Status and Work Notes fields |
| FR-04 | The system shall prevent Team Members from creating or deleting tasks |
| FR-05 | The system shall automatically send an email notification when a task is created and assigned |
| FR-06 | The system shall automatically notify Project Managers when a task status changes to Completed |
| FR-07 | The system shall send daily overdue notifications for past-due incomplete tasks |
| FR-08 | The system shall provide a dashboard showing task KPIs in real-time |
| FR-09 | The system shall provide four analytical reports |
| FR-10 | The system shall enforce data validation (e.g., due date cannot be in the past) |
| FR-11 | The system shall log all status changes to Work Notes automatically |

### 4.2 Non-Functional Requirements

| ID | Requirement |
|---|---|
| NFR-01 | Security: All access controls must be enforced server-side (ACLs) and cannot be bypassed via client-side manipulation |
| NFR-02 | Portability: The application must be exportable as update set XML files |
| NFR-03 | Isolation: All artefacts must use the `x_ptms` scope prefix to prevent conflicts |
| NFR-04 | Auditability: All field changes must be tracked in the platform's audit history |
| NFR-05 | Maintainability: All scripts must include inline documentation and comments |
| NFR-06 | Usability: Forms must provide clear visual feedback for mandatory fields and errors |

### 4.3 Technical Requirements

- ServiceNow instance (Washington DC or later)
- Flow Designer plugin: `com.glide.hub.flow_engine`
- Performance Analytics plugin: `com.snc.pa.dashboard`
- Outbound email configured (SMTP)

---

## 5. Technology Overview — ServiceNow

### 5.1 What is ServiceNow?

ServiceNow is a cloud-based enterprise platform that provides IT Service Management (ITSM), IT Operations Management (ITOM), and custom application development capabilities. It is used by thousands of organisations worldwide as their central system of record for IT operations.

The platform features:
- **A relational database** (tables, fields, relationships)
- **A scripting engine** (GlideScript — a Java-based JavaScript dialect)
- **A UI framework** (forms, list views, dashboards)
- **An automation engine** (Flow Designer, Business Rules, Workflows)
- **A security framework** (ACLs, Roles, Groups)
- **A notification engine** (email, SMS, push)

### 5.2 Why ServiceNow for This Project?

| Feature | ServiceNow Capability |
|---|---|
| Custom tables | sys_db_object — create custom tables with any fields |
| Role-based access | sys_user_role + ACL framework |
| Automation | Flow Designer — visual, no-code workflow builder |
| Notifications | sysevent_email_action with HTML templates |
| Dashboards | Performance Analytics (PA) module |
| Reports | sys_report with multiple chart types |
| Portability | Update Sets — XML snapshots of all configuration |

### 5.3 Scoped Application Architecture

A **scoped application** in ServiceNow is a self-contained package with its own namespace (scope prefix). Benefits include:

- **Isolation**: `x_ptms.` prefix prevents naming conflicts with other apps
- **Security**: Cross-scope access must be explicitly granted
- **Portability**: Can be exported as an update set or published to the ServiceNow Store
- **Governance**: Changes are tracked and controlled per-scope

---

## 6. Application Design

### 6.1 Data Model

The application is built around one primary table:

**Table**: `x_ptms_project_task`
**Extends**: `task` (platform base table)

By extending the `task` table, we inherit 7+ fields for free without additional configuration:

| Field | Type | Source | Description |
|---|---|---|---|
| number | Auto Number | Inherited | Unique task ID (e.g., PTMS0001001) |
| short_description | String | Inherited | Task Name |
| description | HTML | Inherited | Detailed description |
| assigned_to | Reference → sys_user | Inherited | Assigned Team Member |
| state | Integer (Choice) | Inherited | Status dropdown |
| priority | Integer (Choice) | Inherited | Priority dropdown |
| work_notes | Journal | Inherited | Append-only activity notes |
| sys_created_by | String | Platform | Auto-set on create |
| sys_created_on | DateTime | Platform | Auto-set on create |
| project_name | String | **Custom** | Which project this task belongs to |
| due_date | Date | **Custom** | Task deadline |

### 6.2 Status Values

| Value | Label | Meaning |
|---|---|---|
| 1 | New | Task created, not started |
| 2 | In Progress | Actively being worked on |
| 3 | On Hold | Blocked, awaiting resolution |
| 4 | Completed | Finished and verified |

### 6.3 Priority Values

| Value | Label | Urgency |
|---|---|---|
| 1 | High | Requires immediate attention |
| 2 | Medium | Standard priority |
| 3 | Low | Non-urgent |

### 6.4 User and Role Design

```
Users:
  alice.johnson → x_ptms.project_manager (Full CRUD)
  bob.smith     → x_ptms.team_member (Restricted)

Role Definitions (sys_user_role):
  x_ptms.project_manager
    └── Can Create, Read, Update, Delete all tasks
    └── Access: All Tasks, Dashboard, Reports modules

  x_ptms.team_member
    └── Can Read own tasks (where assigned_to = self)
    └── Can Write: state, work_notes (own tasks only)
    └── Access: My Tasks module only
```

---

## 7. Implementation Details

### 7.1 Update Set Structure

The application is implemented as 10 ordered update sets:

| # | Update Set | Contents |
|---|---|---|
| 01 | Application Scope | sys_scope, navigation modules |
| 02 | Table & Fields | x_ptms_project_task, field definitions, choice lists |
| 03 | Roles | x_ptms.project_manager, x_ptms.team_member |
| 04 | Users | alice.johnson, bob.smith + role assignments |
| 05 | ACLs | 14 ACL records (table + field level) |
| 06 | Flow Designer | 3 flows (assignment, completion, overdue) |
| 07 | Notifications | 3 HTML email templates |
| 08 | UI Views | Form sections, list columns, 2 views |
| 09 | Dashboard | PA indicators + widgets |
| 10 | Reports | 4 analytical reports |

### 7.2 Business Rules

Five server-side Business Rules enforce data integrity:

| Rule | Trigger | Purpose |
|---|---|---|
| BR-01: Prevent Past Due Date | Before Insert/Update | Blocks saving a past due date |
| BR-02: Auto-Set Created By | Before Insert | Logs creator display name |
| BR-03: Status Transitions | Before Update | Prevents illogical state changes |
| BR-04: Log Status Changes | Before Update | Auto-appends status change to Work Notes |
| BR-05: Completion Timestamp | Before Update | Records `closed_at` when completed |

### 7.3 Client Scripts

Five client-side scripts enhance form interactivity:

| Script | Type | Purpose |
|---|---|---|
| CS-01: Role Read-Only | onLoad | Makes fields read-only for Team Members |
| CS-02: Due Date Warning | onChange | Yellow/red warning for upcoming/past dates |
| CS-03: Priority Color | onChange | Colours the priority label based on value |
| CS-04: Confirm Complete | onSubmit | Confirmation dialog before completing a task |
| CS-05: Mandatory Highlight | onLoad | Blue border on mandatory fields for new tasks |

### 7.4 Script Include: PTMSUtils

A reusable server-side utility class (`PTMSUtils`) provides:
- `getOverdueTasks()` — GlideRecord of all overdue tasks
- `getTasksByStatus(state)` — count of tasks by state
- `getTasksForUser(userID)` — tasks for a specific user
- `isProjectManager(userID)` / `isTeamMember(userID)` — role checks
- `getAllProjectManagers()` — array of PM email addresses
- `getDashboardStats()` — JSON object of all KPIs
- `formatTaskSummary(taskGR)` — human-readable task summary string

---

## 8. Access Control & Security

### 8.1 ACL Framework

ServiceNow's ACL framework evaluates access at three levels:

1. **Table Level** — Can this role access records on this table? (CREATE, READ, WRITE, DELETE)
2. **Record Level** — Condition scripts further restrict to specific rows
3. **Field Level** — Can this role read/write this specific field?

ACLs are evaluated in this order (most specific to least), and the **first matching ACL** determines access.

### 8.2 Implemented ACLs

| ACL ID | Operation | Type | Role | Condition |
|---|---|---|---|---|
| ACL-01 | READ | Table | project_manager | None (all records) |
| ACL-02 | READ | Table | team_member | `assigned_to == current user` |
| ACL-03 | CREATE | Table | project_manager | None |
| ACL-04 | WRITE | Table | project_manager | None |
| ACL-05 | WRITE | Table | team_member | `assigned_to == current user` |
| ACL-06 | DELETE | Table | project_manager | None |
| ACL-07 | WRITE | Field: state | team_member | `assigned_to == current user` |
| ACL-08 | WRITE | Field: work_notes | team_member | `assigned_to == current user` |
| ACL-09 | WRITE | Field: project_name | team_member | Deny (returns false) |
| ACL-10 | WRITE | Field: short_description | team_member | Deny |
| ACL-11 | WRITE | Field: description | team_member | Deny |
| ACL-12 | WRITE | Field: assigned_to | team_member | Deny |
| ACL-13 | WRITE | Field: priority | team_member | Deny |
| ACL-14 | WRITE | Field: due_date | team_member | Deny |

### 8.3 Security Layering Principle

The application implements defence-in-depth with three security layers:

```
Layer 1 (UI)   : Client Scripts hide/disable fields for Team Members
                 → Can be bypassed by a determined user
                 → NOT the authoritative security gate

Layer 2 (ACLs) : Server-side ACL scripts enforce per-record, per-field access
                 → Cannot be bypassed by client-side manipulation
                 → Authoritative security enforcement

Layer 3 (BR)   : Business Rules add additional validation
                 → Status transition rules, data integrity
```

> **Key Principle**: Even if a Team Member bypasses the UI layer (e.g., using a direct API call or developer tools), the server-side ACLs will still deny access. Security is never dependent on the UI alone.

---

## 9. Automation with Flow Designer

### 9.1 Why Flow Designer?

Flow Designer is ServiceNow's modern, declarative automation tool that replaced legacy Workflows. Benefits:
- Visual drag-and-drop interface
- Native integration with ServiceNow tables and notifications
- Better error handling and execution logging
- Actively maintained by ServiceNow (Workflows are deprecated)

### 9.2 Flow 1: Task Assignment Notification

**Trigger**: Record Created on `x_ptms_project_task`

**Logic**:
1. Look up the assigned user's sys_user record
2. Retrieve their email address
3. Send the `x_ptms_task_assigned` notification

**Business Value**: Ensures that Team Members are immediately aware of new task assignments without relying on manual communication.

### 9.3 Flow 2: Task Completion Notification

**Trigger**: Record Updated where `state` changes to `4` (Completed)

**Logic**:
1. Query all users with the Project Manager role
2. Send the `x_ptms_task_completed` notification to all PMs

**Business Value**: Project Managers receive automatic notification when their team completes tasks, enabling real-time progress tracking without polling the system.

### 9.4 Flow 3: Daily Overdue Check (Scheduled)

**Trigger**: Cron schedule — `0 8 * * *` (daily at 08:00 AM)

**Logic**:
1. Query all tasks where `due_date < today AND state != 4`
2. For each overdue task, send the `x_ptms_task_overdue` notification to the assigned user

**Business Value**: Proactive escalation mechanism that alerts Team Members of missed deadlines before Project Managers need to manually follow up.

---

## 10. Notifications

### 10.1 Notification Architecture

ServiceNow notifications (stored in `sysevent_email_action`) support:
- **HTML email body** with platform template variables (`${task.field_name}`)
- **Plain text fallback** for email clients without HTML rendering
- **Dynamic recipient** support — recipients can be data-driven
- **Outbound email logs** for delivery tracking and debugging

### 10.2 Notification 1: Task Assigned

| Property | Value |
|---|---|
| Internal Name | `x_ptms_task_assigned` |
| Subject | `[PTMS] New Task Assigned: {Task Name} ({Task Number})` |
| To | Assigned Team Member's email |
| Trigger | Flow Designer (record create event) |
| Content | Task number, name, project, description, priority, status, due date, view link |
| Design | Blue gradient header, structured field cards, CTA button |

### 10.3 Notification 2: Task Completed

| Property | Value |
|---|---|
| Internal Name | `x_ptms_task_completed` |
| Subject | `[PTMS] ✅ Task Completed: {Task Name} ({Number})` |
| To | All Project Managers |
| Trigger | Flow Designer (state changes to Completed) |
| Design | Green gradient header, completion badge |

### 10.4 Notification 3: Task Overdue

| Property | Value |
|---|---|
| Internal Name | `x_ptms_task_overdue` |
| Subject | `[PTMS] ⚠️ OVERDUE: {Task Name} — Immediate Attention Required` |
| To | Assigned Team Member |
| Trigger | Daily scheduled Flow (08:00 AM) |
| Design | Red gradient header, warning alert box, update CTA |

---

## 11. Dashboard & Analytics

### 11.1 Dashboard: PTMS Overview

The dashboard (`PTMS Overview Dashboard`) is built using ServiceNow's **Performance Analytics (PA)** module, which collects and aggregates data from the custom table.

**PA Architecture**:
```
x_ptms_project_task records
         │
         ▼
PA Indicator (aggregation query)
  → COUNT, grouped by filter
         │
         ▼
PA Score (computed result stored)
         │
         ▼
PA Widget (visual card on dashboard)
```

### 11.2 Dashboard Widgets

| Widget | Color | Metric | Query |
|---|---|---|---|
| Total Tasks | Blue | COUNT all | No filter |
| Open Tasks | Amber | COUNT new | state = 1 |
| In Progress | Sky Blue | COUNT in progress | state = 2 |
| Completed | Green | COUNT completed | state = 4 |
| High Priority | Red | COUNT high priority | priority = 1 |

---

## 12. Reporting

### 12.1 Report 1: Tasks by Status (Pie Chart)

Groups all task records by their Status value and renders a pie chart with percentage labels. Useful for an at-a-glance health check of the project.

### 12.2 Report 2: Tasks by Priority (Bar Chart)

Horizontal bar chart grouping tasks by priority level. Enables identification of whether the project backlog is weighted towards high or low priority work.

### 12.3 Report 3: Tasks by Assigned User (Bar Chart)

Bar chart grouping tasks by assigned team member. Critical for workload balancing — Project Managers can see if one person has disproportionately more tasks.

### 12.4 Report 4: Overdue Tasks (List Report)

Tabular list filtered to tasks where `due_date < today AND state != 4`. Sorted by oldest due date first. Used for escalation and follow-up actions.

---

## 13. Testing & Verification

### 13.1 Test Strategy

The application was tested using a structured black-box testing approach with 33 test cases across 7 categories:

| Category | Tests | Purpose |
|---|---|---|
| User & Role Setup | 4 | Verify users, roles, and navigator visibility |
| CRUD — Alice (PM) | 6 | Verify full Create, Read, Update, Delete |
| ACL — Bob (TM) | 8 | Verify access restrictions enforced correctly |
| Flow Designer | 3 | Verify automation fires correctly |
| Notifications | 3 | Verify email content and delivery |
| Dashboard | 5 | Verify KPI widget accuracy |
| Reports | 4 | Verify report data correctness |

### 13.2 Test Results Summary

All 33 test cases passed with no defects found.

Key verified behaviours:
- **ACL Bypass Attempt (TC-12)**: Bob was unable to access another user's task even via direct URL (`/x_ptms_project_task.do?sys_id=...`), confirming server-side ACL enforcement
- **Business Rule (TC-10)**: Attempting to save a task with a past due date correctly aborted the save and displayed an error message
- **Flow Trigger (TC-20)**: Changing Bob's task status to "Completed" triggered the completion flow within seconds and delivered Alice's notification email

### 13.3 Test Coverage

```
Feature Coverage:
  ✅ All 14 ACL rules tested
  ✅ All 3 Flow Designer flows tested
  ✅ All 3 notification templates tested
  ✅ All 5 Business Rules tested
  ✅ All 5 dashboard widgets verified
  ✅ All 4 reports verified
  ✅ Both user roles tested exhaustively
```

---

## 14. ServiceNow Best Practices Applied

The PTMS application adheres to the following ServiceNow development best practices:

| Practice | Implementation |
|---|---|
| **Scoped Application** | All artefacts use `x_ptms` prefix. No global scope pollution. |
| **Extend task table** | Inherits platform fields, number auto-numbering, work notes journal |
| **Custom scoped roles** | `x_ptms.project_manager` and `x_ptms.team_member` — not re-using admin/itil |
| **Server-side ACLs** | All access control enforced via `sys_security_acl` — cannot be bypassed |
| **Field-level ACLs** | Granular field restriction for Team Member role |
| **Flow Designer** | Used instead of deprecated legacy Workflows |
| **Script Include** | Reusable `PTMSUtils` class — no duplicate code across scripts |
| **Inline documentation** | Every script and XML element has descriptive comments |
| **Update Sets** | All configuration captured in ordered XML update sets |
| **Avoid hard-coding** | sys_ids used as references; no string literals for table names in scripts |
| **Audit trail** | `is_audited=true` on table; status changes auto-logged to Work Notes |
| **Defence in depth** | UI layer (client scripts) + Server layer (ACLs) + Logic layer (BRs) |

---

## 15. Challenges & Solutions

### Challenge 1: Field-Level ACL for Team Members

**Problem**: Granting Team Members table-level WRITE access (for status and work notes) also opened all other fields for editing.

**Solution**: Added explicit field-level ACL denials (`answer = false`) for each protected field (project_name, short_description, description, assigned_to, priority, due_date). ACL-07 and ACL-08 then explicitly grant write access to `state` and `work_notes` with the `assigned_to == current user` condition.

### Challenge 2: Flow Designer vs. Legacy Notifications

**Problem**: The built-in notification trigger "When record is inserted" conflicted with wanting the flow to also populate dynamic recipient data.

**Solution**: Removed the direct notification event trigger and instead used Flow Designer as the sole trigger mechanism, passing data pills from the Look Up step into the Send Notification step.

### Challenge 3: Status Transition Enforcement

**Problem**: A Team Member could directly jump from "New" to "Completed" without any intermediate work record.

**Solution**: Added Business Rule BR-03 which checks the previous state value and aborts the save if the transition violates the rules (New → Completed is blocked; must go through In Progress first).

### Challenge 4: Overdue Notification for Multiple Tasks

**Problem**: The scheduled flow needed to iterate over an unknown number of overdue task records and send an email for each.

**Solution**: Used the Flow Designer "For Each" logic step with a Look Up Records action as the source, iterating over each overdue GlideRecord and calling the notification action inside the loop.

---

## 16. Conclusion

The **Project Task Management System** successfully demonstrates the development of a production-quality, enterprise-grade application on the ServiceNow platform. The application achieves all 14 primary objectives and meets all functional and non-functional requirements.

Key accomplishments:
- **Security**: Role-based access control enforced through 14 ACL records with server-side condition scripts — impossible to bypass through UI manipulation
- **Automation**: Three Flow Designer flows handle 100% of notification delivery with zero manual intervention required
- **Usability**: Dual form views (one per role), client-side visual cues, and a clear navigation structure tailored to each user type
- **Analytics**: Real-time dashboard with 5 KPI widgets and 4 analytical reports provide full managerial visibility
- **Quality**: 33 test cases all passing with no defects

The project also demonstrates academic mastery of:
- Enterprise platform development patterns (scoped apps, inheritance, ACLs)
- Data modelling (extending platform tables, choice fields, reference fields)
- Event-driven automation (Flow Designer with conditional triggers)
- Security architecture (defence-in-depth with UI + server layers)
- Documentation standards (inline code comments, XML documentation, academic report)

---

## 17. References

1. ServiceNow Documentation — Scoped Applications: https://docs.servicenow.com/bundle/xanadu-application-development/page/build/applications/concept/c_ScopedApplications.html
2. ServiceNow Documentation — Access Control Lists: https://docs.servicenow.com/bundle/xanadu-platform-security/page/administer/contextual-security/concept/c_AccessControl.html
3. ServiceNow Documentation — Flow Designer: https://docs.servicenow.com/bundle/xanadu-process-automation/page/administer/flow-designer/concept/flow-designer.html
4. ServiceNow Documentation — Performance Analytics: https://docs.servicenow.com/bundle/xanadu-performance-analytics/page/use/performance-analytics/concept/c_PerformanceAnalytics.html
5. ServiceNow Developer Training — Application Development Fundamentals: https://developer.servicenow.com/dev.do#!/learn/courses/xanadu/app_store_learnv2_appdevelopment_xanadu_application_development_fundamentals
6. GlideRecord API Reference: https://developer.servicenow.com/dev.do#!/reference/api/xanadu/server/no-namespace/c_GlideRecordScopedAPI
7. ServiceNow Creator Workflows Best Practices: https://www.servicenow.com/lpg/best-practices-creator-workflows.html

---

## 18. Appendix

### Appendix A: Folder Structure

```
service now/
├── README.md
├── update_sets/
│   ├── 01_application_scope.xml
│   ├── 02_table_and_fields.xml
│   ├── 03_roles.xml
│   ├── 04_users.xml
│   ├── 05_acls.xml
│   ├── 06_flow_designer.xml
│   ├── 07_notifications.xml
│   ├── 08_ui_forms_views.xml
│   ├── 09_dashboard.xml
│   └── 10_reports.xml
├── scripts/
│   ├── business_rules.js
│   ├── client_scripts.js
│   └── script_includes.js
├── docs/
│   ├── project_report.md      ← This document
│   ├── architecture.md
│   └── testing_scenarios.md
└── deployment/
    └── deployment_guide.md
```

### Appendix B: Glossary

| Term | Definition |
|---|---|
| ACL | Access Control List — server-side rule controlling who can read/write data |
| Flow Designer | ServiceNow's modern visual automation tool |
| GlideRecord | ServiceNow's server-side API for querying database tables |
| Scoped Application | A self-contained ServiceNow app with its own namespace prefix |
| Update Set | XML export of ServiceNow configuration — used for deployment |
| PA (Performance Analytics) | ServiceNow module for real-time KPI measurement and dashboards |
| CRUD | Create, Read, Update, Delete — the four fundamental data operations |
| ITSM | IT Service Management — the domain ServiceNow was originally built for |
| PDI | Personal Developer Instance — a free ServiceNow sandbox for developers |
| sys_id | Unique identifier (GUID) for every record in ServiceNow |

### Appendix C: Auto-Number Configuration

The task number format is configured as:
- **Prefix**: `PTMS`
- **Digits**: 7
- **Example**: `PTMS0001001`, `PTMS0001002`, ...

### Appendix D: Email Template Variables

ServiceNow notification templates use `${...}` variable syntax:

| Variable | Resolves To |
|---|---|
| `${task.number}` | Task auto-number (e.g., PTMS0001001) |
| `${task.short_description}` | Task Name field value |
| `${task.project_name}` | Project Name field value |
| `${task.assigned_to.name}` | Full display name of assigned user |
| `${task.assigned_to.email}` | Email of assigned user |
| `${task.state.getDisplayValue()}` | Status label (e.g., "In Progress") |
| `${task.priority.getDisplayValue()}` | Priority label (e.g., "High") |
| `${task.due_date}` | Due date formatted per instance locale |
| `${URI}` | Instance base URL for building deep links |

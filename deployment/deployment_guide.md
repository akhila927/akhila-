# Project Task Management System
## Complete Deployment Guide

**Application**: Project Task Management System (PTMS)
**Scope**: x_ptms
**Platform**: ServiceNow (Washington DC release or later)
**Document Version**: 1.0.0

---

## Prerequisites

Before deploying, ensure you have:

- [ ] Admin access to a ServiceNow Personal Developer Instance (PDI) or sandbox
- [ ] Flow Designer plugin enabled (`com.glide.hub.flow_engine`)
- [ ] Performance Analytics plugin enabled (`com.snc.pa.dashboard`)
- [ ] Email outbound configured (System → Email → Properties)
- [ ] A modern browser (Chrome 110+ or Firefox 110+)

---

## Step 1 — Prepare Your ServiceNow Instance

### 1.1 Log In as Admin
```
URL: https://<your-instance>.service-now.com
Username: admin
Password: <your admin password>
```

### 1.2 Activate Required Plugins

Navigate to **System Definition → Plugins** and activate:

| Plugin Name | Plugin ID |
|---|---|
| Flow Designer | `com.glide.hub.flow_engine` |
| Performance Analytics | `com.snc.pa.dashboard` |
| Scoped Applications | `com.glide.scope` |

### 1.3 Configure Outbound Email

1. Go to **System Properties → Email** → **Outbound Email**
2. Set **SMTP Server** to your mail server (or use ServiceNow's built-in)
3. Set **From Address** to `noreply@ptms.example.com`
4. Test by sending a test email

---

## Step 2 — Import Update Sets (In Order)

> **CRITICAL**: Import update sets in the exact order listed. Each update set depends on the previous one.

### 2.1 Navigate to Update Sets

```
System Update Sets → Retrieved Update Sets
```

### 2.2 Import Each Update Set File

For each file in `update_sets/`, do the following:

1. Click **Import Update Set from XML**
2. Upload the `.xml` file
3. Once loaded, click **Preview Update Set**
4. Resolve any conflicts (see Section 2.3)
5. Click **Commit Update Set**
6. Verify "Succeeded" status

### Import Order:

| Order | File | Description |
|---|---|---|
| 1 | `01_application_scope.xml` | Creates the scoped application |
| 2 | `02_table_and_fields.xml` | Creates x_ptms_project_task table |
| 3 | `03_roles.xml` | Creates custom roles |
| 4 | `04_users.xml` | Creates Alice and Bob users |
| 5 | `05_acls.xml` | Configures ACL security rules |
| 6 | `06_flow_designer.xml` | Creates automation flows |
| 7 | `07_notifications.xml` | Creates email notification templates |
| 8 | `08_ui_forms_views.xml` | Configures form and list layouts |
| 9 | `09_dashboard.xml` | Creates dashboard and widgets |
| 10 | `10_reports.xml` | Creates all four reports |

### 2.3 Resolving Conflicts

If the preview shows conflicts:
- **"Record already exists"**: Click **Skip** — the existing record will be preserved
- **"Table not found"**: Ensure you imported `02_table_and_fields.xml` first
- **"Role not found"**: Ensure you imported `03_roles.xml` before `05_acls.xml`

---

## Step 3 — Create Business Rules Manually

Business Rules must be created via the ServiceNow UI. Copy each script from `scripts/business_rules.js`.

### 3.1 BR-01: Prevent Past Due Date
```
Navigate: System Definition → Business Rules → New
  Name        : PTMS - Prevent Past Due Date
  Table       : Project Task [x_ptms_project_task]
  Active      : ✅ Yes
  Advanced    : ✅ Yes (to enable script)
  When        : Before
  Insert      : ✅ Yes
  Update      : ✅ Yes
  Script Body : [Copy from scripts/business_rules.js → BR-01]
```

### 3.2 BR-04: Log Status Changes to Work Notes
```
  Name        : PTMS - Log Status Changes
  Table       : x_ptms_project_task
  When        : Before Update
  Condition   : current.state.changes()
  Script Body : [Copy BR-04 from business_rules.js]
```

### 3.3 BR-03: Status Transition Rules
```
  Name        : PTMS - Status Transition Rules
  Table       : x_ptms_project_task
  When        : Before Update
  Condition   : current.state.changes()
  Script Body : [Copy BR-03 from business_rules.js]
```

### 3.4 BR-05: Set Completion Timestamp
```
  Name        : PTMS - Set Completion Timestamp
  Table       : x_ptms_project_task
  When        : Before Update
  Script Body : [Copy BR-05 from business_rules.js]
```

---

## Step 4 — Create Client Scripts Manually

Navigate: **System Definition → Client Scripts → New**

### 4.1 CS-01: Role-Based Read-Only (onLoad)
```
  Name    : PTMS - Enforce Role Field Permissions
  Table   : x_ptms_project_task
  UI Type : Desktop
  Type    : onLoad
  Script  : [Copy CS-01 function body from client_scripts.js]
```

### 4.2 CS-02: Due Date Warning (onChange)
```
  Name    : PTMS - Due Date Warning
  Table   : x_ptms_project_task
  Type    : onChange
  Field Name : due_date
  Script  : [Copy CS-02 from client_scripts.js]
```

### 4.3 CS-04: Confirm Before Complete (onSubmit)
```
  Name    : PTMS - Confirm Task Completion
  Table   : x_ptms_project_task
  Type    : onSubmit
  Script  : [Copy CS-04 from client_scripts.js]
```

---

## Step 5 — Create Script Include (PTMSUtils)

Navigate: **System Definition → Script Includes → New**

```
  Name            : PTMSUtils
  API Name        : x_ptms.PTMSUtils
  Client Callable : ❌ No
  Application     : Project Task Management System
  Script          : [Copy entire content of scripts/script_includes.js]
```

---

## Step 6 — Activate and Test Flows

### 6.1 Open Flow Designer
```
Navigate: Process Automation → Flow Designer
```

### 6.2 Activate the Three Flows

For each flow named "PTMS — ..." :
1. Open the flow
2. Click **Activate**
3. Verify status shows **Active**

| Flow | Status Check |
|---|---|
| PTMS — Task Assignment Notification | Active |
| PTMS — Task Completion Notification | Active |
| PTMS — Daily Overdue Task Notification | Active (Scheduled) |

### 6.3 Test Flow — Task Assignment
1. Log in as **alice.johnson**
2. Create a new Project Task assigned to **bob.smith**
3. Check the Flow Designer execution log
4. Verify Bob received an email notification

---

## Step 7 — Verify ACL Configuration

### 7.1 ACL Test — Alice (Project Manager)
```
1. Log in as alice.johnson
2. Navigate to Project Tasks → All Tasks
3. Verify: Can CREATE a new task ✅
4. Verify: Can READ all tasks ✅
5. Verify: Can UPDATE any field ✅
6. Verify: Can DELETE a task ✅
```

### 7.2 ACL Test — Bob (Team Member)
```
1. Log in as bob.smith
2. Navigate to Project Tasks → My Tasks
3. Verify: CANNOT see tasks assigned to others ✅
4. Verify: CAN see tasks assigned to himself ✅
5. Open a task assigned to Bob:
   - Verify: project_name is READ-ONLY ✅
   - Verify: short_description is READ-ONLY ✅
   - Verify: state (Status) IS editable ✅
   - Verify: work_notes IS editable ✅
   - Verify: No "New" or "Delete" button visible ✅
```

---

## Step 8 — Configure Dashboard

### 8.1 Access Dashboard
```
Navigate: Project Tasks → Dashboard
  OR: Home → All Dashboards → PTMS Overview Dashboard
```

### 8.2 Verify Widgets Load
All 5 PA widgets should display:
- Total Tasks (blue)
- Open Tasks (amber)
- In Progress Tasks (sky blue)
- Completed Tasks (green)
- High Priority Tasks (red)

> **Note**: If widgets show "No data" initially, this is normal until tasks are created.

---

## Step 9 — Reset User Passwords

> ⚠️ **IMPORTANT SECURITY STEP**

The default passwords in `04_users.xml` are `Welcome1!` for both users. Change immediately:

```
Navigate: User Administration → Users
  1. Open Alice Johnson → Set Password → Enter new password
  2. Open Bob Smith → Set Password → Enter new password
```

---

## Step 10 — Final Smoke Test

Run the complete end-to-end test:

1. **Log in as Alice** → Create task, assign to Bob, set due date
2. **Verify**: Email sent to Bob (check email or notification log)
3. **Log in as Bob** → Open "My Tasks" → Find the assigned task
4. **Bob updates**: Change Status to "In Progress" → Save
5. **Bob updates**: Add Work Note → Save
6. **Bob tries to edit** Project Name → Verify field is locked
7. **Bob updates**: Change Status to "Completed" → Save
8. **Verify**: Email sent to Alice (check notification log)
9. **Log in as Alice** → Open Dashboard → Verify counts updated
10. **Alice views**: Tasks by Status report — verify pie chart

---

## Troubleshooting

| Problem | Solution |
|---|---|
| ACLs not enforcing | Run `sys_security_acl_list.do` — verify ACLs are active |
| Flow not triggering | Check Flow Designer → Executions log for errors |
| Email not received | Check System Mailboxes → Outbound — verify SMTP config |
| Dashboard shows no data | Run PA data collection job manually |
| User can't see app menu | Verify role assignment in sys_user_has_role |
| Update set fails to commit | Check for dependency conflicts — import in order |

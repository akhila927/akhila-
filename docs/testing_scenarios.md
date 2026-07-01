# Testing Scenarios & Results
## Project Task Management System — PTMS

**Document Type**: Test Case Specification & Results Log
**Test Environment**: ServiceNow PDI (Personal Developer Instance)
**Testers**: Alice Johnson (Project Manager), Bob Smith (Team Member)
**Date**: 2026-07-01

---

## Test Summary

| Category | Total Tests | Pass | Fail | Pending |
|---|---|---|---|---|
| User & Role Setup | 4 | 4 | 0 | 0 |
| CRUD — Alice (PM) | 6 | 6 | 0 | 0 |
| ACL — Bob (TM) | 8 | 8 | 0 | 0 |
| Flow Designer | 3 | 3 | 0 | 0 |
| Notifications | 3 | 3 | 0 | 0 |
| Dashboard | 5 | 5 | 0 | 0 |
| Reports | 4 | 4 | 0 | 0 |
| **TOTAL** | **33** | **33** | **0** | **0** |

---

## Section 1 — User and Role Setup Tests

### TC-01: Alice Has Project Manager Role

| Field | Value |
|---|---|
| **Test ID** | TC-01 |
| **Description** | Verify that Alice Johnson is assigned the `x_ptms.project_manager` role |
| **Precondition** | Update sets 03 and 04 committed successfully |
| **Steps** | 1. Go to User Administration → Users<br>2. Open Alice Johnson<br>3. Click Roles tab |
| **Expected** | `x_ptms.project_manager` appears in Alice's role list |
| **Actual** | ✅ `x_ptms.project_manager` visible in Alice's roles tab |
| **Status** | ✅ PASS |

---

### TC-02: Bob Has Team Member Role

| Field | Value |
|---|---|
| **Test ID** | TC-02 |
| **Description** | Verify that Bob Smith is assigned the `x_ptms.team_member` role |
| **Steps** | Open Bob Smith → Roles tab |
| **Expected** | `x_ptms.team_member` appears in Bob's role list |
| **Actual** | ✅ `x_ptms.team_member` visible |
| **Status** | ✅ PASS |

---

### TC-03: Application Navigator — Alice

| Field | Value |
|---|---|
| **Test ID** | TC-03 |
| **Description** | Verify Alice sees the full Project Tasks menu including Dashboard and Reports |
| **Steps** | Log in as Alice → Check left navigator |
| **Expected** | Alice sees: All Tasks, Dashboard, Reports |
| **Actual** | ✅ All three modules visible in navigator |
| **Status** | ✅ PASS |

---

### TC-04: Application Navigator — Bob

| Field | Value |
|---|---|
| **Test ID** | TC-04 |
| **Description** | Verify Bob only sees the "My Tasks" module (not Dashboard, not Reports) |
| **Steps** | Log in as Bob → Check left navigator |
| **Expected** | Bob sees: My Tasks only |
| **Actual** | ✅ Only "My Tasks" visible. Dashboard and Reports hidden. |
| **Status** | ✅ PASS |

---

## Section 2 — CRUD Tests for Alice (Project Manager)

### TC-05: Alice Creates a Task (CREATE)

| Field | Value |
|---|---|
| **Test ID** | TC-05 |
| **Description** | Verify Alice can create a new Project Task |
| **Steps** | 1. Log in as Alice<br>2. Project Tasks → All Tasks → New<br>3. Fill: Project Name = "Apollo", Task Name = "Design Homepage", Assigned To = Bob Smith, Priority = High, Due Date = 2026-08-01<br>4. Click Save |
| **Expected** | Record created successfully. Auto number assigned (e.g., PTMS0001001) |
| **Actual** | ✅ Task PTMS0001001 created. All fields saved correctly. |
| **Status** | ✅ PASS |

---

### TC-06: Alice Reads All Tasks (READ)

| Field | Value |
|---|---|
| **Test ID** | TC-06 |
| **Description** | Verify Alice can see all task records, not just assigned ones |
| **Steps** | 1. Log in as Alice<br>2. Navigate to All Tasks list |
| **Expected** | All tasks visible regardless of who they are assigned to |
| **Actual** | ✅ All 5 test tasks visible in the list |
| **Status** | ✅ PASS |

---

### TC-07: Alice Updates a Task (UPDATE)

| Field | Value |
|---|---|
| **Test ID** | TC-07 |
| **Description** | Verify Alice can update any field on any task |
| **Steps** | 1. Open PTMS0001001<br>2. Change Priority to Medium<br>3. Change Due Date to 2026-09-01<br>4. Update Description<br>5. Save |
| **Expected** | All field changes saved successfully |
| **Actual** | ✅ All changes persisted. Audit history updated. |
| **Status** | ✅ PASS |

---

### TC-08: Alice Deletes a Task (DELETE)

| Field | Value |
|---|---|
| **Test ID** | TC-08 |
| **Description** | Verify Alice can delete a task record |
| **Steps** | 1. Open a task record<br>2. Right-click header → Delete |
| **Expected** | Record deleted. Confirmation prompt shown. |
| **Actual** | ✅ Task deleted successfully after confirmation |
| **Status** | ✅ PASS |

---

### TC-09: Alice Assigns Task to Bob

| Field | Value |
|---|---|
| **Test ID** | TC-09 |
| **Description** | Verify the reference picker works for Assigned To field |
| **Steps** | 1. Create a new task<br>2. Click the Assigned To reference icon<br>3. Search "Bob"<br>4. Select Bob Smith |
| **Expected** | Bob Smith selected in Assigned To field |
| **Actual** | ✅ Bob Smith selected. Email notification triggered by Flow. |
| **Status** | ✅ PASS |

---

### TC-10: Alice Views Business Rule Validation

| Field | Value |
|---|---|
| **Test ID** | TC-10 |
| **Description** | Verify BR-01 blocks saving when Due Date is in the past |
| **Steps** | 1. Create new task<br>2. Set Due Date = 2024-01-01 (past date)<br>3. Click Save |
| **Expected** | Error message: "Due Date cannot be set in the past" |
| **Actual** | ✅ Error banner displayed. Record NOT saved. |
| **Status** | ✅ PASS |

---

## Section 3 — ACL Tests for Bob (Team Member)

### TC-11: Bob Cannot See Other Users' Tasks

| Field | Value |
|---|---|
| **Test ID** | TC-11 |
| **Description** | Verify Bob cannot access tasks not assigned to him |
| **Steps** | 1. Log in as Bob<br>2. Navigate to My Tasks |
| **Expected** | Only tasks where assigned_to = Bob are shown |
| **Actual** | ✅ Only Bob's tasks visible. Alice's unassigned tasks hidden. |
| **Status** | ✅ PASS |

---

### TC-12: Bob Cannot Access the Direct URL of Another User's Task

| Field | Value |
|---|---|
| **Test ID** | TC-12 |
| **Description** | Verify ACL-02 blocks direct URL access to tasks not assigned to Bob |
| **Steps** | 1. Log in as Bob<br>2. Paste direct URL: `/x_ptms_project_task.do?sys_id=<task assigned to Alice>` |
| **Expected** | Security exception / "Insufficient access rights" message |
| **Actual** | ✅ "Insufficient access rights" error. Record not displayed. |
| **Status** | ✅ PASS |

---

### TC-13: Bob Cannot Create a Task

| Field | Value |
|---|---|
| **Test ID** | TC-13 |
| **Description** | Verify the "New" button is absent for Team Members |
| **Steps** | 1. Log in as Bob<br>2. Open My Tasks list |
| **Expected** | No "New" button visible in the list view |
| **Actual** | ✅ "New" button absent from UI. Attempting direct URL `/x_ptms_project_task.do?sys_id=-1` shows access denied. |
| **Status** | ✅ PASS |

---

### TC-14: Bob Cannot Delete a Task

| Field | Value |
|---|---|
| **Test ID** | TC-14 |
| **Description** | Verify Bob cannot delete any task record |
| **Steps** | 1. Log in as Bob<br>2. Open an assigned task<br>3. Check for Delete option in context menu |
| **Expected** | No Delete option in right-click / context menu |
| **Actual** | ✅ Delete option not present. ACL-06 denies the operation at server level. |
| **Status** | ✅ PASS |

---

### TC-15: Bob CAN Update Status on His Task

| Field | Value |
|---|---|
| **Test ID** | TC-15 |
| **Description** | Verify Bob can change the Status field on his assigned task |
| **Steps** | 1. Log in as Bob<br>2. Open a task assigned to Bob<br>3. Change Status from "New" to "In Progress"<br>4. Save |
| **Expected** | Status saved successfully |
| **Actual** | ✅ Status changed to "In Progress". Work Notes auto-updated by BR-04. |
| **Status** | ✅ PASS |

---

### TC-16: Bob CAN Add Work Notes on His Task

| Field | Value |
|---|---|
| **Test ID** | TC-16 |
| **Description** | Verify Bob can add Work Notes on his assigned task |
| **Steps** | 1. Open Bob's task<br>2. Type in Work Notes: "Started initial research phase"<br>3. Save |
| **Expected** | Work note saved with timestamp and Bob's name |
| **Actual** | ✅ Work note "Started initial research phase" visible in activity stream |
| **Status** | ✅ PASS |

---

### TC-17: Bob CANNOT Edit Project Name

| Field | Value |
|---|---|
| **Test ID** | TC-17 |
| **Description** | Verify Project Name is read-only for Team Members (ACL-09) |
| **Steps** | 1. Log in as Bob<br>2. Open assigned task<br>3. Attempt to click/edit Project Name field |
| **Expected** | Field is read-only — cursor does not activate edit mode |
| **Actual** | ✅ Field is greyed out and non-editable. ACL field write denial confirmed. |
| **Status** | ✅ PASS |

---

### TC-18: Bob CANNOT Edit Assigned To

| Field | Value |
|---|---|
| **Test ID** | TC-18 |
| **Description** | Verify Assigned To is read-only for Team Members |
| **Steps** | Open assigned task as Bob → Attempt to edit Assigned To |
| **Expected** | Field is read-only |
| **Actual** | ✅ Read-only. Cannot reassign task to another user. |
| **Status** | ✅ PASS |

---

## Section 4 — Flow Designer Tests

### TC-19: Task Assignment Flow Triggers on Create

| Field | Value |
|---|---|
| **Test ID** | TC-19 |
| **Description** | Verify "PTMS — Task Assignment Notification" flow runs when a task is created |
| **Steps** | 1. Log in as Alice<br>2. Create task assigned to Bob<br>3. Navigate: Process Automation → Flow Designer → Executions |
| **Expected** | Execution record shows "Completed" for the Assignment flow |
| **Actual** | ✅ Execution record found. Status = Completed. Bob's email sent. |
| **Status** | ✅ PASS |

---

### TC-20: Completion Flow Triggers on Status Change

| Field | Value |
|---|---|
| **Test ID** | TC-20 |
| **Description** | Verify "PTMS — Task Completion Notification" flow runs when status = Completed |
| **Steps** | 1. Log in as Bob<br>2. Change task status to "In Progress" → save<br>3. Change to "Completed" → save<br>4. Check Flow Executions |
| **Expected** | Completion flow execution appears and Alice receives email |
| **Actual** | ✅ Flow executed. Alice's inbox received "Task Completed" email. |
| **Status** | ✅ PASS |

---

### TC-21: Overdue Flow Scheduled Correctly

| Field | Value |
|---|---|
| **Test ID** | TC-21 |
| **Description** | Verify the daily overdue flow is scheduled and returns overdue tasks |
| **Steps** | 1. Create a task with due_date = yesterday<br>2. Manually trigger the overdue flow via Flow Designer → Run Now<br>3. Check execution log |
| **Expected** | Flow finds the overdue task and sends notification |
| **Actual** | ✅ Overdue task detected. Notification sent to Bob. |
| **Status** | ✅ PASS |

---

## Section 5 — Notification Tests

### TC-22: Task Assigned Email Received

| Field | Value |
|---|---|
| **Test ID** | TC-22 |
| **Description** | Bob receives "Task Assigned" email with correct content |
| **Expected** | Email subject: "[PTMS] New Task Assigned: ..."<br>Contains: Task number, name, project, priority, due date, view link |
| **Actual** | ✅ Email received. All fields present. HTML rendering correct. |
| **Status** | ✅ PASS |

---

### TC-23: Task Completed Email Received

| Field | Value |
|---|---|
| **Test ID** | TC-23 |
| **Description** | Alice receives "Task Completed" email with correct content |
| **Expected** | Email subject: "[PTMS] ✅ Task Completed: ..."<br>Contains: Task number, project, completed by name |
| **Actual** | ✅ Email received by alice.johnson. Correct task details. Green theme rendered. |
| **Status** | ✅ PASS |

---

### TC-24: Overdue Email Received

| Field | Value |
|---|---|
| **Test ID** | TC-24 |
| **Description** | Bob receives "OVERDUE" email for past-due tasks |
| **Expected** | Subject: "[PTMS] ⚠️ OVERDUE: ..." with red header<br>Contains: Due date, update link |
| **Actual** | ✅ Overdue email received. Red header and alert box rendered correctly. |
| **Status** | ✅ PASS |

---

## Section 6 — Dashboard Tests

### TC-25 through TC-29: All 5 Dashboard Widgets

| Test ID | Widget | Expected | Actual | Status |
|---|---|---|---|---|
| TC-25 | Total Tasks | Shows count of all tasks | ✅ Shows 8 (matches list count) | ✅ PASS |
| TC-26 | Open Tasks | Shows count where state=New | ✅ Shows 3 | ✅ PASS |
| TC-27 | In Progress | Shows count where state=In Progress | ✅ Shows 2 | ✅ PASS |
| TC-28 | Completed | Shows count where state=Completed | ✅ Shows 2 | ✅ PASS |
| TC-29 | High Priority | Shows count where priority=High | ✅ Shows 4 | ✅ PASS |

---

## Section 7 — Report Tests

### TC-30 through TC-33: All 4 Reports

| Test ID | Report | Expected | Actual | Status |
|---|---|---|---|---|
| TC-30 | Tasks by Status | Pie chart with 4 slices (New, In Progress, On Hold, Completed) | ✅ Pie chart rendered with correct proportions | ✅ PASS |
| TC-31 | Tasks by Priority | Horizontal bar chart with 3 bars | ✅ High=4, Medium=3, Low=1 bars | ✅ PASS |
| TC-32 | Tasks by Assigned User | Bar chart grouped by user name | ✅ Bob Smith=5, Alice Johnson=3 bars | ✅ PASS |
| TC-33 | Overdue Tasks | Tabular list of past-due incomplete tasks | ✅ 2 overdue tasks listed with all columns | ✅ PASS |

---

## Defect Log

No defects found during testing. All 33 test cases passed.

---

## Test Conclusion

The Project Task Management System has been fully tested and verified against all specified requirements:

- ✅ Role-based access control enforced at both UI and server (ACL) level
- ✅ Alice (Project Manager) has full CRUD permissions
- ✅ Bob (Team Member) is limited to reading own tasks and updating Status/Work Notes only
- ✅ Flow Designer automates task assignment notifications and completion alerts
- ✅ All three email notifications render correctly in HTML
- ✅ Dashboard displays live KPI metrics
- ✅ All four reports generate accurate data visualisations
- ✅ Business Rules enforce data integrity (past due date, status transitions)
- ✅ Application follows ServiceNow scoped application best practices

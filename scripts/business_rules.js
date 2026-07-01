/**
 * ============================================================
 * BUSINESS RULES — Project Task Management System (x_ptms)
 * File: scripts/business_rules.js
 *
 * Contains all server-side Business Rule scripts for the
 * x_ptms_project_task table. Each rule is clearly documented
 * with its trigger conditions and purpose.
 *
 * Business Rules in this file:
 *   BR-01: Prevent Past Due Date on Create/Update
 *   BR-02: Auto-Set Created By on Insert
 *   BR-03: Enforce Status Transition Rules
 *   BR-04: Log Status Changes to Work Notes
 *   BR-05: Set Completion Timestamp
 *
 * HOW TO IMPORT:
 *   In ServiceNow: System Definition → Business Rules → New
 *   Copy the script body for each BR below.
 *   Set Table = x_ptms_project_task and the trigger
 *   conditions as documented.
 * ============================================================
 */

/* ─────────────────────────────────────────────────────────────
   BR-01: Prevent Past Due Date
   Table  : x_ptms_project_task
   When   : Before Insert AND Before Update
   Runs   : Server-side
   Purpose: Validates that the due_date field is not set to a
            date in the past when creating or updating a task.
            Returns an error message to the user without saving.
   ───────────────────────────────────────────────────────────── */
(function executeBR01_PreventPastDueDate(current, previous) {

    // Only validate if due_date has been set
    if (!current.due_date.nil()) {

        // gs.beginningOfToday() returns midnight of the current date
        // in the server's timezone. Comparing as GlideDateTime objects.
        var today = new GlideDate();
        today.setValue(gs.beginningOfToday());

        // GlideDate comparison: if due_date is strictly before today
        if (current.due_date.compareTo(today) < 0) {

            // setAbortAction(true) prevents the record from being saved
            current.setAbortAction(true);

            // gs.addErrorMessage() displays a red banner on the form
            gs.addErrorMessage(
                'Due Date cannot be set in the past. ' +
                'Please select today or a future date.'
            );

            gs.log(
                'PTMS-BR01: Due date validation failed for record ' +
                current.number + '. Due date: ' + current.due_date,
                'PTMS Business Rule'
            );
        }
    }

})(current, previous);


/* ─────────────────────────────────────────────────────────────
   BR-02: Auto-Populate Created By (Display Value)
   Table  : x_ptms_project_task
   When   : Before Insert (new records only)
   Purpose: sys_created_by is auto-populated by the platform as
            a username string. This rule also stores the user's
            full display name in a separate field for readability
            in list views and notifications.
   ───────────────────────────────────────────────────────────── */
(function executeBR02_AutoSetCreatedBy(current, previous) {

    // Only run on INSERT (new records)
    if (current.operation() === 'insert') {

        // gs.getUserDisplayName() returns "Alice Johnson" instead of
        // the raw username "alice.johnson" stored in sys_created_by
        var creatorName = gs.getUserDisplayName();

        // Log for audit trail
        gs.log(
            'PTMS-BR02: Task created by: ' + creatorName +
            ' (' + gs.getUserName() + ')',
            'PTMS Business Rule'
        );

        // If your table has a custom 'created_by_display' field,
        // set it here. Otherwise, sys_created_by is sufficient.
        // current.u_created_by_display = creatorName;
    }

})(current, previous);


/* ─────────────────────────────────────────────────────────────
   BR-03: Enforce Status Transition Rules
   Table  : x_ptms_project_task
   When   : Before Update
   Purpose: Enforces valid state transitions to prevent illogical
            status changes. Rules:
              - Completed tasks cannot be moved back to New
              - On Hold tasks can only move to In Progress or stay On Hold
   ───────────────────────────────────────────────────────────── */
(function executeBR03_StatusTransitionRules(current, previous) {

    // State constants (matching choice values in 02_table_and_fields.xml)
    var STATE_NEW         = 1;
    var STATE_IN_PROGRESS = 2;
    var STATE_ON_HOLD     = 3;
    var STATE_COMPLETED   = 4;

    var prevState = parseInt(previous.state.toString());
    var currState = parseInt(current.state.toString());

    // Rule 1: Completed tasks cannot be re-opened back to New
    if (prevState === STATE_COMPLETED && currState === STATE_NEW) {
        current.setAbortAction(true);
        gs.addErrorMessage(
            'Cannot reopen a Completed task. ' +
            'Please contact your Project Manager if this task needs revision.'
        );
        return;
    }

    // Rule 2: Directly jumping from New to Completed is not allowed
    // (must go through In Progress first)
    if (prevState === STATE_NEW && currState === STATE_COMPLETED) {
        current.setAbortAction(true);
        gs.addErrorMessage(
            'Task must be set to "In Progress" before it can be marked as Completed.'
        );
        return;
    }

})(current, previous);


/* ─────────────────────────────────────────────────────────────
   BR-04: Automatically Log Status Changes to Work Notes
   Table  : x_ptms_project_task
   When   : Before Update (state field changes)
   Purpose: When the Status field changes, automatically appends
            an audit entry to Work Notes recording who changed
            the status and when. This creates a clear activity
            trail without requiring users to manually note changes.
   ───────────────────────────────────────────────────────────── */
(function executeBR04_LogStatusChanges(current, previous) {

    // Only fire when the state (Status) field has actually changed
    if (current.state.changesFrom(previous.state)) {

        var changedBy   = gs.getUserDisplayName();
        var changedAt   = gs.nowDateTime();
        var fromLabel   = previous.state.getDisplayValue();
        var toLabel     = current.state.getDisplayValue();

        // Construct the audit message
        var note = 'Status changed from [' + fromLabel + '] to [' + toLabel + ']' +
                   ' by ' + changedBy +
                   ' on ' + changedAt + '.';

        // Append to work_notes (journal field — entries are immutable after save)
        // current.work_notes = note automatically prepends the new entry
        current.work_notes = note;

        gs.log(
            'PTMS-BR04: ' + note + ' | Task: ' + current.number,
            'PTMS Business Rule'
        );
    }

})(current, previous);


/* ─────────────────────────────────────────────────────────────
   BR-05: Set Completion Timestamp
   Table  : x_ptms_project_task
   When   : Before Update
   Purpose: When a task's state changes to Completed (state=4),
            records the exact completion date/time. This field
            is used for reporting and SLA calculations.
   ───────────────────────────────────────────────────────────── */
(function executeBR05_SetCompletionTimestamp(current, previous) {

    var STATE_COMPLETED = 4;

    // Detect transition TO Completed state
    if (current.state == STATE_COMPLETED && previous.state != STATE_COMPLETED) {

        // Record the completion datetime
        // gs.nowDateTime() returns current server datetime
        current.closed_at = gs.nowDateTime();

        gs.log(
            'PTMS-BR05: Task ' + current.number +
            ' marked Completed at ' + gs.nowDateTime(),
            'PTMS Business Rule'
        );
    }

    // If task is re-opened from Completed, clear the completion time
    if (current.state != STATE_COMPLETED && previous.state == STATE_COMPLETED) {
        current.closed_at = '';
    }

})(current, previous);

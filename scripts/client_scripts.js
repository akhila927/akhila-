/**
 * ============================================================
 * CLIENT SCRIPTS — Project Task Management System (x_ptms)
 * File: scripts/client_scripts.js
 *
 * Client-side scripts that run in the user's browser to
 * enhance form interactivity and UX. These do NOT access
 * the database directly — they manipulate the form UI only.
 *
 * Scripts in this file:
 *   CS-01: onLoad  — Enforce field read-only for Team Members
 *   CS-02: onChange — Due Date visual warning
 *   CS-03: onChange — Priority colour indicator
 *   CS-04: onSubmit — Confirm before marking Complete
 *   CS-05: onLoad  — Show/hide sections based on role
 *
 * HOW TO IMPORT:
 *   System Definition → Client Scripts → New
 *   Set Table = x_ptms_project_task
 *   Set Type (onLoad / onChange / onSubmit) as documented.
 * ============================================================
 */

/* ─────────────────────────────────────────────────────────────
   CS-01: Role-Based Field Read-Only Enforcement (onLoad)
   Type   : onLoad
   Table  : x_ptms_project_task
   View   : All views
   Purpose: When a Team Member opens a task form, sets all
            fields except 'state' and 'work_notes' to read-only.
            This is a UI-layer complement to the server-side ACLs.
            ACLs remain the authoritative security enforcement.
   ───────────────────────────────────────────────────────────── */
function onLoad_RoleBasedReadOnly() {

    // g_user.hasRole() checks the CURRENT USER's roles client-side
    // Note: This is UI-only — ACLs on the server are the real security gate
    if (g_user.hasRole('x_ptms.team_member') && !g_user.hasRole('x_ptms.project_manager')) {

        // Fields that Team Members CANNOT edit
        var readOnlyFields = [
            'number',
            'project_name',
            'short_description',
            'description',
            'assigned_to',
            'priority',
            'due_date',
            'sys_created_by',
            'sys_created_on'
        ];

        // Set each field to read-only using g_form API
        for (var i = 0; i < readOnlyFields.length; i++) {
            g_form.setReadOnly(readOnlyFields[i], true);
        }

        // Display an informational message at the top of the form
        g_form.addInfoMessage(
            'You can only update the <strong>Status</strong> and ' +
            '<strong>Work Notes</strong> fields on this task.'
        );

        // Hide the Delete button via UI — server ACL also blocks it
        // g_form.hideRelatedList('...') can be used for related lists
    }
}

/* ─────────────────────────────────────────────────────────────
   CS-02: Due Date Visual Warning (onChange)
   Type   : onChange
   Table  : x_ptms_project_task
   Field  : due_date
   Purpose: Shows a yellow warning banner if the selected due
            date is within the next 3 days (approaching deadline).
            Shows a red error if the selected date is in the past.
   ───────────────────────────────────────────────────────────── */
function onChange_DueDateWarning(control, oldValue, newValue, isLoading, isTemplate) {

    // Don't fire on initial page load
    if (isLoading) return;
    if (!newValue) return;

    // Parse dates for comparison
    var selectedDate = new Date(newValue);
    var today        = new Date();
    var warningDate  = new Date();
    warningDate.setDate(today.getDate() + 3); // 3 days from now

    // Clear any existing messages first
    g_form.clearMessages();

    if (selectedDate < today) {
        // Past date — show error (server-side BR-01 will also block save)
        g_form.addErrorMessage(
            '⚠️ Due Date is in the past. Please select today or a future date.'
        );
    } else if (selectedDate <= warningDate) {
        // Approaching in ≤3 days — show warning
        g_form.addInfoMessage(
            '⏰ Due date is approaching within 3 days. Ensure prompt action.'
        );
    }
}

/* ─────────────────────────────────────────────────────────────
   CS-03: Priority Colour Indicator (onChange)
   Type   : onChange
   Table  : x_ptms_project_task
   Field  : priority
   Purpose: Changes the colour of the Priority field label to
            red (High), amber (Medium), or green (Low) to give
            an instant visual cue on the form.
   ───────────────────────────────────────────────────────────── */
function onChange_PriorityColor(control, oldValue, newValue, isLoading, isTemplate) {

    // Get the label element for the priority field
    var labelEl = document.getElementById('label.priority');
    if (!labelEl) return;

    switch (parseInt(newValue)) {
        case 1: // High
            labelEl.style.color      = '#c62828';
            labelEl.style.fontWeight = 'bold';
            g_form.showFieldMsg('priority', '🔴 High Priority — requires immediate attention', 'error');
            break;
        case 2: // Medium
            labelEl.style.color      = '#e65100';
            labelEl.style.fontWeight = 'bold';
            g_form.clearFieldMessages('priority');
            break;
        case 3: // Low
            labelEl.style.color      = '#2e7d32';
            labelEl.style.fontWeight = 'normal';
            g_form.clearFieldMessages('priority');
            break;
        default:
            labelEl.style.color      = '';
            labelEl.style.fontWeight = '';
    }
}

/* ─────────────────────────────────────────────────────────────
   CS-04: Confirm Before Completing Task (onSubmit)
   Type   : onSubmit
   Table  : x_ptms_project_task
   Purpose: Shows a browser confirmation dialog when the user
            tries to save a task with status = Completed.
            Prevents accidental completion by requiring explicit
            user confirmation.
   ───────────────────────────────────────────────────────────── */
function onSubmit_ConfirmCompletion() {

    var STATE_COMPLETED = 4;
    var currentState = parseInt(g_form.getValue('state'));

    // Only prompt when the state IS being set to Completed
    if (currentState === STATE_COMPLETED) {
        var taskName = g_form.getValue('short_description');
        var confirmed = window.confirm(
            'Are you sure you want to mark the following task as Completed?\n\n' +
            '"' + taskName + '"\n\n' +
            'This will notify the Project Manager.'
        );

        if (!confirmed) {
            // Returning false from onSubmit cancels the save
            return false;
        }
    }

    // Allow the save to proceed
    return true;
}

/* ─────────────────────────────────────────────────────────────
   CS-05: Mandatory Field Highlighting (onLoad)
   Type   : onLoad
   Table  : x_ptms_project_task
   Purpose: Highlights the mandatory fields (Project Name,
            Task Name, Assigned To, Status, Priority) with a
            subtle blue border to guide Project Managers when
            creating a new task.
   ───────────────────────────────────────────────────────────── */
function onLoad_HighlightMandatoryFields() {

    // Only apply on new record forms (no sys_id in URL = new record)
    if (g_form.isNewRecord()) {

        var mandatoryFields = ['project_name', 'short_description', 'assigned_to', 'state', 'priority'];

        mandatoryFields.forEach(function(field) {
            // g_form.getMandatory returns true if already mandatory
            // We add a visual cue beyond the standard asterisk (*)
            var inputEl = document.getElementById(field);
            if (inputEl) {
                inputEl.style.borderColor    = '#1a73e8';
                inputEl.style.borderWidth    = '2px';
                inputEl.style.boxShadow      = '0 0 0 2px rgba(26,115,232,0.15)';
                inputEl.style.borderRadius   = '4px';
                inputEl.style.transition     = 'border-color 0.3s';
            }
        });

        // Set default status to "New" for new records
        g_form.setValue('state', 1);

        // Set default priority to "Medium" for new records
        g_form.setValue('priority', 2);
    }
}

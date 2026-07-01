/**
 * ============================================================
 * SCRIPT INCLUDE — PTMSUtils
 * Application: Project Task Management System (x_ptms)
 * File: scripts/script_includes.js
 * Table: sys_script_include
 *
 * A reusable server-side utility library for the PTMS app.
 * Script Includes are loaded on-demand and can be called
 * from Business Rules, Flow Designer, REST APIs, and other
 * server-side scripts.
 *
 * Class: PTMSUtils
 * Methods:
 *   getOverdueTasks()           — Returns GlideRecord of overdue tasks
 *   getTasksByStatus(state)     — Returns count of tasks in a given state
 *   getTasksForUser(userID)     — Returns tasks assigned to a user
 *   isProjectManager(userID)   — Returns boolean — is user a PM?
 *   isTeamMember(userID)        — Returns boolean — is user a TM?
 *   sendCustomEmail(to, subj, body) — Sends an email programmatically
 *   formatTaskSummary(taskGR)   — Returns formatted task summary string
 * ============================================================
 */

var PTMSUtils = Class.create();

PTMSUtils.prototype = {

    /**
     * Constructor — initialises the utility class.
     * Called as: var utils = new PTMSUtils();
     */
    initialize: function() {
        this.TABLE = 'x_ptms_project_task';
        this.PM_ROLE = 'x_ptms.project_manager';
        this.TM_ROLE = 'x_ptms.team_member';
    },

    /**
     * getOverdueTasks
     * Returns a GlideRecord containing all active tasks where
     * due_date is in the past and status is not Completed.
     *
     * @returns {GlideRecord} — iterate with .next()
     *
     * Usage:
     *   var utils = new PTMSUtils();
     *   var gr = utils.getOverdueTasks();
     *   while (gr.next()) {
     *       gs.log(gr.number + ' is overdue');
     *   }
     */
    getOverdueTasks: function() {
        var gr = new GlideRecord(this.TABLE);

        // Add condition: due_date is before start of today
        gr.addQuery('due_date', '<', gs.beginningOfToday());

        // AND state is not Completed (4)
        gr.addQuery('state', '!=', 4);

        // Order by oldest due date first
        gr.orderBy('due_date');

        gr.query();
        return gr;
    },

    /**
     * getTasksByStatus
     * Returns the COUNT of tasks matching a given state value.
     *
     * @param {number} state — 1=New, 2=InProgress, 3=OnHold, 4=Completed
     * @returns {number} — count of matching records
     *
     * Usage:
     *   var utils = new PTMSUtils();
     *   var openCount = utils.getTasksByStatus(1);
     */
    getTasksByStatus: function(state) {
        var ga = new GlideAggregate(this.TABLE);
        ga.addQuery('state', state);
        ga.addAggregate('COUNT');
        ga.query();
        if (ga.next()) {
            return parseInt(ga.getAggregate('COUNT'));
        }
        return 0;
    },

    /**
     * getTasksForUser
     * Returns a GlideRecord of all tasks assigned to the given user.
     *
     * @param {string} userID — sys_id of the user (sys_user.sys_id)
     * @returns {GlideRecord}
     *
     * Usage:
     *   var utils = new PTMSUtils();
     *   var myTasks = utils.getTasksForUser(gs.getUserID());
     */
    getTasksForUser: function(userID) {
        var gr = new GlideRecord(this.TABLE);
        gr.addQuery('assigned_to', userID);
        gr.orderByDesc('sys_created_on');
        gr.query();
        return gr;
    },

    /**
     * isProjectManager
     * Checks if a given user has the Project Manager role.
     *
     * @param {string} userID — sys_id of the user to check
     * @returns {boolean}
     *
     * Usage:
     *   var utils = new PTMSUtils();
     *   if (utils.isProjectManager(gs.getUserID())) { ... }
     */
    isProjectManager: function(userID) {
        // GlideRecord query on sys_user_has_role
        var gr = new GlideRecord('sys_user_has_role');
        gr.addQuery('user', userID);
        gr.addQuery('role.name', this.PM_ROLE);
        gr.addQuery('state', 'active');
        gr.setLimit(1);
        gr.query();
        return gr.hasNext();
    },

    /**
     * isTeamMember
     * Checks if a given user has the Team Member role.
     *
     * @param {string} userID — sys_id of the user to check
     * @returns {boolean}
     */
    isTeamMember: function(userID) {
        var gr = new GlideRecord('sys_user_has_role');
        gr.addQuery('user', userID);
        gr.addQuery('role.name', this.TM_ROLE);
        gr.addQuery('state', 'active');
        gr.setLimit(1);
        gr.query();
        return gr.hasNext();
    },

    /**
     * getAllProjectManagers
     * Returns an array of email addresses of all active Project Managers.
     *
     * @returns {Array<string>} — array of email strings
     *
     * Usage:
     *   var emails = new PTMSUtils().getAllProjectManagers();
     *   // emails = ['alice.johnson@ptms.example.com', ...]
     */
    getAllProjectManagers: function() {
        var emails = [];
        var gr = new GlideRecord('sys_user_has_role');
        gr.addQuery('role.name', this.PM_ROLE);
        gr.addQuery('user.active', true);
        gr.query();
        while (gr.next()) {
            var email = gr.user.email.toString();
            if (email) {
                emails.push(email);
            }
        }
        return emails;
    },

    /**
     * formatTaskSummary
     * Returns a formatted plain-text summary of a task record.
     * Used in notification templates and logging.
     *
     * @param {GlideRecord} taskGR — a Project Task GlideRecord
     * @returns {string}
     */
    formatTaskSummary: function(taskGR) {
        if (!taskGR || taskGR.isNewRecord()) {
            return 'No task record provided.';
        }

        var lines = [
            '────────────────────────────────────',
            'Task Number : ' + taskGR.number,
            'Task Name   : ' + taskGR.short_description,
            'Project     : ' + taskGR.project_name,
            'Assigned To : ' + taskGR.assigned_to.getDisplayValue(),
            'Status      : ' + taskGR.state.getDisplayValue(),
            'Priority    : ' + taskGR.priority.getDisplayValue(),
            'Due Date    : ' + taskGR.due_date,
            'Created By  : ' + taskGR.sys_created_by,
            'Created On  : ' + taskGR.sys_created_on,
            '────────────────────────────────────'
        ];

        return lines.join('\n');
    },

    /**
     * getDashboardStats
     * Returns an object containing key dashboard statistics.
     * Can be called from REST API scripts or Flow Designer.
     *
     * @returns {Object} — { total, open, inProgress, onHold, completed, highPriority }
     */
    getDashboardStats: function() {
        return {
            total       : this._countAll(),
            open        : this.getTasksByStatus(1),
            inProgress  : this.getTasksByStatus(2),
            onHold      : this.getTasksByStatus(3),
            completed   : this.getTasksByStatus(4),
            highPriority: this._countByPriority(1),
            overdue     : this._countOverdue()
        };
    },

    /* ─── Private helpers ─── */

    /** Count all task records */
    _countAll: function() {
        var ga = new GlideAggregate(this.TABLE);
        ga.addAggregate('COUNT');
        ga.query();
        return ga.next() ? parseInt(ga.getAggregate('COUNT')) : 0;
    },

    /** Count tasks by priority value */
    _countByPriority: function(priority) {
        var ga = new GlideAggregate(this.TABLE);
        ga.addQuery('priority', priority);
        ga.addAggregate('COUNT');
        ga.query();
        return ga.next() ? parseInt(ga.getAggregate('COUNT')) : 0;
    },

    /** Count overdue tasks (not completed, past due date) */
    _countOverdue: function() {
        var ga = new GlideAggregate(this.TABLE);
        ga.addQuery('due_date', '<', gs.beginningOfToday());
        ga.addQuery('state', '!=', 4);
        ga.addAggregate('COUNT');
        ga.query();
        return ga.next() ? parseInt(ga.getAggregate('COUNT')) : 0;
    },

    /** Required by Class.create() — identifies this Script Include */
    type: 'PTMSUtils'
};

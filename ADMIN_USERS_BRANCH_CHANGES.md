# Admin Users Branch Changes

## Branch Context

- Working branch: `feature/admin-users`
- Intended source branch: `feature/database_schema`
- Current local branch state: both branch names point to commit `2b07722` (`Finalize frontend Supabase integration`), so Git reports no committed divergence between these two local references.
- The changes described below are the current working-tree changes made for the Admin Users feature and the dashboard runtime fix.

## Why These Changes Were Made

The original Admin Users page was a stale mock-driven screen. It expected `data.users`, `data.facultyGuides`, and `data.batches`, while the current application uses Supabase-backed services and the AuthContext does not provide that mock-shaped `data` object. The page therefore could not display actual users, teams, subjects, or coordinator status from the database.

After connecting the Admin Users page, a separate runtime issue became visible: a valid Admin login opened `AdminDashboard.jsx`, which still read `data.auditLogs` and `data.users`. Because `data` was undefined, React displayed a white screen. The dashboard was updated only to remove that stale dependency and allow the authenticated Admin to reach the application.

## Files Changed

### `frontend/src/pages/admin/AdminUsers.jsx`

- Removed the old mock-data assumptions.
- Loads directory data through `academicService.getAdminUserDirectory()`.
- Preserves the global search field and role filter.
- Displays separate Teams, Students, Faculty, and Admins sections.
- Adds expandable team rows with real student USNs and names.
- Displays real team subjects, guides, student counts, emails, and coordinator status.
- Handles loading, errors, empty results, and missing relationships without crashing.

### `frontend/src/services/academicService.js`

- Added `getAdminUserDirectory()` to read `users`, `student`, `faculty`, `admin`, `team`, and `subject`.
- Assembles existing database relationships in memory without changing the schema.
- Resolves student subjects from the student’s team and faculty subjects from the faculty member’s `subject_id`.
- Keeps Admin subject fields null.
- Fixed the subject expression precedence issue that could incorrectly discard a student team subject.
- Removed unused legacy normalized fields such as `department` and `designation`.
- Added `getAdminAuditLogs()` for the Admin Dashboard’s recent audit activity.

### `frontend/src/pages/admin/AdminDashboard.jsx`

- Replaced the stale `useAuth().data` dependency with service-loaded stats, users, and audit logs.
- Added a safe empty state for audit logs.
- This was an additional runtime compatibility fix because the old dashboard crashed after Admin authentication.

## Deliberately Unchanged

- No database schema or migration files were changed for the Admin Users implementation.
- No authentication or onboarding behavior was changed.
- No password, account deletion, role-management, or account-editing functionality was added.
- Existing mock data used by unrelated pages remains untouched.

## Verification

- `npm run build` from `frontend` completed successfully after the Admin Users and dashboard changes.
- VS Code diagnostics reported no errors in the changed JavaScript/JSX files.
- The Vite development server served `http://localhost:5173/` with HTTP status `200` after the fix.

The build emitted only the existing Vite bundle-size warning for a JavaScript chunk larger than 500 kB; it did not fail the build.

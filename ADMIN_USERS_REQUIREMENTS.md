# Admin Users Requirements

## 1. BRANCH SCOPE

Branch:
`feature/admin-users`

The branch is specifically for:

- Admin Users frontend work
- Supabase/database integration for the Admin Users page
- Replacing the existing mock user data in `AdminUsers.jsx` with real application data
- Making necessary UI changes to the Admin Users page so it correctly represents the real data

The branch is NOT for general Admin development.

The following are outside this branch:
- Admin Subjects
- Admin Logs
- Admin Status / overall status
- Admin Master Edit
- unrelated Student features
- unrelated Faculty features
- unrelated Coordinator features
- authentication implementation
- database schema redesign

No database schema changes are planned for this branch.

==================================================
2. CURRENT STATE
==================================================

The current `AdminUsers.jsx` is a mock/stale admin directory UI.

The current page contains:

A. Search and role filter

B. "System Managed Faculty Guides" card

C. "System Academic Batches" card

D. "All Registered Accounts Directory" table

The current implementation expects mock-style data such as:
- `data.users`
- `data.facultyGuides`
- `data.batches`

The current Admin Users page is NOT currently connected to Supabase/database data.

The existing project already has real Supabase-related authentication/profile and academic service functionality. The Admin Users implementation should reuse the existing application architecture where appropriate rather than rebuilding unrelated functionality.

==================================================
3. GOAL
==================================================

Replace the mock/stale data flow of the Admin Users page with real application data from the existing Supabase/database-backed data model.

The final page should allow the Admin to view:

- academic teams/batches
- students
- faculty
- coordinators
- admins

using real application data rather than mock data.

This branch does not implement onboarding. The page must consume the profile information already produced by the existing onboarding/application registration flow and display that data accurately.

The UI should be adjusted as necessary to represent the actual data clearly.

==================================================
4. AGREED ADMIN USERS PAGE STRUCTURE
==================================================

The Admin Users page should contain:

1. Search + role filter

2. System Academic Teams / Batches section

3. Students table

4. Faculty table

5. Admins table

There should NOT be a separate Faculty Guides section.

Faculty members should appear in the main Faculty table.

Coordinators should be highlighted within the Faculty table.

==================================================
5. SEARCH
==================================================

Keep a global search field.

The search should work against relevant real data.

For students, relevant searchable information includes:
- name
- USN
- email
- team/batch
- subject
- guide

For faculty:
- name
- email
- subject

For admins:
- name/identifier where available
- email

Search must operate on real application data after the mock data has been removed.

==================================================
6. ROLE FILTER
==================================================

Keep a role filter.

The filter should support:

- All Users
- Students
- Faculty
- Admins

When a specific role is selected, the corresponding user table should be shown.

When "All Users" is selected, the relevant Students, Faculty, and Admin tables should be shown.

Do not invent additional user roles.

Coordinator is a faculty designation/status, not a separate user entity.

==================================================
7. SYSTEM ACADEMIC TEAMS / BATCHES
==================================================

The existing "System Academic Batches" section should remain.

In this project, "batch" refers to the team number/team identifier.

Do NOT create a separate batch database entity or batch field merely for this page.

The section should represent the existing `team` records and their relationships.

The team section should display:

- Team / Batch number
- Subject
- Guide
- Number of students

Each team should be expandable.

When expanded, the Admin should be able to see the students belonging to that team, including:

- USN
- Name

The student information should come from the actual student/team relationship.

The existing mock "Semester" field should NOT be carried over unless a real approved data source/requirement exists for it.

Do not use hardcoded semester values.

Do not use mock team/batch status values.

For now, do not add a Status field unless a meaningful status can be derived from existing application data.

==================================================
8. STUDENTS TABLE
==================================================

Students should have their own dedicated table.

The student table should display:

- USN
- Name
- Email
- Team / Batch
- Subject
- Guide

These values should come from the actual application data and existing database relationships.

The expected relationship is conceptually:

student
→ team
→ subject

and

student
→ team
→ guide/faculty

Do not duplicate these relationships with unnecessary new database columns.

==================================================
9. FACULTY TABLE
==================================================

Faculty should have their own dedicated table.

The faculty table should display:

- Name
- Email
- Subject
- Coordinator status

A faculty member designated as a coordinator should be clearly highlighted in the UI.

For example, a coordinator may have a visible "COORDINATOR" badge/highlight.

Coordinator should NOT be represented as a separate user type/entity.

The coordinator status should come from the actual faculty/application data, not hardcoded values.

Faculty should appear in this table regardless of whether they are coordinators.

==================================================
10. ADMINS TABLE
==================================================

Admins should have their own dedicated table.

The Admin table should display:

- Name/identifier, where available
- Email
- Role

Do not invent additional Admin profile fields.

==================================================
11. AUTHENTICATION CONTEXT
==================================================

Users may authenticate through:

- Email + password
- Google

Authentication itself is NOT part of this branch.

This branch also does not implement onboarding. The Admin Users module only needs to consume the profile information already created by the existing onboarding/application-registration flow and the authenticated application's user/profile record, regardless of the authentication method used.

The authentication method should not cause otherwise valid users to be excluded from the Admin Users directory.

Do not redesign or modify the authentication system or onboarding flow as part of this branch.

==================================================
12. REAL DATA SOURCES
==================================================

Use the existing database/Supabase-backed application data.

The page must consume the application profile data that already exists from the onboarding/user-registration flow and the normal authenticated user records, not a separate mock or synthetic user model.

Relevant approved entities include:

- `users`
- `student`
- `faculty`
- `admin`
- `team`
- `subject`

Use the existing relationships between these entities.

Do not reproduce the old mock-data structure in the database.

Do not add database fields merely because they existed in mock data.

If the existing service layer needs a new read/query function to assemble the Admin Users directory, it is acceptable to add the necessary service/data-access functionality, but it must remain limited to the Admin Users requirement.

Prefer reuse of existing services and conventions.

For example, an appropriately named function such as:
`academicService.getAdminUserDirectory()`

may be introduced if necessary.

Do not assume this exact function name is mandatory.

==================================================
13. MOCK DATA REMOVAL
==================================================

The final implementation must no longer depend on the old mock user structures for the Admin Users page.

In particular, the Admin Users page should not depend on:

- `data.users`
- `data.facultyGuides`
- `data.batches`

as its source of truth.

Mock data may continue to exist elsewhere in the application if other features still use it, but the Admin Users page itself should use real application data.

==================================================
14. MISSING DATA
==================================================

The UI should handle missing/incomplete real data gracefully.

Examples:

- Student with no assigned guide → show an appropriate "Not assigned" or equivalent state
- Student with no team → show an appropriate missing-data state
- Faculty team information → do not display it because it does not apply
- Admin academic fields → do not display irrelevant fields

Do not crash the page because an optional relationship is missing.

Do not invent fake fallback values such as:
- fake subject names
- fake guide names
- fake teams
- fake semester values
- fake departments

==================================================
15. EDITING / ACCOUNT MANAGEMENT
==================================================

Admin editing permissions are NOT finalized yet.

The current mock "Edit Account" action only displays an alert and is not a real backend operation.

Do not implement real account editing, role changes, deletion, password changes, or other account-management operations as part of this requirements document/initial implementation unless separately approved.

For the initial Admin Users implementation, focus on accurate real-data display.

Editing functionality can be decided later.

==================================================
16. UI GUIDELINES
==================================================

Preserve the existing Admin Users page style where practical.

UI changes are allowed where needed to:

- remove mock-only fields
- remove the separate Faculty Guides card
- keep the Academic Teams/Batches section
- create separate Students, Faculty, and Admin tables
- highlight coordinators
- show team members through expandable team rows
- display real database-backed information
- keep search/filter functionality usable

Do not redesign the entire Admin interface.

Do not modify unrelated Admin pages.

==================================================
17. DATABASE CONSTRAINT
==================================================

No database schema changes are planned for this branch.

Do not:

- add a batch column
- create a separate batch entity
- add mock-only user fields
- redesign existing relationships
- create unrelated migrations

Batch/team information should use the existing team representation.

If implementation reveals a genuine requirement that cannot be represented by the current schema, document the issue rather than silently changing the schema.

==================================================
18. OUT OF SCOPE
==================================================

The following are explicitly outside this branch:

- Admin Subjects module
- Admin Logs module
- Admin Status / overall status module
- Admin Master Edit module
- authentication implementation
- Google authentication implementation
- email/password authentication implementation
- onboarding implementation
- database schema redesign
- unrelated Student UI/functionality
- unrelated Faculty UI/functionality
- unrelated Coordinator UI/functionality
- real account editing/permission management
- password management
- user deletion
- unrelated UI redesign

The branch should remain focused on:

Admin Users frontend + Supabase/database integration.

==================================================
19. TESTING REQUIREMENTS
==================================================

The implementation should be tested using real application/Supabase data.

Verify:

- Students appear correctly
- Faculty appear correctly
- Coordinators are correctly identified/highlighted
- Admins appear correctly
- Student team relationships are correct
- Student subject information is correct
- Student guide information is correct
- Academic Teams/Batches show the correct teams
- Expanding a team shows the correct USNs and names
- Search works against real data
- Role filtering works
- Missing relationships do not crash the page
- No mock user data is required for the Admin Users page
- No hardcoded fake academic values are displayed

==================================================
20. DEFINITION OF DONE
==================================================

The Admin Users branch is considered complete when:

- [x] Admin Users no longer depends on mock user data
- [x] Real Supabase/database-backed data is displayed
- [x] Academic Teams/Batches section uses real team data
- [x] Team expansion shows real student USNs and names
- [x] Students have a dedicated table
- [x] Faculty have a dedicated table
- [x] Admins have a dedicated table
- [x] Coordinators are highlighted within the Faculty table
- [x] Search works with real data
- [x] Role filtering works with real data
- [x] Missing relationships are handled gracefully
- [x] No unnecessary database schema changes are introduced
- [x] No authentication implementation is added
- [ ] No unrelated Admin modules are modified
- [x] Editing/account-management functionality remains deferred
- [x] The implementation follows existing project service/data-access conventions
- [x] The feature is tested against real application data
- [x] All changes remain on `feature/admin-users`

Implementation note: `AdminDashboard.jsx` was also updated to remove a stale mock-data dependency that caused a white screen immediately after a valid Admin login. This was a runtime compatibility fix required to reach the Admin Users page, but it is outside the original Admin Users-only file scope.

==================================================
21. IMPLEMENTATION BOUNDARY
==================================================

Before making any implementation changes, inspect the current repository and existing service architecture.

Do not assume the old mock data structure is the correct data model.

The implementation should adapt the Admin Users frontend to the actual application/database structure.

Do not expand the scope beyond the requirements in this document.

END OF REQUIREMENTS

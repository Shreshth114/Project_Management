# PROJECT HANDOFF

## 1. FRONTEND STRUCTURE
*   **Framework & Version:** React 19 (via Vite)
*   **Build Tool:** Vite 8.2.2
*   **Folder/File Structure:** 
    *   `frontend/src/assets/`: Static assets (images, icons)
    *   `frontend/src/components/`: Reusable UI components
        *   `common/`: Generic UI elements (Card, Badge, Header, Sidebar, Modal, MobileDrawer, RoleSelectionModal)
        *   `layout/`: `DashboardLayout.jsx` handling role-based view rendering
        *   `student/`: Student-specific complex components (`GroupSubmissionManagement.jsx`)
    *   `frontend/src/context/`: Context providers (`AuthContext.jsx`)
    *   `frontend/src/data/`: Mock data (`mockData.js`)
    *   `frontend/src/lib/`: Library configurations (`supabase.js`)
    *   `frontend/src/pages/`: Page views organized by role (`admin`, `auth`, `coordinator`, `faculty`, `student`)
    *   `frontend/src/App.jsx`: Root component handling auth view switching
    *   `frontend/src/main.jsx`: React DOM entry point
*   **Important Components:** `DashboardLayout` (handles all routing logic), `AuthContext` (manages global state)
*   **Routes/Layouts:** The app uses conditional rendering instead of a routing library (like React Router). State variables `currentRole` and `activeTab` determine which page component to display within the `DashboardLayout`.
*   **Styling Approach:** Custom Vanilla CSS (`index.css`, `App.css`) providing a unified design system. No Tailwind or heavy UI frameworks. Icons are provided by `lucide-react`.

## 2. CURRENTLY IMPLEMENTED FEATURES
*Note: All current features are implemented purely in the UI using mock in-memory state. They do not yet persist to a real backend.*
*   **Authentication (Mock):** 
    *   *Roles:* All Users
    *   *Details:* Users can log in using presets from `mockData.js`. UI handles role routing based on the mock user object.
*   **Student Submissions (Mock):** 
    *   *Roles:* Student
    *   *Details:* View assigned components, handle Mode A (Leader submits all) or Mode B (Distributed), simulate file/link upload.
*   **Faculty Evaluation (Mock):**
    *   *Roles:* Faculty
    *   *Details:* Select a group and task, view submissions, evaluate individual students using a rubric form (calculating out of 50 marks).
*   **Coordinator Tasks (Mock):**
    *   *Roles:* Coordinator
    *   *Details:* Create milestone tasks for projects.
*   **Dashboards & Messaging (Mock):**
    *   *Roles:* All
    *   *Details:* View statistics, read/send messages, view system logs.

## 3. USER ROLES
*   **Student:** Can view their dashboard, assigned tasks, upload project submissions, view status, send messages, and edit their profile.
*   **Faculty:** Can view their dashboard, guide assigned teams, review team submissions, conduct individual evaluations using rubrics, and send messages.
*   **Coordinator:** Can create milestone tasks, manage groups globally, view system-wide status, and send messages. (Faculty can hold this dual role and switch between them via `RoleSelectionModal`).
*   **Admin:** Has master edit capabilities, manages subjects, manages users, and reviews audit logs.

## 4. SUPABASE INTEGRATION
*   **Configuration:** Configured via Vite environment variables: `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`.
*   **Client Location:** `frontend/src/lib/supabase.js`.
*   **Frontend Communication:** The client is initialized and exported, but it is **not yet used** by any application components or contexts.
*   **Existing Queries:** Only a single test function `verifySupabaseConnection()` exists to test reading from the `users` table. No actual application queries, inserts, updates, or deletes exist yet.
*   **Authentication/RLS:** Not yet implemented in the codebase.

## 5. DATABASE USAGE
Based on the existing Supabase schema (`admin`, `audit_log`, `evaluation`, `evaluation_criteria`, `faculty`, `message`, `notification`, `student`, `subject`, `submission`, `task`, `team`, `users`) and the current frontend code:
*   **Current Usage:** The frontend currently uses **0%** of these tables for actual feature logic. Everything relies on `mockData.js`.
*   **Intended Flow (Pending Implementation):**
    *   Login will query/auth against `users`, which links 1:1 with `student`, `faculty`, or `admin`.
    *   Coordinator tasks will insert into `task`.
    *   Student uploads will insert into `submission` (referencing `task` and `team`).
    *   Faculty grading will insert into `evaluation` (referencing `submission`, `student`, and `evaluator`).

## 6. ROUTES AND NAVIGATION
Because no routing library is used, "routes" are simulated via the `activeTab` state in `AuthContext`:
*   **Auth Pages:** `login`, `register` (Accessible to unauthenticated users).
*   **Student Tabs:** `dashboard`, `tasks`, `submissions`, `status`, `messages`, `profile`.
*   **Faculty Tabs:** `dashboard`, `groups`, `submissions`, `evaluation`, `status`, `messages`, `profile`.
*   **Coordinator Tabs:** `dashboard`, `tasks`, `create-task`, `groups`, `status`, `messages`, `profile`.
*   **Admin Tabs:** `dashboard`, `subjects`, `users`, `status`, `logs`, `master-edit`, `profile`.
*   **Navigation:** Handled by clicking items in `Sidebar.jsx`, which calls `setActiveTab(tabName)`.

## 7. AUTHENTICATION & AUTHORIZATION
*   **Login Flow:** User enters credentials -> `AuthContext` searches `mockData.js` -> Sets `currentUser` and `currentRole` in React state.
*   **Registration Flow:** UI exists, but does not persist data.
*   **Session Handling:** Managed purely in React memory (`useState`). **Refreshing the page logs the user out.**
*   **Role Detection:** Based on `currentUser.role`. Switching roles (e.g., Faculty to Coordinator) updates `currentRole` state.
*   **Protected Routes:** `App.jsx` returns the `<Login />` component if `!currentUser` is true.

## 8. CURRENT PROJECT STATUS
*   **COMPLETED:** 
    *   UI/UX Design, CSS, and Layouts.
    *   Role-based dashboards and conditional rendering logic.
    *   Submission and Evaluation form UIs.
    *   Supabase client initialization (`supabase.js`).
*   **PARTIALLY IMPLEMENTED:** 
    *   State management (currently works flawlessly for demos using mock data, but needs to be rewritten to use Supabase).
*   **NOT IMPLEMENTED:** 
    *   Real Supabase Auth (Sign in/Sign out).
    *   Real Database CRUD operations.
    *   File storage (simulated in UI).
    *   Session persistence (cookies/local storage).
*   **KNOWN BUGS/ISSUES:** 
    *   Refreshing the page destroys the session.
    *   Uploaded files are not actually stored anywhere.

## 9. IMPORTANT FILE MAP

| File/Folder | Purpose | Important? |
|-------------|---------|------------|
| `frontend/src/App.jsx` | Root entry, handles auth protection and view switching | Yes |
| `frontend/src/context/AuthContext.jsx` | Core state container. Currently holds mock logic to be replaced by Supabase | **CRITICAL** |
| `frontend/src/data/mockData.js` | Contains all current mock data | Yes (for reference) |
| `frontend/src/lib/supabase.js` | The Supabase client connection | Yes |
| `frontend/src/components/layout/DashboardLayout.jsx` | Determines which page component renders based on role and tab | Yes |
| `frontend/src/pages/student/StudentSubmissions.jsx` | Complex logic for handling group submissions (Mode A/B) | Yes |
| `frontend/src/pages/faculty/FacultyEvaluation.jsx` | Complex form for evaluating students individually on group tasks | Yes |
| `frontend/src/index.css` | Global styles, CSS variables, and core classes | No (unless styling) |

## 10. PENDING / NEXT WORK
To transition this app to a production-ready state against the existing Supabase database:
1.  **Authentication:** Replace the `login` function in `AuthContext.jsx` with `supabase.auth.signInWithPassword()`. Implement session persistence on page load.
2.  **Data Fetching:** Replace `initialCollegeData` with `useEffect` hooks that fetch the current user's role data, team data, and tasks from the Supabase tables.
3.  **CRUD Operations:** 
    *   Update `submitGroupComponent` to insert records into the `submission` table and optionally upload files to Supabase Storage.
    *   Update `saveIndividualStudentEvaluation` to insert records into the `evaluation` table.
    *   Update `addTask` to insert into the `task` table.

## 11. ARCHITECTURE SUMMARY
Currently: 
**User -> React UI -> AuthContext (Local Memory) -> mockData.js**

Target (Next Steps):
**User -> React UI -> AuthContext / React Hooks -> Supabase Client (`supabase.js`) -> Real PostgreSQL Database**

The UI is highly developed and robust, but the application logic acts as a "hollow shell" demonstrating the flows. The primary task moving forward is systematically replacing local state updates in `AuthContext` (and page components) with async calls to the Supabase database, strictly mapping the UI's data structures to the existing database schema.

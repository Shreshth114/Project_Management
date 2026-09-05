import { supabase } from './src/lib/supabase.js';
import { authService } from './src/services/authService.js';
import { academicService } from './src/services/academicService.js';
import { taskService } from './src/services/taskService.js';
import { submissionService } from './src/services/submissionService.js';
import { evaluationService } from './src/services/evaluationService.js';
import { messageService } from './src/services/messageService.js';
import { teamService } from './src/services/teamService.js';

const TEST_ACCOUNTS = [
  { email: 'admin_test@msrit.edu', pass: 'Password123!' },
  { email: 'coord_test@msrit.edu', pass: 'Password123!' },
  { email: 'faculty_test@msrit.edu', pass: 'Password123!' },
  { email: 'student1@msrit.edu', pass: 'Password123!' },
  { email: 'student2@msrit.edu', pass: 'Password123!' }
];

async function runTests() {
  console.log("=== PHASE 2: SUPABASE CONNECTION & TABLES ===");
  const tables = ['users', 'student', 'faculty', 'admin', 'subject', 'team', 'task', 'evaluation_criteria', 'submission', 'evaluation', 'message', 'notification', 'audit_log'];
  for (const table of tables) {
    const { data, error } = await supabase.from(table).select('*').limit(1);
    if (error) {
      console.log(`${table} | FAIL | ${error.message}`);
    } else {
      console.log(`${table} | SUCCESS | ${data.length} rows (anon)`);
    }
  }

  console.log("\n=== PHASE 3 & 13: AUTH & PERMISSIONS ===");
  for (const account of TEST_ACCOUNTS) {
    console.log(`\nTesting account: ${account.email}`);
    try {
      const loginRes = await authService.login(account.email, account.pass);
      const session = await supabase.auth.getSession();
      console.log(`- Login: SUCCESS (Session: ${!!session.data.session})`);
      console.log(`- Email Confirmed: ${session.data.session?.user?.email_confirmed_at ? 'YES' : 'NO'}`);
      
      const profile = await authService.getUserProfile(account.email);
      console.log(`- Profile Resolved: SUCCESS`);
      console.log(`- Role: ${profile.role}`);
      console.log(`- User ID: ${profile.user_id}`);
      
      // Phase 13 Check permissions
      console.log("- Permission Check:");
      for (const table of ['users', 'subject', 'team']) {
        const { error } = await supabase.from(table).select('*').limit(1);
        console.log(`  Read ${table}: ${error ? 'FAIL (' + error.message + ')' : 'SUCCESS'}`);
      }
      
      await authService.logout();
    } catch (e) {
      console.log(`- Login/Profile FAIL: ${e.message}`);
    }
  }

  console.log("\n=== PHASE 5: SERVICES ===");
  try {
    await authService.login('admin_test@msrit.edu', 'Password123!');
    console.log("AuthService getProfile():", (await authService.getUserProfile('admin_test@msrit.edu')).role);
    console.log("AcademicService getSubjects():", (await academicService.getSubjects()).length, "subjects found.");
    console.log("AcademicService getTeams():", (await academicService.getTeams()).length, "teams found.");
    
    await authService.login('student1@msrit.edu', 'Password123!');
    const prof = await authService.getUserProfile('student1@msrit.edu');
    console.log("TaskService getTasks():", (await taskService.getTasks()).length, "tasks found.");
    const team = await academicService.getTeamByStudent(prof.student_id);
    console.log("Team fetched for student1:", team ? team.team_code : 'None');
    
    if (team) {
      console.log("SubmissionService getSubmissionsByTeam():", (await submissionService.getSubmissionsByTeam(team.team_id)).length);
    }
    
    console.log("MessageService getMessagesForUser():", (await messageService.getMessagesForUser(prof.user_id)).length);
    
  } catch(e) {
    console.log("Service test failed:", e.message);
  }
}

runTests().then(() => process.exit(0)).catch(e => { console.error(e); process.exit(1); });

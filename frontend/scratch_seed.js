import { createClient } from '@supabase/supabase-js';

const VITE_SUPABASE_URL = 'https://wknameikfdkgobqmswrl.supabase.co';
const VITE_SUPABASE_ANON_KEY = 'sb_publishable_X6tmBSZqkV-Qhth6nwOZWg_LiTva1p4';

const supabase = createClient(VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY);

async function seedData() {
  console.log("Creating Admin Test User...");
  const adminRes = await supabase.auth.signUp({
    email: 'admin_test@msrit.edu',
    password: 'Password123!'
  });
  
  if (adminRes.error) {
    console.error("SignUp Error:", adminRes.error);
  }
  
  // Create application records for admin
  let res = await supabase.from('users').insert({
    email: 'admin_test@msrit.edu',
    password_hash: 'managed_by_supabase_auth',
    role: 'ADMIN'
  }).select();
  const adminId = res.data?.[0]?.user_id;
  console.log("Admin User ID:", adminId);

  res = await supabase.from('admin').insert({
    user_id: adminId
  });
  console.log("Admin insert:", res.error || "Success");
  
  // 1. Create a subject
  res = await supabase.from('subject').insert({
    subject_code: '21CSP81',
    subject_name: 'Project Phase II (TEST DATA)'
  }).select();
  const subjectId = res.data?.[0]?.subject_id;
  console.log("Subject Created:", subjectId);

  // 2. Create Coordinator
  const coordRes = await supabase.auth.signUp({
    email: 'coord_test@msrit.edu',
    password: 'Password123!'
  });
  res = await supabase.from('users').insert({
    email: 'coord_test@msrit.edu',
    password_hash: 'managed_by_supabase_auth',
    role: 'FACULTY'
  }).select();
  const coordUserId = res.data?.[0]?.user_id;

  res = await supabase.from('faculty').insert({
    user_id: coordUserId,
    subject_id: subjectId,
    name: '[TEST] Dr. Coordinator',
    is_coordinator: true
  }).select();
  const coordId = res.data?.[0]?.faculty_id;
  console.log("Coordinator Created:", coordId);

  // 3. Create Faculty
  const facRes = await supabase.auth.signUp({
    email: 'faculty_test@msrit.edu',
    password: 'Password123!'
  });
  res = await supabase.from('users').insert({
    email: 'faculty_test@msrit.edu',
    password_hash: 'managed_by_supabase_auth',
    role: 'FACULTY'
  }).select();
  const facUserId = res.data?.[0]?.user_id;

  res = await supabase.from('faculty').insert({
    user_id: facUserId,
    subject_id: subjectId,
    name: '[TEST] Prof. Guide',
    is_coordinator: false
  }).select();
  const facId = res.data?.[0]?.faculty_id;
  console.log("Faculty Created:", facId);

  // 4. Create Team
  res = await supabase.from('team').insert({
    team_code: 'B1-TEST',
    subject_id: subjectId,
    guide_id: facId
  }).select();
  const teamId = res.data?.[0]?.team_id;
  console.log("Team Created:", teamId);

  // 5. Create Students
  const s1Res = await supabase.auth.signUp({
    email: 'student1@msrit.edu',
    password: 'Password123!'
  });
  res = await supabase.from('users').insert({
    email: 'student1@msrit.edu',
    password_hash: 'managed_by_supabase_auth',
    role: 'STUDENT'
  }).select();
  const s1UserId = res.data?.[0]?.user_id;

  res = await supabase.from('student').insert({
    user_id: s1UserId,
    team_id: teamId,
    usn: 'TEST001',
    name: '[TEST] Student 1'
  }).select();
  const s1Id = res.data?.[0]?.student_id;

  const s2Res = await supabase.auth.signUp({
    email: 'student2@msrit.edu',
    password: 'Password123!'
  });
  res = await supabase.from('users').insert({
    email: 'student2@msrit.edu',
    password_hash: 'managed_by_supabase_auth',
    role: 'STUDENT'
  }).select();
  const s2UserId = res.data?.[0]?.user_id;

  res = await supabase.from('student').insert({
    user_id: s2UserId,
    team_id: teamId,
    usn: 'TEST002',
    name: '[TEST] Student 2'
  }).select();
  const s2Id = res.data?.[0]?.student_id;
  console.log("Students Created:", s1Id, s2Id);

  // 6. Create Task
  res = await supabase.from('task').insert({
    faculty_id: coordId,
    title: '[TEST] Phase 2 Architecture Report',
    description: 'Detailed system architecture diagram',
    task_type: 'GROUP',
    deadline: new Date(Date.now() + 86400000 * 7).toISOString() // 7 days from now
  }).select();
  const taskId = res.data?.[0]?.task_id;
  console.log("Task Created:", taskId);

  // 7. Create Evaluation Criteria
  res = await supabase.from('evaluation_criteria').insert({
    task_id: taskId,
    criteria_name: '[TEST] System Architecture Clarity',
    max_marks: 20
  }).select();
  const criteriaId = res.data?.[0]?.criteria_id;
  console.log("Criteria Created:", criteriaId);

  // 8. Create Submission
  res = await supabase.from('submission').insert({
    task_id: taskId,
    submitted_by_student_id: s1Id,
    team_id: teamId,
    file_name: 'test_architecture.pdf',
    file_type: 'PDF',
    file_url: 'https://example.com/arch.pdf'
  }).select();
  const subId = res.data?.[0]?.submission_id;
  console.log("Submission Created:", subId);

  // 9. Create Evaluation
  res = await supabase.from('evaluation').insert({
    submission_id: subId,
    student_id: s1Id,
    criteria_id: criteriaId,
    evaluator_id: facId,
    awarded_marks: 18,
    feedback: '[TEST] Good architecture diagram.'
  });
  console.log("Evaluation 1 Created:", res.error || "Success");

  res = await supabase.from('evaluation').insert({
    submission_id: subId,
    student_id: s2Id,
    criteria_id: criteriaId,
    evaluator_id: facId,
    awarded_marks: 17,
    feedback: '[TEST] Good contribution.'
  });
  console.log("Evaluation 2 Created:", res.error || "Success");

  // 10. Create Message
  res = await supabase.from('message').insert({
    sender_id: s1UserId,
    receiver_id: facUserId,
    message_text: '[TEST] Sir, we have submitted the architecture report.',
    is_read: false
  });
  console.log("Message Created:", res.error || "Success");

  // 11. Create Notification
  res = await supabase.from('notification').insert({
    user_id: s1UserId,
    title: '[TEST] Submission Received',
    message: 'Your submission for Phase 2 Architecture Report was received.',
    is_read: false
  });
  console.log("Notification Created:", res.error || "Success");

  // 12. Create Audit Log
  res = await supabase.from('audit_log').insert({
    user_id: coordUserId,
    action: 'CREATE_TASK',
    entity_type: 'TASK',
    entity_id: taskId,
    details: '[TEST] Created Phase 2 Architecture Report task'
  });
  console.log("Audit Log Created:", res.error || "Success");

  console.log("ALL DATA SEEDED SUCCESSFULLY!");
}

seedData();

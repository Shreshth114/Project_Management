// Complete Realistic Mock Data for Engineering College Final Year Project Management Portal

export const initialCollegeData = {
  collegeName: "M. S. Ramaiah Institute of Technology",
  department: "Department of Computer Science & Engineering",
  academicYear: "2025–2026",

  // 1. System Managed Subjects
  subjects: [
    { code: "21CSP81", name: "Major Project Phase - II", credits: 6, semester: 8, totalGroups: 36, status: "Active" },
    { code: "21CSP71", name: "Major Project Phase - I", credits: 2, semester: 7, totalGroups: 36, status: "Completed" },
    { code: "21CSS82", name: "Technical Seminar & Paper", credits: 1, semester: 8, totalGroups: 144, status: "Active" }
  ],

  // 2. System Managed Batches
  batches: [
    { id: "batch-2025", title: "2021–2025 (8th Sem)", status: "Active" },
    { id: "batch-2026", title: "2022–2026 (6th Sem)", status: "Upcoming" }
  ],

  // 3. System Managed Guides (Faculty)
  facultyGuides: [
    { id: "g-sharma", name: "Dr. R. Sharma", email: "dr.sharma@msrit.edu", designation: "Professor", department: "CSE" },
    { id: "g-kulkarni", name: "Prof. V. Kulkarni", email: "prof.kulkarni@msrit.edu", designation: "Associate Professor", department: "CSE" },
    { id: "g-anita", name: "Dr. Anita M.", email: "anita.m@msrit.edu", designation: "Professor", department: "CSE" }
  ],

  // 4. System Users Roster
  users: [
    // Group G01 Members (Mode A: Leader Submits All)
    {
      id: "u-student-1",
      username: "1MS21CS042",
      email: "rahul.sharma@msrit.edu",
      name: "Rahul Sharma",
      role: "STUDENT",
      usn: "1MS21CS042",
      subject: "21CSP81",
      batch: "2021–2025 (8th Sem)",
      guideName: "Dr. R. Sharma",
      groupId: "G01",
      isGroupLeader: true,
      phone: "+91 98450 12345"
    },
    {
      id: "u-student-2",
      username: "1MS21CS015",
      email: "ananya.h@msrit.edu",
      name: "Ananya Hegde",
      role: "STUDENT",
      usn: "1MS21CS015",
      subject: "21CSP81",
      batch: "2021–2025 (8th Sem)",
      guideName: "Dr. R. Sharma",
      groupId: "G01",
      isGroupLeader: false,
      phone: "+91 98450 54321"
    },
    {
      id: "u-student-3",
      username: "1MS21CS062",
      email: "karthik.r@msrit.edu",
      name: "Karthik Raja",
      role: "STUDENT",
      usn: "1MS21CS062",
      subject: "21CSP81",
      batch: "2021–2025 (8th Sem)",
      guideName: "Dr. R. Sharma",
      groupId: "G01",
      isGroupLeader: false,
      phone: "+91 98450 67890"
    },
    {
      id: "u-student-4",
      username: "1MS21CS099",
      email: "priya.v@msrit.edu",
      name: "Priya V",
      role: "STUDENT",
      usn: "1MS21CS099",
      subject: "21CSP81",
      batch: "2021–2025 (8th Sem)",
      guideName: "Dr. R. Sharma",
      groupId: "G01",
      isGroupLeader: false,
      phone: "+91 98450 99999"
    },

    // Group G02 Members (Mode B: Distributed Group Submission)
    {
      id: "u-student-5",
      username: "1MS21CS134",
      email: "vikram.r@msrit.edu",
      name: "Vikram R",
      role: "STUDENT",
      usn: "1MS21CS134",
      subject: "21CSP81",
      batch: "2021–2025 (8th Sem)",
      guideName: "Prof. V. Kulkarni",
      groupId: "G02",
      isGroupLeader: true,
      phone: "+91 98450 11111"
    },
    {
      id: "u-student-6",
      username: "1MS21CS078",
      email: "neha.p@msrit.edu",
      name: "Neha Patil",
      role: "STUDENT",
      usn: "1MS21CS078",
      subject: "21CSP81",
      batch: "2021–2025 (8th Sem)",
      guideName: "Prof. V. Kulkarni",
      groupId: "G02",
      isGroupLeader: false,
      phone: "+91 98450 22222"
    },
    {
      id: "u-student-7",
      username: "1MS21CS112",
      email: "suresh.b@msrit.edu",
      name: "Suresh B",
      role: "STUDENT",
      usn: "1MS21CS112",
      subject: "21CSP81",
      batch: "2021–2025 (8th Sem)",
      guideName: "Prof. V. Kulkarni",
      groupId: "G02",
      isGroupLeader: false,
      phone: "+91 98450 33333"
    },

    // Faculty & Coordinator Users
    {
      id: "u-teacher-1",
      username: "dr.sharma",
      email: "dr.sharma@msrit.edu",
      name: "Dr. R. Sharma",
      role: "TEACHER",
      teacherRoles: ["FACULTY", "COORDINATOR"],
      designation: "Professor & Project Coordinator",
      department: "CSE"
    },
    {
      id: "u-teacher-2",
      username: "prof.kulkarni",
      email: "prof.kulkarni@msrit.edu",
      name: "Prof. V. Kulkarni",
      role: "TEACHER",
      teacherRoles: ["FACULTY"],
      designation: "Associate Professor",
      department: "CSE"
    },
    {
      id: "u-admin-1",
      username: "admin.academic",
      email: "admin@msrit.edu",
      name: "Academic Admin Office",
      role: "ADMIN",
      designation: "Head of Academic Governance"
    }
  ],

  // 5. Group Projects Roster
  groups: [
    {
      id: "G01",
      groupCode: "Group G01",
      title: "Smart Campus Management System & Edge AI Cardiac Detection",
      domain: "Artificial Intelligence & Embedded Systems",
      leaderUsn: "1MS21CS042",
      leaderName: "Rahul Sharma",
      guide: "Dr. R. Sharma",
      subject: "21CSP81",
      batch: "2021–2025 (8th Sem)",
      members: [
        { usn: "1MS21CS042", name: "Rahul Sharma", email: "rahul.sharma@msrit.edu", role: "Team Lead" },
        { usn: "1MS21CS015", name: "Ananya Hegde", email: "ananya.h@msrit.edu", role: "ML Engineer" },
        { usn: "1MS21CS062", name: "Karthik Raja", email: "karthik.r@msrit.edu", role: "Embedded Specialist" },
        { usn: "1MS21CS099", name: "Priya V", email: "priya.v@msrit.edu", role: "Documentation Lead" }
      ],
      // Submission Mode A: Leader Submits All
      submissionMode: "LEADER_SUBMITS_ALL",
      overallProgress: 90,
      repoUrl: "https://github.com/msrit-cse-g01/smart-campus-edge-ai",
      
      // Components of ONE Combined Group Project
      components: {
        finalReport: {
          key: "finalReport",
          title: "Final Project Report (PDF)",
          status: "COMPLETED", // COMPLETED | PENDING
          submittedByNames: ["Rahul Sharma"],
          submittedByUsns: ["1MS21CS042"],
          fileName: "G01_Final_Report_IEEE.pdf",
          fileSize: "4.8 MB",
          submittedAt: "2025-10-08 14:20"
        },
        sourceCode: {
          key: "sourceCode",
          title: "Source Code & Models (ZIP)",
          status: "COMPLETED",
          submittedByNames: ["Rahul Sharma"],
          submittedByUsns: ["1MS21CS042"],
          fileName: "G01_Edge_AI_Source_v2.zip",
          fileSize: "18.5 MB",
          submittedAt: "2025-10-08 14:25"
        },
        researchPaper: {
          key: "researchPaper",
          title: "Research Paper Draft",
          status: "COMPLETED",
          submittedByNames: ["Rahul Sharma"],
          submittedByUsns: ["1MS21CS042"],
          fileName: "G01_IEEE_Transactions_Paper.pdf",
          fileSize: "2.1 MB",
          submittedAt: "2025-10-08 14:30"
        },
        ppt: {
          key: "ppt",
          title: "Defense Presentation (PPT)",
          status: "COMPLETED",
          submittedByNames: ["Rahul Sharma"],
          submittedByUsns: ["1MS21CS042"],
          fileName: "G01_Viva_Presentation_Slides.pptx",
          fileSize: "8.2 MB",
          submittedAt: "2025-10-08 14:32"
        },
        demoVideo: {
          key: "demoVideo",
          title: "Demo Video / Prototype",
          status: "COMPLETED",
          submittedByNames: ["Rahul Sharma"],
          submittedByUsns: ["1MS21CS042"],
          fileName: "G01_Hardware_Demo.mp4",
          fileSize: "42.0 MB",
          submittedAt: "2025-10-08 14:40"
        },
        deploymentLink: {
          key: "deploymentLink",
          title: "Live Deployment Link",
          status: "COMPLETED",
          submittedByNames: ["Rahul Sharma"],
          submittedByUsns: ["1MS21CS042"],
          url: "https://edge-cardiac-ai.msrit-cse.edu",
          submittedAt: "2025-10-08 14:42"
        }
      }
    },
    {
      id: "G02",
      groupCode: "Group G02",
      title: "Blockchain-Based Decentralized Land Registry Verification System",
      domain: "Cybersecurity & Blockchain",
      leaderUsn: "1MS21CS134",
      leaderName: "Vikram R",
      guide: "Prof. V. Kulkarni",
      subject: "21CSP81",
      batch: "2021–2025 (8th Sem)",
      members: [
        { usn: "1MS21CS134", name: "Vikram R", email: "vikram.r@msrit.edu", role: "Team Lead" },
        { usn: "1MS21CS078", name: "Neha Patil", email: "neha.p@msrit.edu", role: "Smart Contract Dev" },
        { usn: "1MS21CS112", name: "Suresh B", email: "suresh.b@msrit.edu", role: "Backend Architect" }
      ],
      // Submission Mode B: Distributed Member Submissions
      submissionMode: "MEMBERS_SUBMIT_ASSIGNED",
      overallProgress: 65,
      repoUrl: "https://github.com/msrit-cse-g02/land-registry",

      // Distributed Components of ONE Combined Group Project
      components: {
        finalReport: {
          key: "finalReport",
          title: "Final Project Report (PDF)",
          assignedUsns: ["1MS21CS134"], // Vikram R
          assignedNames: ["Vikram R"],
          status: "COMPLETED",
          submittedByNames: ["Vikram R"],
          submittedByUsns: ["1MS21CS134"],
          fileName: "G02_LandRegistry_Report.pdf",
          fileSize: "5.2 MB",
          submittedAt: "2025-10-07 10:15"
        },
        sourceCode: {
          key: "sourceCode",
          title: "Source Code & Smart Contracts (ZIP)",
          assignedUsns: ["1MS21CS078", "1MS21CS112"], // Neha Patil + Suresh B (Multi-responsible students)
          assignedNames: ["Neha Patil", "Suresh B"],
          status: "COMPLETED",
          submittedByNames: ["Neha Patil", "Suresh B"],
          submittedByUsns: ["1MS21CS078", "1MS21CS112"],
          fileName: "G02_Solidity_Contracts.zip",
          fileSize: "12.4 MB",
          submittedAt: "2025-10-07 11:30"
        },
        researchPaper: {
          key: "researchPaper",
          title: "Research Paper Draft",
          assignedUsns: ["1MS21CS112"], // Suresh B
          assignedNames: ["Suresh B"],
          status: "PENDING",
          submittedByNames: [],
          submittedByUsns: []
        },
        ppt: {
          key: "ppt",
          title: "Defense Presentation (PPT)",
          assignedUsns: ["1MS21CS134"], // Vikram R
          assignedNames: ["Vikram R"],
          status: "COMPLETED",
          submittedByNames: ["Vikram R"],
          submittedByUsns: ["1MS21CS134"],
          fileName: "G02_Blockchain_Presentation.pptx",
          fileSize: "6.7 MB",
          submittedAt: "2025-10-07 12:00"
        },
        demoVideo: {
          key: "demoVideo",
          title: "Demo Video / Prototype",
          assignedUsns: ["1MS21CS078", "1MS21CS134"], // Neha Patil + Vikram R
          assignedNames: ["Neha Patil", "Vikram R"],
          status: "PENDING",
          submittedByNames: [],
          submittedByUsns: []
        },
        deploymentLink: {
          key: "deploymentLink",
          title: "Live Polygon Testnet Link",
          assignedUsns: ["1MS21CS078"], // Neha Patil
          assignedNames: ["Neha Patil"],
          status: "COMPLETED",
          submittedByNames: ["Neha Patil"],
          submittedByUsns: ["1MS21CS078"],
          url: "https://mumbai.polygonscan.com/address/0x71C...",
          submittedAt: "2025-10-07 11:45"
        }
      }
    }
  ],

  // 6. Coordinator Defined Tasks
  tasks: [
    {
      id: "tsk-ind-01",
      title: "Individual Task: Literature Review & Paper Synthesis",
      taskType: "INDIVIDUAL", // INDIVIDUAL task
      phase: "Phase 1",
      totalMarks: 20,
      deadline: "2025-09-20",
      status: "COMPLETED",
      description: "Each student independently submits their survey of 5 IEEE papers related to their project domain.",
      rubricCriteria: [
        { title: "Literature Coverage", max: 10 },
        { title: "Critical Analysis", max: 10 }
      ]
    },
    {
      id: "tsk-grp-01",
      title: "Group Task: Final Project Submission & Viva Voce",
      taskType: "GROUP", // GROUP task
      phase: "Phase 2",
      totalMarks: 50,
      deadline: "2025-10-15",
      status: "IN_PROGRESS",
      allowedMode: "BOTH",
      description: "Complete submission of Group Project components (Report, Source Code, Paper, PPT, Video, Link). Faculty evaluates every student individually.",
      rubricCriteria: [
        { title: "Technical Implementation", max: 15 },
        { title: "Project Understanding", max: 10 },
        { title: "Individual Contribution", max: 10 },
        { title: "Documentation", max: 5 },
        { title: "Presentation", max: 5 },
        { title: "Viva Voce", max: 5 }
      ]
    }
  ],

  // 7. Individual Student Submissions for Individual Tasks
  individualSubmissions: [
    {
      id: "ind-sub-01",
      taskId: "tsk-ind-01",
      taskTitle: "Individual Task: Literature Review & Paper Synthesis",
      studentUsn: "1MS21CS042",
      studentName: "Rahul Sharma",
      fileName: "Rahul_Literature_Review.pdf",
      fileSize: "2.4 MB",
      submittedAt: "2025-09-18 10:30",
      status: "COMPLETED",
      marksAwarded: 18,
      totalMarks: 20,
      feedback: "Thorough analysis of cardiac ECG signal processing models."
    },
    {
      id: "ind-sub-02",
      taskId: "tsk-ind-01",
      taskTitle: "Individual Task: Literature Review & Paper Synthesis",
      studentUsn: "1MS21CS015",
      studentName: "Ananya Hegde",
      fileName: "Ananya_Literature_Review.pdf",
      fileSize: "1.9 MB",
      submittedAt: "2025-09-19 14:15",
      status: "COMPLETED",
      marksAwarded: 15,
      totalMarks: 20,
      feedback: "Good coverage of baseline models. Add more recent 2024 references."
    }
  ],

  // 8. CRITICAL RULE: Individual Evaluations for Group Tasks (Demonstrates Scenarios 2, 5 & 6)
  // Same rubric form used for every student in Group G01, but each student gets separate individual marks!
  groupEvaluations: [
    {
      id: "eval-G01-1MS21CS042",
      groupId: "G01",
      groupCode: "Group G01",
      taskId: "tsk-grp-01",
      studentUsn: "1MS21CS042",
      studentName: "Rahul Sharma",
      evaluator: "Dr. R. Sharma",
      scores: {
        technicalImplementation: 14, // out of 15
        projectUnderstanding: 9,     // out of 10
        individualContribution: 9,   // out of 10
        documentation: 5,            // out of 5
        presentation: 5,             // out of 5
        viva: 4                      // out of 5
      },
      totalScore: 46,
      maxScore: 50,
      feedback: "Outstanding leadership, model quantization, and real-time edge integration.",
      evaluatedAt: "2025-10-09 11:00",
      status: "COMPLETED"
    },
    {
      id: "eval-G01-1MS21CS015",
      groupId: "G01",
      groupCode: "Group G01",
      taskId: "tsk-grp-01",
      studentUsn: "1MS21CS015",
      studentName: "Ananya Hegde",
      evaluator: "Dr. R. Sharma",
      scores: {
        technicalImplementation: 13,
        projectUnderstanding: 8,
        individualContribution: 8,
        documentation: 4,
        presentation: 4,
        viva: 4
      },
      totalScore: 41,
      maxScore: 50,
      feedback: "Strong data pipeline contribution. Solid grasp of confusion matrix metrics.",
      evaluatedAt: "2025-10-09 11:15",
      status: "COMPLETED"
    },
    {
      id: "eval-G01-1MS21CS062",
      groupId: "G01",
      groupCode: "Group G01",
      taskId: "tsk-grp-01",
      studentUsn: "1MS21CS062",
      studentName: "Karthik Raja",
      evaluator: "Dr. R. Sharma",
      scores: {
        technicalImplementation: 15,
        projectUnderstanding: 9,
        individualContribution: 10,
        documentation: 4,
        presentation: 4,
        viva: 5
      },
      totalScore: 47,
      maxScore: 50,
      feedback: "Exemplary hardware integration on Raspberry Pi and latency benchmarking.",
      evaluatedAt: "2025-10-09 11:30",
      status: "COMPLETED"
    },
    {
      id: "eval-G01-1MS21CS099",
      groupId: "G01",
      groupCode: "Group G01",
      taskId: "tsk-grp-01",
      studentUsn: "1MS21CS099",
      studentName: "Priya V",
      evaluator: "Dr. R. Sharma",
      scores: {
        technicalImplementation: 11,
        projectUnderstanding: 7,
        individualContribution: 7,
        documentation: 5,
        presentation: 4,
        viva: 4
      },
      totalScore: 38,
      maxScore: 50,
      feedback: "Meticulous documentation work. Needs deeper understanding of model optimization.",
      evaluatedAt: "2025-10-09 11:45",
      status: "COMPLETED"
    }
  ],

  // 9. Messages & System Audit Logs
  messages: [
    {
      id: "msg-1",
      sender: "Prof. V. Kulkarni (Coordinator)",
      senderRole: "COORDINATOR",
      recipient: "All Groups (CSE 8th Sem)",
      subject: "IMPORTANT: Mode A & Mode B Final Project Submission Guidelines",
      content: "Group Leaders can either submit all components or distribute component uploads to members in Mode B. All members will see ONE combined project.",
      timestamp: "2025-10-06 14:30",
      isUnread: true
    },
    {
      id: "msg-2",
      sender: "Dr. R. Sharma (Guide)",
      senderRole: "FACULTY",
      recipient: "Group G01",
      subject: "Individual Evaluation Rubric Prepared",
      content: "All 4 members of Group G01 will be evaluated individually during Friday's Viva Voce.",
      timestamp: "2025-10-08 18:10",
      isUnread: false
    }
  ],

  auditLogs: [
    { id: "log-1", timestamp: "2025-10-08 14:42:00", user: "1MS21CS042", action: "GROUP_SUBMISSION", details: "Group G01 Leader uploaded all components under Mode A" },
    { id: "log-2", timestamp: "2025-10-07 11:30:00", user: "1MS21CS078", action: "COMPONENT_SUBMISSION", details: "Neha Patil uploaded Source Code for Group G02 (Mode B)" },
    { id: "log-3", timestamp: "2025-10-09 11:45:00", user: "dr.sharma", action: "INDIVIDUAL_EVALUATION", details: "Completed individual evaluations for all 4 members of Group G01" }
  ]
};

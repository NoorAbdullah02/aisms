import "dotenv/config";
import bcrypt from "bcryptjs";
import { eq, sql } from "drizzle-orm";
import { db } from "./index.js";
import {
  users,
  departments,
  teachers,
  students,
  courses,
  enrollments,
  attendance,
  results,
  notices,
  fees,
  auditLogs,
} from "./schema.js";

async function main() {
  console.log("🚀 Starting comprehensive AISMS demo data seed...\n");

  // Pre-hash default passwords
  const adminPasswordHash = await bcrypt.hash("Admin@123", 10);
  const teacherPasswordHash = await bcrypt.hash("Teacher@123", 10);
  const studentPasswordHash = await bcrypt.hash("Student@123", 10);

  // ----------------------------------------------------
  // 1. Departments
  // ----------------------------------------------------
  console.log("🏫 Seeding Departments...");
  const deptData = [
    { name: "Computer Science & Engineering", code: "CSE", description: "Department of Computer Science & Engineering" },
    { name: "Electrical & Electronic Engineering", code: "EEE", description: "Department of Electrical and Electronic Engineering" },
    { name: "Business Administration", code: "BBA", description: "School of Business Administration & Management Studies" },
    { name: "Mechanical Engineering", code: "ME", description: "Department of Mechanical & Aerospace Engineering" },
    { name: "Civil Engineering", code: "CE", description: "Department of Civil & Environmental Engineering" },
    { name: "English Language & Literature", code: "ENG", description: "Department of English Language, Linguistics & Literature" },
    { name: "Pharmacy & Life Sciences", code: "PHR", description: "Department of Pharmacy & Pharmaceutical Sciences" },
    { name: "Law & Justice", code: "LAW", description: "Faculty of Law, Human Rights & Legal Studies" },
  ];

  for (const d of deptData) {
    await db.insert(departments).values(d).onConflictDoNothing();
  }

  const allDepts = await db.select().from(departments);
  const deptMap = new Map<string, number>();
  allDepts.forEach((d) => deptMap.set(d.code, d.id));
  console.log(`✓ ${allDepts.length} departments available.`);

  // ----------------------------------------------------
  // 2. Administrators
  // ----------------------------------------------------
  console.log("👤 Seeding Admin Users...");
  const adminUsersData = [
    {
      fullName: "System Administrator",
      email: "admin@aisms.dev",
      passwordHash: adminPasswordHash,
      role: "admin" as const,
      isActive: true,
    },
    {
      fullName: "Academic Registrar Office",
      email: "registrar@aisms.dev",
      passwordHash: adminPasswordHash,
      role: "admin" as const,
      isActive: true,
    },
  ];

  for (const a of adminUsersData) {
    await db.insert(users).values(a).onConflictDoNothing();
  }
  const [primaryAdmin] = await db.select().from(users).where(eq(users.email, "admin@aisms.dev")).limit(1);

  // ----------------------------------------------------
  // 3. Teachers / Faculty Members
  // ----------------------------------------------------
  console.log("👨‍🏫 Seeding Faculty & Teachers...");
  const teachersSeed = [
    {
      fullName: "Dr. Sarah Ahmed",
      email: "teacher@aisms.dev",
      deptCode: "CSE",
      employeeCode: "EMP-001",
      designation: "Associate Professor",
      phone: "+880-1711-000001",
      employmentType: "Permanent" as const,
      joinedAt: "2020-01-15",
    },
    {
      fullName: "Prof. Dr. M. Rafiqul Islam",
      email: "rafiqul.cse@aisms.dev",
      deptCode: "CSE",
      employeeCode: "EMP-002",
      designation: "Professor & Department Head",
      phone: "+880-1711-000002",
      employmentType: "Permanent" as const,
      joinedAt: "2016-08-01",
    },
    {
      fullName: "Dr. Tanvir Anjum",
      email: "tanvir.cse@aisms.dev",
      deptCode: "CSE",
      employeeCode: "EMP-003",
      designation: "Associate Professor",
      phone: "+880-1711-000003",
      employmentType: "Permanent" as const,
      joinedAt: "2021-03-10",
    },
    {
      fullName: "Nusrat Sharmin",
      email: "nusrat.cse@aisms.dev",
      deptCode: "CSE",
      employeeCode: "EMP-004",
      designation: "Assistant Professor",
      phone: "+880-1711-000004",
      employmentType: "Permanent" as const,
      joinedAt: "2022-07-01",
    },
    {
      fullName: "Kazi Arifur Rahman",
      email: "arifur.cse@aisms.dev",
      deptCode: "CSE",
      employeeCode: "EMP-005",
      designation: "Senior Lecturer",
      phone: "+880-1711-000005",
      employmentType: "Permanent" as const,
      joinedAt: "2023-01-10",
    },
    {
      fullName: "Prof. Dr. Shamsul Huda",
      email: "shamsul.eee@aisms.dev",
      deptCode: "EEE",
      employeeCode: "EMP-006",
      designation: "Professor & Department Head",
      phone: "+880-1711-000006",
      employmentType: "Permanent" as const,
      joinedAt: "2017-02-15",
    },
    {
      fullName: "Dr. Mahmuda Khatun",
      email: "mahmuda.eee@aisms.dev",
      deptCode: "EEE",
      employeeCode: "EMP-007",
      designation: "Associate Professor",
      phone: "+880-1711-000007",
      employmentType: "Permanent" as const,
      joinedAt: "2020-11-01",
    },
    {
      fullName: "Engr. Farhan Tanvir",
      email: "farhan.eee@aisms.dev",
      deptCode: "EEE",
      employeeCode: "EMP-008",
      designation: "Assistant Professor",
      phone: "+880-1711-000008",
      employmentType: "Contractual" as const,
      contractEndDate: "2027-12-31",
      joinedAt: "2023-06-15",
    },
    {
      fullName: "Prof. Dr. Syed Jahangir Alam",
      email: "jahangir.bba@aisms.dev",
      deptCode: "BBA",
      employeeCode: "EMP-009",
      designation: "Professor & Dean",
      phone: "+880-1711-000009",
      employmentType: "Permanent" as const,
      joinedAt: "2015-05-20",
    },
    {
      fullName: "Rubina Yasmin",
      email: "rubina.bba@aisms.dev",
      deptCode: "BBA",
      employeeCode: "EMP-010",
      designation: "Associate Professor",
      phone: "+880-1711-000010",
      employmentType: "Permanent" as const,
      joinedAt: "2019-09-01",
    },
    {
      fullName: "Mahbubul Haque",
      email: "mahbub.bba@aisms.dev",
      deptCode: "BBA",
      employeeCode: "EMP-011",
      designation: "Assistant Professor",
      phone: "+880-1711-000011",
      employmentType: "Permanent" as const,
      joinedAt: "2022-02-15",
    },
    {
      fullName: "Dr. Nasreen Akhtar",
      email: "nasreen.eng@aisms.dev",
      deptCode: "ENG",
      employeeCode: "EMP-012",
      designation: "Associate Professor & Head",
      phone: "+880-1711-000012",
      employmentType: "Permanent" as const,
      joinedAt: "2018-04-10",
    },
    {
      fullName: "Shahinur Rahman",
      email: "shahinur.eng@aisms.dev",
      deptCode: "ENG",
      employeeCode: "EMP-013",
      designation: "Senior Lecturer",
      phone: "+880-1711-000013",
      employmentType: "Contractual" as const,
      contractEndDate: "2028-06-30",
      joinedAt: "2023-09-01",
    },
    {
      fullName: "Prof. Dr. Tariqul Islam",
      email: "tariqul.me@aisms.dev",
      deptCode: "ME",
      employeeCode: "EMP-014",
      designation: "Professor & Department Head",
      phone: "+880-1711-000014",
      employmentType: "Permanent" as const,
      joinedAt: "2017-07-01",
    },
    {
      fullName: "Engr. Asif Imtiaz",
      email: "asif.me@aisms.dev",
      deptCode: "ME",
      employeeCode: "EMP-015",
      designation: "Assistant Professor",
      phone: "+880-1711-000015",
      employmentType: "Permanent" as const,
      joinedAt: "2021-08-15",
    },
    {
      fullName: "Dr. Rezaul Karim",
      email: "rezaul.ce@aisms.dev",
      deptCode: "CE",
      employeeCode: "EMP-016",
      designation: "Professor & Head",
      phone: "+880-1711-000016",
      employmentType: "Permanent" as const,
      joinedAt: "2019-01-20",
    },
    {
      fullName: "Dr. Ferdous Ara",
      email: "ferdous.phr@aisms.dev",
      deptCode: "PHR",
      employeeCode: "EMP-017",
      designation: "Associate Professor",
      phone: "+880-1711-000017",
      employmentType: "Permanent" as const,
      joinedAt: "2020-03-01",
    },
    {
      fullName: "Barrister Sabrina Hossain",
      email: "sabrina.law@aisms.dev",
      deptCode: "LAW",
      employeeCode: "EMP-018",
      designation: "Assistant Professor",
      phone: "+880-1711-000018",
      employmentType: "Contractual" as const,
      contractEndDate: "2027-10-31",
      joinedAt: "2022-10-01",
    },
  ];

  for (const t of teachersSeed) {
    // 1. Create User
    await db
      .insert(users)
      .values({
        fullName: t.fullName,
        email: t.email,
        passwordHash: teacherPasswordHash,
        role: "teacher",
        isActive: true,
      })
      .onConflictDoNothing();

    const [u] = await db.select().from(users).where(eq(users.email, t.email)).limit(1);
    const deptId = deptMap.get(t.deptCode);

    if (u) {
      await db
        .insert(teachers)
        .values({
          userId: u.id,
          departmentId: deptId,
          employeeCode: t.employeeCode,
          designation: t.designation,
          phone: t.phone,
          employmentType: t.employmentType,
          contractEndDate: t.contractEndDate || null,
          joinedAt: t.joinedAt,
        })
        .onConflictDoNothing();
    }
  }

  const allTeachers = await db.select().from(teachers);
  const teacherCodeMap = new Map<string, number>();
  allTeachers.forEach((t) => teacherCodeMap.set(t.employeeCode, t.id));
  console.log(`✓ ${allTeachers.length} faculty teachers registered.`);

  // ----------------------------------------------------
  // 4. Courses
  // ----------------------------------------------------
  console.log("📚 Seeding Courses...");
  const coursesSeed = [
    // CSE
    { code: "CSE-101", title: "Introduction to Computer Systems & C", credits: 3, deptCode: "CSE", empCode: "EMP-005", semester: "1", capacity: 60 },
    { code: "CSE-102", title: "Discrete Mathematics & Graph Theory", credits: 3, deptCode: "CSE", empCode: "EMP-003", semester: "1", capacity: 60 },
    { code: "CSE-105", title: "Structured Programming Laboratory", credits: 2, deptCode: "CSE", empCode: "EMP-005", semester: "1", capacity: 40 },
    { code: "CSE-201", title: "Data Structures & Algorithms", credits: 3, deptCode: "CSE", empCode: "EMP-001", semester: "3", capacity: 60 },
    { code: "CSE-202", title: "Data Structures Laboratory", credits: 2, deptCode: "CSE", empCode: "EMP-001", semester: "3", capacity: 40 },
    { code: "CSE-205", title: "Database Systems & Architecture", credits: 3, deptCode: "CSE", empCode: "EMP-001", semester: "3", capacity: 60 },
    { code: "CSE-206", title: "Database Systems Laboratory", credits: 2, deptCode: "CSE", empCode: "EMP-004", semester: "3", capacity: 40 },
    { code: "CSE-301", title: "Object Oriented Programming (Java)", credits: 3, deptCode: "CSE", empCode: "EMP-004", semester: "4", capacity: 60 },
    { code: "CSE-305", title: "Software Engineering & Architecture", credits: 3, deptCode: "CSE", empCode: "EMP-002", semester: "5", capacity: 60 },
    { code: "CSE-310", title: "Computer Networks & Security", credits: 3, deptCode: "CSE", empCode: "EMP-003", semester: "5", capacity: 60 },
    { code: "CSE-315", title: "Operating Systems & Systems Programming", credits: 3, deptCode: "CSE", empCode: "EMP-002", semester: "6", capacity: 60 },
    { code: "CSE-401", title: "Artificial Intelligence & Machine Learning", credits: 3, deptCode: "CSE", empCode: "EMP-003", semester: "7", capacity: 55 },
    { code: "CSE-405", title: "Cloud Computing & DevOps", credits: 3, deptCode: "CSE", empCode: "EMP-004", semester: "7", capacity: 50 },
    { code: "CSE-450", title: "Senior Capstone Design Project", credits: 4, deptCode: "CSE", empCode: "EMP-002", semester: "8", capacity: 45 },

    // EEE
    { code: "EEE-101", title: "Electrical Circuit Analysis I", credits: 3, deptCode: "EEE", empCode: "EMP-006", semester: "1", capacity: 60 },
    { code: "EEE-201", title: "Analog Electronics & Circuit Design", credits: 3, deptCode: "EEE", empCode: "EMP-007", semester: "3", capacity: 50 },
    { code: "EEE-205", title: "Signals, Systems & Linear Analysis", credits: 3, deptCode: "EEE", empCode: "EMP-008", semester: "3", capacity: 50 },
    { code: "EEE-301", title: "Digital Signal Processing", credits: 3, deptCode: "EEE", empCode: "EMP-007", semester: "5", capacity: 50 },
    { code: "EEE-305", title: "Microprocessors & Embedded Systems", credits: 3, deptCode: "EEE", empCode: "EMP-008", semester: "5", capacity: 45 },
    { code: "EEE-401", title: "Power Systems Engineering & Grid Control", credits: 3, deptCode: "EEE", empCode: "EMP-006", semester: "7", capacity: 50 },

    // BBA
    { code: "BBA-101", title: "Principles of Management & Organization", credits: 3, deptCode: "BBA", empCode: "EMP-009", semester: "1", capacity: 70 },
    { code: "BBA-105", title: "Financial & Managerial Accounting", credits: 3, deptCode: "BBA", empCode: "EMP-011", semester: "1", capacity: 70 },
    { code: "BBA-201", title: "Principles of Marketing & Consumer Behavior", credits: 3, deptCode: "BBA", empCode: "EMP-010", semester: "3", capacity: 65 },
    { code: "BBA-205", title: "Business Statistics & Decision Science", credits: 3, deptCode: "BBA", empCode: "EMP-011", semester: "3", capacity: 65 },
    { code: "BBA-301", title: "Corporate Finance & Investment Analysis", credits: 3, deptCode: "BBA", empCode: "EMP-010", semester: "5", capacity: 60 },
    { code: "BBA-401", title: "Strategic Management & Entrepreneurship", credits: 3, deptCode: "BBA", empCode: "EMP-009", semester: "7", capacity: 55 },

    // ME
    { code: "ME-101", title: "Engineering Mechanics & Statics", credits: 3, deptCode: "ME", empCode: "EMP-014", semester: "1", capacity: 50 },
    { code: "ME-201", title: "Applied Thermodynamics", credits: 3, deptCode: "ME", empCode: "EMP-015", semester: "3", capacity: 50 },
    { code: "ME-301", title: "Fluid Mechanics & Turbo Machinery", credits: 3, deptCode: "ME", empCode: "EMP-014", semester: "5", capacity: 45 },

    // CE
    { code: "CE-101", title: "Surveying & Geomatics Engineering", credits: 3, deptCode: "CE", empCode: "EMP-016", semester: "1", capacity: 55 },
    { code: "CE-201", title: "Mechanics of Materials", credits: 3, deptCode: "CE", empCode: "EMP-016", semester: "3", capacity: 55 },
    { code: "CE-301", title: "Structural Analysis & Reinforced Concrete", credits: 3, deptCode: "CE", empCode: "EMP-016", semester: "5", capacity: 50 },

    // ENG
    { code: "ENG-101", title: "English Composition & Academic Writing", credits: 3, deptCode: "ENG", empCode: "EMP-012", semester: "1", capacity: 60 },
    { code: "ENG-201", title: "World Literature & Critical Analysis", credits: 3, deptCode: "ENG", empCode: "EMP-013", semester: "3", capacity: 55 },

    // PHR
    { code: "PHR-101", title: "Inorganic & Physical Pharmacy", credits: 3, deptCode: "PHR", empCode: "EMP-017", semester: "1", capacity: 50 },
    { code: "PHR-201", title: "Pharmacology & Toxicological Principles", credits: 3, deptCode: "PHR", empCode: "EMP-017", semester: "3", capacity: 45 },

    // LAW
    { code: "LAW-101", title: "Jurisprudence & Legal Systems", credits: 3, deptCode: "LAW", empCode: "EMP-018", semester: "1", capacity: 55 },
    { code: "LAW-201", title: "Constitutional Law of Bangladesh", credits: 3, deptCode: "LAW", empCode: "EMP-018", semester: "3", capacity: 50 },
  ];

  for (const c of coursesSeed) {
    const deptId = deptMap.get(c.deptCode);
    const teacherId = teacherCodeMap.get(c.empCode);
    await db
      .insert(courses)
      .values({
        title: c.title,
        code: c.code,
        credits: c.credits,
        departmentId: deptId,
        teacherId: teacherId,
        semester: c.semester,
        capacity: c.capacity,
      })
      .onConflictDoNothing();
  }

  const allCourses = await db.select().from(courses);
  console.log(`✓ ${allCourses.length} academic courses registered.`);

  // ----------------------------------------------------
  // 5. Students
  // ----------------------------------------------------
  console.log("🎓 Seeding Students & User Profiles...");
  const studentsSeed = [
    // CSE Students
    { fullName: "Noor Abdullah", email: "student@aisms.dev", studentCode: "STU-2026-001", deptCode: "CSE", semester: "3", status: "active" as const, guardianName: "Mr. Abdullah", guardianPhone: "+880-1720-111001", admissionDate: "2025-01-10" },
    { fullName: "Ayesha Siddiqua", email: "ayesha.siddiqua@aisms.dev", studentCode: "STU-2026-002", deptCode: "CSE", semester: "3", status: "active" as const, guardianName: "Abul Bashar", guardianPhone: "+880-1720-111002", admissionDate: "2025-01-10" },
    { fullName: "Md. Farhan Kabir", email: "farhan.kabir@aisms.dev", studentCode: "STU-2026-003", deptCode: "CSE", semester: "5", status: "active" as const, guardianName: "Humayun Kabir", guardianPhone: "+880-1720-111003", admissionDate: "2024-01-15" },
    { fullName: "Tasnim Sultana", email: "tasnim.sultana@aisms.dev", studentCode: "STU-2026-004", deptCode: "CSE", semester: "1", status: "active" as const, guardianName: "Sultan Mahmud", guardianPhone: "+880-1720-111004", admissionDate: "2026-01-10" },
    { fullName: "Shahriar Hasan", email: "shahriar.hasan@aisms.dev", studentCode: "STU-2026-005", deptCode: "CSE", semester: "7", status: "active" as const, guardianName: "Nazrul Hasan", guardianPhone: "+880-1720-111005", admissionDate: "2023-01-12" },
    { fullName: "Fatima Zahra", email: "fatima.zahra@aisms.dev", studentCode: "STU-2026-006", deptCode: "CSE", semester: "8", status: "graduated" as const, graduationDate: "2026-05-15", guardianName: "Zahid Hossain", guardianPhone: "+880-1720-111006", admissionDate: "2022-08-01" },
    { fullName: "Rifat Hossain", email: "rifat.hossain@aisms.dev", studentCode: "STU-2026-007", deptCode: "CSE", semester: "4", status: "active" as const, guardianName: "Delwar Hossain", guardianPhone: "+880-1720-111007", admissionDate: "2024-08-15" },
    { fullName: "Sadia Afrin", email: "sadia.afrin@aisms.dev", studentCode: "STU-2026-008", deptCode: "CSE", semester: "2", status: "active" as const, guardianName: "Mokhlesur Rahman", guardianPhone: "+880-1720-111008", admissionDate: "2025-08-10" },
    { fullName: "Mahir Faisal", email: "mahir.faisal@aisms.dev", studentCode: "STU-2026-009", deptCode: "CSE", semester: "6", status: "active" as const, guardianName: "Faisal Ahmed", guardianPhone: "+880-1720-111009", admissionDate: "2023-08-12" },
    { fullName: "Nafisa Tabassum", email: "nafisa.tabassum@aisms.dev", studentCode: "STU-2026-010", deptCode: "CSE", semester: "3", status: "active" as const, guardianName: "Shafiqul Islam", guardianPhone: "+880-1720-111010", admissionDate: "2025-01-10" },
    { fullName: "Zubair Al Mahmud", email: "zubair.mahmud@aisms.dev", studentCode: "STU-2026-011", deptCode: "CSE", semester: "8", status: "graduated" as const, graduationDate: "2026-05-15", guardianName: "Mahmudul Haque", guardianPhone: "+880-1720-111011", admissionDate: "2022-08-01" },
    { fullName: "Sumaiya Akter", email: "sumaiya.akter@aisms.dev", studentCode: "STU-2026-012", deptCode: "CSE", semester: "5", status: "suspended" as const, guardianName: "Rafiqul Islam", guardianPhone: "+880-1720-111012", admissionDate: "2024-01-15" },
    { fullName: "Tanvir Rahman", email: "tanvir.rahman@aisms.dev", studentCode: "STU-2026-013", deptCode: "CSE", semester: "1", status: "active" as const, guardianName: "Habibur Rahman", guardianPhone: "+880-1720-111013", admissionDate: "2026-01-10" },
    { fullName: "Anika Bushra", email: "anika.bushra@aisms.dev", studentCode: "STU-2026-014", deptCode: "CSE", semester: "4", status: "active" as const, guardianName: "Golam Kibria", guardianPhone: "+880-1720-111014", admissionDate: "2024-08-15" },
    { fullName: "Kazi Mehedi Hasan", email: "mehedi.hasan@aisms.dev", studentCode: "STU-2026-015", deptCode: "CSE", semester: "2", status: "active" as const, guardianName: "Kazi Anwarul", guardianPhone: "+880-1720-111015", admissionDate: "2025-08-10" },

    // EEE Students
    { fullName: "Mehzabin Chowdhury", email: "mehzabin.chowdhury@aisms.dev", studentCode: "STU-2026-016", deptCode: "EEE", semester: "3", status: "active" as const, guardianName: "Kamal Chowdhury", guardianPhone: "+880-1720-111016", admissionDate: "2025-01-10" },
    { fullName: "Shafiqul Islam", email: "shafiqul.islam@aisms.dev", studentCode: "STU-2026-017", deptCode: "EEE", semester: "5", status: "active" as const, guardianName: "Sirajul Islam", guardianPhone: "+880-1720-111017", admissionDate: "2024-01-15" },
    { fullName: "Tahmidur Rahman", email: "tahmid.rahman@aisms.dev", studentCode: "STU-2026-018", deptCode: "EEE", semester: "1", status: "active" as const, guardianName: "Mustafizur Rahman", guardianPhone: "+880-1720-111018", admissionDate: "2026-01-10" },
    { fullName: "Nabila Jahan", email: "nabila.jahan@aisms.dev", studentCode: "STU-2026-019", deptCode: "EEE", semester: "7", status: "active" as const, guardianName: "Anisur Rahman", guardianPhone: "+880-1720-111019", admissionDate: "2023-01-12" },
    { fullName: "Ashraful Alom", email: "ashraful.alom@aisms.dev", studentCode: "STU-2026-020", deptCode: "EEE", semester: "4", status: "active" as const, guardianName: "Nurul Alom", guardianPhone: "+880-1720-111020", admissionDate: "2024-08-15" },
    { fullName: "Rumana Sharmin", email: "rumana.sharmin@aisms.dev", studentCode: "STU-2026-021", deptCode: "EEE", semester: "8", status: "graduated" as const, graduationDate: "2026-05-15", guardianName: "Shamsul Haque", guardianPhone: "+880-1720-111021", admissionDate: "2022-08-01" },
    { fullName: "Sajid Ahmed", email: "sajid.ahmed@aisms.dev", studentCode: "STU-2026-022", deptCode: "EEE", semester: "2", status: "active" as const, guardianName: "Masud Ahmed", guardianPhone: "+880-1720-111022", admissionDate: "2025-08-10" },

    // BBA Students
    { fullName: "Ishrat Jahan", email: "ishrat.jahan@aisms.dev", studentCode: "STU-2026-023", deptCode: "BBA", semester: "3", status: "active" as const, guardianName: "Shafiqul Alam", guardianPhone: "+880-1720-111023", admissionDate: "2025-01-10" },
    { fullName: "Raihan Ullah", email: "raihan.ullah@aisms.dev", studentCode: "STU-2026-024", deptCode: "BBA", semester: "1", status: "active" as const, guardianName: "Aman Ullah", guardianPhone: "+880-1720-111024", admissionDate: "2026-01-10" },
    { fullName: "Zarin Subah", email: "zarin.subah@aisms.dev", studentCode: "STU-2026-025", deptCode: "BBA", semester: "5", status: "active" as const, guardianName: "Monirul Islam", guardianPhone: "+880-1720-111025", admissionDate: "2024-01-15" },
    { fullName: "Shakib Al Hasan", email: "shakib.hasan@aisms.dev", studentCode: "STU-2026-026", deptCode: "BBA", semester: "6", status: "active" as const, guardianName: "Mashrafe Hasan", guardianPhone: "+880-1720-111026", admissionDate: "2023-08-12" },
    { fullName: "Jannatul Ferdous", email: "jannatul.ferdous@aisms.dev", studentCode: "STU-2026-027", deptCode: "BBA", semester: "4", status: "active" as const, guardianName: "Ferdous Ahmed", guardianPhone: "+880-1720-111027", admissionDate: "2024-08-15" },
    { fullName: "Muhtasim Billah", email: "muhtasim.billah@aisms.dev", studentCode: "STU-2026-028", deptCode: "BBA", semester: "2", status: "active" as const, guardianName: "Motiur Rahman", guardianPhone: "+880-1720-111028", admissionDate: "2025-08-10" },
    { fullName: "Samia Rahman", email: "samia.rahman@aisms.dev", studentCode: "STU-2026-029", deptCode: "BBA", semester: "8", status: "graduated" as const, graduationDate: "2026-05-15", guardianName: "Bazlur Rahman", guardianPhone: "+880-1720-111029", admissionDate: "2022-08-01" },

    // ME Students
    { fullName: "Mahmudul Hasan", email: "mahmudul.hasan@aisms.dev", studentCode: "STU-2026-030", deptCode: "ME", semester: "3", status: "active" as const, guardianName: "Abul Kalam", guardianPhone: "+880-1720-111030", admissionDate: "2025-01-10" },
    { fullName: "Lamia Haque", email: "lamia.haque@aisms.dev", studentCode: "STU-2026-031", deptCode: "ME", semester: "5", status: "active" as const, guardianName: "Enamul Haque", guardianPhone: "+880-1720-111031", admissionDate: "2024-01-15" },
    { fullName: "Asaduzzaman Nur", email: "asaduzzaman.nur@aisms.dev", studentCode: "STU-2026-032", deptCode: "ME", semester: "2", status: "active" as const, guardianName: "Zahirul Islam", guardianPhone: "+880-1720-111032", admissionDate: "2025-08-10" },
    { fullName: "Nusrat Jahan Mim", email: "nusrat.mim@aisms.dev", studentCode: "STU-2026-033", deptCode: "ME", semester: "7", status: "active" as const, guardianName: "Jahangir Alam", guardianPhone: "+880-1720-111033", admissionDate: "2023-01-12" },

    // CE Students
    { fullName: "Golam Mostafa", email: "golam.mostafa@aisms.dev", studentCode: "STU-2026-034", deptCode: "CE", semester: "4", status: "active" as const, guardianName: "Mustafa Kamal", guardianPhone: "+880-1720-111034", admissionDate: "2024-08-15" },
    { fullName: "Sharmin Sultana", email: "sharmin.sultana@aisms.dev", studentCode: "STU-2026-035", deptCode: "CE", semester: "6", status: "active" as const, guardianName: "Abdur Rashid", guardianPhone: "+880-1720-111035", admissionDate: "2023-08-12" },
    { fullName: "Nazmul Huda", email: "nazmul.huda@aisms.dev", studentCode: "STU-2026-036", deptCode: "CE", semester: "2", status: "active" as const, guardianName: "Shamsul Huda", guardianPhone: "+880-1720-111036", admissionDate: "2025-08-10" },

    // ENG Students
    { fullName: "Fariha Zaman", email: "fariha.zaman@aisms.dev", studentCode: "STU-2026-037", deptCode: "ENG", semester: "3", status: "active" as const, guardianName: "Kamruzzaman", guardianPhone: "+880-1720-111037", admissionDate: "2025-01-10" },
    { fullName: "Shafiul Alam", email: "shafiul.alam@aisms.dev", studentCode: "STU-2026-038", deptCode: "ENG", semester: "5", status: "active" as const, guardianName: "Badiul Alam", guardianPhone: "+880-1720-111038", admissionDate: "2024-01-15" },
    { fullName: "Marzia Khanom", email: "marzia.khanom@aisms.dev", studentCode: "STU-2026-039", deptCode: "ENG", semester: "1", status: "active" as const, guardianName: "Mizanur Rahman", guardianPhone: "+880-1720-111039", admissionDate: "2026-01-10" },

    // PHR Students
    { fullName: "Nahid Parvez", email: "nahid.parvez@aisms.dev", studentCode: "STU-2026-040", deptCode: "PHR", semester: "4", status: "active" as const, guardianName: "Parvez Hossain", guardianPhone: "+880-1720-111040", admissionDate: "2024-08-15" },
    { fullName: "Tasnuva Shahrin", email: "tasnuva.shahrin@aisms.dev", studentCode: "STU-2026-041", deptCode: "PHR", semester: "6", status: "active" as const, guardianName: "Shahriar Kabir", guardianPhone: "+880-1720-111041", admissionDate: "2023-08-12" },
    { fullName: "Rakib Mia", email: "rakib.mia@aisms.dev", studentCode: "STU-2026-042", deptCode: "PHR", semester: "2", status: "active" as const, guardianName: "Younus Mia", guardianPhone: "+880-1720-111042", admissionDate: "2025-08-10" },

    // LAW Students
    { fullName: "Fahim Muntasir", email: "fahim.muntasir@aisms.dev", studentCode: "STU-2026-043", deptCode: "LAW", semester: "3", status: "active" as const, guardianName: "Muntasir Billah", guardianPhone: "+880-1720-111043", admissionDate: "2025-01-10" },
    { fullName: "Sanjida Islam", email: "sanjida.islam@aisms.dev", studentCode: "STU-2026-044", deptCode: "LAW", semester: "5", status: "active" as const, guardianName: "Monjurul Islam", guardianPhone: "+880-1720-111044", admissionDate: "2024-01-15" },
    { fullName: "Arifuzzaman Shuvo", email: "arifuzzaman.shuvo@aisms.dev", studentCode: "STU-2026-045", deptCode: "LAW", semester: "1", status: "active" as const, guardianName: "Zaman Hossain", guardianPhone: "+880-1720-111045", admissionDate: "2026-01-10" },
  ];

  for (const s of studentsSeed) {
    // 1. Create User
    await db
      .insert(users)
      .values({
        fullName: s.fullName,
        email: s.email,
        passwordHash: studentPasswordHash,
        role: "student",
        isActive: s.status !== "suspended",
      })
      .onConflictDoNothing();

    const [u] = await db.select().from(users).where(eq(users.email, s.email)).limit(1);
    const deptId = deptMap.get(s.deptCode);

    if (u) {
      await db
        .insert(students)
        .values({
          userId: u.id,
          departmentId: deptId,
          studentCode: s.studentCode,
          semester: s.semester,
          guardianName: s.guardianName,
          guardianPhone: s.guardianPhone,
          admissionDate: s.admissionDate,
          status: s.status,
          graduationDate: s.graduationDate || null,
        })
        .onConflictDoNothing();
    }
  }

  const allStudents = await db.select().from(students);
  console.log(`✓ ${allStudents.length} students registered.`);

  // ----------------------------------------------------
  // 6. Course Enrollments
  // ----------------------------------------------------
  console.log("📝 Seeding Student Enrollments...");
  const enrollmentEntries: Array<{ studentId: number; courseId: number }> = [];

  for (const stu of allStudents) {
    // Find all courses in their department
    const deptCourses = allCourses.filter((c) => c.departmentId === stu.departmentId);

    // Filter relevant courses: match semester or past semester, or up to 4 courses
    let assignedCourses = deptCourses.filter((c) => c.semester === stu.semester);
    if (assignedCourses.length === 0) {
      assignedCourses = deptCourses.slice(0, 3);
    } else if (assignedCourses.length < 3) {
      const additional = deptCourses.filter((c) => c.semester !== stu.semester).slice(0, 3 - assignedCourses.length);
      assignedCourses.push(...additional);
    }

    for (const c of assignedCourses) {
      enrollmentEntries.push({ studentId: stu.id, courseId: c.id });
    }
  }

  // Insert enrollments with conflict ignored
  for (const enr of enrollmentEntries) {
    await db.insert(enrollments).values(enr).onConflictDoNothing();
  }
  const allEnrollments = await db.select().from(enrollments);
  console.log(`✓ ${allEnrollments.length} course enrollments created.`);

  // ----------------------------------------------------
  // 7. Attendance Records (Last 20 class days)
  // ----------------------------------------------------
  console.log("📅 Seeding Daily Attendance Records...");
  const attendanceEntries: Array<{
    studentId: number;
    courseId: number;
    date: string;
    status: "present" | "absent" | "late" | "excused";
    markedByTeacherId: number | null;
  }> = [];

  // Generate weekday dates for the past 28 calendar days (~18-20 class days)
  const classDates: string[] = [];
  const today = new Date();
  for (let i = 1; i <= 28; i++) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const day = d.getDay();
    // Monday(1) to Friday(5)
    if (day !== 0 && day !== 6) {
      classDates.push(d.toISOString().slice(0, 10));
      if (classDates.length >= 18) break;
    }
  }

  // Course map by id
  const courseById = new Map<number, typeof allCourses[0]>();
  allCourses.forEach((c) => courseById.set(c.id, c));

  for (const enr of allEnrollments) {
    const course = courseById.get(enr.courseId);
    const teacherId = course?.teacherId ?? null;

    // Simulate realistic variance in student attendance
    // Some students are high performers (90%+), some regular (75%), some at-risk (50%)
    const performanceProfile = (enr.studentId + enr.courseId) % 10;

    for (let dayIndex = 0; dayIndex < classDates.length; dayIndex++) {
      const d = classDates[dayIndex]!;
      let status: "present" | "absent" | "late" | "excused" = "present";

      if (performanceProfile === 1 || performanceProfile === 7) {
        // At-risk student profile: frequent absences
        if (dayIndex % 3 === 0) status = "absent";
        else if (dayIndex % 5 === 0) status = "late";
        else status = "present";
      } else if (performanceProfile === 3) {
        // Occasional excused/late
        if (dayIndex % 7 === 0) status = "excused";
        else if (dayIndex % 4 === 0) status = "late";
        else status = "present";
      } else {
        // Good student profile: mostly present
        if (dayIndex === 2 && enr.studentId % 5 === 0) status = "absent";
        else if (dayIndex === 6 && enr.studentId % 7 === 0) status = "late";
        else status = "present";
      }

      attendanceEntries.push({
        studentId: enr.studentId,
        courseId: enr.courseId,
        date: d,
        status,
        markedByTeacherId: teacherId,
      });
    }
  }

  // Batch insert attendance (in chunks to avoid SQL param limits)
  const chunkSize = 200;
  for (let i = 0; i < attendanceEntries.length; i += chunkSize) {
    const chunk = attendanceEntries.slice(i, i + chunkSize);
    await db.insert(attendance).values(chunk).onConflictDoNothing();
  }
  const totalAttendance = await db.select({ count: sql<number>`count(*)::int` }).from(attendance);
  console.log(`✓ ${totalAttendance[0]?.count ?? 0} attendance records available.`);

  // ----------------------------------------------------
  // 8. Academic Results & Grades
  // ----------------------------------------------------
  console.log("📊 Seeding Academic Examination Results...");
  const resultEntries: Array<{
    studentId: number;
    courseId: number;
    marks: string;
    gradePoint: string;
    semester: string;
    publishedByTeacherId: number | null;
  }> = [];

  for (const enr of allEnrollments) {
    const course = courseById.get(enr.courseId);
    const teacherId = course?.teacherId ?? null;

    // Deterministic yet varied marks based on studentId & courseId
    const baseScore = 55 + ((enr.studentId * 13 + enr.courseId * 7) % 43); // 55 to 97
    let marks = Math.min(97.5, Math.max(48.0, baseScore + ((enr.studentId % 3) * 1.5)));
    let gp = 0.0;

    if (marks >= 80) gp = 4.0;
    else if (marks >= 75) gp = 3.75;
    else if (marks >= 70) gp = 3.5;
    else if (marks >= 65) gp = 3.25;
    else if (marks >= 60) gp = 3.0;
    else if (marks >= 55) gp = 2.75;
    else if (marks >= 50) gp = 2.5;
    else if (marks >= 45) gp = 2.25;
    else gp = 0.0;

    resultEntries.push({
      studentId: enr.studentId,
      courseId: enr.courseId,
      marks: marks.toFixed(2),
      gradePoint: gp.toFixed(2),
      semester: course?.semester || "1",
      publishedByTeacherId: teacherId,
    });
  }

  for (let i = 0; i < resultEntries.length; i += chunkSize) {
    const chunk = resultEntries.slice(i, i + chunkSize);
    await db.insert(results).values(chunk).onConflictDoNothing();
  }
  const totalResults = await db.select({ count: sql<number>`count(*)::int` }).from(results);
  console.log(`✓ ${totalResults[0]?.count ?? 0} published academic results available.`);

  // ----------------------------------------------------
  // 9. Student Fees & Financial Invoices (BDT ৳)
  // ----------------------------------------------------
  console.log("💳 Seeding Student Fees & Financial Billing (BDT)...");
  const feeEntries: Array<{
    studentId: number;
    title: string;
    amount: string;
    semester: string;
    dueDate: string;
    status: "pending" | "paid" | "overdue" | "waived";
    paidAt: Date | null;
    createdByUserId: number | null;
  }> = [];

  const adminId = primaryAdmin?.id ?? null;

  for (const stu of allStudents) {
    const sem = stu.semester;

    // 1. Semester Tuition Fee
    const tuitionAmount = (35000 + ((stu.id * 1000) % 15000)).toFixed(2);
    const tuitionStatus: "paid" | "pending" | "overdue" | "waived" =
      stu.status === "graduated"
        ? "paid"
        : stu.id % 4 === 0
        ? "overdue"
        : stu.id % 3 === 0
        ? "pending"
        : stu.id % 7 === 0
        ? "waived"
        : "paid";

    const dueDateTuition =
      tuitionStatus === "overdue"
        ? "2026-09-15"
        : tuitionStatus === "paid"
        ? "2026-10-15"
        : "2026-11-25";

    feeEntries.push({
      studentId: stu.id,
      title: `Semester ${sem} Tuition & Academic Fee (BDT)`,
      amount: tuitionAmount,
      semester: sem,
      dueDate: dueDateTuition,
      status: tuitionStatus,
      paidAt: tuitionStatus === "paid" ? new Date("2026-10-10T14:30:00Z") : null,
      createdByUserId: adminId,
    });

    // 2. Lab & Technological Services Fee
    const labStatus: "paid" | "pending" | "overdue" | "waived" =
      stu.id % 2 === 0 ? "paid" : "pending";
    feeEntries.push({
      studentId: stu.id,
      title: "Computer Lab & Technological Infrastructure Fee",
      amount: "4500.00",
      semester: sem,
      dueDate: "2026-11-30",
      status: labStatus,
      paidAt: labStatus === "paid" ? new Date("2026-10-18T11:00:00Z") : null,
      createdByUserId: adminId,
    });

    // 3. Central Library & Digital Database Access
    if (stu.id % 3 === 0) {
      feeEntries.push({
        studentId: stu.id,
        title: "Central Library & IEEE/ACM Digital Access Fee",
        amount: "1500.00",
        semester: sem,
        dueDate: "2026-11-20",
        status: "paid",
        paidAt: new Date("2026-10-05T09:15:00Z"),
        createdByUserId: adminId,
      });
    }

    // 4. Convocation & Degree Certificate Fee for Graduated Students
    if (stu.status === "graduated") {
      feeEntries.push({
        studentId: stu.id,
        title: "Convocation & Degree Certificate Clearance Fee",
        amount: "12000.00",
        semester: "8",
        dueDate: "2026-04-30",
        status: "paid",
        paidAt: new Date("2026-04-20T16:00:00Z"),
        createdByUserId: adminId,
      });
    }
  }

  for (let i = 0; i < feeEntries.length; i += chunkSize) {
    const chunk = feeEntries.slice(i, i + chunkSize);
    await db.insert(fees).values(chunk).onConflictDoNothing();
  }
  const totalFees = await db.select({ count: sql<number>`count(*)::int` }).from(fees);
  console.log(`✓ ${totalFees[0]?.count ?? 0} fee invoices seeded.`);

  // ----------------------------------------------------
  // 10. Notices & Campus Announcements
  // ----------------------------------------------------
  console.log("📢 Seeding University Notices & Bulletins...");
  const noticesSeed = [
    {
      title: "Semester Final Examination Routine - Fall 2026",
      body: "The final examination routine for all undergraduate and graduate programs has been officially published by the Controller of Examinations. All students are advised to download the admit card from the portal and verify their course registration.",
      audience: "all" as const,
      createdByUserId: primaryAdmin!.id,
    },
    {
      title: "Call for Papers: Annual AISMS National AI Hackathon & Project Showcase",
      body: "The Department of Computer Science & Engineering invites student teams to register for the National AI Hackathon 2026. Attractive prize pool of ৳3,00,000 BDT, mentorship from industry experts, and internship opportunities await top performers.",
      audience: "all" as const,
      createdByUserId: primaryAdmin!.id,
    },
    {
      title: "Mandatory Course Pre-Registration for Spring 2027",
      body: "Course pre-registration for the upcoming Spring 2027 semester opens next Monday. Students must clear any pending semester tuition dues to activate the course selection panel in their student portal.",
      audience: "students" as const,
      createdByUserId: primaryAdmin!.id,
    },
    {
      title: "Faculty Workshop: Generative AI & Automated Student Assessment",
      body: "All faculty members are cordially invited to participate in the upcoming pedagogy development workshop on leveraging AISMS AI prediction tools and automated evaluation systems on Saturday at 10:00 AM.",
      audience: "teachers" as const,
      createdByUserId: primaryAdmin!.id,
    },
    {
      title: "Campus Closure on Account of National Victory Day",
      body: "The university administrative offices and academic departments will remain closed on 16th December in observance of National Victory Day. Regular classes and lab sessions will resume the following day.",
      audience: "all" as const,
      createdByUserId: primaryAdmin!.id,
    },
    {
      title: "Central Library Book Return Clearance Deadline",
      body: "Students who have borrowed physical books or reference journals from the Central Library must return or renew their loans by the 25th of this month to avoid daily overdue fines and hold on grade cards.",
      audience: "students" as const,
      createdByUserId: primaryAdmin!.id,
    },
    {
      title: "Grade Submission Guidelines & Deadline for Faculty",
      body: "All department instructors are respectfully requested to finalize internal marks, mid-term evaluations, and attendance records on AISMS by Friday midnight to enable prompt result verification.",
      audience: "teachers" as const,
      createdByUserId: primaryAdmin!.id,
    },
    {
      title: "Financial Aid & Merit-Based Tuition Fee Waiver Applications",
      body: "Applications for 25% to 100% tuition waivers for students with CGPA 3.80+ or documented financial hardship are now accepted. Please submit the financial disclosure form with guardian endorsement.",
      audience: "students" as const,
      createdByUserId: primaryAdmin!.id,
    },
    {
      title: "Scheduled Cloud Server Maintenance & AISMS Platform Upgrade",
      body: "Please be informed that the IT Department will perform scheduled infrastructure scaling and database optimization tonight between 2:00 AM and 4:00 AM. Student and teacher portals may experience intermittent pauses.",
      audience: "all" as const,
      createdByUserId: primaryAdmin!.id,
    },
    {
      title: "Convocation 2026: Gown Distribution & Rehearsal Schedule",
      body: "Graduated alumni students from all faculties are requested to collect their academic gowns and invitation cards from the Registrar Office starting Wednesday. Rehearsal will take place in the Central Auditorium.",
      audience: "all" as const,
      createdByUserId: primaryAdmin!.id,
    },
  ];

  for (const n of noticesSeed) {
    await db.insert(notices).values(n).onConflictDoNothing();
  }
  const totalNotices = await db.select({ count: sql<number>`count(*)::int` }).from(notices);
  console.log(`✓ ${totalNotices[0]?.count ?? 0} campus notices active.`);

  // ----------------------------------------------------
  // 11. Audit Logs (System Activity Trail)
  // ----------------------------------------------------
  console.log("📜 Seeding Audit Logs & Security Trails...");
  const auditEntries = [
    { userId: primaryAdmin!.id, action: "SYSTEM_INITIALIZATION", metadata: JSON.stringify({ message: "AISMS Enterprise Platform initialized with dual AI providers" }) },
    { userId: primaryAdmin!.id, action: "DEPARTMENT_CREATED", metadata: JSON.stringify({ codes: ["CSE", "EEE", "BBA", "ME", "CE", "ENG", "PHR", "LAW"] }) },
    { userId: primaryAdmin!.id, action: "COURSE_BATCH_CREATED", metadata: JSON.stringify({ totalCourses: allCourses.length }) },
    { userId: primaryAdmin!.id, action: "FEE_STRUCTURE_ESTABLISHED", metadata: JSON.stringify({ currency: "BDT", scope: "Undergraduate & Graduate" }) },
    { userId: primaryAdmin!.id, action: "NOTICE_PUBLISHED", metadata: JSON.stringify({ title: "Semester Final Examination Routine - Fall 2026" }) },
    { userId: allTeachers[0]?.userId ?? primaryAdmin!.id, action: "ATTENDANCE_BATCH_MARKED", metadata: JSON.stringify({ courseCode: "CSE-201", sessionCount: 18 }) },
    { userId: allTeachers[0]?.userId ?? primaryAdmin!.id, action: "RESULTS_PUBLISHED", metadata: JSON.stringify({ courseCode: "CSE-201", semester: "3" }) },
    { userId: primaryAdmin!.id, action: "AI_MODEL_CALIBRATED", metadata: JSON.stringify({ provider: "mistral", model: "mistral-small-latest" }) },
  ];

  for (const al of auditEntries) {
    await db.insert(auditLogs).values(al).onConflictDoNothing();
  }
  const totalAudit = await db.select({ count: sql<number>`count(*)::int` }).from(auditLogs);
  console.log(`✓ ${totalAudit[0]?.count ?? 0} audit log records recorded.`);

  // ----------------------------------------------------
  // Summary
  // ----------------------------------------------------
  console.log("\n=======================================================");
  console.log("🎉 AISMS DEMO DATA GENERATION COMPLETE!");
  console.log("=======================================================");
  console.log(`• Departments:      ${allDepts.length}`);
  console.log(`• Faculty/Teachers: ${allTeachers.length}`);
  console.log(`• Courses:          ${allCourses.length}`);
  console.log(`• Students:         ${allStudents.length}`);
  console.log(`• Enrollments:      ${allEnrollments.length}`);
  console.log(`• Attendance:       ${totalAttendance[0]?.count ?? 0}`);
  console.log(`• Results:          ${totalResults[0]?.count ?? 0}`);
  console.log(`• Fees / Invoices:  ${totalFees[0]?.count ?? 0}`);
  console.log(`• Notices:          ${totalNotices[0]?.count ?? 0}`);
  console.log(`• Audit Logs:       ${totalAudit[0]?.count ?? 0}`);
  console.log("-------------------------------------------------------");
  console.log("🔑 DEMO LOGIN CREDENTIALS:");
  console.log("  [Admin]:   admin@aisms.dev   /  Admin@123");
  console.log("  [Teacher]: teacher@aisms.dev /  Teacher@123  (or rafiqul.cse@aisms.dev)");
  console.log("  [Student]: student@aisms.dev /  Student@123  (or ayesha.siddiqua@aisms.dev)");
  console.log("=======================================================\n");

  process.exit(0);
}

main().catch((err) => {
  console.error("❌ Seed failed with error:", err);
  process.exit(1);
});

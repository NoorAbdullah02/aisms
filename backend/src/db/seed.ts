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
  console.log("🚀 Starting MEGA AISMS demo data seed...\n");

  const adminPasswordHash   = await bcrypt.hash("Admin@123",   10);
  const teacherPasswordHash = await bcrypt.hash("Teacher@123", 10);
  const studentPasswordHash = await bcrypt.hash("Student@123", 10);

  // ══════════════════════════════════════════════════════════════
  // 1. DEPARTMENTS
  // ══════════════════════════════════════════════════════════════
  console.log("🏫 Seeding Departments...");
  const deptData = [
    { name: "Computer Science & Engineering",    code: "CSE", description: "Dept of CSE & Software Engineering" },
    { name: "Electrical & Electronic Engineering", code: "EEE", description: "Dept of EEE & Power Systems" },
    { name: "Business Administration",            code: "BBA", description: "School of Business & Management" },
    { name: "Mechanical Engineering",             code: "ME",  description: "Dept of Mechanical & Aerospace Engineering" },
    { name: "Civil Engineering",                  code: "CE",  description: "Dept of Civil & Environmental Engineering" },
    { name: "English Language & Literature",      code: "ENG", description: "Dept of English Language & Linguistics" },
    { name: "Pharmacy & Life Sciences",           code: "PHR", description: "Dept of Pharmacy & Pharmaceutical Sciences" },
    { name: "Law & Justice",                      code: "LAW", description: "Faculty of Law & Legal Studies" },
  ];

  for (const d of deptData) {
    await db.insert(departments).values(d).onConflictDoNothing();
  }
  const allDepts = await db.select().from(departments);
  const deptMap  = new Map<string, number>();
  allDepts.forEach((d) => deptMap.set(d.code, d.id));
  console.log(`✓ ${allDepts.length} departments`);

  // ══════════════════════════════════════════════════════════════
  // 2. ADMINS
  // ══════════════════════════════════════════════════════════════
  console.log("👤 Seeding Admins...");
  const adminUsersData = [
    { fullName: "System Administrator",    email: "admin@aisms.dev",      passwordHash: adminPasswordHash, role: "admin" as const, isActive: true },
    { fullName: "Academic Registrar",      email: "registrar@aisms.dev",  passwordHash: adminPasswordHash, role: "admin" as const, isActive: true },
    { fullName: "Finance Controller",      email: "finance@aisms.dev",    passwordHash: adminPasswordHash, role: "admin" as const, isActive: true },
    { fullName: "IT Administrator",        email: "it.admin@aisms.dev",   passwordHash: adminPasswordHash, role: "admin" as const, isActive: true },
    { fullName: "Dean of Students",        email: "dean@aisms.dev",       passwordHash: adminPasswordHash, role: "admin" as const, isActive: true },
  ];
  for (const a of adminUsersData) {
    await db.insert(users).values(a).onConflictDoNothing();
  }
  const [primaryAdmin] = await db.select().from(users).where(eq(users.email, "admin@aisms.dev")).limit(1);

  // ══════════════════════════════════════════════════════════════
  // 3. TEACHERS (30 total)
  // ══════════════════════════════════════════════════════════════
  console.log("👨‍🏫 Seeding Teachers...");
  const teachersSeed = [
    // CSE (7)
    { fullName: "Dr. Sarah Ahmed",            email: "teacher@aisms.dev",        deptCode: "CSE", empCode: "EMP-001", designation: "Associate Professor",          phone: "+880-1711-000001", employmentType: "Permanent"   as const, joinedAt: "2020-01-15" },
    { fullName: "Prof. Dr. M. Rafiqul Islam", email: "rafiqul.cse@aisms.dev",    deptCode: "CSE", empCode: "EMP-002", designation: "Professor & Dept Head",         phone: "+880-1711-000002", employmentType: "Permanent"   as const, joinedAt: "2016-08-01" },
    { fullName: "Dr. Tanvir Anjum",           email: "tanvir.cse@aisms.dev",     deptCode: "CSE", empCode: "EMP-003", designation: "Associate Professor",          phone: "+880-1711-000003", employmentType: "Permanent"   as const, joinedAt: "2021-03-10" },
    { fullName: "Nusrat Sharmin",             email: "nusrat.cse@aisms.dev",     deptCode: "CSE", empCode: "EMP-004", designation: "Assistant Professor",          phone: "+880-1711-000004", employmentType: "Permanent"   as const, joinedAt: "2022-07-01" },
    { fullName: "Kazi Arifur Rahman",         email: "arifur.cse@aisms.dev",     deptCode: "CSE", empCode: "EMP-005", designation: "Senior Lecturer",             phone: "+880-1711-000005", employmentType: "Permanent"   as const, joinedAt: "2023-01-10" },
    { fullName: "Dr. Rezaul Karim CSE",       email: "rezaul.cse@aisms.dev",     deptCode: "CSE", empCode: "EMP-006", designation: "Assistant Professor",          phone: "+880-1711-000006", employmentType: "Contractual" as const, contractEndDate: "2027-12-31", joinedAt: "2023-06-01" },
    { fullName: "Mehrin Akter",               email: "mehrin.cse@aisms.dev",     deptCode: "CSE", empCode: "EMP-007", designation: "Lecturer",                    phone: "+880-1711-000007", employmentType: "Contractual" as const, contractEndDate: "2028-06-30", joinedAt: "2024-01-15" },
    // EEE (5)
    { fullName: "Prof. Dr. Shamsul Huda",     email: "shamsul.eee@aisms.dev",    deptCode: "EEE", empCode: "EMP-008", designation: "Professor & Dept Head",         phone: "+880-1711-000008", employmentType: "Permanent"   as const, joinedAt: "2017-02-15" },
    { fullName: "Dr. Mahmuda Khatun",         email: "mahmuda.eee@aisms.dev",    deptCode: "EEE", empCode: "EMP-009", designation: "Associate Professor",          phone: "+880-1711-000009", employmentType: "Permanent"   as const, joinedAt: "2020-11-01" },
    { fullName: "Engr. Farhan Tanvir",        email: "farhan.eee@aisms.dev",     deptCode: "EEE", empCode: "EMP-010", designation: "Assistant Professor",          phone: "+880-1711-000010", employmentType: "Contractual" as const, contractEndDate: "2027-12-31", joinedAt: "2023-06-15" },
    { fullName: "Lutfun Nahar",               email: "lutfun.eee@aisms.dev",     deptCode: "EEE", empCode: "EMP-011", designation: "Lecturer",                    phone: "+880-1711-000011", employmentType: "Permanent"   as const, joinedAt: "2022-03-01" },
    { fullName: "Engr. Sajjad Hossain",       email: "sajjad.eee@aisms.dev",     deptCode: "EEE", empCode: "EMP-012", designation: "Senior Lecturer",             phone: "+880-1711-000012", employmentType: "Permanent"   as const, joinedAt: "2021-09-01" },
    // BBA (5)
    { fullName: "Prof. Dr. Syed Jahangir",    email: "jahangir.bba@aisms.dev",   deptCode: "BBA", empCode: "EMP-013", designation: "Professor & Dean",             phone: "+880-1711-000013", employmentType: "Permanent"   as const, joinedAt: "2015-05-20" },
    { fullName: "Rubina Yasmin",              email: "rubina.bba@aisms.dev",     deptCode: "BBA", empCode: "EMP-014", designation: "Associate Professor",          phone: "+880-1711-000014", employmentType: "Permanent"   as const, joinedAt: "2019-09-01" },
    { fullName: "Mahbubul Haque",             email: "mahbub.bba@aisms.dev",     deptCode: "BBA", empCode: "EMP-015", designation: "Assistant Professor",          phone: "+880-1711-000015", employmentType: "Permanent"   as const, joinedAt: "2022-02-15" },
    { fullName: "Tamanna Islam",              email: "tamanna.bba@aisms.dev",    deptCode: "BBA", empCode: "EMP-016", designation: "Senior Lecturer",             phone: "+880-1711-000016", employmentType: "Contractual" as const, contractEndDate: "2028-06-30", joinedAt: "2023-09-01" },
    { fullName: "Kamal Uddin",                email: "kamal.bba@aisms.dev",      deptCode: "BBA", empCode: "EMP-017", designation: "Lecturer",                    phone: "+880-1711-000017", employmentType: "Contractual" as const, contractEndDate: "2027-06-30", joinedAt: "2024-01-10" },
    // ME (3)
    { fullName: "Prof. Dr. Tariqul Islam",    email: "tariqul.me@aisms.dev",     deptCode: "ME",  empCode: "EMP-018", designation: "Professor & Dept Head",         phone: "+880-1711-000018", employmentType: "Permanent"   as const, joinedAt: "2017-07-01" },
    { fullName: "Engr. Asif Imtiaz",          email: "asif.me@aisms.dev",        deptCode: "ME",  empCode: "EMP-019", designation: "Assistant Professor",          phone: "+880-1711-000019", employmentType: "Permanent"   as const, joinedAt: "2021-08-15" },
    { fullName: "Dr. Fahmida Khanam",         email: "fahmida.me@aisms.dev",     deptCode: "ME",  empCode: "EMP-020", designation: "Associate Professor",          phone: "+880-1711-000020", employmentType: "Permanent"   as const, joinedAt: "2019-03-01" },
    // CE (3)
    { fullName: "Dr. Rezaul Karim CE",        email: "rezaul.ce@aisms.dev",      deptCode: "CE",  empCode: "EMP-021", designation: "Professor & Head",             phone: "+880-1711-000021", employmentType: "Permanent"   as const, joinedAt: "2019-01-20" },
    { fullName: "Engr. Salma Hossain",        email: "salma.ce@aisms.dev",       deptCode: "CE",  empCode: "EMP-022", designation: "Assistant Professor",          phone: "+880-1711-000022", employmentType: "Permanent"   as const, joinedAt: "2022-05-01" },
    { fullName: "Mosaddek Ali",               email: "mosaddek.ce@aisms.dev",    deptCode: "CE",  empCode: "EMP-023", designation: "Lecturer",                    phone: "+880-1711-000023", employmentType: "Contractual" as const, contractEndDate: "2027-12-31", joinedAt: "2023-09-01" },
    // ENG (3)
    { fullName: "Dr. Nasreen Akhtar",         email: "nasreen.eng@aisms.dev",    deptCode: "ENG", empCode: "EMP-024", designation: "Associate Professor & Head",   phone: "+880-1711-000024", employmentType: "Permanent"   as const, joinedAt: "2018-04-10" },
    { fullName: "Shahinur Rahman",            email: "shahinur.eng@aisms.dev",   deptCode: "ENG", empCode: "EMP-025", designation: "Senior Lecturer",             phone: "+880-1711-000025", employmentType: "Contractual" as const, contractEndDate: "2028-06-30", joinedAt: "2023-09-01" },
    { fullName: "Mafruha Sultana",            email: "mafruha.eng@aisms.dev",    deptCode: "ENG", empCode: "EMP-026", designation: "Lecturer",                    phone: "+880-1711-000026", employmentType: "Permanent"   as const, joinedAt: "2022-01-15" },
    // PHR (2)
    { fullName: "Dr. Ferdous Ara",            email: "ferdous.phr@aisms.dev",    deptCode: "PHR", empCode: "EMP-027", designation: "Associate Professor",          phone: "+880-1711-000027", employmentType: "Permanent"   as const, joinedAt: "2020-03-01" },
    { fullName: "Md. Anisur Rahman PHR",      email: "anis.phr@aisms.dev",       deptCode: "PHR", empCode: "EMP-028", designation: "Assistant Professor",          phone: "+880-1711-000028", employmentType: "Permanent"   as const, joinedAt: "2021-07-01" },
    // LAW (2)
    { fullName: "Barrister Sabrina Hossain",  email: "sabrina.law@aisms.dev",    deptCode: "LAW", empCode: "EMP-029", designation: "Assistant Professor",          phone: "+880-1711-000029", employmentType: "Contractual" as const, contractEndDate: "2027-10-31", joinedAt: "2022-10-01" },
    { fullName: "Advocate Rashidul Islam",    email: "rashidul.law@aisms.dev",   deptCode: "LAW", empCode: "EMP-030", designation: "Senior Lecturer",             phone: "+880-1711-000030", employmentType: "Permanent"   as const, joinedAt: "2020-06-01" },
  ];

  for (const t of teachersSeed) {
    await db.insert(users).values({ fullName: t.fullName, email: t.email, passwordHash: teacherPasswordHash, role: "teacher", isActive: true }).onConflictDoNothing();
    const [u] = await db.select().from(users).where(eq(users.email, t.email)).limit(1);
    const deptId = deptMap.get(t.deptCode);
    if (u) {
      await db.insert(teachers).values({
        userId: u.id, departmentId: deptId, employeeCode: t.empCode,
        designation: t.designation, phone: t.phone,
        employmentType: t.employmentType, contractEndDate: t.contractEndDate || null, joinedAt: t.joinedAt,
      }).onConflictDoNothing();
    }
  }
  const allTeachers = await db.select().from(teachers);
  const teacherCodeMap = new Map<string, number>();
  allTeachers.forEach((t) => teacherCodeMap.set(t.employeeCode, t.id));
  console.log(`✓ ${allTeachers.length} teachers`);

  // ══════════════════════════════════════════════════════════════
  // 4. COURSES (100+ total)
  // ══════════════════════════════════════════════════════════════
  console.log("📚 Seeding Courses...");
  const coursesSeed = [
    // ── CSE (22 courses) ──
    { code: "CSE-101", title: "Introduction to Programming with C",           credits: 3, deptCode: "CSE", empCode: "EMP-005", semester: "1", capacity: 60 },
    { code: "CSE-102", title: "Discrete Mathematics & Logic",                 credits: 3, deptCode: "CSE", empCode: "EMP-003", semester: "1", capacity: 60 },
    { code: "CSE-103", title: "Digital Logic Design",                         credits: 3, deptCode: "CSE", empCode: "EMP-006", semester: "1", capacity: 55 },
    { code: "CSE-104", title: "Programming Lab (C)",                          credits: 1, deptCode: "CSE", empCode: "EMP-007", semester: "1", capacity: 40 },
    { code: "CSE-201", title: "Data Structures & Algorithms",                 credits: 3, deptCode: "CSE", empCode: "EMP-001", semester: "2", capacity: 60 },
    { code: "CSE-202", title: "Object Oriented Programming (Java)",           credits: 3, deptCode: "CSE", empCode: "EMP-004", semester: "2", capacity: 60 },
    { code: "CSE-203", title: "Computer Architecture & Organization",         credits: 3, deptCode: "CSE", empCode: "EMP-003", semester: "2", capacity: 55 },
    { code: "CSE-204", title: "Data Structures Lab",                          credits: 1, deptCode: "CSE", empCode: "EMP-005", semester: "2", capacity: 40 },
    { code: "CSE-301", title: "Database Systems & SQL",                       credits: 3, deptCode: "CSE", empCode: "EMP-001", semester: "3", capacity: 60 },
    { code: "CSE-302", title: "Computer Networks",                            credits: 3, deptCode: "CSE", empCode: "EMP-003", semester: "3", capacity: 60 },
    { code: "CSE-303", title: "Theory of Computation",                        credits: 3, deptCode: "CSE", empCode: "EMP-002", semester: "3", capacity: 55 },
    { code: "CSE-304", title: "Database Lab",                                 credits: 1, deptCode: "CSE", empCode: "EMP-004", semester: "3", capacity: 40 },
    { code: "CSE-401", title: "Software Engineering & Architecture",          credits: 3, deptCode: "CSE", empCode: "EMP-002", semester: "4", capacity: 60 },
    { code: "CSE-402", title: "Operating Systems",                            credits: 3, deptCode: "CSE", empCode: "EMP-003", semester: "4", capacity: 60 },
    { code: "CSE-403", title: "Web Application Development",                  credits: 3, deptCode: "CSE", empCode: "EMP-004", semester: "4", capacity: 55 },
    { code: "CSE-404", title: "Networks Lab",                                 credits: 1, deptCode: "CSE", empCode: "EMP-007", semester: "4", capacity: 40 },
    { code: "CSE-501", title: "Artificial Intelligence",                      credits: 3, deptCode: "CSE", empCode: "EMP-003", semester: "5", capacity: 55 },
    { code: "CSE-502", title: "Machine Learning & Data Science",              credits: 3, deptCode: "CSE", empCode: "EMP-001", semester: "5", capacity: 50 },
    { code: "CSE-503", title: "Cloud Computing & DevOps",                     credits: 3, deptCode: "CSE", empCode: "EMP-004", semester: "5", capacity: 50 },
    { code: "CSE-601", title: "Cyber Security & Ethical Hacking",             credits: 3, deptCode: "CSE", empCode: "EMP-006", semester: "6", capacity: 50 },
    { code: "CSE-602", title: "Mobile Application Development",               credits: 3, deptCode: "CSE", empCode: "EMP-005", semester: "6", capacity: 50 },
    { code: "CSE-701", title: "Senior Capstone Design Project",               credits: 4, deptCode: "CSE", empCode: "EMP-002", semester: "7", capacity: 45 },

    // ── EEE (16 courses) ──
    { code: "EEE-101", title: "Electrical Circuit Analysis I",                credits: 3, deptCode: "EEE", empCode: "EMP-008", semester: "1", capacity: 60 },
    { code: "EEE-102", title: "Engineering Mathematics I",                    credits: 3, deptCode: "EEE", empCode: "EMP-011", semester: "1", capacity: 60 },
    { code: "EEE-103", title: "Electrical Circuit Lab",                       credits: 1, deptCode: "EEE", empCode: "EMP-012", semester: "1", capacity: 40 },
    { code: "EEE-201", title: "Analog Electronics",                           credits: 3, deptCode: "EEE", empCode: "EMP-009", semester: "2", capacity: 55 },
    { code: "EEE-202", title: "Signals & Systems",                            credits: 3, deptCode: "EEE", empCode: "EMP-010", semester: "2", capacity: 55 },
    { code: "EEE-203", title: "Electronics Lab",                              credits: 1, deptCode: "EEE", empCode: "EMP-012", semester: "2", capacity: 40 },
    { code: "EEE-301", title: "Digital Electronics & Logic Circuits",         credits: 3, deptCode: "EEE", empCode: "EMP-011", semester: "3", capacity: 55 },
    { code: "EEE-302", title: "Electromagnetic Fields & Waves",               credits: 3, deptCode: "EEE", empCode: "EMP-008", semester: "3", capacity: 50 },
    { code: "EEE-401", title: "Digital Signal Processing",                    credits: 3, deptCode: "EEE", empCode: "EMP-009", semester: "4", capacity: 50 },
    { code: "EEE-402", title: "Microprocessors & Embedded Systems",           credits: 3, deptCode: "EEE", empCode: "EMP-010", semester: "4", capacity: 50 },
    { code: "EEE-403", title: "Control Systems Engineering",                  credits: 3, deptCode: "EEE", empCode: "EMP-012", semester: "4", capacity: 50 },
    { code: "EEE-501", title: "Power Systems Engineering",                    credits: 3, deptCode: "EEE", empCode: "EMP-008", semester: "5", capacity: 50 },
    { code: "EEE-502", title: "Renewable Energy Systems",                     credits: 3, deptCode: "EEE", empCode: "EMP-009", semester: "5", capacity: 45 },
    { code: "EEE-601", title: "VLSI Design & Fabrication",                    credits: 3, deptCode: "EEE", empCode: "EMP-011", semester: "6", capacity: 45 },
    { code: "EEE-602", title: "Wireless Communications",                      credits: 3, deptCode: "EEE", empCode: "EMP-010", semester: "6", capacity: 45 },
    { code: "EEE-701", title: "EEE Capstone Design Project",                  credits: 4, deptCode: "EEE", empCode: "EMP-008", semester: "7", capacity: 40 },

    // ── BBA (16 courses) ──
    { code: "BBA-101", title: "Principles of Management",                     credits: 3, deptCode: "BBA", empCode: "EMP-013", semester: "1", capacity: 70 },
    { code: "BBA-102", title: "Business Communication",                       credits: 3, deptCode: "BBA", empCode: "EMP-016", semester: "1", capacity: 70 },
    { code: "BBA-103", title: "Financial Accounting",                         credits: 3, deptCode: "BBA", empCode: "EMP-015", semester: "1", capacity: 70 },
    { code: "BBA-201", title: "Marketing Management",                         credits: 3, deptCode: "BBA", empCode: "EMP-014", semester: "2", capacity: 65 },
    { code: "BBA-202", title: "Business Statistics",                          credits: 3, deptCode: "BBA", empCode: "EMP-015", semester: "2", capacity: 65 },
    { code: "BBA-203", title: "Organizational Behaviour",                     credits: 3, deptCode: "BBA", empCode: "EMP-013", semester: "2", capacity: 65 },
    { code: "BBA-301", title: "Corporate Finance",                            credits: 3, deptCode: "BBA", empCode: "EMP-014", semester: "3", capacity: 60 },
    { code: "BBA-302", title: "Operations Management",                        credits: 3, deptCode: "BBA", empCode: "EMP-016", semester: "3", capacity: 60 },
    { code: "BBA-303", title: "Human Resource Management",                    credits: 3, deptCode: "BBA", empCode: "EMP-017", semester: "3", capacity: 60 },
    { code: "BBA-401", title: "Strategic Management",                         credits: 3, deptCode: "BBA", empCode: "EMP-013", semester: "4", capacity: 60 },
    { code: "BBA-402", title: "Consumer Behaviour & Research",                credits: 3, deptCode: "BBA", empCode: "EMP-014", semester: "4", capacity: 55 },
    { code: "BBA-403", title: "Investment Analysis & Portfolio Management",   credits: 3, deptCode: "BBA", empCode: "EMP-015", semester: "4", capacity: 55 },
    { code: "BBA-501", title: "International Business & Trade",               credits: 3, deptCode: "BBA", empCode: "EMP-013", semester: "5", capacity: 55 },
    { code: "BBA-502", title: "E-Commerce & Digital Marketing",               credits: 3, deptCode: "BBA", empCode: "EMP-017", semester: "5", capacity: 55 },
    { code: "BBA-601", title: "Business Ethics & Corporate Governance",       credits: 3, deptCode: "BBA", empCode: "EMP-016", semester: "6", capacity: 50 },
    { code: "BBA-701", title: "BBA Thesis & Project",                         credits: 4, deptCode: "BBA", empCode: "EMP-013", semester: "7", capacity: 45 },

    // ── ME (12 courses) ──
    { code: "ME-101",  title: "Engineering Mechanics & Statics",              credits: 3, deptCode: "ME",  empCode: "EMP-018", semester: "1", capacity: 55 },
    { code: "ME-102",  title: "Engineering Drawing & CAD",                    credits: 2, deptCode: "ME",  empCode: "EMP-019", semester: "1", capacity: 50 },
    { code: "ME-201",  title: "Applied Thermodynamics",                       credits: 3, deptCode: "ME",  empCode: "EMP-020", semester: "2", capacity: 55 },
    { code: "ME-202",  title: "Dynamics & Vibrations",                        credits: 3, deptCode: "ME",  empCode: "EMP-018", semester: "2", capacity: 50 },
    { code: "ME-301",  title: "Fluid Mechanics",                              credits: 3, deptCode: "ME",  empCode: "EMP-020", semester: "3", capacity: 50 },
    { code: "ME-302",  title: "Manufacturing Processes",                      credits: 3, deptCode: "ME",  empCode: "EMP-019", semester: "3", capacity: 50 },
    { code: "ME-401",  title: "Heat Transfer & Mass Transport",               credits: 3, deptCode: "ME",  empCode: "EMP-020", semester: "4", capacity: 50 },
    { code: "ME-402",  title: "Machine Design & Elements",                    credits: 3, deptCode: "ME",  empCode: "EMP-018", semester: "4", capacity: 45 },
    { code: "ME-501",  title: "Robotics & Automation",                        credits: 3, deptCode: "ME",  empCode: "EMP-019", semester: "5", capacity: 45 },
    { code: "ME-502",  title: "Finite Element Analysis",                      credits: 3, deptCode: "ME",  empCode: "EMP-020", semester: "5", capacity: 40 },
    { code: "ME-601",  title: "Renewable Energy & Sustainability",            credits: 3, deptCode: "ME",  empCode: "EMP-018", semester: "6", capacity: 40 },
    { code: "ME-701",  title: "ME Capstone Project",                          credits: 4, deptCode: "ME",  empCode: "EMP-018", semester: "7", capacity: 35 },

    // ── CE (12 courses) ──
    { code: "CE-101",  title: "Surveying & Geomatics",                        credits: 3, deptCode: "CE",  empCode: "EMP-021", semester: "1", capacity: 55 },
    { code: "CE-102",  title: "Engineering Geology",                          credits: 2, deptCode: "CE",  empCode: "EMP-023", semester: "1", capacity: 50 },
    { code: "CE-201",  title: "Mechanics of Materials",                       credits: 3, deptCode: "CE",  empCode: "EMP-021", semester: "2", capacity: 55 },
    { code: "CE-202",  title: "Fluid Mechanics for Civil",                    credits: 3, deptCode: "CE",  empCode: "EMP-022", semester: "2", capacity: 50 },
    { code: "CE-301",  title: "Structural Analysis",                          credits: 3, deptCode: "CE",  empCode: "EMP-021", semester: "3", capacity: 55 },
    { code: "CE-302",  title: "Soil Mechanics & Foundation",                  credits: 3, deptCode: "CE",  empCode: "EMP-022", semester: "3", capacity: 50 },
    { code: "CE-401",  title: "Reinforced Concrete Design",                   credits: 3, deptCode: "CE",  empCode: "EMP-021", semester: "4", capacity: 50 },
    { code: "CE-402",  title: "Environmental Engineering",                    credits: 3, deptCode: "CE",  empCode: "EMP-023", semester: "4", capacity: 45 },
    { code: "CE-501",  title: "Transportation Engineering",                   credits: 3, deptCode: "CE",  empCode: "EMP-022", semester: "5", capacity: 45 },
    { code: "CE-502",  title: "Hydraulics & Water Resources",                 credits: 3, deptCode: "CE",  empCode: "EMP-021", semester: "5", capacity: 45 },
    { code: "CE-601",  title: "Construction Management",                      credits: 3, deptCode: "CE",  empCode: "EMP-023", semester: "6", capacity: 45 },
    { code: "CE-701",  title: "CE Senior Thesis Project",                     credits: 4, deptCode: "CE",  empCode: "EMP-021", semester: "7", capacity: 35 },

    // ── ENG (8 courses) ──
    { code: "ENG-101", title: "English Composition & Academic Writing",       credits: 3, deptCode: "ENG", empCode: "EMP-024", semester: "1", capacity: 60 },
    { code: "ENG-102", title: "Introduction to Linguistics",                  credits: 3, deptCode: "ENG", empCode: "EMP-026", semester: "1", capacity: 60 },
    { code: "ENG-201", title: "World Literature & Critical Theory",           credits: 3, deptCode: "ENG", empCode: "EMP-025", semester: "2", capacity: 55 },
    { code: "ENG-202", title: "British Literature I",                         credits: 3, deptCode: "ENG", empCode: "EMP-024", semester: "2", capacity: 55 },
    { code: "ENG-301", title: "American Literature",                          credits: 3, deptCode: "ENG", empCode: "EMP-026", semester: "3", capacity: 50 },
    { code: "ENG-302", title: "Creative Writing Workshop",                    credits: 3, deptCode: "ENG", empCode: "EMP-025", semester: "3", capacity: 45 },
    { code: "ENG-401", title: "Postcolonial Literature",                      credits: 3, deptCode: "ENG", empCode: "EMP-024", semester: "4", capacity: 45 },
    { code: "ENG-501", title: "ENG Research Dissertation",                    credits: 4, deptCode: "ENG", empCode: "EMP-024", semester: "5", capacity: 35 },

    // ── PHR (8 courses) ──
    { code: "PHR-101", title: "Inorganic & Physical Pharmacy",                credits: 3, deptCode: "PHR", empCode: "EMP-027", semester: "1", capacity: 50 },
    { code: "PHR-102", title: "Pharmaceutical Biology",                       credits: 3, deptCode: "PHR", empCode: "EMP-028", semester: "1", capacity: 50 },
    { code: "PHR-201", title: "Organic Chemistry for Pharmacy",               credits: 3, deptCode: "PHR", empCode: "EMP-027", semester: "2", capacity: 50 },
    { code: "PHR-202", title: "Pharmaceutics I – Dosage Forms",               credits: 3, deptCode: "PHR", empCode: "EMP-028", semester: "2", capacity: 45 },
    { code: "PHR-301", title: "Pharmacology I – Autonomic Nervous System",    credits: 3, deptCode: "PHR", empCode: "EMP-027", semester: "3", capacity: 45 },
    { code: "PHR-302", title: "Medicinal Chemistry",                          credits: 3, deptCode: "PHR", empCode: "EMP-028", semester: "3", capacity: 45 },
    { code: "PHR-401", title: "Clinical Pharmacy & Therapeutics",             credits: 3, deptCode: "PHR", empCode: "EMP-027", semester: "4", capacity: 40 },
    { code: "PHR-501", title: "Pharmacy Research Project",                    credits: 4, deptCode: "PHR", empCode: "EMP-027", semester: "5", capacity: 35 },

    // ── LAW (8 courses) ──
    { code: "LAW-101", title: "Jurisprudence & Legal Theory",                 credits: 3, deptCode: "LAW", empCode: "EMP-029", semester: "1", capacity: 55 },
    { code: "LAW-102", title: "Constitutional Law of Bangladesh",             credits: 3, deptCode: "LAW", empCode: "EMP-030", semester: "1", capacity: 55 },
    { code: "LAW-201", title: "Law of Contract & Tort",                       credits: 3, deptCode: "LAW", empCode: "EMP-029", semester: "2", capacity: 50 },
    { code: "LAW-202", title: "Criminal Law & Procedure",                     credits: 3, deptCode: "LAW", empCode: "EMP-030", semester: "2", capacity: 50 },
    { code: "LAW-301", title: "Administrative & Public Law",                  credits: 3, deptCode: "LAW", empCode: "EMP-029", semester: "3", capacity: 50 },
    { code: "LAW-302", title: "International Law & Human Rights",             credits: 3, deptCode: "LAW", empCode: "EMP-030", semester: "3", capacity: 45 },
    { code: "LAW-401", title: "Company Law & Corporate Governance",           credits: 3, deptCode: "LAW", empCode: "EMP-029", semester: "4", capacity: 45 },
    { code: "LAW-501", title: "Moot Court & Legal Research Project",          credits: 4, deptCode: "LAW", empCode: "EMP-029", semester: "5", capacity: 35 },
  ];

  for (const c of coursesSeed) {
    const deptId   = deptMap.get(c.deptCode);
    const teacherId = teacherCodeMap.get(c.empCode);
    await db.insert(courses).values({
      title: c.title, code: c.code, credits: c.credits,
      departmentId: deptId, teacherId, semester: c.semester, capacity: c.capacity,
    }).onConflictDoNothing();
  }
  const allCourses = await db.select().from(courses);
  console.log(`✓ ${allCourses.length} courses`);

  // ══════════════════════════════════════════════════════════════
  // 5. STUDENTS (150 total)
  // ══════════════════════════════════════════════════════════════
  console.log("🎓 Seeding Students...");

  // Helper to build a student entry quickly
  type St = {
    fullName: string; email: string; studentCode: string; deptCode: string;
    semester: string; status: "active"|"graduated"|"suspended"|"expired";
    guardianName: string; guardianPhone: string; admissionDate: string;
    graduationDate?: string;
  };

  const mkStu = (
    n: number, fullName: string, email: string, deptCode: string,
    semester: string, status: "active"|"graduated"|"suspended"|"expired",
    guardianName: string, admissionDate: string, graduationDate?: string
  ): St => ({
    fullName, email,
    studentCode: `STU-${String(n).padStart(4, "0")}`,
    deptCode, semester, status, guardianName,
    guardianPhone: `+880-1720-${String(100000 + n)}`,
    admissionDate,
    ...(graduationDate ? { graduationDate } : {}),
  });

  const studentsSeed: St[] = [
    // ── CSE (001–040) ──
    mkStu(1,   "Noor Abdullah",        "student@aisms.dev",              "CSE","3","active",    "Mr. Abdullah",       "2025-01-10"),
    mkStu(2,   "Ayesha Siddiqua",      "ayesha.siddiqua@aisms.dev",     "CSE","3","active",    "Abul Bashar",        "2025-01-10"),
    mkStu(3,   "Md. Farhan Kabir",     "farhan.kabir@aisms.dev",        "CSE","5","active",    "Humayun Kabir",      "2024-01-15"),
    mkStu(4,   "Tasnim Sultana",       "tasnim.sultana@aisms.dev",      "CSE","1","active",    "Sultan Mahmud",      "2026-01-10"),
    mkStu(5,   "Shahriar Hasan",       "shahriar.hasan@aisms.dev",      "CSE","6","active",    "Nazrul Hasan",       "2023-01-12"),
    mkStu(6,   "Fatima Zahra",         "fatima.zahra@aisms.dev",        "CSE","7","graduated", "Zahid Hossain",      "2022-08-01", "2026-05-15"),
    mkStu(7,   "Rifat Hossain",        "rifat.hossain@aisms.dev",       "CSE","4","active",    "Delwar Hossain",     "2024-08-15"),
    mkStu(8,   "Sadia Afrin",          "sadia.afrin@aisms.dev",         "CSE","2","active",    "Mokhlesur Rahman",   "2025-08-10"),
    mkStu(9,   "Mahir Faisal",         "mahir.faisal@aisms.dev",        "CSE","5","active",    "Faisal Ahmed",       "2023-08-12"),
    mkStu(10,  "Nafisa Tabassum",      "nafisa.tabassum@aisms.dev",     "CSE","3","active",    "Shafiqul Islam",     "2025-01-10"),
    mkStu(11,  "Zubair Al Mahmud",     "zubair.mahmud@aisms.dev",       "CSE","7","graduated", "Mahmudul Haque",     "2022-08-01", "2026-05-15"),
    mkStu(12,  "Sumaiya Akter",        "sumaiya.akter@aisms.dev",       "CSE","4","suspended", "Rafiqul Islam",      "2024-01-15"),
    mkStu(13,  "Tanvir Rahman",        "tanvir.rahman@aisms.dev",       "CSE","1","active",    "Habibur Rahman",     "2026-01-10"),
    mkStu(14,  "Anika Bushra",         "anika.bushra@aisms.dev",        "CSE","4","active",    "Golam Kibria",       "2024-08-15"),
    mkStu(15,  "Kazi Mehedi Hasan",    "mehedi.hasan@aisms.dev",        "CSE","2","active",    "Kazi Anwarul",       "2025-08-10"),
    mkStu(16,  "Imran Hossain",        "imran.hossain@aisms.dev",       "CSE","5","active",    "Badrul Hossain",     "2023-08-12"),
    mkStu(17,  "Mitu Akter",           "mitu.akter@aisms.dev",          "CSE","4","active",    "Alamgir Kabir",      "2024-08-15"),
    mkStu(18,  "Rafi Abdullah",        "rafi.abdullah@aisms.dev",       "CSE","2","active",    "Jalal Uddin",        "2025-08-10"),
    mkStu(19,  "Sujon Barua",          "sujon.barua@aisms.dev",         "CSE","6","active",    "Proshanta Barua",    "2023-01-12"),
    mkStu(20,  "Rimi Sultana",         "rimi.sultana@aisms.dev",        "CSE","5","active",    "Nasir Uddin",        "2024-01-15"),
    mkStu(21,  "Arif Hossain",         "arif.hossain@aisms.dev",        "CSE","1","active",    "Shahidul Hossain",   "2026-01-10"),
    mkStu(22,  "Mim Akter",            "mim.akter@aisms.dev",           "CSE","3","active",    "Jalilur Rahman",     "2025-01-10"),
    mkStu(23,  "Razwan Islam",         "razwan.islam@aisms.dev",        "CSE","5","active",    "Shahinul Islam",     "2023-08-12"),
    mkStu(24,  "Priyanka Das",         "priyanka.das@aisms.dev",        "CSE","2","active",    "Subal Chandra Das",  "2025-08-10"),
    mkStu(25,  "Sakib Al Amin",        "sakib.alamin@aisms.dev",        "CSE","4","active",    "Joynal Abedin",      "2024-08-15"),
    mkStu(26,  "Dilnoza Begum",        "dilnoza.begum@aisms.dev",       "CSE","7","graduated", "Motiur Begum",       "2022-08-01", "2026-05-15"),
    mkStu(27,  "Ismail Hossen",        "ismail.hossen@aisms.dev",       "CSE","5","active",    "Nazrul Hossen",      "2024-01-15"),
    mkStu(28,  "Lamiya Ferdousi",      "lamiya.ferdousi@aisms.dev",     "CSE","3","active",    "Mamunur Rashid",     "2025-01-10"),
    mkStu(29,  "Asif Mahmud",          "asif.mahmud@aisms.dev",         "CSE","6","active",    "Mahbubur Rahman",    "2023-01-12"),
    mkStu(30,  "Nadia Nawshin",        "nadia.nawshin@aisms.dev",       "CSE","1","active",    "Nawsher Ali",        "2026-01-10"),
    mkStu(31,  "Tarik Hasan CSE",      "tarik.cse@aisms.dev",           "CSE","3","active",    "Abul Hasan",         "2025-01-10"),
    mkStu(32,  "Samiha Islam",         "samiha.islam@aisms.dev",        "CSE","2","active",    "Shafiqul Hossain",   "2025-08-10"),
    mkStu(33,  "Emon Chowdhury",       "emon.chowdhury@aisms.dev",      "CSE","4","active",    "Kamal Chowdhury",    "2024-08-15"),
    mkStu(34,  "Nahin Ahmed",          "nahin.ahmed@aisms.dev",         "CSE","6","active",    "Masud Ahmed",        "2023-08-12"),
    mkStu(35,  "Sinthia Chowdhury",    "sinthia.chowdhury@aisms.dev",   "CSE","1","active",    "Badal Chowdhury",    "2026-01-10"),
    mkStu(36,  "Jahirul Islam CSE",    "jahirul.cse@aisms.dev",         "CSE","5","active",    "Sirajul Islam",      "2024-01-15"),
    mkStu(37,  "Afsana Mitu",          "afsana.mitu@aisms.dev",         "CSE","3","active",    "Motiur Rahman",      "2025-01-10"),
    mkStu(38,  "Sabbir Hasan",         "sabbir.hasan@aisms.dev",        "CSE","4","suspended", "Anwarul Hasan",      "2024-08-15"),
    mkStu(39,  "Jesmin Ara",           "jesmin.ara@aisms.dev",          "CSE","2","active",    "Amirul Islam",       "2025-08-10"),
    mkStu(40,  "Raihan Kabir",         "raihan.kabir@aisms.dev",        "CSE","6","active",    "Humayun Kabir",      "2023-01-12"),

    // ── EEE (041–075) ──
    mkStu(41,  "Mehzabin Chowdhury",   "mehzabin.chowdhury@aisms.dev",  "EEE","3","active",    "Kamal Chowdhury",    "2025-01-10"),
    mkStu(42,  "Shafiqul EEE",         "shafiqul.eee@aisms.dev",        "EEE","5","active",    "Sirajul Islam",      "2024-01-15"),
    mkStu(43,  "Tahmidur Rahman",      "tahmid.rahman@aisms.dev",       "EEE","1","active",    "Mustafizur Rahman",  "2026-01-10"),
    mkStu(44,  "Nabila Jahan",         "nabila.jahan@aisms.dev",        "EEE","6","active",    "Anisur Rahman",      "2023-01-12"),
    mkStu(45,  "Ashraful Alom",        "ashraful.alom@aisms.dev",       "EEE","4","active",    "Nurul Alom",         "2024-08-15"),
    mkStu(46,  "Rumana Sharmin",       "rumana.sharmin@aisms.dev",      "EEE","7","graduated", "Shamsul Haque",      "2022-08-01", "2026-05-15"),
    mkStu(47,  "Sajid Ahmed",          "sajid.ahmed@aisms.dev",         "EEE","2","active",    "Masud Ahmed",        "2025-08-10"),
    mkStu(48,  "Touhidur Islam",       "touhid.islam@aisms.dev",        "EEE","5","active",    "Anwarul Islam",      "2023-08-12"),
    mkStu(49,  "Sabina Khatun",        "sabina.khatun@aisms.dev",       "EEE","3","active",    "Nurul Kabir",        "2025-01-10"),
    mkStu(50,  "Ehsan Uddin",          "ehsan.uddin@aisms.dev",         "EEE","4","active",    "Shamsuddin Ahmed",   "2024-01-15"),
    mkStu(51,  "Sumaiya Begum EEE",    "sumaiya.eee@aisms.dev",         "EEE","1","active",    "Khurshid Alam",      "2026-01-10"),
    mkStu(52,  "Arafat Hossain",       "arafat.hossain@aisms.dev",      "EEE","4","active",    "Hafizur Rahman",     "2024-08-15"),
    mkStu(53,  "Nishita Rani Paul",    "nishita.paul@aisms.dev",        "EEE","2","active",    "Nikhil Paul",        "2025-08-10"),
    mkStu(54,  "Fahad Bin Karim",      "fahad.karim@aisms.dev",         "EEE","6","active",    "Abdul Karim",        "2023-01-12"),
    mkStu(55,  "Farhana Yesmin",       "farhana.yesmin@aisms.dev",      "EEE","5","active",    "Yeasin Kabir",       "2023-08-12"),
    mkStu(56,  "Rony Ahmed EEE",       "rony.eee@aisms.dev",            "EEE","3","active",    "Jamal Ahmed",        "2025-01-10"),
    mkStu(57,  "Lubna Akter",          "lubna.akter@aisms.dev",         "EEE","2","active",    "Lutfur Rahman",      "2025-08-10"),
    mkStu(58,  "Mubin Hossain",        "mubin.hossain@aisms.dev",       "EEE","5","active",    "Amir Hossain",       "2024-01-15"),
    mkStu(59,  "Tania Begum EEE",      "tania.eee@aisms.dev",           "EEE","4","active",    "Kadir Hossain",      "2024-08-15"),
    mkStu(60,  "Zahirul Islam EEE",    "zahirul.eee@aisms.dev",         "EEE","6","active",    "Ruhul Amin",         "2023-08-12"),
    mkStu(61,  "Runa Laila EEE",       "runa.eee@aisms.dev",            "EEE","1","active",    "Asadul Islam",       "2026-01-10"),
    mkStu(62,  "Saidul Islam EEE",     "saidul.eee@aisms.dev",          "EEE","7","graduated", "Azizul Islam",       "2022-08-01", "2026-05-15"),
    mkStu(63,  "Mirza Hasan EEE",      "mirza.eee@aisms.dev",           "EEE","3","active",    "Mirza Kamal",        "2025-01-10"),
    mkStu(64,  "Munni Begum EEE",      "munni.eee@aisms.dev",           "EEE","2","active",    "Nurul Huda",         "2025-08-10"),
    mkStu(65,  "Jobayer Ahmed EEE",    "jobayer.eee@aisms.dev",         "EEE","4","active",    "Moajjem Hossain",    "2024-08-15"),

    // ── BBA (066–095) ──
    mkStu(66,  "Ishrat Jahan",         "ishrat.jahan@aisms.dev",        "BBA","3","active",    "Shafiqul Alam",      "2025-01-10"),
    mkStu(67,  "Raihan Ullah",         "raihan.ullah@aisms.dev",        "BBA","1","active",    "Aman Ullah",         "2026-01-10"),
    mkStu(68,  "Zarin Subah",          "zarin.subah@aisms.dev",         "BBA","5","active",    "Monirul Islam",      "2024-01-15"),
    mkStu(69,  "Shakib Al Hasan",      "shakib.hasan@aisms.dev",        "BBA","5","active",    "Mashrafe Hasan",     "2023-08-12"),
    mkStu(70,  "Jannatul Ferdous",     "jannatul.ferdous@aisms.dev",    "BBA","4","active",    "Ferdous Ahmed",      "2024-08-15"),
    mkStu(71,  "Muhtasim Billah",      "muhtasim.billah@aisms.dev",     "BBA","2","active",    "Motiur Rahman",      "2025-08-10"),
    mkStu(72,  "Samia Rahman",         "samia.rahman@aisms.dev",        "BBA","7","graduated", "Bazlur Rahman",      "2022-08-01", "2026-05-15"),
    mkStu(73,  "Tamim Iqbal BBA",      "tamim.bba@aisms.dev",           "BBA","6","active",    "Aminul Haque",       "2023-01-12"),
    mkStu(74,  "Moumita Dhar",         "moumita.dhar@aisms.dev",        "BBA","5","active",    "Ramaprasad Dhar",    "2024-01-15"),
    mkStu(75,  "Tarek Hasan BBA",      "tarek.bba@aisms.dev",           "BBA","3","active",    "Abul Hasan",         "2025-01-10"),
    mkStu(76,  "Nusrat Tasnim",        "nusrat.tasnim@aisms.dev",       "BBA","1","active",    "Touhiduzzaman",      "2026-01-10"),
    mkStu(77,  "Abdullah Al Mamun",    "almamun.bba@aisms.dev",         "BBA","4","active",    "Mamunur Rashid",     "2024-08-15"),
    mkStu(78,  "Sonia Akhter",         "sonia.akhter@aisms.dev",        "BBA","2","active",    "Khaled Hossain",     "2025-08-10"),
    mkStu(79,  "Rafiqul Hasan BBA",    "rafiqul.bba@aisms.dev",         "BBA","5","active",    "Siddiqur Rahman",    "2023-08-12"),
    mkStu(80,  "Mahmuda Khanam",       "mahmuda.khanam@aisms.dev",      "BBA","7","graduated", "Zahurul Islam",      "2022-08-01", "2026-05-15"),
    mkStu(81,  "Fardin Kawsar",        "fardin.kawsar@aisms.dev",       "BBA","6","active",    "Mosharrof Hossain",  "2023-01-12"),
    mkStu(82,  "Khadija Akter BBA",    "khadija.bba@aisms.dev",         "BBA","3","active",    "Mofizul Islam",      "2025-01-10"),
    mkStu(83,  "Rezaul Haque BBA",     "rezaul.bba@aisms.dev",          "BBA","4","active",    "Shafiqul Haque",     "2024-08-15"),
    mkStu(84,  "Shuvo Islam BBA",      "shuvo.bba@aisms.dev",           "BBA","2","active",    "Saiful Islam",       "2025-08-10"),
    mkStu(85,  "Toma Akter BBA",       "toma.bba@aisms.dev",            "BBA","6","active",    "Nurul Akter",        "2023-08-12"),
    mkStu(86,  "Prodip Kumar",         "prodip.bba@aisms.dev",          "BBA","1","active",    "Tarun Kumar",        "2026-01-10"),
    mkStu(87,  "Ruksana Begum",        "ruksana.bba@aisms.dev",         "BBA","5","active",    "Zahir Uddin",        "2024-01-15"),
    mkStu(88,  "Sabbir Ahmed BBA",     "sabbir.bba@aisms.dev",          "BBA","3","active",    "Jahangir Ahmed",     "2025-01-10"),
    mkStu(89,  "Meherun Nesa",         "meherun.bba@aisms.dev",         "BBA","4","suspended", "Nesar Ahmed",        "2024-08-15"),
    mkStu(90,  "Dipu Chandra BBA",     "dipu.bba@aisms.dev",            "BBA","2","active",    "Bikash Chandra",     "2025-08-10"),

    // ── ME (091–107) ──
    mkStu(91,  "Mahmudul Hasan ME",    "mahmudul.me@aisms.dev",         "ME","3","active",     "Abul Kalam",         "2025-01-10"),
    mkStu(92,  "Lamia Haque ME",       "lamia.me@aisms.dev",            "ME","5","active",     "Enamul Haque",       "2024-01-15"),
    mkStu(93,  "Asaduzzaman Nur",      "asaduzzaman.nur@aisms.dev",     "ME","2","active",     "Zahirul Islam",      "2025-08-10"),
    mkStu(94,  "Nusrat Jahan ME",      "nusrat.me@aisms.dev",           "ME","6","active",     "Jahangir Alam",      "2023-01-12"),
    mkStu(95,  "Sazid Alam ME",        "sazid.me@aisms.dev",            "ME","4","active",     "Morshedul Alam",     "2024-08-15"),
    mkStu(96,  "Tanjila Hossain ME",   "tanjila.me@aisms.dev",          "ME","1","active",     "Delwar Hossain",     "2026-01-10"),
    mkStu(97,  "Rakibul Hasan ME",     "rakibul.me@aisms.dev",          "ME","5","active",     "Habibur Rahman",     "2023-08-12"),
    mkStu(98,  "Nowrin Sultana ME",    "nowrin.me@aisms.dev",           "ME","7","graduated",  "Sultanul Islam",     "2022-08-01", "2026-05-15"),
    mkStu(99,  "Iftekharul Islam ME",  "iftekhar.me@aisms.dev",         "ME","5","active",     "Azizul Islam",       "2024-01-15"),
    mkStu(100, "Pavel Hossain",        "pavel.me@aisms.dev",            "ME","4","active",     "Badrul Hossain",     "2024-08-15"),
    mkStu(101, "Sadia Khanom ME",      "sadia.me@aisms.dev",            "ME","2","active",     "Amirul Islam",       "2025-08-10"),
    mkStu(102, "Faruk Ahmed ME",       "faruk.me@aisms.dev",            "ME","6","active",     "Masud Alam",         "2023-08-12"),
    mkStu(103, "Habiba Sultana ME",    "habiba.me@aisms.dev",           "ME","3","active",     "Lutfur Rahman",      "2025-01-10"),

    // ── CE (108–120) ──
    mkStu(104, "Golam Mostafa CE",     "golam.ce@aisms.dev",            "CE","4","active",     "Mustafa Kamal",      "2024-08-15"),
    mkStu(105, "Sharmin Sultana CE",   "sharmin.ce@aisms.dev",          "CE","5","active",     "Abdur Rashid",       "2023-08-12"),
    mkStu(106, "Nazmul Huda CE",       "nazmul.ce@aisms.dev",           "CE","2","active",     "Shamsul Huda",       "2025-08-10"),
    mkStu(107, "Morshedur Rahman",     "morshed.ce@aisms.dev",          "CE","1","active",     "Lutfur Rahman",      "2026-01-10"),
    mkStu(108, "Rina Begum CE",        "rina.ce@aisms.dev",             "CE","3","active",     "Nurul Kabir",        "2025-01-10"),
    mkStu(109, "Jahidul Islam CE",     "jahidul.ce@aisms.dev",          "CE","5","active",     "Sirajul Hossain",    "2024-01-15"),
    mkStu(110, "Sabrina Afrose",       "sabrina.ce@aisms.dev",          "CE","6","active",     "Shahadat Hossain",   "2023-01-12"),
    mkStu(111, "Habibur Rahman CE",    "habibur.ce@aisms.dev",          "CE","7","graduated",  "Azizur Rahman",      "2022-08-01", "2026-05-15"),
    mkStu(112, "Parveen Akter CE",     "parveen.ce@aisms.dev",          "CE","4","active",     "Mostafizur Rahman",  "2024-08-15"),
    mkStu(113, "Shaon Biswas CE",      "shaon.ce@aisms.dev",            "CE","5","active",     "Sunil Biswas",       "2023-08-12"),
    mkStu(114, "Jahangir Alam CE",     "jahangir.ce@aisms.dev",         "CE","2","active",     "Shamsul Alam",       "2025-08-10"),
    mkStu(115, "Runu Begum CE",        "runu.ce@aisms.dev",             "CE","3","active",     "Abul Bashar",        "2025-01-10"),
    mkStu(116, "Sadek Hossain CE",     "sadek.ce@aisms.dev",            "CE","6","active",     "Mokhlesur Hossain",  "2023-08-12"),

    // ── ENG (121–130) ──
    mkStu(117, "Fariha Zaman ENG",     "fariha.eng@aisms.dev",          "ENG","3","active",    "Kamruzzaman",        "2025-01-10"),
    mkStu(118, "Shafiul Alam ENG",     "shafiul.eng@aisms.dev",         "ENG","5","active",    "Badiul Alam",        "2024-01-15"),
    mkStu(119, "Marzia Khanom ENG",    "marzia.eng@aisms.dev",          "ENG","1","active",    "Mizanur Rahman",     "2026-01-10"),
    mkStu(120, "Ruma Begum ENG",       "ruma.eng@aisms.dev",            "ENG","4","active",    "Abdul Wahab",        "2024-08-15"),
    mkStu(121, "Sadiq Hassan ENG",     "sadiq.eng@aisms.dev",           "ENG","5","active",    "Nasir Hassan",       "2023-08-12"),
    mkStu(122, "Mehnaj Farida",        "mehnaj.eng@aisms.dev",          "ENG","2","active",    "Farid Uddin",        "2025-08-10"),
    mkStu(123, "Tanveer Ahmed ENG",    "tanveer.eng@aisms.dev",         "ENG","6","active",    "Mahbub Ahmed",       "2023-01-12"),
    mkStu(124, "Sifat Zahin",          "sifat.eng@aisms.dev",           "ENG","7","graduated", "Zahin Uddin",        "2022-08-01", "2026-05-15"),
    mkStu(125, "Bilkis Parvin ENG",    "bilkis.eng@aisms.dev",          "ENG","3","active",    "Parvin Hossain",     "2025-01-10"),
    mkStu(126, "Omar Faruk ENG",       "omar.eng@aisms.dev",            "ENG","4","active",    "Faruk Hossain",      "2024-08-15"),

    // ── PHR (131–141) ──
    mkStu(127, "Nahid Parvez PHR",     "nahid.phr@aisms.dev",           "PHR","4","active",    "Parvez Hossain",     "2024-08-15"),
    mkStu(128, "Tasnuva Shahrin",      "tasnuva.phr@aisms.dev",         "PHR","5","active",    "Shahriar Kabir",     "2023-08-12"),
    mkStu(129, "Rakib Mia PHR",        "rakib.phr@aisms.dev",           "PHR","2","active",    "Younus Mia",         "2025-08-10"),
    mkStu(130, "Shirin Akhter PHR",    "shirin.phr@aisms.dev",          "PHR","1","active",    "Aminul Haque",       "2026-01-10"),
    mkStu(131, "Khalid Hossain PHR",   "khalid.phr@aisms.dev",          "PHR","3","active",    "Badiuzzaman",        "2025-01-10"),
    mkStu(132, "Orpita Das PHR",       "orpita.phr@aisms.dev",          "PHR","5","active",    "Arun Das",           "2024-01-15"),
    mkStu(133, "Mizanur Rashid PHR",   "mizan.phr@aisms.dev",           "PHR","6","active",    "Abdur Rashid",       "2023-01-12"),
    mkStu(134, "Nabeela Khanam",       "nabeela.phr@aisms.dev",         "PHR","7","graduated", "Shamim Hossain",     "2022-08-01", "2026-05-15"),
    mkStu(135, "Afsana Akter PHR",     "afsana.phr@aisms.dev",          "PHR","3","active",    "Nurul Akter",        "2025-01-10"),
    mkStu(136, "Niaz Ahmed PHR",       "niaz.phr@aisms.dev",            "PHR","4","active",    "Shahidul Ahmed",     "2024-08-15"),
    mkStu(137, "Jesmin PHR",           "jesmin.phr@aisms.dev",          "PHR","2","active",    "Kamal Hossain",      "2025-08-10"),

    // ── LAW (142–150) ──
    mkStu(138, "Fahim Muntasir LAW",   "fahim.law@aisms.dev",           "LAW","3","active",    "Muntasir Billah",    "2025-01-10"),
    mkStu(139, "Sanjida Islam LAW",    "sanjida.law@aisms.dev",         "LAW","5","active",    "Monjurul Islam",     "2024-01-15"),
    mkStu(140, "Arifuzzaman Shuvo",    "arifuzzaman.law@aisms.dev",     "LAW","1","active",    "Zaman Hossain",      "2026-01-10"),
    mkStu(141, "Rawnok Jahan LAW",     "rawnok.law@aisms.dev",          "LAW","4","active",    "Rafiqul Jahan",      "2024-08-15"),
    mkStu(142, "Asraful Kadir LAW",    "asraful.law@aisms.dev",         "LAW","2","active",    "Abdul Kadir",        "2025-08-10"),
    mkStu(143, "Nasrin Nahar LAW",     "nasrin.law@aisms.dev",          "LAW","5","active",    "Nahar Begum",        "2023-08-12"),
    mkStu(144, "Saifuddin Hossain",    "saifuddin.law@aisms.dev",       "LAW","6","active",    "Sanaullah Hossain",  "2023-01-12"),
    mkStu(145, "Tania Akter LAW",      "tania.law@aisms.dev",           "LAW","7","graduated", "Anisur Akter",       "2022-08-01", "2026-05-15"),
    mkStu(146, "Faysal Mahmud LAW",    "faysal.law@aisms.dev",          "LAW","5","active",    "Mahmudur Rahman",    "2024-01-15"),
    mkStu(147, "Rokibul Hasan LAW",    "rokibul.law@aisms.dev",         "LAW","3","active",    "Sirajul Hasan",      "2025-01-10"),
    mkStu(148, "Lima Akter LAW",       "lima.law@aisms.dev",            "LAW","4","active",    "Shamim Akter",       "2024-08-15"),
    mkStu(149, "Alamin Hossain LAW",   "alamin.law@aisms.dev",          "LAW","2","active",    "Kamal Hossain",      "2025-08-10"),
    mkStu(150, "Parisa Begum LAW",     "parisa.law@aisms.dev",          "LAW","6","active",    "Rafiqul Begum",      "2023-08-12"),
  ];

  for (const s of studentsSeed) {
    await db.insert(users).values({
      fullName: s.fullName, email: s.email, passwordHash: studentPasswordHash,
      role: "student", isActive: s.status !== "suspended",
    }).onConflictDoNothing();

    const [u] = await db.select().from(users).where(eq(users.email, s.email)).limit(1);
    const deptId = deptMap.get(s.deptCode);
    if (u) {
      await db.insert(students).values({
        userId: u.id, departmentId: deptId, studentCode: s.studentCode,
        semester: s.semester, guardianName: s.guardianName,
        guardianPhone: s.guardianPhone, admissionDate: s.admissionDate,
        status: s.status, graduationDate: s.graduationDate || null,
      }).onConflictDoNothing();
    }
  }

  const allStudents = await db.select().from(students);
  console.log(`✓ ${allStudents.length} students`);

  // ══════════════════════════════════════════════════════════════
  // 6. ENROLLMENTS
  // ══════════════════════════════════════════════════════════════
  console.log("📝 Seeding Enrollments...");
  const enrollmentEntries: Array<{ studentId: number; courseId: number }> = [];

  for (const stu of allStudents) {
    const deptCourses = allCourses.filter((c) => c.departmentId === stu.departmentId);
    // Enroll in semester-matched courses; pad to at least 4 courses per student
    let assignedCourses = deptCourses.filter((c) => c.semester === stu.semester);
    if (assignedCourses.length < 4) {
      const extra = deptCourses
        .filter((c) => c.semester !== stu.semester)
        .slice(0, 4 - assignedCourses.length);
      assignedCourses = [...assignedCourses, ...extra];
    }
    for (const c of assignedCourses) {
      enrollmentEntries.push({ studentId: stu.id, courseId: c.id });
    }
  }

  const chunkSize = 200;
  for (let i = 0; i < enrollmentEntries.length; i += chunkSize) {
    await db.insert(enrollments).values(enrollmentEntries.slice(i, i + chunkSize)).onConflictDoNothing();
  }
  const allEnrollments = await db.select().from(enrollments);
  console.log(`✓ ${allEnrollments.length} enrollments`);

  // ══════════════════════════════════════════════════════════════
  // 7. ATTENDANCE (last 25 class days)
  // ══════════════════════════════════════════════════════════════
  console.log("📅 Seeding Attendance...");

  const classDates: string[] = [];
  const today = new Date();
  for (let i = 1; i <= 40 && classDates.length < 25; i++) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    if (d.getDay() !== 0 && d.getDay() !== 6) {
      classDates.push(d.toISOString().slice(0, 10));
    }
  }

  const courseById = new Map<number, typeof allCourses[0]>();
  allCourses.forEach((c) => courseById.set(c.id, c));

  const attendanceEntries: Array<{
    studentId: number; courseId: number; date: string;
    status: "present"|"absent"|"late"|"excused"; markedByTeacherId: number|null;
  }> = [];

  for (const enr of allEnrollments) {
    const course   = courseById.get(enr.courseId);
    const teacherId = course?.teacherId ?? null;
    const profile  = (enr.studentId + enr.courseId) % 10;

    for (let di = 0; di < classDates.length; di++) {
      let status: "present"|"absent"|"late"|"excused" = "present";
      if (profile <= 1) {
        status = di % 3 === 0 ? "absent" : di % 5 === 0 ? "late" : "present";
      } else if (profile === 2) {
        status = di % 7 === 0 ? "excused" : di % 4 === 0 ? "late" : "present";
      } else if (profile === 3) {
        status = di % 6 === 0 ? "absent" : "present";
      } else {
        if (di === 2 && enr.studentId % 5 === 0) status = "absent";
        else if (di === 8 && enr.studentId % 7 === 0) status = "late";
        else status = "present";
      }

      attendanceEntries.push({
        studentId: enr.studentId, courseId: enr.courseId,
        date: classDates[di]!, status, markedByTeacherId: teacherId,
      });
    }
  }

  for (let i = 0; i < attendanceEntries.length; i += chunkSize) {
    await db.insert(attendance).values(attendanceEntries.slice(i, i + chunkSize)).onConflictDoNothing();
  }
  const totalAttendance = await db.select({ count: sql<number>`count(*)::int` }).from(attendance);
  console.log(`✓ ${totalAttendance[0]?.count ?? 0} attendance records`);

  // ══════════════════════════════════════════════════════════════
  // 8. RESULTS
  // ══════════════════════════════════════════════════════════════
  console.log("📊 Seeding Results...");
  const resultEntries: Array<{
    studentId: number; courseId: number; marks: string;
    gradePoint: string; semester: string; publishedByTeacherId: number|null;
  }> = [];

  for (const enr of allEnrollments) {
    const course   = courseById.get(enr.courseId);
    const teacherId = course?.teacherId ?? null;
    const base     = 55 + ((enr.studentId * 13 + enr.courseId * 7) % 43);
    const marks    = Math.min(97.5, Math.max(48.0, base + (enr.studentId % 3) * 1.5));
    let gp = 0.0;
    if      (marks >= 80) gp = 4.00;
    else if (marks >= 75) gp = 3.75;
    else if (marks >= 70) gp = 3.50;
    else if (marks >= 65) gp = 3.25;
    else if (marks >= 60) gp = 3.00;
    else if (marks >= 55) gp = 2.75;
    else if (marks >= 50) gp = 2.50;
    else if (marks >= 45) gp = 2.25;
    else                  gp = 0.00;

    resultEntries.push({
      studentId: enr.studentId, courseId: enr.courseId,
      marks: marks.toFixed(2), gradePoint: gp.toFixed(2),
      semester: course?.semester || "1", publishedByTeacherId: teacherId,
    });
  }

  for (let i = 0; i < resultEntries.length; i += chunkSize) {
    await db.insert(results).values(resultEntries.slice(i, i + chunkSize)).onConflictDoNothing();
  }
  const totalResults = await db.select({ count: sql<number>`count(*)::int` }).from(results);
  console.log(`✓ ${totalResults[0]?.count ?? 0} results`);

  // ══════════════════════════════════════════════════════════════
  // 9. FEES
  // ══════════════════════════════════════════════════════════════
  console.log("💳 Seeding Fees...");
  const adminId   = primaryAdmin?.id ?? null;
  const feeEntries: Array<{
    studentId: number; title: string; amount: string; semester: string;
    dueDate: string; status: "pending"|"paid"|"overdue"|"waived";
    paidAt: Date|null; createdByUserId: number|null;
  }> = [];

  for (const stu of allStudents) {
    const sem = stu.semester;

    // Tuition
    const tuitionAmt = (30000 + ((stu.id * 1200) % 20000)).toFixed(2);
    const tuitionStatus: "paid"|"pending"|"overdue"|"waived" =
      stu.status === "graduated" ? "paid"
      : stu.id % 4 === 0 ? "overdue"
      : stu.id % 5 === 0 ? "waived"
      : stu.id % 3 === 0 ? "pending"
      : "paid";

    feeEntries.push({
      studentId: stu.id,
      title: `Semester ${sem} Tuition Fee`,
      amount: tuitionAmt, semester: sem,
      dueDate: tuitionStatus === "overdue" ? "2026-09-15" : "2026-11-30",
      status: tuitionStatus,
      paidAt: tuitionStatus === "paid" ? new Date("2026-10-10T10:00:00Z") : null,
      createdByUserId: adminId,
    });

    // Lab fee
    const labStatus: "paid"|"pending" = stu.id % 2 === 0 ? "paid" : "pending";
    feeEntries.push({
      studentId: stu.id, title: "Lab & Technology Infrastructure Fee",
      amount: "5500.00", semester: sem, dueDate: "2026-11-30",
      status: labStatus,
      paidAt: labStatus === "paid" ? new Date("2026-10-15T11:00:00Z") : null,
      createdByUserId: adminId,
    });

    // Library fee (every 3rd student)
    if (stu.id % 3 === 0) {
      feeEntries.push({
        studentId: stu.id, title: "Central Library & Digital Access Fee",
        amount: "1800.00", semester: sem, dueDate: "2026-11-20",
        status: "paid",
        paidAt: new Date("2026-10-05T09:15:00Z"),
        createdByUserId: adminId,
      });
    }

    // Sports & Activity fee (every 5th student)
    if (stu.id % 5 === 0) {
      feeEntries.push({
        studentId: stu.id, title: "Sports, Culture & Club Activity Fee",
        amount: "2500.00", semester: sem, dueDate: "2026-11-25",
        status: stu.id % 10 === 0 ? "overdue" : "pending",
        paidAt: null, createdByUserId: adminId,
      });
    }

    // Transport card (every 4th student)
    if (stu.id % 4 === 0) {
      feeEntries.push({
        studentId: stu.id, title: "Campus Transport Card (Semester Pass)",
        amount: "3200.00", semester: sem, dueDate: "2026-10-31",
        status: "paid",
        paidAt: new Date("2026-10-01T08:00:00Z"),
        createdByUserId: adminId,
      });
    }

    // Exam form fee
    feeEntries.push({
      studentId: stu.id, title: `Semester ${sem} Examination Form Fee`,
      amount: "800.00", semester: sem, dueDate: "2026-10-20",
      status: stu.id % 6 === 0 ? "pending" : "paid",
      paidAt: stu.id % 6 === 0 ? null : new Date("2026-10-12T13:00:00Z"),
      createdByUserId: adminId,
    });

    // Convocation for graduated students
    if (stu.status === "graduated") {
      feeEntries.push({
        studentId: stu.id, title: "Convocation & Degree Certificate Clearance",
        amount: "12000.00", semester: "8", dueDate: "2026-04-30",
        status: "paid",
        paidAt: new Date("2026-04-20T16:00:00Z"),
        createdByUserId: adminId,
      });
    }
  }

  for (let i = 0; i < feeEntries.length; i += chunkSize) {
    await db.insert(fees).values(feeEntries.slice(i, i + chunkSize)).onConflictDoNothing();
  }
  const totalFees = await db.select({ count: sql<number>`count(*)::int` }).from(fees);
  console.log(`✓ ${totalFees[0]?.count ?? 0} fee records`);

  // ══════════════════════════════════════════════════════════════
  // 10. NOTICES (20 notices covering all audiences)
  // ══════════════════════════════════════════════════════════════
  console.log("📢 Seeding Notices...");
  const noticesSeed = [
    { title: "Semester Final Examination Routine – Fall 2026", audience: "all" as const,
      body: "The final examination routine for all undergraduate programs has been published by the Controller of Examinations. Students must download admit cards from the portal." },
    { title: "National AI Hackathon & Project Showcase 2026", audience: "all" as const,
      body: "CSE Department invites student teams to register for the National AI Hackathon 2026. Prize pool of ৳3,00,000 BDT with mentorship from industry experts." },
    { title: "Mandatory Course Pre-Registration – Spring 2027", audience: "students" as const,
      body: "Course pre-registration for Spring 2027 opens Monday. Students must clear all pending tuition dues to activate the course selection panel." },
    { title: "Faculty Development Workshop: AI in Education", audience: "teachers" as const,
      body: "All faculty are invited to the pedagogy development workshop on AI and automated assessment systems – Saturday, 10:00 AM in the Conference Hall." },
    { title: "Campus Closure – National Victory Day (16 December)", audience: "all" as const,
      body: "Administrative offices and academic departments will be closed on 16th December. Regular classes resume the following day." },
    { title: "Library Book Return Deadline", audience: "students" as const,
      body: "Students with borrowed books must return or renew by the 25th of this month to avoid overdue fines and holds on grade cards." },
    { title: "Grade Submission Deadline – Faculty", audience: "teachers" as const,
      body: "All instructors must finalize internal marks, mid-term evaluations, and attendance records on AISMS by Friday midnight." },
    { title: "Merit-Based Tuition Fee Waiver Applications Open", audience: "students" as const,
      body: "Applications for 25%–100% tuition waivers for students with CGPA 3.80+ or documented financial hardship are now being accepted." },
    { title: "AISMS Platform Maintenance – Tonight 2:00–4:00 AM", audience: "all" as const,
      body: "IT Department will perform scheduled infrastructure upgrades tonight. Student and teacher portals may experience intermittent pauses." },
    { title: "Convocation 2026: Gown Distribution & Rehearsal", audience: "all" as const,
      body: "Graduated students from all faculties should collect academic gowns from the Registrar's Office starting Wednesday. Rehearsal in the Central Auditorium." },
    { title: "New Academic Calendar 2026-2027 Published", audience: "all" as const,
      body: "The revised academic calendar for 2026-2027 is now available on the AISMS portal. Please note important dates for exams, holidays, and semester breaks." },
    { title: "Blood Donation Camp – University Medical Center", audience: "all" as const,
      body: "A voluntary blood donation camp will be held in the University Medical Center on 20th November. All students and staff are encouraged to participate." },
    { title: "PhD Scholarship Applications – Spring 2027", audience: "students" as const,
      body: "The university is accepting applications for fully-funded PhD scholarships for the Spring 2027 semester. Eligible candidates with CGPA 3.75+ may apply." },
    { title: "Emergency Contact Update Required", audience: "students" as const,
      body: "All students are requested to update emergency contact information in the student portal by 30th November. This is mandatory for semester registration." },
    { title: "Seminar: Industry Trends in Software Engineering", audience: "all" as const,
      body: "CSE Department hosts a seminar with industry experts from leading tech companies. All CS students and faculty are cordially invited on 15th November at 2 PM." },
    { title: "Anti-Ragging Policy Reminder", audience: "students" as const,
      body: "The university strictly enforces a zero-tolerance anti-ragging policy. Any incidents should be reported immediately to the Dean of Students office." },
    { title: "Research Grant Applications Open – Faculty", audience: "teachers" as const,
      body: "Faculty members may apply for university research grants up to ৳5,00,000 for applied research projects. Application deadline is 15th December." },
    { title: "NSS Volunteer Registration Open", audience: "students" as const,
      body: "National Service Scheme volunteer registration for 2026-27 is now open. Students can earn extra-curricular credit through NSS community service activities." },
    { title: "Annual Sports Fest – Registration Open", audience: "all" as const,
      body: "AISMS Annual Sports Fest will be held from 1st–5th December. Students can register for cricket, football, badminton, chess, and athletics events." },
    { title: "Updated Exam Policy: Use of AI Tools", audience: "all" as const,
      body: "The academic council has published updated guidelines on the permitted use of AI tools during assignments and exams. Faculty must communicate these rules to students." },
  ];

  for (const n of noticesSeed) {
    await db.insert(notices).values({ ...n, createdByUserId: primaryAdmin!.id }).onConflictDoNothing();
  }
  const totalNotices = await db.select({ count: sql<number>`count(*)::int` }).from(notices);
  console.log(`✓ ${totalNotices[0]?.count ?? 0} notices`);

  // ══════════════════════════════════════════════════════════════
  // 11. AUDIT LOGS (20+ entries)
  // ══════════════════════════════════════════════════════════════
  console.log("📜 Seeding Audit Logs...");
  const auditEntries = [
    { userId: primaryAdmin!.id, action: "SYSTEM_INITIALIZATION",      metadata: JSON.stringify({ version: "2.0", provider: "AISMS Enterprise" }) },
    { userId: primaryAdmin!.id, action: "DEPARTMENT_BATCH_CREATED",   metadata: JSON.stringify({ codes: ["CSE","EEE","BBA","ME","CE","ENG","PHR","LAW"] }) },
    { userId: primaryAdmin!.id, action: "COURSE_BATCH_CREATED",       metadata: JSON.stringify({ total: allCourses.length }) },
    { userId: primaryAdmin!.id, action: "STUDENT_BATCH_IMPORTED",     metadata: JSON.stringify({ total: allStudents.length }) },
    { userId: primaryAdmin!.id, action: "FEE_STRUCTURE_ESTABLISHED",  metadata: JSON.stringify({ currency: "BDT", scope: "Undergraduate" }) },
    { userId: primaryAdmin!.id, action: "NOTICE_PUBLISHED",           metadata: JSON.stringify({ title: "Semester Final Examination Routine" }) },
    { userId: primaryAdmin!.id, action: "NOTICE_PUBLISHED",           metadata: JSON.stringify({ title: "Merit-Based Tuition Fee Waiver Applications Open" }) },
    { userId: primaryAdmin!.id, action: "ADMIN_LOGIN",                metadata: JSON.stringify({ email: "admin@aisms.dev", ip: "192.168.1.1" }) },
    { userId: primaryAdmin!.id, action: "AI_MODEL_CALIBRATED",        metadata: JSON.stringify({ provider: "mistral", model: "mistral-small-latest" }) },
    { userId: primaryAdmin!.id, action: "BACKUP_COMPLETED",           metadata: JSON.stringify({ size_mb: 142, tables: 11 }) },
    { userId: allTeachers[0]?.userId ?? primaryAdmin!.id, action: "ATTENDANCE_BATCH_MARKED",  metadata: JSON.stringify({ courseCode: "CSE-301", days: 25 }) },
    { userId: allTeachers[0]?.userId ?? primaryAdmin!.id, action: "RESULTS_PUBLISHED",        metadata: JSON.stringify({ courseCode: "CSE-301", semester: "3" }) },
    { userId: allTeachers[1]?.userId ?? primaryAdmin!.id, action: "ATTENDANCE_BATCH_MARKED",  metadata: JSON.stringify({ courseCode: "EEE-201", days: 25 }) },
    { userId: allTeachers[1]?.userId ?? primaryAdmin!.id, action: "RESULTS_PUBLISHED",        metadata: JSON.stringify({ courseCode: "EEE-201", semester: "2" }) },
    { userId: allTeachers[2]?.userId ?? primaryAdmin!.id, action: "COURSE_UPDATED",           metadata: JSON.stringify({ courseCode: "CSE-401", field: "capacity", old: 50, new: 55 }) },
    { userId: primaryAdmin!.id, action: "STUDENT_STATUS_CHANGED",     metadata: JSON.stringify({ studentCode: "STU-0012", old: "active", new: "suspended" }) },
    { userId: primaryAdmin!.id, action: "FEE_WAIVER_GRANTED",         metadata: JSON.stringify({ studentCount: 8, waiverPct: "50%" }) },
    { userId: primaryAdmin!.id, action: "SEMESTER_ROLLOVER",          metadata: JSON.stringify({ from: "Fall 2026", to: "Spring 2027" }) },
    { userId: primaryAdmin!.id, action: "PASSWORD_POLICY_UPDATED",    metadata: JSON.stringify({ minLength: 8, requireSpecial: true }) },
    { userId: primaryAdmin!.id, action: "REPORT_GENERATED",           metadata: JSON.stringify({ report: "Semester Attendance Summary", format: "PDF" }) },
    { userId: primaryAdmin!.id, action: "ENROLLMENT_WINDOW_OPENED",   metadata: JSON.stringify({ semester: "Spring 2027", openDate: "2026-11-15" }) },
    { userId: primaryAdmin!.id, action: "EXAM_SCHEDULE_PUBLISHED",    metadata: JSON.stringify({ semester: "Fall 2026", totalExams: allCourses.length }) },
  ];

  for (const al of auditEntries) {
    await db.insert(auditLogs).values(al).onConflictDoNothing();
  }
  const totalAudit = await db.select({ count: sql<number>`count(*)::int` }).from(auditLogs);
  console.log(`✓ ${totalAudit[0]?.count ?? 0} audit logs`);

  // ══════════════════════════════════════════════════════════════
  // SUMMARY
  // ══════════════════════════════════════════════════════════════
  console.log("\n=======================================================");
  console.log("🎉  AISMS MEGA DEMO SEED COMPLETE!");
  console.log("=======================================================");
  console.log(`• Departments  : ${allDepts.length}`);
  console.log(`• Teachers     : ${allTeachers.length}`);
  console.log(`• Courses      : ${allCourses.length}`);
  console.log(`• Students     : ${allStudents.length}`);
  console.log(`• Enrollments  : ${allEnrollments.length}`);
  console.log(`• Attendance   : ${totalAttendance[0]?.count ?? 0}`);
  console.log(`• Results      : ${totalResults[0]?.count ?? 0}`);
  console.log(`• Fees         : ${totalFees[0]?.count ?? 0}`);
  console.log(`• Notices      : ${totalNotices[0]?.count ?? 0}`);
  console.log(`• Audit Logs   : ${totalAudit[0]?.count ?? 0}`);
  console.log("-------------------------------------------------------");
  console.log("🔑 DEMO LOGIN CREDENTIALS:");
  console.log("   [Admin]  : admin@aisms.dev     / Admin@123");
  console.log("   [Teacher]: teacher@aisms.dev   / Teacher@123");
  console.log("   [Student]: student@aisms.dev   / Student@123");
  console.log("=======================================================\n");

  process.exit(0);
}

main().catch((err) => {
  console.error("❌ Seed failed:", err);
  process.exit(1);
});

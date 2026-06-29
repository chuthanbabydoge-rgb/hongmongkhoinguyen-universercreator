import { pgTable, uuid, text, timestamp, jsonb, integer, boolean, decimal, index } from "drizzle-orm/pg-core";

// Enums
export const educationTypeEnum = ["school", "college", "university", "academy", "training_center", "online"] as const;
export const courseStatusEnum = ["draft", "published", "archived"] as const;
export const lessonTypeEnum = ["lecture", "lab", "exam", "seminar", "workshop"] as const;
export const examTypeEnum = ["quiz", "midterm", "final", "practical", "oral"] as const;
export const certificateTypeEnum = ["completion", "professional", "degree", "license"] as const;
export const enrollmentStatusEnum = ["pending", "active", "completed", "dropped"] as const;
export const attendanceStatusEnum = ["present", "late", "absent", "excused"] as const;
export const educationLevelEnum = ["primary", "secondary", "high_school", "college", "bachelor", "master", "doctor"] as const;

// Tables
export const creatorEducation = pgTable("creator_education", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  educationType: text("education_type").notNull().$type<typeof educationTypeEnum[number]>(),
  description: text("description"),
  level: text("level").notNull().$type<typeof educationLevelEnum[number]>(),
  cityId: uuid("city_id"),
  buildingId: uuid("building_id"),
  nationId: uuid("nation_id"),
  principalId: uuid("principal_id"),
  address: text("address"),
  contactPhone: text("contact_phone"),
  contactEmail: text("contact_email"),
  website: text("website"),
  foundedYear: integer("founded_year"),
  accreditation: text("accreditation"),
  capacity: integer("capacity"),
  isPublic: boolean("is_public").default(true),
  isTemplate: boolean("is_template").default(false),
  isPublished: boolean("is_published").default(false),
  isArchived: boolean("is_archived").default(false),
  createdBy: uuid("created_by").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
  metadata: jsonb("metadata").$type<Record<string, unknown>>(),
}, (table) => ({
  cityIdx: index("education_city_idx").on(table.cityId),
  nationIdx: index("education_nation_idx").on(table.nationId),
  typeIdx: index("education_type_idx").on(table.educationType),
}));

export const creatorCourses = pgTable("creator_courses", {
  id: uuid("id").defaultRandom().primaryKey(),
  educationId: uuid("education_id").notNull().references(() => creatorEducation.id, { onDelete: "cascade" }),
  subjectId: uuid("subject_id").references(() => creatorSubjects.id),
  name: text("name").notNull(),
  code: text("code").notNull(),
  description: text("description"),
  credits: integer("credits").default(3),
  duration: integer("duration"),
  level: text("level").$type<typeof educationLevelEnum[number]>(),
  status: text("status").notNull().$type<typeof courseStatusEnum[number]>().default("draft"),
  prerequisites: jsonb("prerequisites").$type<string[]>(),
  capacity: integer("capacity"),
  isRequired: boolean("is_required").default(false),
  createdBy: uuid("created_by").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
  metadata: jsonb("metadata").$type<Record<string, unknown>>(),
}, (table) => ({
  educationIdx: index("course_education_idx").on(table.educationId),
  subjectIdx: index("course_subject_idx").on(table.subjectId),
  statusIdx: index("course_status_idx").on(table.status),
}));

export const creatorSubjects = pgTable("creator_subjects", {
  id: uuid("id").defaultRandom().primaryKey(),
  educationId: uuid("education_id").notNull().references(() => creatorEducation.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  code: text("code").notNull(),
  description: text("description"),
  category: text("category"),
  credits: integer("credits").default(3),
  createdBy: uuid("created_by").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
  metadata: jsonb("metadata").$type<Record<string, unknown>>(),
}, (table) => ({
  educationIdx: index("subject_education_idx").on(table.educationId),
}));

export const creatorLessons = pgTable("creator_lessons", {
  id: uuid("id").defaultRandom().primaryKey(),
  courseId: uuid("course_id").notNull().references(() => creatorCourses.id, { onDelete: "cascade" }),
  classroomId: uuid("classroom_id").references(() => creatorClassrooms.id),
  teacherId: uuid("teacher_id").references(() => creatorTeachers.id),
  title: text("title").notNull(),
  description: text("description"),
  lessonType: text("lesson_type").notNull().$type<typeof lessonTypeEnum[number]>().default("lecture"),
  duration: integer("duration").default(60),
  startTime: timestamp("start_time"),
  endTime: timestamp("end_time"),
  dayOfWeek: integer("day_of_week"),
  weekNumber: integer("week_number"),
  materials: jsonb("materials").$type<string[]>(),
  objectives: jsonb("objectives").$type<string[]>(),
  createdBy: uuid("created_by").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
  metadata: jsonb("metadata").$type<Record<string, unknown>>(),
}, (table) => ({
  courseIdx: index("lesson_course_idx").on(table.courseId),
  classroomIdx: index("lesson_classroom_idx").on(table.classroomId),
  teacherIdx: index("lesson_teacher_idx").on(table.teacherId),
}));

export const creatorClassrooms = pgTable("creator_classrooms", {
  id: uuid("id").defaultRandom().primaryKey(),
  educationId: uuid("education_id").notNull().references(() => creatorEducation.id, { onDelete: "cascade" }),
  buildingId: uuid("building_id"),
  name: text("name").notNull(),
  roomNumber: text("room_number"),
  floor: integer("floor"),
  capacity: integer("capacity").notNull(),
  equipment: jsonb("equipment").$type<string[]>(),
  isAvailable: boolean("is_available").default(true),
  createdBy: uuid("created_by").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
  metadata: jsonb("metadata").$type<Record<string, unknown>>(),
}, (table) => ({
  educationIdx: index("classroom_education_idx").on(table.educationId),
  buildingIdx: index("classroom_building_idx").on(table.buildingId),
}));

export const creatorTeachers = pgTable("creator_teachers", {
  id: uuid("id").defaultRandom().primaryKey(),
  educationId: uuid("education_id").notNull().references(() => creatorEducation.id, { onDelete: "cascade" }),
  npcId: uuid("npc_id"),
  name: text("name").notNull(),
  email: text("email"),
  phone: text("phone"),
  specialization: jsonb("specialization").$type<string[]>(),
  qualifications: jsonb("qualifications").$type<string[]>(),
  hireDate: timestamp("hire_date"),
  salary: decimal("salary", { precision: 10, scale: 2 }),
  isActive: boolean("is_active").default(true),
  createdBy: uuid("created_by").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
  metadata: jsonb("metadata").$type<Record<string, unknown>>(),
}, (table) => ({
  educationIdx: index("teacher_education_idx").on(table.educationId),
  npcIdx: index("teacher_npc_idx").on(table.npcId),
}));

export const creatorStudents = pgTable("creator_students", {
  id: uuid("id").defaultRandom().primaryKey(),
  educationId: uuid("education_id").notNull().references(() => creatorEducation.id, { onDelete: "cascade" }),
  npcId: uuid("npc_id"),
  name: text("name").notNull(),
  email: text("email"),
  phone: text("phone"),
  dateOfBirth: timestamp("date_of_birth"),
  address: text("address"),
  guardianContact: text("guardian_contact"),
  enrollmentDate: timestamp("enrollment_date").defaultNow(),
  grade: text("grade"),
  isActive: boolean("is_active").default(true),
  createdBy: uuid("created_by").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
  metadata: jsonb("metadata").$type<Record<string, unknown>>(),
}, (table) => ({
  educationIdx: index("student_education_idx").on(table.educationId),
  npcIdx: index("student_npc_idx").on(table.npcId),
}));

export const creatorEnrollments = pgTable("creator_enrollments", {
  id: uuid("id").defaultRandom().primaryKey(),
  studentId: uuid("student_id").notNull().references(() => creatorStudents.id, { onDelete: "cascade" }),
  courseId: uuid("course_id").notNull().references(() => creatorCourses.id, { onDelete: "cascade" }),
  semester: text("semester").notNull(),
  year: integer("year").notNull(),
  status: text("status").notNull().$type<typeof enrollmentStatusEnum[number]>().default("pending"),
  enrollmentDate: timestamp("enrollment_date").defaultNow(),
  completionDate: timestamp("completion_date"),
  grade: text("grade"),
  creditsEarned: integer("credits_earned").default(0),
  createdBy: uuid("created_by").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
  metadata: jsonb("metadata").$type<Record<string, unknown>>(),
}, (table) => ({
  studentIdx: index("enrollment_student_idx").on(table.studentId),
  courseIdx: index("enrollment_course_idx").on(table.courseId),
  statusIdx: index("enrollment_status_idx").on(table.status),
}));

export const creatorAttendance = pgTable("creator_attendance", {
  id: uuid("id").defaultRandom().primaryKey(),
  studentId: uuid("student_id").notNull().references(() => creatorStudents.id, { onDelete: "cascade" }),
  lessonId: uuid("lesson_id").notNull().references(() => creatorLessons.id, { onDelete: "cascade" }),
  date: timestamp("date").notNull(),
  status: text("status").notNull().$type<typeof attendanceStatusEnum[number]>().default("present"),
  notes: text("notes"),
  recordedBy: uuid("recorded_by").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
  metadata: jsonb("metadata").$type<Record<string, unknown>>(),
}, (table) => ({
  studentIdx: index("attendance_student_idx").on(table.studentId),
  lessonIdx: index("attendance_lesson_idx").on(table.lessonId),
  dateIdx: index("attendance_date_idx").on(table.date),
}));

export const creatorCurriculum = pgTable("creator_curriculum", {
  id: uuid("id").defaultRandom().primaryKey(),
  educationId: uuid("education_id").notNull().references(() => creatorEducation.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  description: text("description"),
  level: text("level").$type<typeof educationLevelEnum[number]>(),
  courses: jsonb("courses").$type<string[]>(),
  totalCredits: integer("totalCredits"),
  graduationRequirements: jsonb("graduation_requirements").$type<Record<string, unknown>>(),
  isActive: boolean("is_active").default(true),
  createdBy: uuid("created_by").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
  metadata: jsonb("metadata").$type<Record<string, unknown>>(),
}, (table) => ({
  educationIdx: index("curriculum_education_idx").on(table.educationId),
}));

export const creatorExams = pgTable("creator_exams", {
  id: uuid("id").defaultRandom().primaryKey(),
  courseId: uuid("course_id").notNull().references(() => creatorCourses.id, { onDelete: "cascade" }),
  subjectId: uuid("subject_id").references(() => creatorSubjects.id),
  name: text("name").notNull(),
  description: text("description"),
  examType: text("exam_type").notNull().$type<typeof examTypeEnum[number]>().default("quiz"),
  totalPoints: integer("total_points").default(100),
  passingScore: integer("passing_score").default(60),
  duration: integer("duration"),
  scheduledDate: timestamp("scheduled_date"),
  classroomId: uuid("classroom_id").references(() => creatorClassrooms.id),
  questions: jsonb("questions").$type<Record<string, unknown>[]>(),
  isPublished: boolean("is_published").default(false),
  createdBy: uuid("created_by").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
  metadata: jsonb("metadata").$type<Record<string, unknown>>(),
}, (table) => ({
  courseIdx: index("exam_course_idx").on(table.courseId),
  subjectIdx: index("exam_subject_idx").on(table.subjectId),
  classroomIdx: index("exam_classroom_idx").on(table.classroomId),
}));

export const creatorExamResults = pgTable("creator_exam_results", {
  id: uuid("id").defaultRandom().primaryKey(),
  examId: uuid("exam_id").notNull().references(() => creatorExams.id, { onDelete: "cascade" }),
  studentId: uuid("student_id").notNull().references(() => creatorStudents.id, { onDelete: "cascade" }),
  score: integer("score").notNull(),
  maxScore: integer("max_score").notNull(),
  percentage: decimal("percentage", { precision: 5, scale: 2 }),
  passed: boolean("passed").notNull(),
  answers: jsonb("answers").$type<Record<string, unknown>>(),
  gradedBy: uuid("graded_by"),
  gradedAt: timestamp("graded_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
  metadata: jsonb("metadata").$type<Record<string, unknown>>(),
}, (table) => ({
  examIdx: index("exam_result_exam_idx").on(table.examId),
  studentIdx: index("exam_result_student_idx").on(table.studentId),
}));

export const creatorCertificates = pgTable("creator_certificates", {
  id: uuid("id").defaultRandom().primaryKey(),
  studentId: uuid("student_id").notNull().references(() => creatorStudents.id, { onDelete: "cascade" }),
  courseId: uuid("course_id").references(() => creatorCourses.id),
  degreeId: uuid("degree_id").references(() => creatorDegrees.id),
  certificateType: text("certificate_type").notNull().$type<typeof certificateTypeEnum[number]>().default("completion"),
  certificateNumber: text("certificate_number").notNull().unique(),
  title: text("title").notNull(),
  description: text("description"),
  issueDate: timestamp("issue_date").defaultNow(),
  expiryDate: timestamp("expiry_date"),
  issuer: text("issuer").notNull(),
  signature: text("signature"),
  isRevoked: boolean("is_revoked").default(false),
  createdBy: uuid("created_by").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
  metadata: jsonb("metadata").$type<Record<string, unknown>>(),
}, (table) => ({
  studentIdx: index("certificate_student_idx").on(table.studentId),
  courseIdx: index("certificate_course_idx").on(table.courseId),
  degreeIdx: index("certificate_degree_idx").on(table.degreeId),
  numberIdx: index("certificate_number_idx").on(table.certificateNumber),
}));

export const creatorDegrees = pgTable("creator_degrees", {
  id: uuid("id").defaultRandom().primaryKey(),
  educationId: uuid("education_id").notNull().references(() => creatorEducation.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  level: text("level").notNull().$type<typeof educationLevelEnum[number]>(),
  field: text("field"),
  duration: integer("duration"),
  totalCredits: integer("total_credits"),
  requirements: jsonb("requirements").$type<Record<string, unknown>>(),
  isActive: boolean("is_active").default(true),
  createdBy: uuid("created_by").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
  metadata: jsonb("metadata").$type<Record<string, unknown>>(),
}, (table) => ({
  educationIdx: index("degree_education_idx").on(table.educationId),
}));

export const creatorTimetable = pgTable("creator_timetable", {
  id: uuid("id").defaultRandom().primaryKey(),
  educationId: uuid("education_id").notNull().references(() => creatorEducation.id, { onDelete: "cascade" }),
  semester: text("semester").notNull(),
  year: integer("year").notNull(),
  lessonId: uuid("lesson_id").references(() => creatorLessons.id),
  courseId: uuid("course_id").references(() => creatorCourses.id),
  classroomId: uuid("classroom_id").references(() => creatorClassrooms.id),
  teacherId: uuid("teacher_id").references(() => creatorTeachers.id),
  dayOfWeek: integer("day_of_week").notNull(),
  startTime: text("start_time").notNull(),
  endTime: text("end_time").notNull(),
  createdBy: uuid("created_by").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
  metadata: jsonb("metadata").$type<Record<string, unknown>>(),
}, (table) => ({
  educationIdx: index("timetable_education_idx").on(table.educationId),
  semesterIdx: index("timetable_semester_idx").on(table.semester, table.year),
}));

export const creatorEducationTemplates = pgTable("creator_education_templates", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  educationType: text("education_type").notNull().$type<typeof educationTypeEnum[number]>(),
  level: text("level").notNull().$type<typeof educationLevelEnum[number]>(),
  templateData: jsonb("template_data").notNull().$type<Record<string, unknown>>(),
  isPublic: boolean("is_public").default(false),
  createdBy: uuid("created_by").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
  metadata: jsonb("metadata").$type<Record<string, unknown>>(),
}, (table) => ({
  typeIdx: index("education_template_type_idx").on(table.educationType),
}));

export const creatorEducationVersions = pgTable("creator_education_versions", {
  id: uuid("id").defaultRandom().primaryKey(),
  educationId: uuid("education_id").notNull().references(() => creatorEducation.id, { onDelete: "cascade" }),
  version: integer("version").notNull(),
  changelog: text("changelog"),
  snapshot: jsonb("snapshot").notNull().$type<Record<string, unknown>>(),
  createdBy: uuid("created_by").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  metadata: jsonb("metadata").$type<Record<string, unknown>>(),
}, (table) => ({
  educationIdx: index("education_version_education_idx").on(table.educationId),
  versionIdx: index("education_version_version_idx").on(table.educationId, table.version),
}));

export const creatorEducationHistory = pgTable("creator_education_history", {
  id: uuid("id").defaultRandom().primaryKey(),
  educationId: uuid("education_id").references(() => creatorEducation.id, { onDelete: "cascade" }),
  entityType: text("entity_type").notNull(),
  entityId: uuid("entity_id").notNull(),
  action: text("action").notNull(),
  changes: jsonb("changes").$type<Record<string, unknown>>(),
  userId: uuid("user_id").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  metadata: jsonb("metadata").$type<Record<string, unknown>>(),
}, (table) => ({
  educationIdx: index("education_history_education_idx").on(table.educationId),
  entityIdx: index("education_history_entity_idx").on(table.entityType, table.entityId),
  createdAtIdx: index("education_history_created_idx").on(table.createdAt),
}));

export const creatorEducationStatistics = pgTable("creator_education_statistics", {
  id: uuid("id").defaultRandom().primaryKey(),
  educationId: uuid("education_id").notNull().references(() => creatorEducation.id, { onDelete: "cascade" }),
  totalStudents: integer("total_students").default(0),
  totalTeachers: integer("total_teachers").default(0),
  totalCourses: integer("total_courses").default(0),
  totalClassrooms: integer("total_classrooms").default(0),
  activeEnrollments: integer("active_enrollments").default(0),
  completedEnrollments: integer("completed_enrollments").default(0),
  averageAttendance: decimal("average_attendance", { precision: 5, scale: 2 }),
  averageGrade: decimal("average_grade", { precision: 5, scale: 2 }),
  certificatesIssued: integer("certificates_issued").default(0),
  degreesAwarded: integer("degrees_awarded").default(0),
  examPassRate: decimal("exam_pass_rate", { precision: 5, scale: 2 }),
  calculatedAt: timestamp("calculated_at").defaultNow(),
  metadata: jsonb("metadata").$type<Record<string, unknown>>(),
}, (table) => ({
  educationIdx: index("education_statistics_education_idx").on(table.educationId),
}));

export const creatorEducationExports = pgTable("creator_education_exports", {
  id: uuid("id").defaultRandom().primaryKey(),
  educationId: uuid("education_id").notNull().references(() => creatorEducation.id, { onDelete: "cascade" }),
  format: text("format").notNull(),
  payload: jsonb("payload").notNull().$type<Record<string, unknown>>(),
  checksum: text("checksum").notNull(),
  exportedBy: uuid("exported_by").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  metadata: jsonb("metadata").$type<Record<string, unknown>>(),
}, (table) => ({
  educationIdx: index("education_export_education_idx").on(table.educationId),
}));

export const creatorEducationRuntime = pgTable("creator_education_runtime", {
  id: uuid("id").defaultRandom().primaryKey(),
  educationId: uuid("education_id").notNull().references(() => creatorEducation.id, { onDelete: "cascade" }),
  isSimulating: boolean("is_simulating").default(false),
  semesterProgress: decimal("semester_progress", { precision: 5, scale: 2 }).default("0"),
  currentSemester: text("current_semester"),
  currentYear: integer("current_year"),
  simulationTick: integer("simulation_tick").default(0),
  dailyAttendance: decimal("daily_attendance", { precision: 5, scale: 2 }),
  weeklyAttendance: decimal("weekly_attendance", { precision: 5, scale: 2 }),
  monthlyAttendance: decimal("monthly_attendance", { precision: 5, scale: 2 }),
  graduationRate: decimal("graduation_rate", { precision: 5, scale: 2 }),
  retentionRate: decimal("retention_rate", { precision: 5, scale: 2 }),
  lastSimulatedAt: timestamp("last_simulated_at"),
  metadata: jsonb("metadata").$type<Record<string, unknown>>(),
}, (table) => ({
  educationIdx: index("education_runtime_education_idx").on(table.educationId),
}));

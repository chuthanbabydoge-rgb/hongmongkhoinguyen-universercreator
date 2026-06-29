import { db } from "@workspace/db";
import { eq, and, desc, asc, sql } from "drizzle-orm";
import {
  creatorEducation,
  creatorCourses,
  creatorSubjects,
  creatorLessons,
  creatorClassrooms,
  creatorTeachers,
  creatorStudents,
  creatorEnrollments,
  creatorAttendance,
  creatorCurriculum,
  creatorExams,
  creatorExamResults,
  creatorCertificates,
  creatorDegrees,
  creatorTimetable,
  creatorEducationTemplates,
  creatorEducationVersions,
  creatorEducationHistory,
  creatorEducationStatistics,
  creatorEducationExports,
  creatorEducationRuntime,
} from "@workspace/db";

export class EducationRepository {
  // Education
  async findEducationById(id: string) {
    const [education] = await db.select().from(creatorEducation).where(eq(creatorEducation.id, id));
    return education;
  }

  async findAllEducation(limit = 50, offset = 0) {
    return db.select().from(creatorEducation).limit(limit).offset(offset).orderBy(desc(creatorEducation.createdAt));
  }

  async searchEducation(query: string) {
    return db.select().from(creatorEducation).where(
      sql`${creatorEducation.name} ILIKE ${`%${query}%`}`
    ).limit(20);
  }

  async createEducation(data: typeof creatorEducation.$inferInsert) {
    const [education] = await db.insert(creatorEducation).values(data).returning();
    return education;
  }

  async updateEducation(id: string, data: Partial<typeof creatorEducation.$inferInsert>) {
    const [education] = await db.update(creatorEducation).set({ ...data, updatedAt: new Date() }).where(eq(creatorEducation.id, id)).returning();
    return education;
  }

  async deleteEducation(id: string) {
    await db.delete(creatorEducation).where(eq(creatorEducation.id, id));
  }

  async publishEducation(id: string) {
    return this.updateEducation(id, { isPublished: true });
  }

  async archiveEducation(id: string) {
    return this.updateEducation(id, { isArchived: true });
  }

  async restoreEducation(id: string) {
    return this.updateEducation(id, { isArchived: false });
  }

  async duplicateEducation(id: string, createdBy: string) {
    const original = await this.findEducationById(id);
    if (!original) throw new Error("Education not found");
    const { id: _, createdAt, updatedAt, ...data } = original;
    return this.createEducation({ ...data, name: `${data.name} (Copy)`, createdBy, isPublished: false });
  }

  // Courses
  async findCoursesByEducation(educationId: string) {
    return db.select().from(creatorCourses).where(eq(creatorCourses.educationId, educationId));
  }

  async findCourseById(id: string) {
    const [course] = await db.select().from(creatorCourses).where(eq(creatorCourses.id, id));
    return course;
  }

  async createCourse(data: typeof creatorCourses.$inferInsert) {
    const [course] = await db.insert(creatorCourses).values(data).returning();
    return course;
  }

  async updateCourse(id: string, data: Partial<typeof creatorCourses.$inferInsert>) {
    const [course] = await db.update(creatorCourses).set({ ...data, updatedAt: new Date() }).where(eq(creatorCourses.id, id)).returning();
    return course;
  }

  async deleteCourse(id: string) {
    await db.delete(creatorCourses).where(eq(creatorCourses.id, id));
  }

  // Subjects
  async findSubjectsByEducation(educationId: string) {
    return db.select().from(creatorSubjects).where(eq(creatorSubjects.educationId, educationId));
  }

  async findSubjectById(id: string) {
    const [subject] = await db.select().from(creatorSubjects).where(eq(creatorSubjects.id, id));
    return subject;
  }

  async createSubject(data: typeof creatorSubjects.$inferInsert) {
    const [subject] = await db.insert(creatorSubjects).values(data).returning();
    return subject;
  }

  async updateSubject(id: string, data: Partial<typeof creatorSubjects.$inferInsert>) {
    const [subject] = await db.update(creatorSubjects).set({ ...data, updatedAt: new Date() }).where(eq(creatorSubjects.id, id)).returning();
    return subject;
  }

  async deleteSubject(id: string) {
    await db.delete(creatorSubjects).where(eq(creatorSubjects.id, id));
  }

  // Lessons
  async findLessonsByCourse(courseId: string) {
    return db.select().from(creatorLessons).where(eq(creatorLessons.courseId, courseId));
  }

  async findLessonById(id: string) {
    const [lesson] = await db.select().from(creatorLessons).where(eq(creatorLessons.id, id));
    return lesson;
  }

  async createLesson(data: typeof creatorLessons.$inferInsert) {
    const [lesson] = await db.insert(creatorLessons).values(data).returning();
    return lesson;
  }

  async updateLesson(id: string, data: Partial<typeof creatorLessons.$inferInsert>) {
    const [lesson] = await db.update(creatorLessons).set({ ...data, updatedAt: new Date() }).where(eq(creatorLessons.id, id)).returning();
    return lesson;
  }

  async deleteLesson(id: string) {
    await db.delete(creatorLessons).where(eq(creatorLessons.id, id));
  }

  // Classrooms
  async findClassroomsByEducation(educationId: string) {
    return db.select().from(creatorClassrooms).where(eq(creatorClassrooms.educationId, educationId));
  }

  async findClassroomById(id: string) {
    const [classroom] = await db.select().from(creatorClassrooms).where(eq(creatorClassrooms.id, id));
    return classroom;
  }

  async createClassroom(data: typeof creatorClassrooms.$inferInsert) {
    const [classroom] = await db.insert(creatorClassrooms).values(data).returning();
    return classroom;
  }

  async updateClassroom(id: string, data: Partial<typeof creatorClassrooms.$inferInsert>) {
    const [classroom] = await db.update(creatorClassrooms).set({ ...data, updatedAt: new Date() }).where(eq(creatorClassrooms.id, id)).returning();
    return classroom;
  }

  async deleteClassroom(id: string) {
    await db.delete(creatorClassrooms).where(eq(creatorClassrooms.id, id));
  }

  // Teachers
  async findTeachersByEducation(educationId: string) {
    return db.select().from(creatorTeachers).where(eq(creatorTeachers.educationId, educationId));
  }

  async findTeacherById(id: string) {
    const [teacher] = await db.select().from(creatorTeachers).where(eq(creatorTeachers.id, id));
    return teacher;
  }

  async createTeacher(data: typeof creatorTeachers.$inferInsert) {
    const [teacher] = await db.insert(creatorTeachers).values(data).returning();
    return teacher;
  }

  async updateTeacher(id: string, data: Partial<typeof creatorTeachers.$inferInsert>) {
    const [teacher] = await db.update(creatorTeachers).set({ ...data, updatedAt: new Date() }).where(eq(creatorTeachers.id, id)).returning();
    return teacher;
  }

  async deleteTeacher(id: string) {
    await db.delete(creatorTeachers).where(eq(creatorTeachers.id, id));
  }

  // Students
  async findStudentsByEducation(educationId: string) {
    return db.select().from(creatorStudents).where(eq(creatorStudents.educationId, educationId));
  }

  async findStudentById(id: string) {
    const [student] = await db.select().from(creatorStudents).where(eq(creatorStudents.id, id));
    return student;
  }

  async createStudent(data: typeof creatorStudents.$inferInsert) {
    const [student] = await db.insert(creatorStudents).values(data).returning();
    return student;
  }

  async updateStudent(id: string, data: Partial<typeof creatorStudents.$inferInsert>) {
    const [student] = await db.update(creatorStudents).set({ ...data, updatedAt: new Date() }).where(eq(creatorStudents.id, id)).returning();
    return student;
  }

  async deleteStudent(id: string) {
    await db.delete(creatorStudents).where(eq(creatorStudents.id, id));
  }

  // Enrollments
  async findEnrollmentsByStudent(studentId: string) {
    return db.select().from(creatorEnrollments).where(eq(creatorEnrollments.studentId, studentId));
  }

  async findEnrollmentsByCourse(courseId: string) {
    return db.select().from(creatorEnrollments).where(eq(creatorEnrollments.courseId, courseId));
  }

  async findEnrollmentById(id: string) {
    const [enrollment] = await db.select().from(creatorEnrollments).where(eq(creatorEnrollments.id, id));
    return enrollment;
  }

  async createEnrollment(data: typeof creatorEnrollments.$inferInsert) {
    const [enrollment] = await db.insert(creatorEnrollments).values(data).returning();
    return enrollment;
  }

  async updateEnrollment(id: string, data: Partial<typeof creatorEnrollments.$inferInsert>) {
    const [enrollment] = await db.update(creatorEnrollments).set({ ...data, updatedAt: new Date() }).where(eq(creatorEnrollments.id, id)).returning();
    return enrollment;
  }

  async deleteEnrollment(id: string) {
    await db.delete(creatorEnrollments).where(eq(creatorEnrollments.id, id));
  }

  // Attendance
  async findAttendanceByStudent(studentId: string) {
    return db.select().from(creatorAttendance).where(eq(creatorAttendance.studentId, studentId));
  }

  async findAttendanceByLesson(lessonId: string) {
    return db.select().from(creatorAttendance).where(eq(creatorAttendance.lessonId, lessonId));
  }

  async findAttendanceById(id: string) {
    const [attendance] = await db.select().from(creatorAttendance).where(eq(creatorAttendance.id, id));
    return attendance;
  }

  async createAttendance(data: typeof creatorAttendance.$inferInsert) {
    const [attendance] = await db.insert(creatorAttendance).values(data).returning();
    return attendance;
  }

  async updateAttendance(id: string, data: Partial<typeof creatorAttendance.$inferInsert>) {
    const [attendance] = await db.update(creatorAttendance).set({ ...data, updatedAt: new Date() }).where(eq(creatorAttendance.id, id)).returning();
    return attendance;
  }

  async deleteAttendance(id: string) {
    await db.delete(creatorAttendance).where(eq(creatorAttendance.id, id));
  }

  // Curriculum
  async findCurriculumByEducation(educationId: string) {
    return db.select().from(creatorCurriculum).where(eq(creatorCurriculum.educationId, educationId));
  }

  async findCurriculumById(id: string) {
    const [curriculum] = await db.select().from(creatorCurriculum).where(eq(creatorCurriculum.id, id));
    return curriculum;
  }

  async createCurriculum(data: typeof creatorCurriculum.$inferInsert) {
    const [curriculum] = await db.insert(creatorCurriculum).values(data).returning();
    return curriculum;
  }

  async updateCurriculum(id: string, data: Partial<typeof creatorCurriculum.$inferInsert>) {
    const [curriculum] = await db.update(creatorCurriculum).set({ ...data, updatedAt: new Date() }).where(eq(creatorCurriculum.id, id)).returning();
    return curriculum;
  }

  async deleteCurriculum(id: string) {
    await db.delete(creatorCurriculum).where(eq(creatorCurriculum.id, id));
  }

  // Exams
  async findExamsByCourse(courseId: string) {
    return db.select().from(creatorExams).where(eq(creatorExams.courseId, courseId));
  }

  async findExamById(id: string) {
    const [exam] = await db.select().from(creatorExams).where(eq(creatorExams.id, id));
    return exam;
  }

  async createExam(data: typeof creatorExams.$inferInsert) {
    const [exam] = await db.insert(creatorExams).values(data).returning();
    return exam;
  }

  async updateExam(id: string, data: Partial<typeof creatorExams.$inferInsert>) {
    const [exam] = await db.update(creatorExams).set({ ...data, updatedAt: new Date() }).where(eq(creatorExams.id, id)).returning();
    return exam;
  }

  async deleteExam(id: string) {
    await db.delete(creatorExams).where(eq(creatorExams.id, id));
  }

  // Exam Results
  async findExamResultsByExam(examId: string) {
    return db.select().from(creatorExamResults).where(eq(creatorExamResults.examId, examId));
  }

  async findExamResultsByStudent(studentId: string) {
    return db.select().from(creatorExamResults).where(eq(creatorExamResults.studentId, studentId));
  }

  async findExamResultById(id: string) {
    const [result] = await db.select().from(creatorExamResults).where(eq(creatorExamResults.id, id));
    return result;
  }

  async createExamResult(data: typeof creatorExamResults.$inferInsert) {
    const [result] = await db.insert(creatorExamResults).values(data).returning();
    return result;
  }

  async updateExamResult(id: string, data: Partial<typeof creatorExamResults.$inferInsert>) {
    const [result] = await db.update(creatorExamResults).set({ ...data, updatedAt: new Date() }).where(eq(creatorExamResults.id, id)).returning();
    return result;
  }

  async deleteExamResult(id: string) {
    await db.delete(creatorExamResults).where(eq(creatorExamResults.id, id));
  }

  // Certificates
  async findCertificatesByStudent(studentId: string) {
    return db.select().from(creatorCertificates).where(eq(creatorCertificates.studentId, studentId));
  }

  async findCertificateById(id: string) {
    const [certificate] = await db.select().from(creatorCertificates).where(eq(creatorCertificates.id, id));
    return certificate;
  }

  async createCertificate(data: typeof creatorCertificates.$inferInsert) {
    const [certificate] = await db.insert(creatorCertificates).values(data).returning();
    return certificate;
  }

  async updateCertificate(id: string, data: Partial<typeof creatorCertificates.$inferInsert>) {
    const [certificate] = await db.update(creatorCertificates).set({ ...data, updatedAt: new Date() }).where(eq(creatorCertificates.id, id)).returning();
    return certificate;
  }

  async deleteCertificate(id: string) {
    await db.delete(creatorCertificates).where(eq(creatorCertificates.id, id));
  }

  // Degrees
  async findDegreesByEducation(educationId: string) {
    return db.select().from(creatorDegrees).where(eq(creatorDegrees.educationId, educationId));
  }

  async findDegreeById(id: string) {
    const [degree] = await db.select().from(creatorDegrees).where(eq(creatorDegrees.id, id));
    return degree;
  }

  async createDegree(data: typeof creatorDegrees.$inferInsert) {
    const [degree] = await db.insert(creatorDegrees).values(data).returning();
    return degree;
  }

  async updateDegree(id: string, data: Partial<typeof creatorDegrees.$inferInsert>) {
    const [degree] = await db.update(creatorDegrees).set({ ...data, updatedAt: new Date() }).where(eq(creatorDegrees.id, id)).returning();
    return degree;
  }

  async deleteDegree(id: string) {
    await db.delete(creatorDegrees).where(eq(creatorDegrees.id, id));
  }

  // Timetable
  async findTimetableByEducation(educationId: string, semester: string, year: number) {
    return db.select().from(creatorTimetable).where(
      and(
        eq(creatorTimetable.educationId, educationId),
        eq(creatorTimetable.semester, semester),
        eq(creatorTimetable.year, year)
      )
    );
  }

  async findTimetableById(id: string) {
    const [timetable] = await db.select().from(creatorTimetable).where(eq(creatorTimetable.id, id));
    return timetable;
  }

  async createTimetable(data: typeof creatorTimetable.$inferInsert) {
    const [timetable] = await db.insert(creatorTimetable).values(data).returning();
    return timetable;
  }

  async updateTimetable(id: string, data: Partial<typeof creatorTimetable.$inferInsert>) {
    const [timetable] = await db.update(creatorTimetable).set({ ...data, updatedAt: new Date() }).where(eq(creatorTimetable.id, id)).returning();
    return timetable;
  }

  async deleteTimetable(id: string) {
    await db.delete(creatorTimetable).where(eq(creatorTimetable.id, id));
  }

  // Templates
  async findAllTemplates(limit = 50, offset = 0) {
    return db.select().from(creatorEducationTemplates).limit(limit).offset(offset);
  }

  async findTemplateById(id: string) {
    const [template] = await db.select().from(creatorEducationTemplates).where(eq(creatorEducationTemplates.id, id));
    return template;
  }

  async createTemplate(data: typeof creatorEducationTemplates.$inferInsert) {
    const [template] = await db.insert(creatorEducationTemplates).values(data).returning();
    return template;
  }

  async updateTemplate(id: string, data: Partial<typeof creatorEducationTemplates.$inferInsert>) {
    const [template] = await db.update(creatorEducationTemplates).set({ ...data, updatedAt: new Date() }).where(eq(creatorEducationTemplates.id, id)).returning();
    return template;
  }

  async deleteTemplate(id: string) {
    await db.delete(creatorEducationTemplates).where(eq(creatorEducationTemplates.id, id));
  }

  // Versions
  async findVersionsByEducation(educationId: string) {
    return db.select().from(creatorEducationVersions).where(eq(creatorEducationVersions.educationId, educationId)).orderBy(desc(creatorEducationVersions.version));
  }

  async findVersionById(id: string) {
    const [version] = await db.select().from(creatorEducationVersions).where(eq(creatorEducationVersions.id, id));
    return version;
  }

  async createVersion(data: typeof creatorEducationVersions.$inferInsert) {
    const [version] = await db.insert(creatorEducationVersions).values(data).returning();
    return version;
  }

  // History
  async findHistoryByEducation(educationId: string, limit = 50, offset = 0) {
    return db.select().from(creatorEducationHistory).where(eq(creatorEducationHistory.educationId, educationId)).orderBy(desc(creatorEducationHistory.createdAt)).limit(limit).offset(offset);
  }

  async createHistory(data: typeof creatorEducationHistory.$inferInsert) {
    const [history] = await db.insert(creatorEducationHistory).values(data).returning();
    return history;
  }

  // Statistics
  async findStatisticsByEducation(educationId: string) {
    const [stats] = await db.select().from(creatorEducationStatistics).where(eq(creatorEducationStatistics.educationId, educationId));
    return stats;
  }

  async createStatistics(data: typeof creatorEducationStatistics.$inferInsert) {
    const [stats] = await db.insert(creatorEducationStatistics).values(data).returning();
    return stats;
  }

  async updateStatistics(educationId: string, data: Partial<typeof creatorEducationStatistics.$inferInsert>) {
    const [stats] = await db.update(creatorEducationStatistics).set({ ...data, calculatedAt: new Date() }).where(eq(creatorEducationStatistics.educationId, educationId)).returning();
    return stats;
  }

  // Exports
  async findExportsByEducation(educationId: string) {
    return db.select().from(creatorEducationExports).where(eq(creatorEducationExports.educationId, educationId)).orderBy(desc(creatorEducationExports.createdAt));
  }

  async createEducationExport(data: typeof creatorEducationExports.$inferInsert) {
    const [exportRecord] = await db.insert(creatorEducationExports).values(data).returning();
    return exportRecord;
  }

  // Runtime
  async findRuntimeByEducation(educationId: string) {
    const [runtime] = await db.select().from(creatorEducationRuntime).where(eq(creatorEducationRuntime.educationId, educationId));
    return runtime;
  }

  async updateEducationRuntime(educationId: string, data: Partial<typeof creatorEducationRuntime.$inferInsert>) {
    const [runtime] = await db.update(creatorEducationRuntime).set({ ...data, lastSimulatedAt: new Date() }).where(eq(creatorEducationRuntime.educationId, educationId)).returning();
    return runtime;
  }
}

export const educationRepository = new EducationRepository();

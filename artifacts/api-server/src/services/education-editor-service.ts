import { educationRepository } from "../repositories/education-repository";

export class EducationEditorService {
  // Education
  async listEducation(limit = 50, offset = 0) {
    return educationRepository.findAllEducation(limit, offset);
  }

  async searchEducation(query: string) {
    return educationRepository.searchEducation(query);
  }

  async getEducation(id: string) {
    const education = await educationRepository.findEducationById(id);
    if (!education) throw new Error("Education not found");
    return education;
  }

  async createEducation(data: any) {
    return educationRepository.createEducation(data);
  }

  async updateEducation(id: string, data: any) {
    const education = await educationRepository.findEducationById(id);
    if (!education) throw new Error("Education not found");
    return educationRepository.updateEducation(id, data);
  }

  async deleteEducation(id: string) {
    await educationRepository.deleteEducation(id);
  }

  async duplicateEducation(id: string, createdBy: string) {
    return educationRepository.duplicateEducation(id, createdBy);
  }

  async publishEducation(id: string) {
    return educationRepository.publishEducation(id);
  }

  async archiveEducation(id: string) {
    return educationRepository.archiveEducation(id);
  }

  async restoreEducation(id: string) {
    return educationRepository.restoreEducation(id);
  }

  async saveVersion(id: string, createdBy: string, changelog?: string) {
    const education = await educationRepository.findEducationById(id);
    if (!education) throw new Error("Education not found");
    const versions = await educationRepository.findVersionsByEducation(id);
    const nextVersion = versions.length > 0 ? Math.max(...versions.map(v => v.version)) + 1 : 1;
    return educationRepository.createVersion({
      educationId: id,
      version: nextVersion,
      changelog,
      snapshot: education,
      createdBy,
    });
  }

  async getStats(id: string) {
    return educationRepository.findStatisticsByEducation(id);
  }

  async recalculateStats(id: string) {
    const education = await educationRepository.findEducationById(id);
    if (!education) throw new Error("Education not found");
    const [students, teachers, courses, classrooms, enrollments] = await Promise.all([
      educationRepository.findStudentsByEducation(id),
      educationRepository.findTeachersByEducation(id),
      educationRepository.findCoursesByEducation(id),
      educationRepository.findClassroomsByEducation(id),
      educationRepository.findEnrollmentsByCourse(id),
    ]);
    const activeEnrollments = enrollments.filter(e => e.status === "active").length;
    const completedEnrollments = enrollments.filter(e => e.status === "completed").length;
    return educationRepository.updateStatistics(id, {
      totalStudents: students.length,
      totalTeachers: teachers.length,
      totalCourses: courses.length,
      totalClassrooms: classrooms.length,
      activeEnrollments,
      completedEnrollments,
    });
  }

  async getHistory(id: string, limit = 50, offset = 0) {
    return educationRepository.findHistoryByEducation(id, limit, offset);
  }

  async getRuntime(id: string) {
    return educationRepository.findRuntimeByEducation(id);
  }

  // Courses
  async listCourses(educationId: string) {
    return educationRepository.findCoursesByEducation(educationId);
  }

  async getCourse(id: string) {
    const course = await educationRepository.findCourseById(id);
    if (!course) throw new Error("Course not found");
    return course;
  }

  async createCourse(educationId: string, data: any) {
    return educationRepository.createCourse({ ...data, educationId });
  }

  async updateCourse(id: string, data: any) {
    return educationRepository.updateCourse(id, data);
  }

  async deleteCourse(id: string) {
    await educationRepository.deleteCourse(id);
  }

  // Subjects
  async listSubjects(educationId: string) {
    return educationRepository.findSubjectsByEducation(educationId);
  }

  async getSubject(id: string) {
    const subject = await educationRepository.findSubjectById(id);
    if (!subject) throw new Error("Subject not found");
    return subject;
  }

  async createSubject(educationId: string, data: any) {
    return educationRepository.createSubject({ ...data, educationId });
  }

  async updateSubject(id: string, data: any) {
    return educationRepository.updateSubject(id, data);
  }

  async deleteSubject(id: string) {
    await educationRepository.deleteSubject(id);
  }

  // Lessons
  async listLessons(courseId: string) {
    return educationRepository.findLessonsByCourse(courseId);
  }

  async getLesson(id: string) {
    const lesson = await educationRepository.findLessonById(id);
    if (!lesson) throw new Error("Lesson not found");
    return lesson;
  }

  async createLesson(courseId: string, data: any) {
    return educationRepository.createLesson({ ...data, courseId });
  }

  async updateLesson(id: string, data: any) {
    return educationRepository.updateLesson(id, data);
  }

  async deleteLesson(id: string) {
    await educationRepository.deleteLesson(id);
  }

  // Classrooms
  async listClassrooms(educationId: string) {
    return educationRepository.findClassroomsByEducation(educationId);
  }

  async getClassroom(id: string) {
    const classroom = await educationRepository.findClassroomById(id);
    if (!classroom) throw new Error("Classroom not found");
    return classroom;
  }

  async createClassroom(educationId: string, data: any) {
    return educationRepository.createClassroom({ ...data, educationId });
  }

  async updateClassroom(id: string, data: any) {
    return educationRepository.updateClassroom(id, data);
  }

  async deleteClassroom(id: string) {
    await educationRepository.deleteClassroom(id);
  }

  // Teachers
  async listTeachers(educationId: string) {
    return educationRepository.findTeachersByEducation(educationId);
  }

  async getTeacher(id: string) {
    const teacher = await educationRepository.findTeacherById(id);
    if (!teacher) throw new Error("Teacher not found");
    return teacher;
  }

  async createTeacher(educationId: string, data: any) {
    return educationRepository.createTeacher({ ...data, educationId });
  }

  async updateTeacher(id: string, data: any) {
    return educationRepository.updateTeacher(id, data);
  }

  async deleteTeacher(id: string) {
    await educationRepository.deleteTeacher(id);
  }

  // Students
  async listStudents(educationId: string) {
    return educationRepository.findStudentsByEducation(educationId);
  }

  async getStudent(id: string) {
    const student = await educationRepository.findStudentById(id);
    if (!student) throw new Error("Student not found");
    return student;
  }

  async createStudent(educationId: string, data: any) {
    return educationRepository.createStudent({ ...data, educationId });
  }

  async updateStudent(id: string, data: any) {
    return educationRepository.updateStudent(id, data);
  }

  async deleteStudent(id: string) {
    await educationRepository.deleteStudent(id);
  }

  // Enrollments
  async listEnrollmentsByStudent(studentId: string) {
    return educationRepository.findEnrollmentsByStudent(studentId);
  }

  async listEnrollmentsByCourse(courseId: string) {
    return educationRepository.findEnrollmentsByCourse(courseId);
  }

  async getEnrollment(id: string) {
    const enrollment = await educationRepository.findEnrollmentById(id);
    if (!enrollment) throw new Error("Enrollment not found");
    return enrollment;
  }

  async createEnrollment(data: any) {
    return educationRepository.createEnrollment(data);
  }

  async updateEnrollment(id: string, data: any) {
    return educationRepository.updateEnrollment(id, data);
  }

  async deleteEnrollment(id: string) {
    await educationRepository.deleteEnrollment(id);
  }

  // Attendance
  async listAttendanceByStudent(studentId: string) {
    return educationRepository.findAttendanceByStudent(studentId);
  }

  async listAttendanceByLesson(lessonId: string) {
    return educationRepository.findAttendanceByLesson(lessonId);
  }

  async getAttendance(id: string) {
    const attendance = await educationRepository.findAttendanceById(id);
    if (!attendance) throw new Error("Attendance not found");
    return attendance;
  }

  async createAttendance(data: any) {
    return educationRepository.createAttendance(data);
  }

  async updateAttendance(id: string, data: any) {
    return educationRepository.updateAttendance(id, data);
  }

  async deleteAttendance(id: string) {
    await educationRepository.deleteAttendance(id);
  }

  // Curriculum
  async listCurriculum(educationId: string) {
    return educationRepository.findCurriculumByEducation(educationId);
  }

  async getCurriculum(id: string) {
    const curriculum = await educationRepository.findCurriculumById(id);
    if (!curriculum) throw new Error("Curriculum not found");
    return curriculum;
  }

  async createCurriculum(educationId: string, data: any) {
    return educationRepository.createCurriculum({ ...data, educationId });
  }

  async updateCurriculum(id: string, data: any) {
    return educationRepository.updateCurriculum(id, data);
  }

  async deleteCurriculum(id: string) {
    await educationRepository.deleteCurriculum(id);
  }

  // Exams
  async listExams(courseId: string) {
    return educationRepository.findExamsByCourse(courseId);
  }

  async getExam(id: string) {
    const exam = await educationRepository.findExamById(id);
    if (!exam) throw new Error("Exam not found");
    return exam;
  }

  async createExam(courseId: string, data: any) {
    return educationRepository.createExam({ ...data, courseId });
  }

  async updateExam(id: string, data: any) {
    return educationRepository.updateExam(id, data);
  }

  async deleteExam(id: string) {
    await educationRepository.deleteExam(id);
  }

  // Exam Results
  async listExamResultsByExam(examId: string) {
    return educationRepository.findExamResultsByExam(examId);
  }

  async listExamResultsByStudent(studentId: string) {
    return educationRepository.findExamResultsByStudent(studentId);
  }

  async getExamResult(id: string) {
    const result = await educationRepository.findExamResultById(id);
    if (!result) throw new Error("Exam result not found");
    return result;
  }

  async createExamResult(data: any) {
    return educationRepository.createExamResult(data);
  }

  async updateExamResult(id: string, data: any) {
    return educationRepository.updateExamResult(id, data);
  }

  async deleteExamResult(id: string) {
    await educationRepository.deleteExamResult(id);
  }

  // Certificates
  async listCertificatesByStudent(studentId: string) {
    return educationRepository.findCertificatesByStudent(studentId);
  }

  async getCertificate(id: string) {
    const certificate = await educationRepository.findCertificateById(id);
    if (!certificate) throw new Error("Certificate not found");
    return certificate;
  }

  async createCertificate(data: any) {
    return educationRepository.createCertificate(data);
  }

  async updateCertificate(id: string, data: any) {
    return educationRepository.updateCertificate(id, data);
  }

  async deleteCertificate(id: string) {
    await educationRepository.deleteCertificate(id);
  }

  // Degrees
  async listDegrees(educationId: string) {
    return educationRepository.findDegreesByEducation(educationId);
  }

  async getDegree(id: string) {
    const degree = await educationRepository.findDegreeById(id);
    if (!degree) throw new Error("Degree not found");
    return degree;
  }

  async createDegree(educationId: string, data: any) {
    return educationRepository.createDegree({ ...data, educationId });
  }

  async updateDegree(id: string, data: any) {
    return educationRepository.updateDegree(id, data);
  }

  async deleteDegree(id: string) {
    await educationRepository.deleteDegree(id);
  }

  // Timetable
  async getTimetable(educationId: string, semester: string, year: number) {
    return educationRepository.findTimetableByEducation(educationId, semester, year);
  }

  async getTimetableById(timetableId: string) {
    return educationRepository.findTimetableById(timetableId);
  }

  async createTimetable(data: any) {
    return educationRepository.createTimetable(data);
  }

  async updateTimetable(id: string, data: any) {
    return educationRepository.updateTimetable(id, data);
  }

  async deleteTimetable(id: string) {
    await educationRepository.deleteTimetable(id);
  }

  // Templates
  async listTemplates(limit = 50, offset = 0) {
    return educationRepository.findAllTemplates(limit, offset);
  }

  async getTemplate(id: string) {
    const template = await educationRepository.findTemplateById(id);
    if (!template) throw new Error("Template not found");
    return template;
  }

  async createTemplate(data: any) {
    return educationRepository.createTemplate(data);
  }

  async updateTemplate(id: string, data: any) {
    return educationRepository.updateTemplate(id, data);
  }

  async deleteTemplate(id: string) {
    await educationRepository.deleteTemplate(id);
  }
}

export const educationEditorService = new EducationEditorService();

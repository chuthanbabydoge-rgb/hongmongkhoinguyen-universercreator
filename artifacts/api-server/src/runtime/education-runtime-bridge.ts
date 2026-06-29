import { educationRepository } from "../repositories/education-repository";

export class EducationRuntimeBridge {
  async startSemester(educationId: string, semester: string, year: number) {
    const runtime = await educationRepository.findRuntimeByEducation(educationId);
    if (!runtime) {
      await educationRepository.updateEducationRuntime(educationId, {
        isSimulating: true,
        currentSemester: semester,
        currentYear: year,
        semesterProgress: "0",
      });
    } else {
      await educationRepository.updateEducationRuntime(educationId, {
        isSimulating: true,
        currentSemester: semester,
        currentYear: year,
        semesterProgress: "0",
      });
    }
    return { educationId, semester, year, status: "started" };
  }

  async endSemester(educationId: string) {
    const runtime = await educationRepository.findRuntimeByEducation(educationId);
    if (!runtime) throw new Error("Runtime not found");
    await educationRepository.updateEducationRuntime(educationId, {
      isSimulating: false,
      semesterProgress: "100",
    });
    return { educationId, status: "ended" };
  }

  async enrollStudent(studentId: string, courseId: string, semester: string, year: number) {
    const enrollment = await educationRepository.createEnrollment({
      studentId,
      courseId,
      semester,
      year,
      status: "active",
      enrollmentDate: new Date(),
      createdBy: "system",
    });
    return enrollment;
  }

  async graduateStudent(studentId: string, degreeId: string) {
    const student = await educationRepository.findStudentById(studentId);
    if (!student) throw new Error("Student not found");
    const degree = await educationRepository.findDegreeById(degreeId);
    if (!degree) throw new Error("Degree not found");
    await educationRepository.createCertificate({
      studentId,
      degreeId,
      certificateType: "degree",
      certificateNumber: this.generateCertificateNumber(),
      title: degree.name,
      issuer: student.educationId,
      createdBy: "system",
    });
    return { studentId, degreeId, status: "graduated" };
  }

  async takeAttendance(lessonId: string, studentId: string, status: "present" | "late" | "absent" | "excused") {
    const attendance = await educationRepository.createAttendance({
      studentId,
      lessonId,
      date: new Date(),
      status,
      recordedBy: "system",
    });
    return attendance;
  }

  async scheduleLesson(educationId: string, lessonId: string, dayOfWeek: number, startTime: string, endTime: string) {
    const lesson = await educationRepository.findLessonById(lessonId);
    if (!lesson) throw new Error("Lesson not found");
    const timetable = await educationRepository.createTimetable({
      educationId,
      lessonId,
      courseId: lesson.courseId,
      classroomId: lesson.classroomId ?? "",
      teacherId: lesson.teacherId ?? "",
      dayOfWeek,
      startTime,
      endTime,
      createdBy: "system",
    } as any);
    return timetable;
  }

  async startExam(examId: string) {
    const exam = await educationRepository.findExamById(examId);
    if (!exam) throw new Error("Exam not found");
    return { examId, status: "started", scheduledDate: exam.scheduledDate };
  }

  async finishExam(examId: string, studentId: string, score: number) {
    const exam = await educationRepository.findExamById(examId);
    if (!exam) throw new Error("Exam not found");
    const totalPoints = exam.totalPoints ?? 100;
    const passingScore = exam.passingScore ?? 60;
    const percentage = (score / totalPoints) * 100;
    const passed = score >= passingScore;
    const result = await educationRepository.createExamResult({
      examId,
      studentId,
      score,
      maxScore: totalPoints,
      percentage: percentage.toString(),
      passed,
      gradedBy: "system",
      gradedAt: new Date(),
    });
    return result;
  }

  async issueCertificate(studentId: string, courseId: string, certificateType: "completion" | "professional" | "degree" | "license") {
    const certificate = await educationRepository.createCertificate({
      studentId,
      courseId,
      certificateType,
      certificateNumber: this.generateCertificateNumber(),
      title: "Certificate",
      issuer: "system",
      createdBy: "system",
    });
    return certificate;
  }

  async updateGrades(courseId: string, studentId: string, grade: string) {
    const enrollments = await educationRepository.findEnrollmentsByCourse(courseId);
    const enrollment = enrollments.find(e => e.studentId === studentId);
    if (!enrollment) throw new Error("Enrollment not found");
    const updated = await educationRepository.updateEnrollment(enrollment.id, { grade });
    return updated;
  }

  async simulateSchoolDay(educationId: string) {
    const runtime = await educationRepository.findRuntimeByEducation(educationId);
    if (!runtime) throw new Error("Runtime not found");
    const tick = (runtime.simulationTick || 0) + 1;
    const progress = Math.min((tick % 100) + 1, 100);
    await educationRepository.updateEducationRuntime(educationId, {
      simulationTick: tick,
      dailyAttendance: (Math.random() * 100).toString(),
      weeklyAttendance: (Math.random() * 100).toString(),
      monthlyAttendance: (Math.random() * 100).toString(),
    });
    return { educationId, tick, progress };
  }

  private generateCertificateNumber(): string {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substring(2, 8);
    return `CERT-${timestamp}-${random}`.toUpperCase();
  }
}

export const educationRuntimeBridge = new EducationRuntimeBridge();

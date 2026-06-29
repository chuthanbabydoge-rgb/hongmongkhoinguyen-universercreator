import { Router } from "express";
import { educationEditorService } from "../services/education-editor-service";
import { educationValidator } from "../validators/education-validator";
import { educationExporter } from "../exporters/education-exporter";
import { educationImporter } from "../importers/education-importer";
import { educationRuntimeBridge } from "../runtime/education-runtime-bridge";

const router = Router();

// Education CRUD
router.get("/", async (req, res) => {
  try {
    const { limit = "50", offset = "0", q } = req.query;
    const data = q
      ? await educationEditorService.searchEducation(q as string)
      : await educationEditorService.listEducation(Number(limit), Number(offset));
    res.json({ items: data });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const data = await educationEditorService.getEducation(req.params.id);
    res.json(data);
  } catch (e: any) {
    res.status(404).json({ error: e.message });
  }
});

router.post("/", async (req, res) => {
  try {
    const data = await educationEditorService.createEducation(req.body);
    res.status(201).json(data);
  } catch (e: any) {
    res.status(400).json({ error: e.message });
  }
});

router.patch("/:id", async (req, res) => {
  try {
    const data = await educationEditorService.updateEducation(req.params.id, req.body);
    res.json(data);
  } catch (e: any) {
    res.status(400).json({ error: e.message });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    await educationEditorService.deleteEducation(req.params.id);
    res.status(204).send();
  } catch (e: any) {
    res.status(400).json({ error: e.message });
  }
});

// Education actions
router.post("/:id/duplicate", async (req, res) => {
  try {
    const { createdBy } = req.body;
    const data = await educationEditorService.duplicateEducation(req.params.id, createdBy);
    res.status(201).json(data);
  } catch (e: any) {
    res.status(400).json({ error: e.message });
  }
});

router.post("/:id/publish", async (req, res) => {
  try {
    const data = await educationEditorService.publishEducation(req.params.id);
    res.json(data);
  } catch (e: any) {
    res.status(400).json({ error: e.message });
  }
});

router.post("/:id/archive", async (req, res) => {
  try {
    const data = await educationEditorService.archiveEducation(req.params.id);
    res.json(data);
  } catch (e: any) {
    res.status(400).json({ error: e.message });
  }
});

router.post("/:id/restore", async (req, res) => {
  try {
    const data = await educationEditorService.restoreEducation(req.params.id);
    res.json(data);
  } catch (e: any) {
    res.status(400).json({ error: e.message });
  }
});

router.post("/:id/version", async (req, res) => {
  try {
    const { createdBy, changelog } = req.body;
    const data = await educationEditorService.saveVersion(req.params.id, createdBy, changelog);
    res.status(201).json(data);
  } catch (e: any) {
    res.status(400).json({ error: e.message });
  }
});

router.get("/:id/stats", async (req, res) => {
  try {
    const data = await educationEditorService.getStats(req.params.id);
    res.json(data);
  } catch (e: any) {
    res.status(404).json({ error: e.message });
  }
});

router.post("/:id/stats/recalculate", async (req, res) => {
  try {
    const data = await educationEditorService.recalculateStats(req.params.id);
    res.json(data);
  } catch (e: any) {
    res.status(400).json({ error: e.message });
  }
});

router.get("/:id/history", async (req, res) => {
  try {
    const { limit = "50", offset = "0" } = req.query;
    const data = await educationEditorService.getHistory(req.params.id, Number(limit), Number(offset));
    res.json({ items: data });
  } catch (e: any) {
    res.status(404).json({ error: e.message });
  }
});

router.post("/:id/validate", async (req, res) => {
  try {
    const data = await educationValidator.validate(req.params.id);
    res.json(data);
  } catch (e: any) {
    res.status(400).json({ error: e.message });
  }
});

router.post("/:id/export", async (req, res) => {
  try {
    const { format = "json", exportedBy } = req.body;
    const data = await educationExporter.exportEducation(req.params.id, format, exportedBy);
    res.json(data);
  } catch (e: any) {
    res.status(400).json({ error: e.message });
  }
});

router.post("/import", async (req, res) => {
  try {
    const { payload, importedBy } = req.body;
    const data = await educationImporter.importEducation(payload, importedBy);
    res.status(201).json(data);
  } catch (e: any) {
    res.status(400).json({ error: e.message });
  }
});

// Courses
router.get("/:id/courses", async (req, res) => {
  try {
    const data = await educationEditorService.listCourses(req.params.id);
    res.json({ items: data });
  } catch (e: any) {
    res.status(400).json({ error: e.message });
  }
});

router.post("/:id/courses", async (req, res) => {
  try {
    const data = await educationEditorService.createCourse(req.params.id, req.body);
    res.status(201).json(data);
  } catch (e: any) {
    res.status(400).json({ error: e.message });
  }
});

router.get("/courses/:courseId", async (req, res) => {
  try {
    const data = await educationEditorService.getCourse(req.params.courseId);
    res.json(data);
  } catch (e: any) {
    res.status(404).json({ error: e.message });
  }
});

router.patch("/courses/:courseId", async (req, res) => {
  try {
    const data = await educationEditorService.updateCourse(req.params.courseId, req.body);
    res.json(data);
  } catch (e: any) {
    res.status(400).json({ error: e.message });
  }
});

router.delete("/courses/:courseId", async (req, res) => {
  try {
    await educationEditorService.deleteCourse(req.params.courseId);
    res.status(204).send();
  } catch (e: any) {
    res.status(400).json({ error: e.message });
  }
});

// Subjects
router.get("/:id/subjects", async (req, res) => {
  try {
    const data = await educationEditorService.listSubjects(req.params.id);
    res.json({ items: data });
  } catch (e: any) {
    res.status(400).json({ error: e.message });
  }
});

router.post("/:id/subjects", async (req, res) => {
  try {
    const data = await educationEditorService.createSubject(req.params.id, req.body);
    res.status(201).json(data);
  } catch (e: any) {
    res.status(400).json({ error: e.message });
  }
});

router.get("/subjects/:subjectId", async (req, res) => {
  try {
    const data = await educationEditorService.getSubject(req.params.subjectId);
    res.json(data);
  } catch (e: any) {
    res.status(404).json({ error: e.message });
  }
});

router.patch("/subjects/:subjectId", async (req, res) => {
  try {
    const data = await educationEditorService.updateSubject(req.params.subjectId, req.body);
    res.json(data);
  } catch (e: any) {
    res.status(400).json({ error: e.message });
  }
});

router.delete("/subjects/:subjectId", async (req, res) => {
  try {
    await educationEditorService.deleteSubject(req.params.subjectId);
    res.status(204).send();
  } catch (e: any) {
    res.status(400).json({ error: e.message });
  }
});

// Lessons
router.get("/courses/:courseId/lessons", async (req, res) => {
  try {
    const data = await educationEditorService.listLessons(req.params.courseId);
    res.json({ items: data });
  } catch (e: any) {
    res.status(400).json({ error: e.message });
  }
});

router.post("/courses/:courseId/lessons", async (req, res) => {
  try {
    const data = await educationEditorService.createLesson(req.params.courseId, req.body);
    res.status(201).json(data);
  } catch (e: any) {
    res.status(400).json({ error: e.message });
  }
});

router.get("/lessons/:lessonId", async (req, res) => {
  try {
    const data = await educationEditorService.getLesson(req.params.lessonId);
    res.json(data);
  } catch (e: any) {
    res.status(404).json({ error: e.message });
  }
});

router.patch("/lessons/:lessonId", async (req, res) => {
  try {
    const data = await educationEditorService.updateLesson(req.params.lessonId, req.body);
    res.json(data);
  } catch (e: any) {
    res.status(400).json({ error: e.message });
  }
});

router.delete("/lessons/:lessonId", async (req, res) => {
  try {
    await educationEditorService.deleteLesson(req.params.lessonId);
    res.status(204).send();
  } catch (e: any) {
    res.status(400).json({ error: e.message });
  }
});

// Classrooms
router.get("/:id/classrooms", async (req, res) => {
  try {
    const data = await educationEditorService.listClassrooms(req.params.id);
    res.json({ items: data });
  } catch (e: any) {
    res.status(400).json({ error: e.message });
  }
});

router.post("/:id/classrooms", async (req, res) => {
  try {
    const data = await educationEditorService.createClassroom(req.params.id, req.body);
    res.status(201).json(data);
  } catch (e: any) {
    res.status(400).json({ error: e.message });
  }
});

router.get("/classrooms/:classroomId", async (req, res) => {
  try {
    const data = await educationEditorService.getClassroom(req.params.classroomId);
    res.json(data);
  } catch (e: any) {
    res.status(404).json({ error: e.message });
  }
});

router.patch("/classrooms/:classroomId", async (req, res) => {
  try {
    const data = await educationEditorService.updateClassroom(req.params.classroomId, req.body);
    res.json(data);
  } catch (e: any) {
    res.status(400).json({ error: e.message });
  }
});

router.delete("/classrooms/:classroomId", async (req, res) => {
  try {
    await educationEditorService.deleteClassroom(req.params.classroomId);
    res.status(204).send();
  } catch (e: any) {
    res.status(400).json({ error: e.message });
  }
});

// Teachers
router.get("/:id/teachers", async (req, res) => {
  try {
    const data = await educationEditorService.listTeachers(req.params.id);
    res.json({ items: data });
  } catch (e: any) {
    res.status(400).json({ error: e.message });
  }
});

router.post("/:id/teachers", async (req, res) => {
  try {
    const data = await educationEditorService.createTeacher(req.params.id, req.body);
    res.status(201).json(data);
  } catch (e: any) {
    res.status(400).json({ error: e.message });
  }
});

router.get("/teachers/:teacherId", async (req, res) => {
  try {
    const data = await educationEditorService.getTeacher(req.params.teacherId);
    res.json(data);
  } catch (e: any) {
    res.status(404).json({ error: e.message });
  }
});

router.patch("/teachers/:teacherId", async (req, res) => {
  try {
    const data = await educationEditorService.updateTeacher(req.params.teacherId, req.body);
    res.json(data);
  } catch (e: any) {
    res.status(400).json({ error: e.message });
  }
});

router.delete("/teachers/:teacherId", async (req, res) => {
  try {
    await educationEditorService.deleteTeacher(req.params.teacherId);
    res.status(204).send();
  } catch (e: any) {
    res.status(400).json({ error: e.message });
  }
});

// Students
router.get("/:id/students", async (req, res) => {
  try {
    const data = await educationEditorService.listStudents(req.params.id);
    res.json({ items: data });
  } catch (e: any) {
    res.status(400).json({ error: e.message });
  }
});

router.post("/:id/students", async (req, res) => {
  try {
    const data = await educationEditorService.createStudent(req.params.id, req.body);
    res.status(201).json(data);
  } catch (e: any) {
    res.status(400).json({ error: e.message });
  }
});

router.get("/students/:studentId", async (req, res) => {
  try {
    const data = await educationEditorService.getStudent(req.params.studentId);
    res.json(data);
  } catch (e: any) {
    res.status(404).json({ error: e.message });
  }
});

router.patch("/students/:studentId", async (req, res) => {
  try {
    const data = await educationEditorService.updateStudent(req.params.studentId, req.body);
    res.json(data);
  } catch (e: any) {
    res.status(400).json({ error: e.message });
  }
});

router.delete("/students/:studentId", async (req, res) => {
  try {
    await educationEditorService.deleteStudent(req.params.studentId);
    res.status(204).send();
  } catch (e: any) {
    res.status(400).json({ error: e.message });
  }
});

// Enrollments
router.get("/students/:studentId/enrollments", async (req, res) => {
  try {
    const data = await educationEditorService.listEnrollmentsByStudent(req.params.studentId);
    res.json({ items: data });
  } catch (e: any) {
    res.status(400).json({ error: e.message });
  }
});

router.get("/courses/:courseId/enrollments", async (req, res) => {
  try {
    const data = await educationEditorService.listEnrollmentsByCourse(req.params.courseId);
    res.json({ items: data });
  } catch (e: any) {
    res.status(400).json({ error: e.message });
  }
});

router.post("/enrollments", async (req, res) => {
  try {
    const data = await educationEditorService.createEnrollment(req.body);
    res.status(201).json(data);
  } catch (e: any) {
    res.status(400).json({ error: e.message });
  }
});

router.get("/enrollments/:enrollmentId", async (req, res) => {
  try {
    const data = await educationEditorService.getEnrollment(req.params.enrollmentId);
    res.json(data);
  } catch (e: any) {
    res.status(404).json({ error: e.message });
  }
});

router.patch("/enrollments/:enrollmentId", async (req, res) => {
  try {
    const data = await educationEditorService.updateEnrollment(req.params.enrollmentId, req.body);
    res.json(data);
  } catch (e: any) {
    res.status(400).json({ error: e.message });
  }
});

router.delete("/enrollments/:enrollmentId", async (req, res) => {
  try {
    await educationEditorService.deleteEnrollment(req.params.enrollmentId);
    res.status(204).send();
  } catch (e: any) {
    res.status(400).json({ error: e.message });
  }
});

// Attendance
router.get("/students/:studentId/attendance", async (req, res) => {
  try {
    const data = await educationEditorService.listAttendanceByStudent(req.params.studentId);
    res.json({ items: data });
  } catch (e: any) {
    res.status(400).json({ error: e.message });
  }
});

router.get("/lessons/:lessonId/attendance", async (req, res) => {
  try {
    const data = await educationEditorService.listAttendanceByLesson(req.params.lessonId);
    res.json({ items: data });
  } catch (e: any) {
    res.status(400).json({ error: e.message });
  }
});

router.post("/attendance", async (req, res) => {
  try {
    const data = await educationEditorService.createAttendance(req.body);
    res.status(201).json(data);
  } catch (e: any) {
    res.status(400).json({ error: e.message });
  }
});

router.get("/attendance/:attendanceId", async (req, res) => {
  try {
    const data = await educationEditorService.getAttendance(req.params.attendanceId);
    res.json(data);
  } catch (e: any) {
    res.status(404).json({ error: e.message });
  }
});

router.patch("/attendance/:attendanceId", async (req, res) => {
  try {
    const data = await educationEditorService.updateAttendance(req.params.attendanceId, req.body);
    res.json(data);
  } catch (e: any) {
    res.status(400).json({ error: e.message });
  }
});

router.delete("/attendance/:attendanceId", async (req, res) => {
  try {
    await educationEditorService.deleteAttendance(req.params.attendanceId);
    res.status(204).send();
  } catch (e: any) {
    res.status(400).json({ error: e.message });
  }
});

// Curriculum
router.get("/:id/curriculum", async (req, res) => {
  try {
    const data = await educationEditorService.listCurriculum(req.params.id);
    res.json({ items: data });
  } catch (e: any) {
    res.status(400).json({ error: e.message });
  }
});

router.post("/:id/curriculum", async (req, res) => {
  try {
    const data = await educationEditorService.createCurriculum(req.params.id, req.body);
    res.status(201).json(data);
  } catch (e: any) {
    res.status(400).json({ error: e.message });
  }
});

router.get("/curriculum/:curriculumId", async (req, res) => {
  try {
    const data = await educationEditorService.getCurriculum(req.params.curriculumId);
    res.json(data);
  } catch (e: any) {
    res.status(404).json({ error: e.message });
  }
});

router.patch("/curriculum/:curriculumId", async (req, res) => {
  try {
    const data = await educationEditorService.updateCurriculum(req.params.curriculumId, req.body);
    res.json(data);
  } catch (e: any) {
    res.status(400).json({ error: e.message });
  }
});

router.delete("/curriculum/:curriculumId", async (req, res) => {
  try {
    await educationEditorService.deleteCurriculum(req.params.curriculumId);
    res.status(204).send();
  } catch (e: any) {
    res.status(400).json({ error: e.message });
  }
});

// Exams
router.get("/courses/:courseId/exams", async (req, res) => {
  try {
    const data = await educationEditorService.listExams(req.params.courseId);
    res.json({ items: data });
  } catch (e: any) {
    res.status(400).json({ error: e.message });
  }
});

router.post("/courses/:courseId/exams", async (req, res) => {
  try {
    const data = await educationEditorService.createExam(req.params.courseId, req.body);
    res.status(201).json(data);
  } catch (e: any) {
    res.status(400).json({ error: e.message });
  }
});

router.get("/exams/:examId", async (req, res) => {
  try {
    const data = await educationEditorService.getExam(req.params.examId);
    res.json(data);
  } catch (e: any) {
    res.status(404).json({ error: e.message });
  }
});

router.patch("/exams/:examId", async (req, res) => {
  try {
    const data = await educationEditorService.updateExam(req.params.examId, req.body);
    res.json(data);
  } catch (e: any) {
    res.status(400).json({ error: e.message });
  }
});

router.delete("/exams/:examId", async (req, res) => {
  try {
    await educationEditorService.deleteExam(req.params.examId);
    res.status(204).send();
  } catch (e: any) {
    res.status(400).json({ error: e.message });
  }
});

// Exam Results
router.get("/exams/:examId/results", async (req, res) => {
  try {
    const data = await educationEditorService.listExamResultsByExam(req.params.examId);
    res.json({ items: data });
  } catch (e: any) {
    res.status(400).json({ error: e.message });
  }
});

router.get("/students/:studentId/exam-results", async (req, res) => {
  try {
    const data = await educationEditorService.listExamResultsByStudent(req.params.studentId);
    res.json({ items: data });
  } catch (e: any) {
    res.status(400).json({ error: e.message });
  }
});

router.post("/exam-results", async (req, res) => {
  try {
    const data = await educationEditorService.createExamResult(req.body);
    res.status(201).json(data);
  } catch (e: any) {
    res.status(400).json({ error: e.message });
  }
});

router.get("/exam-results/:resultId", async (req, res) => {
  try {
    const data = await educationEditorService.getExamResult(req.params.resultId);
    res.json(data);
  } catch (e: any) {
    res.status(404).json({ error: e.message });
  }
});

router.patch("/exam-results/:resultId", async (req, res) => {
  try {
    const data = await educationEditorService.updateExamResult(req.params.resultId, req.body);
    res.json(data);
  } catch (e: any) {
    res.status(400).json({ error: e.message });
  }
});

router.delete("/exam-results/:resultId", async (req, res) => {
  try {
    await educationEditorService.deleteExamResult(req.params.resultId);
    res.status(204).send();
  } catch (e: any) {
    res.status(400).json({ error: e.message });
  }
});

// Certificates
router.get("/students/:studentId/certificates", async (req, res) => {
  try {
    const data = await educationEditorService.listCertificatesByStudent(req.params.studentId);
    res.json({ items: data });
  } catch (e: any) {
    res.status(400).json({ error: e.message });
  }
});

router.post("/certificates", async (req, res) => {
  try {
    const data = await educationEditorService.createCertificate(req.body);
    res.status(201).json(data);
  } catch (e: any) {
    res.status(400).json({ error: e.message });
  }
});

router.get("/certificates/:certificateId", async (req, res) => {
  try {
    const data = await educationEditorService.getCertificate(req.params.certificateId);
    res.json(data);
  } catch (e: any) {
    res.status(404).json({ error: e.message });
  }
});

router.patch("/certificates/:certificateId", async (req, res) => {
  try {
    const data = await educationEditorService.updateCertificate(req.params.certificateId, req.body);
    res.json(data);
  } catch (e: any) {
    res.status(400).json({ error: e.message });
  }
});

router.delete("/certificates/:certificateId", async (req, res) => {
  try {
    await educationEditorService.deleteCertificate(req.params.certificateId);
    res.status(204).send();
  } catch (e: any) {
    res.status(400).json({ error: e.message });
  }
});

// Degrees
router.get("/:id/degrees", async (req, res) => {
  try {
    const data = await educationEditorService.listDegrees(req.params.id);
    res.json({ items: data });
  } catch (e: any) {
    res.status(400).json({ error: e.message });
  }
});

router.post("/:id/degrees", async (req, res) => {
  try {
    const data = await educationEditorService.createDegree(req.params.id, req.body);
    res.status(201).json(data);
  } catch (e: any) {
    res.status(400).json({ error: e.message });
  }
});

router.get("/degrees/:degreeId", async (req, res) => {
  try {
    const data = await educationEditorService.getDegree(req.params.degreeId);
    res.json(data);
  } catch (e: any) {
    res.status(404).json({ error: e.message });
  }
});

router.patch("/degrees/:degreeId", async (req, res) => {
  try {
    const data = await educationEditorService.updateDegree(req.params.degreeId, req.body);
    res.json(data);
  } catch (e: any) {
    res.status(400).json({ error: e.message });
  }
});

router.delete("/degrees/:degreeId", async (req, res) => {
  try {
    await educationEditorService.deleteDegree(req.params.degreeId);
    res.status(204).send();
  } catch (e: any) {
    res.status(400).json({ error: e.message });
  }
});

// Timetable
router.get("/:id/timetable", async (req, res) => {
  try {
    const { semester = "fall", year = new Date().getFullYear() } = req.query;
    const data = await educationEditorService.getTimetable(req.params.id, semester as string, Number(year));
    res.json({ items: data });
  } catch (e: any) {
    res.status(400).json({ error: e.message });
  }
});

router.post("/timetable", async (req, res) => {
  try {
    const data = await educationEditorService.createTimetable(req.body);
    res.status(201).json(data);
  } catch (e: any) {
    res.status(400).json({ error: e.message });
  }
});

router.get("/timetable/:timetableId", async (req, res) => {
  try {
    const timetableId = Array.isArray(req.params.timetableId) ? req.params.timetableId[0] : req.params.timetableId;
    const data = await educationEditorService.getTimetableById(timetableId);
    res.json(data);
  } catch (e: any) {
    res.status(404).json({ error: e.message });
  }
});

router.patch("/timetable/:timetableId", async (req, res) => {
  try {
    const data = await educationEditorService.updateTimetable(req.params.timetableId, req.body);
    res.json(data);
  } catch (e: any) {
    res.status(400).json({ error: e.message });
  }
});

router.delete("/timetable/:timetableId", async (req, res) => {
  try {
    await educationEditorService.deleteTimetable(req.params.timetableId);
    res.status(204).send();
  } catch (e: any) {
    res.status(400).json({ error: e.message });
  }
});

// Templates
router.get("/templates", async (req, res) => {
  try {
    const { limit = "50", offset = "0" } = req.query;
    const data = await educationEditorService.listTemplates(Number(limit), Number(offset));
    res.json({ items: data });
  } catch (e: any) {
    res.status(400).json({ error: e.message });
  }
});

router.post("/templates", async (req, res) => {
  try {
    const data = await educationEditorService.createTemplate(req.body);
    res.status(201).json(data);
  } catch (e: any) {
    res.status(400).json({ error: e.message });
  }
});

router.get("/templates/:templateId", async (req, res) => {
  try {
    const data = await educationEditorService.getTemplate(req.params.templateId);
    res.json(data);
  } catch (e: any) {
    res.status(404).json({ error: e.message });
  }
});

router.patch("/templates/:templateId", async (req, res) => {
  try {
    const data = await educationEditorService.updateTemplate(req.params.templateId, req.body);
    res.json(data);
  } catch (e: any) {
    res.status(400).json({ error: e.message });
  }
});

router.delete("/templates/:templateId", async (req, res) => {
  try {
    await educationEditorService.deleteTemplate(req.params.templateId);
    res.status(204).send();
  } catch (e: any) {
    res.status(400).json({ error: e.message });
  }
});

// Runtime
router.get("/:id/runtime", async (req, res) => {
  try {
    const data = await educationEditorService.getRuntime(req.params.id);
    res.json(data);
  } catch (e: any) {
    res.status(404).json({ error: e.message });
  }
});

router.post("/:id/runtime/start-semester", async (req, res) => {
  try {
    const { semester, year } = req.body;
    const data = await educationRuntimeBridge.startSemester(req.params.id, semester, year);
    res.json(data);
  } catch (e: any) {
    res.status(400).json({ error: e.message });
  }
});

router.post("/:id/runtime/end-semester", async (req, res) => {
  try {
    const data = await educationRuntimeBridge.endSemester(req.params.id);
    res.json(data);
  } catch (e: any) {
    res.status(400).json({ error: e.message });
  }
});

router.post("/runtime/enroll-student", async (req, res) => {
  try {
    const { studentId, courseId, semester, year } = req.body;
    const data = await educationRuntimeBridge.enrollStudent(studentId, courseId, semester, year);
    res.json(data);
  } catch (e: any) {
    res.status(400).json({ error: e.message });
  }
});

router.post("/runtime/graduate-student", async (req, res) => {
  try {
    const { studentId, degreeId } = req.body;
    const data = await educationRuntimeBridge.graduateStudent(studentId, degreeId);
    res.json(data);
  } catch (e: any) {
    res.status(400).json({ error: e.message });
  }
});

router.post("/runtime/take-attendance", async (req, res) => {
  try {
    const { lessonId, studentId, status } = req.body;
    const data = await educationRuntimeBridge.takeAttendance(lessonId, studentId, status);
    res.json(data);
  } catch (e: any) {
    res.status(400).json({ error: e.message });
  }
});

router.post("/runtime/schedule-lesson", async (req, res) => {
  try {
    const { educationId, lessonId, dayOfWeek, startTime, endTime } = req.body;
    const data = await educationRuntimeBridge.scheduleLesson(educationId, lessonId, dayOfWeek, startTime, endTime);
    res.json(data);
  } catch (e: any) {
    res.status(400).json({ error: e.message });
  }
});

router.post("/runtime/start-exam", async (req, res) => {
  try {
    const { examId } = req.body;
    const data = await educationRuntimeBridge.startExam(examId);
    res.json(data);
  } catch (e: any) {
    res.status(400).json({ error: e.message });
  }
});

router.post("/runtime/finish-exam", async (req, res) => {
  try {
    const { examId, studentId, score } = req.body;
    const data = await educationRuntimeBridge.finishExam(examId, studentId, score);
    res.json(data);
  } catch (e: any) {
    res.status(400).json({ error: e.message });
  }
});

router.post("/runtime/issue-certificate", async (req, res) => {
  try {
    const { studentId, courseId, certificateType } = req.body;
    const data = await educationRuntimeBridge.issueCertificate(studentId, courseId, certificateType);
    res.json(data);
  } catch (e: any) {
    res.status(400).json({ error: e.message });
  }
});

router.post("/runtime/update-grades", async (req, res) => {
  try {
    const { courseId, studentId, grade } = req.body;
    const data = await educationRuntimeBridge.updateGrades(courseId, studentId, grade);
    res.json(data);
  } catch (e: any) {
    res.status(400).json({ error: e.message });
  }
});

router.post("/:id/runtime/simulate-day", async (req, res) => {
  try {
    const data = await educationRuntimeBridge.simulateSchoolDay(req.params.id);
    res.json(data);
  } catch (e: any) {
    res.status(400).json({ error: e.message });
  }
});

export default router;

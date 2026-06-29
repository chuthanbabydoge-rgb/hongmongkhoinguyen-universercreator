import crypto from "crypto";
import { educationRepository } from "../repositories/education-repository";

export class EducationExporter {
  async exportEducation(educationId: string, format: "json" | "template" | "package" = "json", exportedBy: string) {
    const [education, courses, subjects, lessons, classrooms, teachers, students, enrollments, curriculum, exams, timetable] = await Promise.all([
      educationRepository.findEducationById(educationId),
      educationRepository.findCoursesByEducation(educationId),
      educationRepository.findSubjectsByEducation(educationId),
      Promise.all((await educationRepository.findCoursesByEducation(educationId)).flatMap(c => 
        educationRepository.findLessonsByCourse(c.id)
      )),
      educationRepository.findClassroomsByEducation(educationId),
      educationRepository.findTeachersByEducation(educationId),
      educationRepository.findStudentsByEducation(educationId),
      Promise.all((await educationRepository.findStudentsByEducation(educationId)).flatMap(s => 
        educationRepository.findEnrollmentsByStudent(s.id)
      )),
      educationRepository.findCurriculumByEducation(educationId),
      Promise.all((await educationRepository.findCoursesByEducation(educationId)).flatMap(c => 
        educationRepository.findExamsByCourse(c.id)
      )),
      educationRepository.findTimetableByEducation(educationId, "fall", new Date().getFullYear()),
    ]);
    if (!education) throw new Error(`Education ${educationId} not found`);

    const payload = {
      exportVersion: "1.0.0",
      format,
      exportedAt: new Date().toISOString(),
      education,
      courses,
      subjects,
      lessons,
      classrooms,
      teachers,
      students,
      enrollments,
      curriculum,
      exams,
      timetable,
    };

    const json = JSON.stringify(payload);
    const checksum = crypto.createHash("sha256").update(json).digest("hex");
    const record = await educationRepository.createEducationExport({ educationId, format, payload: payload as any, checksum, exportedBy });
    return { ...record, data: payload };
  }
}

export const educationExporter = new EducationExporter();

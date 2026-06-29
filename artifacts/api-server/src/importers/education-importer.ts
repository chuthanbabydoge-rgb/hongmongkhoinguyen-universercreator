import { educationRepository } from "../repositories/education-repository";

export class EducationImporter {
  async importEducation(payload: Record<string, unknown>, importedBy: string) {
    const { education, courses, subjects, lessons, classrooms, teachers, students, enrollments, curriculum, exams, timetable } = payload as any;

    if (!education) throw new Error("Invalid education export: missing education");

    const { id: _id, createdAt, updatedAt, ...educationData } = education;
    const created = await educationRepository.createEducation({ ...educationData, createdBy: importedBy, isPublished: false });

    const errors: string[] = [];
    const importGroup = async (items: unknown[], fn: (data: Record<string, unknown>) => Promise<unknown>, label: string) => {
      if (!Array.isArray(items)) return;
      for (const item of items) {
        try {
          const { id: _id2, createdAt: _c, updatedAt: _u, ...rest } = item as any;
          await fn({ ...rest, educationId: created.id });
        } catch (e: any) {
          errors.push(`${label}: ${e.message}`);
        }
      }
    };

    await importGroup(subjects ?? [], d => educationRepository.createSubject(d as any), "subject");
    await importGroup(classrooms ?? [], d => educationRepository.createClassroom(d as any), "classroom");
    await importGroup(teachers ?? [], d => educationRepository.createTeacher(d as any), "teacher");
    await importGroup(students ?? [], d => educationRepository.createStudent(d as any), "student");
    await importGroup(courses ?? [], d => educationRepository.createCourse(d as any), "course");
    await importGroup(lessons ?? [], d => educationRepository.createLesson(d as any), "lesson");
    await importGroup(enrollments ?? [], d => educationRepository.createEnrollment(d as any), "enrollment");
    await importGroup(curriculum ?? [], d => educationRepository.createCurriculum(d as any), "curriculum");
    await importGroup(exams ?? [], d => educationRepository.createExam(d as any), "exam");
    await importGroup(timetable ?? [], d => educationRepository.createTimetable(d as any), "timetable");

    return { educationId: created.id, errors };
  }
}

export const educationImporter = new EducationImporter();

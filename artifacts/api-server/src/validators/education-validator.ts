import { educationRepository } from "../repositories/education-repository";

interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

export class EducationValidator {
  async validate(educationId: string): Promise<ValidationResult> {
    const errors: string[] = [];
    const warnings: string[] = [];

    const education = await educationRepository.findEducationById(educationId);
    if (!education) {
      return { valid: false, errors: ["Education not found"], warnings };
    }

    // Check for missing principal
    if (!education.principalId) {
      errors.push("Education institution has no principal assigned");
    }

    // Check courses
    const courses = await educationRepository.findCoursesByEducation(educationId);
    for (const course of courses) {
      if (!course.subjectId) {
        errors.push(`Course "${course.name}" has no subject assigned`);
      }

      const lessons = await educationRepository.findLessonsByCourse(course.id);
      if (lessons.length === 0) {
        warnings.push(`Course "${course.name}" has no lessons`);
      }

      // Check for overlapping lessons
      const overlaps = this.checkOverlappingLessons(lessons);
      if (overlaps.length > 0) {
        errors.push(`Course "${course.name}" has ${overlaps.length} overlapping lessons`);
      }
    }

    // Check classrooms
    const classrooms = await educationRepository.findClassroomsByEducation(educationId);
    const usedClassrooms = new Set<string>();
    for (const course of courses) {
      const lessons = await educationRepository.findLessonsByCourse(course.id);
      for (const lesson of lessons) {
        if (lesson.classroomId) {
          usedClassrooms.add(lesson.classroomId);
        }
      }
    }

    for (const classroom of classrooms) {
      if (!usedClassrooms.has(classroom.id)) {
        warnings.push(`Classroom "${classroom.name}" is not used in any lesson`);
      }
    }

    // Check teachers
    const teachers = await educationRepository.findTeachersByEducation(educationId);
    const usedTeachers = new Set<string>();
    for (const course of courses) {
      const lessons = await educationRepository.findLessonsByCourse(course.id);
      for (const lesson of lessons) {
        if (lesson.teacherId) {
          usedTeachers.add(lesson.teacherId);
        }
      }
    }

    for (const teacher of teachers) {
      if (!usedTeachers.has(teacher.id)) {
        warnings.push(`Teacher "${teacher.name}" is not assigned to any lesson`);
      }
    }

    // Check exams
    for (const course of courses) {
      const exams = await educationRepository.findExamsByCourse(course.id);
      for (const exam of exams) {
        if (!exam.subjectId) {
          errors.push(`Exam "${exam.name}" has no subject assigned`);
        }
      }
    }

    // Check enrollments
    const students = await educationRepository.findStudentsByEducation(educationId);
    for (const student of students) {
      const enrollments = await educationRepository.findEnrollmentsByStudent(student.id);
      const duplicateEnrollments = this.checkDuplicateEnrollments(enrollments);
      if (duplicateEnrollments.length > 0) {
        errors.push(`Student "${student.name}" has duplicate enrollments for courses: ${duplicateEnrollments.join(", ")}`);
      }
    }

    // Check curriculum
    const curricula = await educationRepository.findCurriculumByEducation(educationId);
    for (const curriculum of curricula) {
      if (!curriculum.courses || curriculum.courses.length === 0) {
        warnings.push(`Curriculum "${curriculum.name}" has no courses`);
      }
      if (!curriculum.graduationRequirements || Object.keys(curriculum.graduationRequirements).length === 0) {
        warnings.push(`Curriculum "${curriculum.name}" has no graduation requirements`);
      }
    }

    // Check classroom capacity
    for (const course of courses) {
      const enrollments = await educationRepository.findEnrollmentsByCourse(course.id);
      for (const lesson of await educationRepository.findLessonsByCourse(course.id)) {
        if (lesson.classroomId) {
          const classroom = await educationRepository.findClassroomById(lesson.classroomId);
          if (classroom && enrollments.length > classroom.capacity) {
            errors.push(`Classroom "${classroom.name}" capacity (${classroom.capacity}) exceeded for course "${course.name}" (${enrollments.length} students)`);
          }
        }
      }
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings,
    };
  }

  private checkOverlappingLessons(lessons: any[]): any[] {
    const overlaps: any[] = [];
    for (let i = 0; i < lessons.length; i++) {
      for (let j = i + 1; j < lessons.length; j++) {
        const a = lessons[i];
        const b = lessons[j];
        if (a.dayOfWeek === b.dayOfWeek && a.classroomId === b.classroomId) {
          if (this.timeOverlaps(a.startTime, a.endTime, b.startTime, b.endTime)) {
            overlaps.push({ a, b });
          }
        }
      }
    }
    return overlaps;
  }

  private timeOverlaps(start1: string, end1: string, start2: string, end2: string): boolean {
    const s1 = this.timeToMinutes(start1);
    const e1 = this.timeToMinutes(end1);
    const s2 = this.timeToMinutes(start2);
    const e2 = this.timeToMinutes(end2);
    return s1 < e2 && s2 < e1;
  }

  private timeToMinutes(time: string): number {
    const [h, m] = time.split(":").map(Number);
    return h * 60 + m;
  }

  private checkDuplicateEnrollments(enrollments: any[]): string[] {
    const courseMap = new Map<string, number>();
    const duplicates: string[] = [];
    for (const enrollment of enrollments) {
      const count = courseMap.get(enrollment.courseId) || 0;
      courseMap.set(enrollment.courseId, count + 1);
      if (count > 0) {
        duplicates.push(enrollment.courseId);
      }
    }
    return duplicates;
  }
}

export const educationValidator = new EducationValidator();

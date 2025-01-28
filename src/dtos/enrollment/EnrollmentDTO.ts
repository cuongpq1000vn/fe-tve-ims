import { AuditInfoDTO } from "../base";
import { StudentDTO } from "../student/StudentDTO";

export type EnrollmentDTO = {
  id: number;
  student: StudentDTO;
  course: number;
  classCode: string;
  courseCode: string;
  courseName: string;
  enrollmentDate: Date;
} & AuditInfoDTO;

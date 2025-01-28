import { Classification } from "@/constants/classification";
import { AuditInfoDTO } from "../base";
import { ClassDTO } from "../classes/ClassDTO";
import { StudentDTO } from "../student";
import { SkillDTO } from "./SkillDTO";
import { TestTypeDTO } from "./TestTypeDTO";

export type GradeDTO = {
  id: number;
  student: StudentDTO;
  classTvms: ClassDTO;
  testType: TestTypeDTO;
  comment: string;
  score: number;
  classification: Classification;
  skills: SkillDTO[];
} & AuditInfoDTO;
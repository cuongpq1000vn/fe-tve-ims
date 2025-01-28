import { Classification } from "@/constants/classification";
import { TypeOfTest } from "@/constants/typeOfTest";
import { SkillRequestDTO } from "./SkillRequestDTO";

export type GradeRequestDTO = {
  studentId: number | undefined;
  classId: number;
  typeOfTest: TypeOfTest;
  comment: string;
  score: number;
  classification: Classification;
  skills: SkillRequestDTO[];
};

export type GradeUpdateRequestDTO = {
  id: number;
  studentId: number;
  classId: number;
  typeOfTest: TypeOfTest;
  comment: string;
  score: number;
  classification: Classification;
  skills: SkillRequestDTO[];
};

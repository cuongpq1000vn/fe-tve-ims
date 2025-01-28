import { TypeOfTest } from "@/constants/typeOfTest";

export type LessonRequest = {
  courseId: string;
  description: string;
  lessonType: TypeOfTest;
};

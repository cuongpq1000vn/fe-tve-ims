import { CourseDTO } from "@/dtos/course";

type Props = {
  course: CourseDTO;
};

export default function LessonsTable({ course }: Readonly<Props>) {
  return <>{course.id}</>;
}

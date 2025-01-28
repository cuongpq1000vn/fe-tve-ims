import { defaultStaff } from "@/dtos";
import { ClassDTO } from "@/dtos/classes/ClassDTO";
import { getCourseById } from "@/services/CourseService";
import { getAllEnrollmentByCourse } from "@/services/EnrollmentService";
import { SearchParams } from "@/types";
import { notFound } from "next/navigation";
import Form from "./component/Form";

type Props = {
  searchParams: SearchParams;
};

export default async function NewClass({ searchParams }: Props) {
  const { enrollments: enrollmentIdString, course: courseCode } =
    await searchParams;

  if (enrollmentIdString && courseCode) {
    const enrollmentIds = (enrollmentIdString as string)
      .split(",")
      .map((id) => Number(id));

    const response = await getAllEnrollmentByCourse(courseCode as string);

    if (!response.data) {
      return notFound();
    }

    const responseCourse = await getCourseById(courseCode as string);
    if (!responseCourse.data) {
      return notFound();
    }

    const students = response.data
      .filter((e) => enrollmentIds.includes(e.id))
      .map((e) => e.student);

    const classInit: ClassDTO = {
      students,
      id: 0,
      code: "000-000",
      course: responseCourse.data,
      createdAt: new Date(),
      updatedAt: new Date(),
      createdBy: "",
      updatedBy: "",
      startDate: new Date().toISOString(),
      schedules: [],
      staff: defaultStaff,
      classDays: [],
      name: `${courseCode} Class`,
      isDelete: false,
    };
    return (
      <div className="mt-6">
        <Form operation="create" defaultClass={classInit} />
      </div>
    );
  }
  return (
    <div className="mt-6">
      <Form operation="create" showGrades={false} showSchedule={false} />
    </div>
  );
}

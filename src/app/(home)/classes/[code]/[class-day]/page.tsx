import { Button } from "@nextui-org/react";
import Link from "next/link";
import ClassDayForm from "./component/ClassDayForm";
import { getClassDayByCode } from "@/services/ClassDayService";
import { notFound } from "next/navigation";
import { getStudentsByClassCode } from "@/services/StudentService";
import { getAllAbsence } from "@/services/AbsenceService";
import { StudentDTO } from "@/dtos";
import { AbsenceDTO } from "@/dtos/absence/AbsenceDTO";
import { DateToStringWithoutTime } from "@/utils/DateUtils";

type Props = {
  params: Promise<{ code: string; "class-day": number }>;
};

export default async function AttendancePage({ params }: Readonly<Props>) {
  const { code, "class-day": classDay } = await params;

  const response = await getClassDayByCode(classDay);
  const studentResponse = await getStudentsByClassCode(code);
  const absentList = await getAllAbsence();

  if (!response.data) {
    notFound();
  }

  if (studentResponse.data && absentList.data) {
    const students = mapStudentsWithAbsence(
      studentResponse.data,
      absentList.data
    );
    return (
      <>
        <div className="w-full mb-3 flex gap-3 justify-between">
        <h1 className="text-2xl font-bold">{DateToStringWithoutTime(response.data.classDate)}</h1>
          <Button
            as={Link}
            href={`/classes/${code}/${classDay}/edit`}
            color="primary"
            type="button"
          >
            Edit
          </Button>
        </div>
        <ClassDayForm
          isReadonly
          isDisabled
          defaultClassDay={response.data}
          code={code}
          classDay={classDay}
          students={students}
        />
      </>
    );
  }

  function mapStudentsWithAbsence(
    students: StudentDTO[],
    absences: AbsenceDTO[]
  ) {
    return students.map((student: StudentDTO) => {
      const absentRecord = absences?.find(
        (absence: AbsenceDTO) =>
          absence.studentId === student.id &&
          absence.classCode === code &&
          absence.classDayId === Number(classDay)
      );
      return {
        id: student.id,
        name: student.name,
        nickname: student.nickname || "",
        avatar: student.avatarUrl || null,
        isAbsent: absentRecord ? !absentRecord.checkAbsent : false,
      };
    });
  }

  return (
    <>
      <div className="w-full mt-8 flex gap-3 justify-between bg-black">
        <h1 className="text-2xl font-bold">{DateToStringWithoutTime(response.data.classDate)}</h1>
        <Button
          as={Link}
          href={`/classes/${code}/${classDay}/edit`}
          color="primary"
          type="button"
        >
          Edit
        </Button>
      </div>
      <ClassDayForm
        isReadonly
        defaultClassDay={response.data}
        code={code}
        classDay={classDay}
        students={[]}
      />
    </>
  );
}

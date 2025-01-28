"use client";

import { EditButton } from "@/components/molecules/form";
import TableWrapper from "@/components/molecules/table/TableWrapper";
import { Rest } from "@/components/type";
import { StudentDTO } from "@/dtos/student/StudentDTO";
import { getStudent } from "@/services/StudentService";
import { DateToStringWithoutTime } from "@/utils/DateUtils";
import { User } from "@nextui-org/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import DropdownWrapper from "./DropdownContextProvider";
import StudentDropdown from "./StudentDropdown";

type Props = {
  defaultStudents?: StudentDTO[];
  disabled?: boolean;
  isReadonly?: boolean;
};

const StudentTable = ({ defaultStudents, disabled, isReadonly }: Props) => {
  const router = useRouter();
  const [data, setData] = useState(defaultStudents ?? []);
  const [loading, setLoading] = useState(false);

  const columns = [
    { name: "Name", key: "name", align: "start" },
    { name: "Code", key: "code" },
    { name: "Nickname", key: "nickname" },
    { name: "Phone Number", key: "phoneNumber" },
    { name: "Date Of Birth", key: "dateOfBirth" },
    { name: "Action", key: "Action" },
  ];

  const renderCell = (key: string, data: StudentDTO) => {
    const cellValue = data[key as keyof StudentDTO];

    switch (key) {
      case "code":
        return (
          <Link
            href={`/students/${cellValue}`}
            className="text-blue-600 underline"
          >
            {cellValue?.toString()}
          </Link>
        );
      case "name":
        return (
          <User
            {...(data.avatarUrl
              ? {
                  avatarProps: {
                    src: `/api/images?filePath=${data.avatarUrl}`,
                  },
                }
              : {})}
            description={data.emailAddress}
            name={cellValue?.toString()}
          >
            {data.emailAddress}
          </User>
        );
      case "nickname":
        return (
          <div className="flex justify-center items-center">
            {cellValue?.toString()}
          </div>
        );
      case "phoneNumber":
        return (
          <div className="flex justify-center items-center">
            {cellValue?.toString()}
          </div>
        );
      case "dateOfBirth":
        return (
          <div className="flex justify-center items-center">
            {DateToStringWithoutTime(cellValue as Date)}
          </div>
        );
      case "Action":
        return (
          <EditButton
            isIconOnly
            onPress={() => router.push(`/students/${data.code}/edit`)}
          />
        );
    }
  };

  const rest: Rest | undefined = {
    totalElements: data.length,
    totalPages: 0,
    size: data.length,
    number: data.length,
    pageable: {
      pageNumber: 0,
      pageSize: data.length,
      offset: 0,
      sort: [],
      paged: true,
      unpaged: false,
    },
    sort: [],
    first: true,
    last: true,
    empty: false,
    numberOfElements: data.length,
  };

  const onChangeSelection = async (selected: string[]) => {
    const selection = selected.map(
      (s) => JSON.parse(s) as { id: string; code: string }
    );
    const codes = selection.map((s) => s.code);

    const newSelections = codes.filter(
      (s) => !data.map((d) => d.code).includes(s)
    );

    if (newSelections.length === 0) {
      const temp = structuredClone(data.filter((d) => codes.includes(d.code)));

      setData(temp);
    }

    for (const code of newSelections) {
      setLoading(true);
      const response = await getStudent(code);
      setLoading(false);

      if (!response.data) {
        toast.error("Failed to get student");
        return;
      }

      const temp = structuredClone(data);

      temp.push(response.data);

      setData(temp);
    }
  };

  return (
    <>
      <TableWrapper<StudentDTO>
        rest={rest}
        columns={columns}
        renderCell={renderCell}
        data={data}
        isLoading={loading}
        showControls={false}
      />
      {!isReadonly && (
        <div className="w-full flex justify-center mt-2">
          <DropdownWrapper
            disabled={disabled}
            label="students"
            defaultLoading
            required
            defaultSelection={defaultStudents?.map((student) => ({
              key: `${student.code} - ${student.name}`,
              value: JSON.stringify({ code: student.code, id: student.id }),
            }))}
            selectionMode="multiple"
          >
            <StudentDropdown setSelected={onChangeSelection} />
          </DropdownWrapper>
        </div>
      )}
    </>
  );
};

export default StudentTable;

"use client";

import { DeleteActionButton } from "@/components";
import { EditButton } from "@/components/molecules/form";
import ReportViewer from "@/components/molecules/reportViewer";
import TableWrapper from "@/components/molecules/table/TableWrapper";
import { DataType, FilterOptionType, Rest } from "@/components/type";
import { ClassStatus } from "@/constants/class";
import { ClassDTO } from "@/dtos/classes/ClassDTO";
import { ScheduleDTO } from "@/dtos/schedule/ScheduleDTO";
import { useMeaningfulContext } from "@/hooks";
import { deleteClass } from "@/services/ClassService";
import {
  Button,
  ButtonGroup,
  Selection,
  useDisclosure,
} from "@nextui-org/react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import React, { ComponentProps, useState } from "react";
import { FaEye } from "react-icons/fa";
import { toast } from "sonner";
import { ClassContext } from "../context/ClassesContext";

const ClassTable: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const path = usePathname();
  const params = new URLSearchParams(Array.from(useSearchParams()));
  const {
    isLoading,
    classes,
    filterValue,
    setFilterValue,
    selection,
    setSelection,
    setClasses,
  } = useMeaningfulContext(ClassContext);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const data = classes;

  const columns = [
    { name: "Code", key: "code", align: "start" },
    { name: "Name", key: "name" },
    { name: "Schedules", key: "schedules" },
    { name: "Next lesson", key: "lesson" },
    { name: "Location", key: "location" },
    { name: "Action", key: "Action" },
  ];

  const deleteAction = async (id: number) => {
    setLoading(true);
    const response = await deleteClass(id);
    if (response.status !== 200) {
      toast.error("Failed to delete class");
      return response;
    }

    toast.success("Class deleted");
    if (!classes) {
      return response;
    }

    const temp = structuredClone(classes);
    const index = temp.content.findIndex((c) => c.id === id);
    temp.content.splice(index, 1);
    setClasses(temp);
    setLoading(false);
    return response;
  };

  const renderCell = (key: string, data: ClassDTO) => {
    const cellValue = data[key as keyof ClassDTO];

    switch (key) {
      case "code":
        return (
          <Link
            href={`/classes/${cellValue as string}`}
            className="text-blue-600 underline"
          >
            {cellValue as string}
          </Link>
        );
      case "name":
        return <p>{cellValue as string}</p>;
      case "startDate":
        return (
          <div className="flex justify-center items-center">
            {new Date(cellValue as string).toISOString().split("T")[0]}
          </div>
        );
      case "schedules":
        return (
          <div className="flex justify-center items-center gap-2">
            {(cellValue as ScheduleDTO[]).map((s) => (
              <p
                key={s.id}
                className="bg-orange-500 text-white px-2 rounded-full"
              >
                {s.code}
              </p>
            ))}
          </div>
        );
      case "lesson": {
        let lesson;
        data.classDays.sort(
          (a, b) =>
            -new Date(a.classDate).getTime() + new Date(b.classDate).getTime()
        );
        for (const c of data.classDays) {
          if (new Date(c.classDate).getTime() > Date.now()) {
            lesson = c.lesson.description;
          }
        }
        return <p>{lesson ?? "N/A"}</p>;
      }

      case "location": {
        let location;
        data.classDays.sort(
          (a, b) =>
            -new Date(a.classDate).getTime() + new Date(b.classDate).getTime()
        );

        for (const c of data.classDays) {
          if (new Date(c.classDate).getTime() > Date.now()) {
            location = c.location;
          }
        }
        return (
          <p>{location ? `${location.branch} - ${location.room}` : "N/A"}</p>
        );
      }
      case "Action":
        return (
          <div className="w-full relative flex justify-center">
            <ButtonGroup>
              <Button
                as={Link}
                isIconOnly
                href={`/classes/${data.code}`}
                disabled={loading}
              >
                <FaEye />
              </Button>
              <EditButton
                isIconOnly
                href={`/classes/${data.code}/edit`}
                disabled={loading}
              />
              <DeleteActionButton
                action={deleteAction}
                objectName="Class"
                afterDelete={() => {}}
                id={data.id}
                isIconOnly={true}
              />
            </ButtonGroup>
          </div>
        );
    }
  };

  const selectOptions: FilterOptionType[0]["options"] = [
    { key: "all", label: "ALL" },
    { key: ClassStatus.NEW, label: "New" },
    { key: ClassStatus.ON_GOING, label: "On going" },
    { key: ClassStatus.ENDED, label: "Ended" },
  ];

  const rest: Rest | undefined = data;

  const filterOptions: FilterOptionType = [
    {
      label: "Status",
      props: {
        selectedKeys: selection,
        selectionMode: "single",
        onSelectionChange: (selection: Selection) => {
          setSelection(selection);
          const selected = Array.from(selection);

          if (selected.length === 2 || selected.length === 0) {
            params.delete("status");
          } else {
            params.set("status", selected[0].toString());
          }

          params.delete("page");

          router.push(`${path}?${params.toString()}`);
        },
      },
      options: selectOptions,
    },
  ];

  const renderCellTestDay = (key: string, data: DataType) => {
    if (key === "id") {
      return <p>{data[key].toString().split(" ")[1]}</p>;
    }
    if (key === "Test Type") {
      const value = data[key];

      if (value === "MIDTERM") {
        return (
          <p className="px-2 py-1 bg-orange-600 w-fit mx-auto  font-bold text-white rounded-full">
            Mid term
          </p>
        );
      }

      if (value === "FINALTERM") {
        return (
          <p className="px-2 py-1 bg-primary-600 w-fit mx-auto  font-bold text-white rounded-full">
            Final term
          </p>
        );
      }

      return (
        <p className="px-2 py-1 bg-slate-600 w-fit mx-auto  font-bold text-white rounded-full">
          Normal day
        </p>
      );
    }

    return <p>{data[key]}</p>;
  };

  const columnsReport = [
    { name: "No.", key: "id" },
    { name: "Name", key: "Name" },
    { name: "Test Date", key: "Test Date" },
    { name: "Test Type", key: "Test Type" },
    { name: "Schedule", key: "Schedule" },
    { name: "Location", key: "Location" },
  ];

  return (
    <>
      <TableWrapper<ClassDTO>
        rest={rest}
        columns={columns}
        renderCell={renderCell}
        data={data?.content}
        isLoading={isLoading}
        filterValue={filterValue}
        setFilterValue={setFilterValue}
        onNew={() => router.push("/classes/new")}
        filterOptions={filterOptions}
        onPrint={() => onOpen()}
      />
      <ReportViewer
        columns={columnsReport}
        renderCell={
          renderCellTestDay as ComponentProps<typeof ReportViewer>["renderCell"]
        }
        url="/api/report/test-day"
        title="Test day report"
        isOpen={isOpen}
        onClose={onClose}
      />
    </>
  );
};

export default ClassTable;

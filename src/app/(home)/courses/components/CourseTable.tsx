"use client";

import TableWrapper from "@/components/molecules/table/TableWrapper";
import { FilterOptionType, Rest } from "@/components/type";
import { CourseLevelConstants } from "@/constants/course";
import { CourseDTO } from "@/dtos";
import { useMeaningfulContext } from "@/hooks";
import { Button, Selection } from "@nextui-org/react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import React from "react";
import { FaPen } from "react-icons/fa";
import { CourseContext } from "../context/CourseContext";

const CourseTable: React.FC = () => {
  const router = useRouter();
  const path = usePathname();
  const {
    isLoading,
    courses,
    filterValue,
    setFilterValue,
    selection,
    setSelection,
  } = useMeaningfulContext(CourseContext);
  const data = courses;

  const columns = [
    { name: "Code", key: "code", align: "start" },
    { name: "Name", key: "name", align: "start" },
    { name: "Number of Hour", key: "numberOfHour", align: "start" },
    { name: "Level", key: "level", align: "start" },
    { name: "Action", key: "Action" },
  ];

  const renderCell = (key: string, data: CourseDTO) => {
    const cellValue = data[key as keyof CourseDTO];

    switch (key) {
      case "code":
        return (
          <Link
            href={`/courses/${data.code}`}
            className="text-blue-600 underline"
          >
            {cellValue as string}
          </Link>
        );
      case "name":
        return <p> {cellValue as string}</p>;
      case "numberOfHour":
        return <p>{data.numberHour}</p>;
      case "level":
        return <p>{data.courseLevel}</p>;
      case "Action":
        return (
          <div className="w-full relative flex justify-center">
            <Button
              as={Link}
              isIconOnly
              href={`/courses/${data.code}/edit`}
              color="warning"
            >
              <FaPen />
            </Button>
          </div>
        );
    }
  };

  const selectOptions: FilterOptionType[0]["options"] = Object.entries(
    CourseLevelConstants
  ).map(([key, value]) => ({
    key: value,
    label: key
      .replace(/_/g, " ")
      .toLowerCase()
      .replace(/^\w/, (c) => c.toUpperCase()),
  }));

  const rest: Rest | undefined = data;

  const filterOptions: FilterOptionType = [
    {
      label: "Filter",
      props: {
        selectedKeys: selection,
        selectionMode: "multiple",
        onSelectionChange: (selection: Selection) => {
          setSelection(selection);
          const selected = Array.from(selection);

          router.push(`${path}/?filter=${selected}`);
        },
      },
      options: selectOptions,
    },
  ];

  return (
    <TableWrapper<CourseDTO>
      rest={rest}
      columns={columns}
      renderCell={renderCell}
      data={data?.content}
      isLoading={isLoading}
      filterValue={filterValue}
      setFilterValue={setFilterValue}
      onNew={() => router.push("/courses/new")}
      filterOptions={filterOptions}
    />
  );
};

export default CourseTable;

"use client";

import { SubmitButton } from "@/components/molecules/form";
import { ClassDTO } from "@/dtos/classes/ClassDTO";
import { createClass, updateClass } from "@/services/ClassService";
import { DateFromScheduleCode } from "@/utils/DateUtils";
import {
  getLocalTimeZone,
  parseAbsolute,
  today,
} from "@internationalized/date";
import { DatePicker, Input, Tab, Tabs } from "@nextui-org/react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import CoursesDropdown from "./CourseDropdown";
import DropdownWrapper from "./DropdownContextProvider";
import FormContextProvider from "./FormContext";
import GradesTable from "./GradesTable";
import ScheduleDropdown from "./ScheduleDropdown";
import ScheduleTable from "./ScheduleTable";
import StaffDropdown from "./StaffDropdown";
import StudentTable from "./StudentTable";

type Props = {
  title?: string;
  defaultClass?: ClassDTO;
  isDisabled?: boolean;
  isReadonly?: boolean;
  operation?: "create" | "update";
  showSchedule?: boolean;
  showGrades?: boolean;
};

export default function Form({
  defaultClass,
  isDisabled,
  isReadonly,
  title,
  operation,
  showGrades = true,
  showSchedule = true,
}: Readonly<Props>) {
  const router = useRouter();
  const onSubmit = async (formData: FormData) => {
    const className = formData.get("name") as string;
    const courseId = JSON.parse(formData.get("courses") as string)[0];
    const schedules = (
      JSON.parse(formData.get("schedules") as string) as string[]
    ).map((s) => JSON.parse(s) as { code: string; id: number });

    if (schedules.length < 2) {
      toast.error("Required at least 2 schedules set for a class");
      return;
    }

    const scheduleIds = schedules.map((s) => s.id);

    const studentIds = (
      JSON.parse(formData.get("students") as string) as string[]
    )
      .map((s) => JSON.parse(s) as { code: string; id: string })
      .map((s) => Number(s.id));

    const staffId = (
      JSON.parse(formData.get("academic staff") as string) as string[]
    ).map((s) => Number(s))[0];

    const startDate = new Date(
      (formData.get("start_date") as string).split("[")[0]
    );

    const dow = startDate.getDay();
    const dates = schedules.map((s) => DateFromScheduleCode(s.code));

    if (dates.every((d) => dow !== d.dow)) {
      toast.error("Date does not match schedule");
      return;
    }

    let response;

    if (operation === "update") {
      if (!defaultClass?.id) {
        toast.error("Class not found");
        return;
      }
      response = await updateClass(defaultClass.id, {
        startDate,
        className,
        studentIds,
        scheduleIds,
        staffId,
      });
    } else {
      response = await createClass({
        className,
        scheduleIds,
        courseId,
        startDate,
        studentIds,
        staffId,
      });
    }

    if (!response.data) {
      toast.error(`Failed to ${operation} class`);
      return;
    }

    toast.success(`Class ${operation}d`);
    router.push(`/classes/${response.data.code}`);
  };

  return (
    <FormContextProvider>
      <form action={onSubmit}>
        <div className="w-full flex gap-3 justify-between">
          <h1 className="font-bold uppercase">{title}</h1>
          {!(isDisabled || isReadonly) && <SubmitButton />}
        </div>
        <div className="w-full flex gap-3 items-end">
          <Input
            isReadOnly={isReadonly}
            isDisabled={
              isDisabled ||
              (defaultClass?.startDate
                ? new Date(defaultClass.startDate).getTime() < Date.now()
                : false)
            }
            defaultValue={defaultClass?.name}
            name="name"
            isRequired
            label="Name"
            placeholder="John Doe"
            labelPlacement="outside"
            variant="bordered"
            size="sm"
            isClearable
            classNames={{
              base: "w-1/4",
            }}
          />
          <DatePicker
            defaultValue={
              defaultClass?.startDate
                ? parseAbsolute(defaultClass.startDate, getLocalTimeZone())
                : undefined
            }
            hideTimeZone
            granularity="day"
            minValue={today(getLocalTimeZone())}
            isRequired
            isReadOnly={isReadonly}
            name="start_date"
            label="Start Date"
            labelPlacement="outside"
            variant="bordered"
            className="w-1/4"
            size="sm"
            isDisabled={
              defaultClass?.startDate
                ? new Date(defaultClass.startDate).getTime() < Date.now()
                : false
            }
          />
        </div>
        <div className="w-full flex gap-3 items-end mt-2">
          <DropdownWrapper
            label="courses"
            defaultLoading
            required
            disabled={
              isDisabled ||
              operation === "update" ||
              (defaultClass?.startDate
                ? new Date(defaultClass.startDate).getTime() < Date.now()
                : false)
            }
            isReadonly={isReadonly}
            defaultSelection={
              defaultClass
                ? [
                    {
                      key: defaultClass.course.name,
                      value: defaultClass.course.id.toString(),
                    },
                  ]
                : undefined
            }
          >
            <CoursesDropdown />
          </DropdownWrapper>
          <DropdownWrapper
            isReadonly={isReadonly}
            label="schedules"
            disabled={
              defaultClass?.startDate
                ? new Date(defaultClass.startDate).getTime() < Date.now()
                : false
            }
            defaultLoading
            defaultSelection={
              defaultClass
                ? defaultClass.schedules.map((s) => ({
                    key: s.code,
                    value: JSON.stringify({ id: s.id, code: s.code }),
                  }))
                : undefined
            }
            required
            selectionMode="multiple"
          >
            <ScheduleDropdown />
          </DropdownWrapper>
          <DropdownWrapper
            disabled={
              defaultClass?.startDate
                ? new Date(defaultClass.startDate).getTime() < Date.now()
                : false
            }
            isReadonly={isReadonly}
            defaultLoading
            label="academic staff"
            defaultSelection={
              defaultClass
                ? [
                    {
                      key: `${defaultClass.staff.firstName} ${defaultClass.staff.lastName}`,
                      value: defaultClass.staff.id.toString(),
                    },
                  ]
                : undefined
            }
            required
            selectionMode="multiple"
          >
            <StaffDropdown />
          </DropdownWrapper>
        </div>
        <div className="w-full flex gap-3 flex-col mt-8 bg-slate-50 p-4 rounded-md">
          <Tabs aria-label="Infos" color="primary">
            <Tab key={"students"} title={"Students"}>
              <StudentTable
                isReadonly={isReadonly}
                defaultStudents={defaultClass?.students}
              />
            </Tab>
            {showSchedule && (
              <Tab key={"schedule"} title={"Schedules"}>
                <ScheduleTable
                  defaultClassDays={defaultClass?.classDays}
                  classCode={defaultClass?.code}
                  students={defaultClass?.students}
                />
              </Tab>
            )}
            {showGrades && (
              <Tab key={"grades"} title={"Grades"}>
                <GradesTable classData={defaultClass} />
              </Tab>
            )}
          </Tabs>
        </div>
      </form>
    </FormContextProvider>
  );
}

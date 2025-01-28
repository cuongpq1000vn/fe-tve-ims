import TableWrapper from "@/components/molecules/table/TableWrapper";
import { Rest } from "@/components/type";
import { ScheduleDTO, StaffDTO, StudentDTO } from "@/dtos";
import { Pageable } from "@/dtos/base";
import { ClassDayDTO } from "@/dtos/classDay/ClassDayDTO";
import { UpdateClassDayDTO } from "@/dtos/classDay/classDayDTORequest";
import { updateClassDayInfo } from "@/services/ClassDayService";
import { getAllSchedules } from "@/services/ScheduleService";
import { getAllStaffs } from "@/services/StaffService";
import { mapDow } from "@/utils/DateUtils";
import {
  getLocalTimeZone,
  parseAbsolute,
  today,
} from "@internationalized/date";
import { Button, ButtonGroup, DatePicker } from "@nextui-org/react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { FaPen, FaSave } from "react-icons/fa";
import { toast } from "sonner";
import DropdownWrapper from "./DropdownContextProvider";
import LocationDropdown from "./LocationDropdown";
import ScheduleDropdown from "./ScheduleDropdown";
import StaffDropdown from "./StaffDropdown";
import { AbsenceDTO } from "@/dtos/absence/AbsenceDTO";
import { getAllAbsenceByClass } from "@/services/AbsenceService";

type Props = {
  defaultClassDays?: ClassDayDTO[];
  classCode?: string;
  students?: StudentDTO[];
};

export default function ScheduleTable({
  defaultClassDays,
  classCode,
}: Readonly<Props>) {
  const [loading, setLoading] = useState(false);
  const [staffs, setStaffs] = useState<Pageable<StaffDTO>>();
  const [data, setData] = useState(defaultClassDays ?? []);
  const [schedules, setSchedules] = useState<ScheduleDTO[]>([]);
  const [absence, setAbsence] = useState<AbsenceDTO[]>([]);

  useEffect(() => {
    const getStaff = async () => {
      if (!loading) {
        setLoading(true);
      }
      const response = await getAllStaffs(0, 1000000);

      if (!response.data) {
        toast.error("Failed to fetch students");
        return;
      }

      setStaffs(response.data);

      const responseSchedules = await getAllSchedules(0, 1000000);
      setLoading(false);
      if (!responseSchedules.data) {
        toast.error("Failed to fetch schedules");
        return;
      }

      const responseAbsence = await getAllAbsenceByClass(classCode);
      if (!responseAbsence.data) {
        toast.error("failed to fetch attendance");
        return;
      }
      setAbsence(responseAbsence.data);

      setSchedules(responseSchedules.data.content);
    };

    getStaff();
  }, []);

  const [input, setInput] = useState<UpdateClassDayDTO>({
    id: -1,
  });

  const { id: currentEdit } = input;

  const onUpdate = async (classDay: ClassDayDTO) => {
    if (classDay.id !== currentEdit) {
      setInput({ id: classDay.id });
      return;
    }

    const body = {
      ...classDay,
      ...input,
    };

    if (
      new Date(body.classDate).getDay() !==
      (mapDow(schedules.find((s) => s.id === body.scheduleId)?.code) ??
        new Date(classDay.classDate).getDay())
    ) {
      toast.error("Schedule and date not match");
      return;
    }

    const temp = structuredClone(data);
    const index = temp.findIndex((t) => t.id === input.id);

    if (index === -1) {
      toast.error("Error updating class day");
      return;
    }
    setLoading(true);
    const response = await updateClassDayInfo(body);

    setLoading(false);
    if (!response.data) {
      toast.error("Error updating class day");
      return;
    }

    temp.splice(index, 1, response.data);

    setData(temp);
    setInput({
      id: -1,
    });
  };

  const columns = [
    { name: "Date", key: "date" },
    { name: "Schedule", key: "schedule" },
    { name: "Lesson description", key: "lesson_desc" },
    { name: "Teacher", key: "teacher" },
    { name: "Location", key: "location" },
    { name: "Attendance", key: "attendance" },
    { name: "Action", key: "action" },
  ];

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

  const renderAbsence = (data: ClassDayDTO) => {
    const hasAbsenceForClassDay = absence?.some(
      (absenceItem) => absenceItem.classDayId === data.id
    );

    return hasAbsenceForClassDay ? (
      <Button
        as={Link}
        href={`/classes/${classCode}/${data.id}`}
        color="primary"
        size="sm"
      >
        View
      </Button>
    ) : (
      <Button
        as={Link}
        href={`/classes/${classCode}/${data.id}/edit`}
        color="warning"
        size="sm"
      >
        Attendance
      </Button>
    );
  };

  const renderCell = (key: string, data: ClassDayDTO) => {
    switch (key) {
      case "date":
        return currentEdit === data.id ? (
          <DatePicker
            isDisabled={loading}
            minValue={today(getLocalTimeZone())}
            defaultValue={parseAbsolute(
              data.classDate.toString(),
              getLocalTimeZone()
            )}
            onChange={(v) =>
              setInput({
                ...input,
                classDate: v?.toDate(),
              })
            }
            hideTimeZone
            granularity="day"
            isRequired
            name="start_date"
            labelPlacement="outside"
            variant="bordered"
            size="sm"
          />
        ) : (
          <p>{new Date(data.classDate).toISOString().split("T")[0]}</p>
        );
      case "lesson_desc":
        return <p>{data.lesson.description}</p>;
      case "schedule":
        return currentEdit === data.id ? (
          <DropdownWrapper
            disabled={loading}
            onChange={(o) => {
              if (o.length === 0) {
                toast.error("schedule is required");
                return false;
              }
              setInput({
                ...input,
                scheduleId: JSON.parse(o[0].value).id,
              });
              return true;
            }}
            label="schedules"
            defaultLoading
            defaultSelection={schedules
              .filter(
                (s) =>
                  mapDow(s.dayOfWeek.substring(0, 2)) ===
                  new Date(data.classDate).getDay()
              )
              .map((s) => ({
                key: s.code,
                value: JSON.stringify({ id: s.id, code: s.code }),
              }))}
            required
          >
            <ScheduleDropdown />
          </DropdownWrapper>
        ) : (
          <span className="px-2 rounded-full bg-orange-500 text-white">
            {
              schedules.find(
                (s) =>
                  mapDow(s.dayOfWeek.substring(0, 2)) ===
                  new Date(data.classDate).getDay()
              )?.code
            }
          </span>
        );
      case "teacher":
        return currentEdit === data.id ? (
          <DropdownWrapper
            disabled={loading}
            label="teacher"
            defaultLoading={false}
            defaultSelection={
              data.teacher
                ? [
                    {
                      key: `${data.teacher.firstName} ${data.teacher.lastName}`,
                      value: data.teacher.id.toString(),
                    },
                  ]
                : undefined
            }
            onChange={(o) => {
              setInput({
                ...input,
                teacherId: o.length == 0 ? undefined : Number(o[0].value),
              });
              return true;
            }}
          >
            <StaffDropdown staffs={staffs} />
          </DropdownWrapper>
        ) : data.teacher ? (
          <p>
            {data.teacher.firstName} {data.teacher.lastName}
          </p>
        ) : (
          <p className="font-bold opacity-30">N/A</p>
        );
      case "location":
        return currentEdit === data.id ? (
          <DropdownWrapper
            disabled={loading}
            label="location"
            defaultLoading
            onChange={(o) => {
              setInput({
                ...input,
                locationId: o.length == 0 ? undefined : Number(o[0].value),
              });
              return true;
            }}
          >
            <LocationDropdown />
          </DropdownWrapper>
        ) : data.location ? (
          <p>
            {data.location.branch} - {data.location.room}
          </p>
        ) : (
          <p className="font-bold opacity-30">N/A</p>
        );
      case "action":
        return (
          <ButtonGroup>
            <Button
              isDisabled={loading}
              isIconOnly
              color={currentEdit === data.id ? "success" : undefined}
              onPress={async () => await onUpdate(data)}
            >
              {currentEdit === data.id ? <FaSave /> : <FaPen />}
            </Button>
          </ButtonGroup>
        );
      case "attendance":
        return renderAbsence(data);
      default:
        return undefined;
    }
  };

  return (
    <TableWrapper<ClassDayDTO>
      rest={rest}
      columns={columns}
      renderCell={renderCell}
      data={data}
      isLoading={loading}
      showControls={false}
    />
  );
}

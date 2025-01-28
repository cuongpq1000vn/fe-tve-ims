"use client";

import { Pageable } from "@/dtos/base";
import { ScheduleDTO } from "@/dtos/schedule/ScheduleDTO";
import { useMeaningfulContext } from "@/hooks";
import { getAllSchedules } from "@/services/ScheduleService";
import { Fragment, useEffect, useState } from "react";
import { toast } from "sonner";
import DropdownForm from "./Dropdown";
import { DropdownContext } from "./DropdownContextProvider";

export default function ScheduleDropdown() {
  const { searchValue, setLoading, loading, setOptions, selected } =
    useMeaningfulContext(DropdownContext);
  const [schedules, setSchedules] = useState<Pageable<ScheduleDTO>>();

  useEffect(() => {
    const getSchedule = async () => {
      if (!loading) {
        setLoading(true);
      }
      const response = await getAllSchedules(0, 150000);
      setLoading(false);
      if (!response.data) {
        toast.error("Failed to fetch students");
        return;
      }

      setSchedules(response.data);
      setOptions(
        response.data.content.map((schedule) => ({
          key: schedule.code,
          value: JSON.stringify({
            id: schedule.id,
            code: schedule.code,
          }),
        }))
      );
    };

    getSchedule();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <DropdownForm>
      {schedules?.content
        .filter(
          (schedule) =>
            !selected.some((s) => s.key === schedule.code) &&
            (schedule.code
              .toLowerCase()
              .includes(searchValue?.toLowerCase() ?? "") ||
              schedule.dayOfWeek
                .toLowerCase()
                .includes(searchValue?.toLowerCase() ?? ""))
        )
        .map((schedule) => (
          <Fragment key={schedule.id}>
            <p className="text-xs opacity-50">{schedule.code}</p>
            <p className="font-bold mt-1">
              <span className="underline font-normal">
                {schedule.dayOfWeek}:
              </span>{" "}
              {schedule.startTime.split(" ")[1].substring(0, 5)} -{" "}
              {schedule.endTime.split(" ")[1].substring(0, 5)}
            </p>
          </Fragment>
        ))}
    </DropdownForm>
  );
}

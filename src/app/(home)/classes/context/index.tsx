"use client";

import { ClassStatus } from "@/constants/class";
import { Pageable } from "@/dtos/base";
import { ClassDTO } from "@/dtos/classes/ClassDTO";
import { getAllClasses } from "@/services/ClassService";
import { Selection } from "@nextui-org/react";
import { useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { ClassContext } from "./ClassesContext";

const parseStatus = (status: string) => {
  return status === "all" ? undefined : status;
};

export default function ClassContextProvider({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const [classes, setClasses] = useState<Pageable<ClassDTO>>();
  const [isLoading, setIsLoading] = useState(true);
  const [filterValue, setFilterValue] = useState<string | null>(null);
  const searchParams = useSearchParams();
  const page = searchParams.get("page")
    ? Number(searchParams.get("page")) - 1
    : 0;
  const size = searchParams.get("size") ? Number(searchParams.get("size")) : 5;
  const searchString = searchParams.get("query") ?? undefined;
  const status = searchParams.get("status");
  const [selection, setSelection] = useState<Selection>(new Set(["all"]));

  const initValue = useMemo(
    () => ({
      classes,
      setClasses,
      isLoading,
      setIsLoading,
      filterValue,
      setFilterValue,
      selection,
      setSelection,
    }),
    [classes, filterValue, isLoading, selection]
  );

  useEffect(() => {
    const getClasses = async () => {
      setIsLoading(true);
      const response = await getAllClasses(
        page,
        size,
        parseStatus(status as string) as ClassStatus,
        searchString
      );
      if (!response.data) {
        toast.error("Failed to fetch classes");
        return;
      }
      setClasses(response.data);
      setIsLoading(false);
    };

    getClasses();
  }, [page, size, searchString, status]);

  return (
    <ClassContext.Provider value={initValue}>{children}</ClassContext.Provider>
  );
}

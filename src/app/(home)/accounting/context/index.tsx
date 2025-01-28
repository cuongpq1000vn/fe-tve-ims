"use client";

import { Pageable } from "@/dtos/base";
import { useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { InvoiceDTO, InvoiceStatusConstants } from "@/dtos/invoice/InvoiceDTO";
import { getAllInvoice } from "@/services/InvoiceService";
import { InvoiceContext } from "./InvoiceContext";
import { Selection } from "@nextui-org/react";

export default function InvoiceContextProvider({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const [invoice, setInvoice] = useState<Pageable<InvoiceDTO>>();
  const [isLoading, setIsLoading] = useState(true);
  const [filterValue, setFilterValue] = useState<string | null>(null);
  const searchParams = useSearchParams();
  const page = searchParams.get("page")
    ? Number(searchParams.get("page")) - 1
    : 0;
  const size = searchParams.get("size") ? Number(searchParams.get("size")) : 5;
  const searchString = searchParams.get("query") ?? undefined;
  const filterParam =
    (searchParams.get("filter") as string) ??
    Object.values(InvoiceStatusConstants).toString();

  const [selection, setSelection] = useState<Selection>(
    new Set(filterParam.split(","))
  );

  const initValue = useMemo(
    () => ({
      invoice,
      setInvoice,
      isLoading,
      setIsLoading,
      filterValue,
      setFilterValue,
      selection,
      setSelection,
    }),
    [invoice, filterValue, isLoading, selection]
  );

  useEffect(() => {
    const filter: InvoiceStatusConstants[] = filterParam
      ? filterParam
          .split(",")
          .map((key) => key.trim().toUpperCase() as InvoiceStatusConstants)
          .filter((key) => Object.values(InvoiceStatusConstants).includes(key))
      : [];
    const getInvoice = async () => {
      setIsLoading(true);
      const response = await getAllInvoice(
        page,
        size,
        ["createdAt,desc"],
        searchString,
        filter
      );
      if (!response.data) {
        toast.error("Failed to fetch invoice");
        return;
      }
      setInvoice(response.data);
      setIsLoading(false);
    };

    getInvoice();
  }, [page, size, filterParam, searchString]);

  return (
    <InvoiceContext.Provider value={initValue}>
      {children}
    </InvoiceContext.Provider>
  );
}

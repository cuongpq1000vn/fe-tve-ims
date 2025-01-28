"use client";

import TableWrapper from "@/components/molecules/table/TableWrapper";
import { FilterOptionType, Rest } from "@/components/type";
import { InvoiceDTO, InvoiceStatusConstants } from "@/dtos/invoice/InvoiceDTO";
import { useMeaningfulContext } from "@/hooks";
import { DateToStringWithoutTime } from "@/utils/DateUtils";
import { Button, Selection } from "@nextui-org/react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import React from "react";
import { InvoiceContext } from "../context/InvoiceContext";

const InvoiceTable: React.FC = () => {
  const router = useRouter();
  const path = usePathname();
  const {
    isLoading,
    invoice,
    filterValue,
    setFilterValue,
    selection,
    setSelection,
  } = useMeaningfulContext(InvoiceContext);
  const data = invoice;

  const columns = [
    { name: "Student Name", key: "studentName", align: "start" },
    { name: "Enrolled Class", key: "classCode" },
    { name: "Tuition Owed", key: "tuitionOwed" },
    { name: "Amount Paid", key: "amount" },
    { name: "Date", key: "date" },
    { name: "Payment Type", key: "paymentType" },
    { name: "Description", key: "description" },
    { name: "Invoice Status", key: "invoiceStatus" },
    { name: "Action", key: "action" },
  ];

  const renderCell = (key: string, data: InvoiceDTO) => {
    switch (key) {
      case "studentName":
        return (
          <Link
            href={`/students/${data.studentCode}`}
            className="text-blue-600 underline hover:text-blue-400"
          >
            {data.studentName}
          </Link>
        );
      case "classCode":
        return (
          <Link
            href={`/classes/${data.classCode}`}
            className="text-blue-600 underline hover:text-blue-400"
          >
            {data.className}
          </Link>
        );
      case "tuitionOwed":
        return (
          <div className="flex justify-center items-center">
            {data.tuitionOwed.toLocaleString("en-US", {
              style: "currency",
              currency: "USD",
            })}
          </div>
        );
      case "amount":
        return (
          <div className="flex justify-center items-center">
            {data.amount.toLocaleString("en-US", {
              style: "currency",
              currency: "USD",
            })}
          </div>
        );
      case "date":
        return (
          <div className="flex justify-center items-center">
            {DateToStringWithoutTime(data.updatedAt)}
          </div>
        );
      case "paymentType":
        return <div>{data.paymentType}</div>;
      case "description":
        return <div>{data.description}</div>;
      case "invoiceStatus": {
        let statusClass = "";
        let statusLabel = "";

        if (data.invoiceStatus === InvoiceStatusConstants.FULLY_PAID) {
          statusClass = "bg-green-100 text-green-800";
          statusLabel = "Fully Paid";
        } else if (
          data.invoiceStatus === InvoiceStatusConstants.PARTIALLY_PAID
        ) {
          statusClass = "bg-yellow-100 text-yellow-800";
          statusLabel = "Partially Paid";
        } else if (data.invoiceStatus === InvoiceStatusConstants.NOT_PAID) {
          statusClass = "bg-red-100 text-red-800";
          statusLabel = "Not Paid";
        }

        return (
          <span className={`status-badge px-2 py-1 rounded ${statusClass}`}>
            {statusLabel}
          </span>
        );
      }
      case "action":
        return (
          <div className="w-full relative flex justify-center">
            <Button
              as={Link}
              isIconOnly={
                data.invoiceStatus === InvoiceStatusConstants.NOT_PAID
              }
              href={
                data.invoiceStatus === InvoiceStatusConstants.NOT_PAID
                  ? `/accounting/${data.id}/pay`
                  : `/accounting/${data.id}`
              }
              color={
                data.invoiceStatus === InvoiceStatusConstants.NOT_PAID
                  ? "danger"
                  : "primary"
              }
            >
              {data.invoiceStatus === InvoiceStatusConstants.NOT_PAID
                ? "Pay"
                : "View Invoice"}
            </Button>
          </div>
        );
    }
  };

  const selectOptions: FilterOptionType[0]["options"] = Object.entries(
    InvoiceStatusConstants
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
    <TableWrapper<InvoiceDTO>
      rest={rest}
      columns={columns}
      renderCell={renderCell}
      data={data?.content?.map((item, index) => ({ ...item, id: index }))}
      isLoading={isLoading}
      filterValue={filterValue}
      setFilterValue={setFilterValue}
      filterOptions={filterOptions}
    />
  );
};

export default InvoiceTable;

import React from "react";
import Invoice from "./component/invoice";
import { getInvoiceById } from "@/services/InvoiceService";
import { notFound } from "next/navigation";

export default async function Receipt({
  params,
}: Readonly<{ params: Promise<{ id: number }> }>) {
  const { id } = await params;
  const response = await getInvoiceById(id);
    if (!response.data) {
      notFound();
    }
  return (
    <div>
      <Invoice invoice={response.data} check={true} />
      <Invoice invoice={response.data} check={false}/>
    </div>
  );
};


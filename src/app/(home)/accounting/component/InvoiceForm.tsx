"use client";

import { Button, Input, Select, SelectItem } from "@nextui-org/react";
import { useRouter } from "next/navigation";
import FormContextProvider from "@/app/(home)/classes/new/component/Form/FormContext";
import { InvoiceDTO, PaymentTypeConstants } from "@/dtos/invoice/InvoiceDTO";
import { InvoiceRequest } from "@/dtos/invoice/InvoiceRequest";
import { updateInvoice } from "@/services/InvoiceService";
import { toast } from "sonner";
import React, { useMemo, useState } from "react";

interface Props {
  isReadonly?: boolean;
  isDisabled?: boolean;
  defaultInvoiceDTO?: InvoiceDTO;
}

export default function InvoiceForm({
  isReadonly,
  isDisabled,
  defaultInvoiceDTO,
}: Readonly<Props>) {
  const router = useRouter();

  const [invoiceDiscount, setInvoiceDiscount] = useState("");
  const tuitionOwed = defaultInvoiceDTO?.tuitionOwed || 0;
  const validateDiscount = (value: string) => {
    const discount = parseFloat(value) || 0;
    return discount <= tuitionOwed;
  };

  const isInvalid = useMemo(() => {
    if (invoiceDiscount === "") return false;
    return !validateDiscount(invoiceDiscount);
  }, [invoiceDiscount, tuitionOwed]);

  const onSubmit = async (formData: FormData) => {
    const amount = parseFloat((formData.get("amount") as string) || "0");
    const description = (formData.get("description") as string) || "";
    const paymentType = formData.get("paymentType") as PaymentTypeConstants;

    try {
      const invoiceId = defaultInvoiceDTO?.id ?? 0;

      const invoiceRequest: InvoiceRequest = {
        invoiceId: invoiceId,
        amount: amount,
        invoiceDiscount: parseFloat(invoiceDiscount) || 0,
        description: description,
        paymentType: paymentType,
      };

      const response = await updateInvoice(invoiceRequest);
      if (!response.data) {
        toast.error(`Failed to update invoice`);
      } else {
        toast.success("Invoice updated successfully");
        router.push(`/accounting/${invoiceId}`);
      }
    } catch (error) {
      console.error("Error submitting the form: ", error);
      toast.error(`Failed to update invoice`);
    }
  };

  return (
    <FormContextProvider>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          const formData = new FormData(e.target as HTMLFormElement);
          onSubmit(formData);
        }}
      >
        <div className="w-full flex gap-3 justify-between">
          <h1 className="text-2xl font-bold mb-4">Class Day Form</h1>
          {!(isDisabled || isReadonly) && (
            <Button color="primary" type="submit">
              Save
            </Button>
          )}
        </div>
        <div className="w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 items-start">
          <Input
            isReadOnly={true}
            isDisabled={true}
            defaultValue={defaultInvoiceDTO?.className}
            name="className"
            label="Enrolled Class"
            labelPlacement="outside"
            variant="bordered"
            classNames={{ base: "w-full" }}
          />
          <Input
            isReadOnly={true}
            isDisabled={true}
            defaultValue={defaultInvoiceDTO?.tuitionOwed?.toString()}
            name="tuitionOwed"
            label="Tuition Owed"
            labelPlacement="outside"
            variant="bordered"
            type="number"
            startContent={
              <div className="pointer-events-none flex items-center">
                <span className="text-default-400 text-small">$</span>
              </div>
            }
            placeholder="0.00"
            classNames={{ base: "w-full" }}
          />
          <Input
            isReadOnly={isReadonly}
            isDisabled={isDisabled}
            defaultValue={defaultInvoiceDTO?.amount?.toString()}
            name="amount"
            label="Amount Paid"
            labelPlacement="outside"
            variant="bordered"
            type="number"
            isRequired={true}
            startContent={
              <div className="pointer-events-none flex items-center">
                <span className="text-default-400 text-small">$</span>
              </div>
            }
            placeholder="0.00"
            classNames={{ base: "w-full" }}
          />
          <Input
            errorMessage="Discount cannot be higher than tuition owed"
            isInvalid={isInvalid}
            label="Invoice Discount"
            type="number"
            value={invoiceDiscount}
            variant="bordered"
            labelPlacement="outside"
            isReadOnly={isReadonly}
            isDisabled={isDisabled}
            onValueChange={(value) => setInvoiceDiscount(value)}
            startContent={
              <div className="pointer-events-none flex items-center">
                <span className="text-default-400 text-small">$</span>
              </div>
            }
          />
          <Select
            isDisabled={isDisabled}
            name="paymentType"
            label="Payment Type"
            placeholder="Select Payment Type"
            className="w-full"
            labelPlacement="outside"
            isRequired
            defaultSelectedKeys={[
              defaultInvoiceDTO?.paymentType || PaymentTypeConstants.CASH,
            ]}
          >
            {Object.values(PaymentTypeConstants).map((value) => (
              <SelectItem value={value} key={value}>
                {value}
              </SelectItem>
            ))}
          </Select>

          <Input
            className="w-full"
            isReadOnly={isReadonly}
            isDisabled={isDisabled}
            defaultValue={defaultInvoiceDTO?.description}
            name="description"
            label="Description"
            labelPlacement="outside"
            variant="bordered"
            isRequired={true}
          />
        </div>
      </form>
    </FormContextProvider>
  );
}

"use client";

import { Tab, Tabs } from "@nextui-org/react";
import AttendanceTable from "./AttendanceTable";
import InvoiceTable from "./InvoiceTable";
import EnrollmentTable from "./EnrollmentTable";

type props = {
  studentCode: string;
};

export default function SwitchTable({ studentCode }: Readonly<props>) {
  return (
    <div className="w-full flex gap-3 flex-col mt-8 bg-slate-50 p-4 rounded-md">
      <Tabs aria-label="Infos" color="primary">
      <Tab key={"enrollment"} title={"Enrollment"}>
          <EnrollmentTable isReadonly={true} studentCode={studentCode}></EnrollmentTable>
        </Tab>
        <Tab key={"attendance"} title={"Attendance"}>
          <AttendanceTable isReadonly={true} studentCode={studentCode} />
        </Tab>
        <Tab key={"invoice"} title={"Invoice"}>
          <InvoiceTable isReadonly={true} studentCode={studentCode}></InvoiceTable>
        </Tab>
      </Tabs>
    </div>
  );
}

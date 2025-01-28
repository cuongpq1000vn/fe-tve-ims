import { Suspense } from "react";
import InvoiceContextProvider from "./context";
import InvoiceTable from "./component/InvoiceTable";

export default function AccountingPage() {
  return (
    <Suspense>
      <InvoiceContextProvider>
        <InvoiceTable />
      </InvoiceContextProvider>
    </Suspense>
  );
}

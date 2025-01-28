import { Suspense } from "react";
import ClassTable from "./components/ClassTable";
import ClassContextProvider from "./context";

export default function Classes() {
  return (
    <Suspense>
      <ClassContextProvider>
        <ClassTable />
      </ClassContextProvider>
    </Suspense>
  );
}

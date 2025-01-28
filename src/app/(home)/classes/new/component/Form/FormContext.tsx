import { createContext, useEffect, useMemo, useState } from "react";

type FormContextProps = {
  isDirty: boolean;
  setIsDirty: (isDirty: boolean) => void;
  invalidFields: string[];
  setInvalidFields: (invalidFields: string[]) => void;
};

export const FormContext = createContext<FormContextProps | undefined>(
  undefined
);

export default function FormContextProvider({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [isDirty, setIsDirty] = useState(true);
  const [invalidFields, setInvalidFields] = useState<string[]>([]);

  const initValue = useMemo(
    () => ({ isDirty, setIsDirty, invalidFields, setInvalidFields }),
    [isDirty, setIsDirty, invalidFields, setInvalidFields]
  );

  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isDirty) {
        e.preventDefault();
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [isDirty]);

  return (
    <FormContext.Provider value={initValue}>{children}</FormContext.Provider>
  );
}

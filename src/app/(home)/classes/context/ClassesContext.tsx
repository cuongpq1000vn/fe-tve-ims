import { Pageable } from "@/dtos/base";
import { ClassDTO } from "@/dtos/classes/ClassDTO";
import { Selection } from "@nextui-org/react";
import { createContext } from "react";

interface ClassesContextProps {
  isLoading: boolean;
  setIsLoading: (isLoading: boolean) => void;
  classes: Pageable<ClassDTO> | undefined;
  setClasses: (students: Pageable<ClassDTO> | undefined) => void;
  filterValue: string | null;
  setFilterValue: (filterValue: string | null) => void;
  selection: Selection;
  setSelection: React.Dispatch<React.SetStateAction<Selection>>;
}

const ClassContext = createContext<ClassesContextProps | undefined>(undefined);

export { ClassContext };

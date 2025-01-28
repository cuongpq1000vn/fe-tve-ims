import { DropdownMenu } from "@nextui-org/react";
import { ComponentProps, createContext, useMemo, useState } from "react";
import { useDebounceValue } from "usehooks-ts";

export type DropdownContextProps = {
  loading: boolean;
  setLoading: (loading: boolean) => void;
  selected: OptionProps[];
  setSelected: (selected: OptionProps[]) => void;
  options: OptionProps[];
  setOptions: (options: OptionProps[]) => void;
  searchValue?: string;
  setSearchValue: (searchValue: string) => void;
} & DefaultProps;

export type OptionProps = {
  key: string;
  value: string;
};

export type DefaultProps = {
  label: string;
  required?: boolean;
  defaultSearchValue?: string;
  defaultLoading?: boolean;
  defaultSelection?: OptionProps[];
  defaultOptions?: OptionProps[];
  selectionMode?: ComponentProps<typeof DropdownMenu>["selectionMode"];
  disabled?: boolean;
  isReadonly?: boolean;
};

export type Props = {
  children: React.ReactNode;
  onChange?: (options: OptionProps[]) => boolean;
} & DefaultProps;

export const DropdownContext = createContext<DropdownContextProps | undefined>(
  undefined
);

export default function DropdownWrapper({
  label,
  defaultLoading,
  defaultSearchValue,
  children,
  required,
  selectionMode,
  defaultSelection,
  defaultOptions,
  disabled,
  isReadonly,
  onChange,
}: Readonly<Props>) {
  const [searchValue, setSearchValue] = useDebounceValue(
    defaultSearchValue,
    500
  );

  const [selected, setSelected] = useState<OptionProps[]>(
    defaultSelection ?? []
  );

  const [loading, setLoading] = useState(defaultLoading ?? false);
  const [options, setOptions] = useState<OptionProps[]>(defaultOptions ?? []);

  const initDropdownValue = useMemo<DropdownContextProps>(
    () => ({
      loading,
      setLoading,
      selected,
      setSelected: (selected) => {
        if (onChange) {
          if (onChange(selected)) {
            setSelected(selected);
            return;
          }
          return;
        }

        setSelected(selected);
      },
      searchValue,
      options,
      setOptions,
      setSearchValue,
      label,
      defaultSearchValue,
      defaultLoading,
      required,
      selectionMode,
      defaultSelection,
      disabled,
      isReadonly,
    }),
    [
      loading,
      selected,
      searchValue,
      options,
      setSearchValue,
      label,
      defaultSearchValue,
      defaultLoading,
      required,
      selectionMode,
      defaultSelection,
      disabled,
      isReadonly,
      onChange,
    ]
  );
  return (
    <DropdownContext.Provider value={initDropdownValue}>
      {children}
    </DropdownContext.Provider>
  );
}

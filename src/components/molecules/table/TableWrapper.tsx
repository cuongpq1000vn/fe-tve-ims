import { SessionContext } from "@/contexts/SessionContext";
import { useMeaningfulContext } from "@/hooks";
import { updateSearchParams } from "@/utils/UrlUtil";
import {
  Button,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
  Input,
  Selection,
} from "@nextui-org/react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import React, { useCallback, useMemo } from "react";
import { HiOutlinePlus } from "react-icons/hi";
import { IoMdPrint } from "react-icons/io";
import { IoChevronDownOutline, IoSearchOutline } from "react-icons/io5";
import { useDebounceCallback } from "usehooks-ts";
import { DtoType, FilterOptionType, Rest, TablePaginationType } from "../types";
import CustomTable from "./CustomTable";

type Props<T> = {
  rest?: Rest;
  columns: {
    name: string;
    key: string;
  }[];
  renderCell: (key: string, data: T) => JSX.Element | undefined;
  data?: T[];
  isLoading: boolean;
  filterValue?: string | null;
  setFilterValue?: (filterValue: string | null) => void;
  onNew?: () => void;
  onPrint?: () => void;
  filterOptions?: FilterOptionType;
  showControls?: boolean;
  showInfo?: boolean;
};

const TableWrapper = <T extends DtoType>({
  rest,
  columns,
  renderCell,
  data,
  isLoading,
  filterValue,
  setFilterValue,
  onNew,
  onPrint,
  filterOptions,
  showControls,
  showInfo = true,
}: Props<T>): JSX.Element => {
  const router = useRouter();
  const path = usePathname();
  const searchParams = useSearchParams();
  const params = useMemo(() => {
    return new URLSearchParams(Array.from(searchParams));
  }, [searchParams]);
  const { isTeacher } = useMeaningfulContext(SessionContext);

  const paginationInfo: TablePaginationType = {
    size: rest?.size || 5,
    number: rest?.number || 0,
    sort: [],
    totalPages: rest?.totalPages || 0,
    totalElements: rest?.totalElements || 0,
    first: rest?.first,
    last: rest?.last,
    onFirst() {
      params.set("page", "1");
      router.push(`${path}?${params.toString()}`);
    },
    onLast() {
      params.set("page", rest ? rest.totalPages.toString() : "0");
      router.push(`${path}?${params.toString()}`);
    },
    onNext() {
      const page = Number(params.get("page") ?? "1") + 1;
      params.set("page", Math.min(page, rest ? rest.totalPages : 0).toString());
      router.push(`${path}?${params.toString()}`);
    },
    onPrevious() {
      const page = Number(params.get("page") ?? "1") - 1;
      params.set("page", Math.max(page, 1).toString());
      router.push(`${path}?${params.toString()}`);
    },
    onClickAnchor(index) {
      params.set("page", index.toString());
      router.push(`${path}?${params.toString()}`);
    },
  };

  const onSearchChange = useDebounceCallback((filter: string) => {
    if (setFilterValue) setFilterValue(filter);
    const updatedParams = updateSearchParams(
      new URLSearchParams(params.toString()),
      {
        page: "1",
        query: filter,
      }
    );

    router.push(`${path}?${updatedParams}`);
  }, 1000);

  const onRowsPerPageChange = useCallback(
    (event: React.ChangeEvent<HTMLSelectElement>) => {
      params.set("size", event.target.value);
      router.push(`${path}?${params.toString()}`);
    },
    [path, params, router]
  );

  const selectedValue = (
    options: { key: string; label: string }[],
    selectedKeys: Selection
  ) => {
    return options
      .map((opt) => {
        if (Array.from(selectedKeys).includes(opt.key)) return opt.label;
      })
      .filter((label): label is string => label !== undefined)
      .toString();
  };

  const topContent = React.useMemo(() => {
    return (
      <div className="flex flex-col gap-4">
        <div className="flex justify-between gap-3 items-end">
          {setFilterValue ? (
            <Input
              isClearable
              classNames={{
                base: "w-full sm:max-w-[44%]",
                inputWrapper: "border-1",
              }}
              placeholder="Search by name..."
              size="sm"
              startContent={<IoSearchOutline />}
              defaultValue={filterValue ?? ""}
              variant="bordered"
              onClear={() => setFilterValue("")}
              onValueChange={onSearchChange}
            />
          ) : (
            <div></div>
          )}
          <div className="flex gap-3">
            {filterOptions?.map((option) => (
              <Dropdown key={option.options.toString()}>
                <DropdownTrigger className="hidden sm:flex">
                  <Button
                    endContent={<IoChevronDownOutline className="text-small" />}
                    size="sm"
                    className="capitalize"
                    variant="flat"
                  >
                    {option.label}
                    {": "}
                    {option.options
                      ? selectedValue(option.options, option.props.selectedKeys)
                      : option.label}
                  </Button>
                </DropdownTrigger>
                <DropdownMenu closeOnSelect={false} {...option.props}>
                  {option.options.map((opt) => (
                    <DropdownItem key={opt.key}>{opt.label}</DropdownItem>
                  ))}
                </DropdownMenu>
              </Dropdown>
            ))}
            {onNew && !isTeacher && (
              <Button
                onPress={onNew}
                color="primary"
                endContent={<HiOutlinePlus />}
                size="sm"
              >
                Add New
              </Button>
            )}
            {onPrint && (
              <Button
                onPress={onPrint}
                startContent={<IoMdPrint />}
                color="success"
                size="sm"
              >
                Print
              </Button>
            )}
          </div>
        </div>
        {showInfo && (
          <div className="flex justify-between items-center">
            <span className="text-default-400 text-small">
              Total {data?.length || 0} records
            </span>
            <label className="flex items-center text-default-400 text-small">
              Rows per page:
              <select
                className="bg-transparent outline-none text-default-400 text-small"
                onChange={onRowsPerPageChange}
                value={rest?.size}
              >
                <option value="5">5</option>
                <option value="10">10</option>
                <option value="15">15</option>
              </select>
            </label>
          </div>
        )}
      </div>
    );
  }, [
    filterValue,
    onSearchChange,
    onRowsPerPageChange,
    data?.length,
    onNew,
    filterOptions,
    rest?.size,
    setFilterValue,
    isTeacher,
    onPrint,
  ]);

  const normalizedData = data?.map((item) => ({ ...item }));

  return (
    <CustomTable<T>
      columns={columns}
      data={normalizedData}
      renderCell={renderCell}
      paginationInfo={paginationInfo}
      isLoading={isLoading}
      topContent={topContent}
      showControl={showControls}
    />
  );
};

export default TableWrapper;

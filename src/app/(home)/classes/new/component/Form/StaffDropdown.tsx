import { StaffDTO } from "@/dtos";
import { Pageable } from "@/dtos/base";
import { useMeaningfulContext } from "@/hooks";
import { getAllStaffs } from "@/services/StaffService";
import { Fragment, useEffect, useState } from "react";
import { toast } from "sonner";
import DropdownForm from "./Dropdown";
import { DropdownContext } from "./DropdownContextProvider";
type Props = {
  staffs?: Pageable<StaffDTO>;
};
export default function StaffDropdown({
  staffs: defaultStaff,
}: Readonly<Props>) {
  const { searchValue, selected, setOptions, setLoading, loading } =
    useMeaningfulContext(DropdownContext);
  const [staffs, setStaffs] = useState(defaultStaff);

  useEffect(() => {
    const getStaff = async () => {
      if (!loading) {
        setLoading(true);
      }
      const response = await getAllStaffs(0, 1000000);
      setLoading(false);
      if (!response.data) {
        toast.error("Failed to fetch students");
        return;
      }

      setStaffs(response.data);
      setOptions(
        response.data.content.map((staff) => ({
          key: `${staff.firstName} ${staff.lastName}`,
          value: staff.id.toString(),
        })) ?? []
      );
    };

    if (!staffs) {
      getStaff();
    }
  }, [loading, setLoading, setOptions, staffs]);

  useEffect(() => {
    setOptions(
      staffs?.content
        .filter(
          (staff) =>
            !selected.some(
              (s) =>
                s.key === `${staff.firstName} ${staff.lastName}` ||
                s.key.toLowerCase().includes(searchValue?.toLowerCase() ?? "")
            )
        )
        .map((staff) => ({
          key: `${staff.firstName} ${staff.lastName}`,
          value: staff.id.toString(),
        })) ?? []
    );
  }, [searchValue, selected, setOptions, staffs?.content]);

  return (
    <DropdownForm>
      {staffs?.content
        .filter(
          (staff) =>
            !selected.some(
              (s) =>
                s.key === `${staff.firstName} ${staff.lastName}` ||
                s.key.toLowerCase().includes(searchValue?.toLowerCase() ?? "")
            )
        )
        .slice(0, 5)
        .map((staff) => (
          <Fragment key={staff.id}>
            <p className="text-xs opacity-50">{staff.code}</p>
            <p className="font-bold">
              {staff.firstName} {staff.lastName}
            </p>
          </Fragment>
        ))}
    </DropdownForm>
  );
}

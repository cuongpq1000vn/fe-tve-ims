import { LocationDTO } from "@/dtos";
import { Pageable } from "@/dtos/base";
import { useMeaningfulContext } from "@/hooks";
import { getAllLocations } from "@/services/LocationService";
import { Button } from "@nextui-org/react";
import { ComponentProps, Fragment, useEffect, useState } from "react";
import { IoIosArrowDown } from "react-icons/io";
import { toast } from "sonner";
import DropdownForm from "./Dropdown";
import { DropdownContext } from "./DropdownContextProvider";

type Props = {
  color?: ComponentProps<typeof Button>["color"];
};
export default function LocationDropdown({ color }: Readonly<Props>) {
  const { searchValue, setLoading, loading, setOptions, selected } =
    useMeaningfulContext(DropdownContext);
  const [locations, setLocations] = useState<Pageable<LocationDTO>>();

  useEffect(() => {
    const getStaff = async () => {
      if (!loading) {
        setLoading(true);
      }
      const response = await getAllLocations(0, 1000000);
      setLoading(false);
      if (!response.data) {
        toast.error("Failed to fetch students");
        return;
      }

      setLocations(response.data);
      setOptions(
        response.data.content.map((location) => ({
          key: `${location.branch} - ${location.room}`,
          value: location.id.toString(),
        }))
      );
    };

    getStaff();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchValue]);

  return (
    <DropdownForm
      trigger={
        <Button
          variant="flat"
          color={color}
          size="sm"
          endContent={<IoIosArrowDown />}
        >
          {selected.length == 0 ? "N/A" : selected.map((s) => s.key)}
        </Button>
      }
    >
      {locations?.content
        .filter(
          (location) =>
            !selected.some(
              (s) => s.key === `${location.branch} - ${location.room}`
            )
        )
        .slice(0, 5)
        .map((location) => (
          <Fragment key={location.id}>
            <p className="text-xs opacity-50">{location.code}</p>
            <p className="font-bold">
              {location.branch} - {location.room}
            </p>
          </Fragment>
        ))}
    </DropdownForm>
  );
}

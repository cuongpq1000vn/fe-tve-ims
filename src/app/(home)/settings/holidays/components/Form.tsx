"use client";

import { DeleteActionButton } from "@/components";
import { DateSelect, TextArea, TextInput } from "@/components/molecules/form";
import { NewOrEditContext } from "@/contexts/NewOrEditContext";
import { HolidayDTO, HolidayRequestDTO } from "@/dtos";
import { useMeaningfulContext } from "@/hooks";
import { HolidayService } from "@/services";
import { Button } from "@nextui-org/react";
import { useRouter } from "next/navigation";
import { SubmitHandler, useForm } from "react-hook-form";
import { FaPen } from "react-icons/fa";
import { toast } from "sonner";

type Props = {
  holiday?: HolidayDTO;
};

const Form: React.FC<Props> = ({ holiday }) => {
  const router = useRouter();
  const { isNew, isEdit } = useMeaningfulContext(NewOrEditContext);
  const isReadOnly = holiday && !isEdit && !isNew;
  const { handleSubmit, watch, control } = useForm<HolidayRequestDTO>({
    defaultValues: {
      holidayType: holiday?.holidayType,
      description: holiday?.description,
    },
  });

  const onSubmit: SubmitHandler<HolidayRequestDTO> = async (holidayData) => {
    holidayData = {
      ...holidayData,
      startDate: holidayData.startDate.toString(),
      endDate: holidayData.endDate.toString(),
    };
    try {
      const response = await (holiday
        ? HolidayService.updateHoliday(holiday.id, holidayData)
        : HolidayService.createHoliday(holidayData));
      if (!response.data) {
        toast.error(`Failed to ${isNew ? "create" : "update"} holiday`);
      } else {
        toast.success(`${isNew ? "Created" : "Updated"} holiday successfully!`);
        router.push(`/settings/holidays/${response.data.id}`);
      }
    } catch (error) {
      console.error("Error submitting the form: ", error);
      toast.error(`Failed to ${isNew ? "create" : "update"} holiday`);
    }
  };

  const startDate = watch("startDate");
  const endDate = watch("endDate");

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div className="flex gap-3 my-5 justify-end">
        {!isEdit && !isNew ? (
          <Button
            startContent={<FaPen />}
            onPress={() =>
              router.push(
                `/settings/holidays/${(holiday as HolidayDTO)?.id}/edit`
              )
            }
          >
            Edit
          </Button>
        ) : (
          <Button type="submit" color="primary">
            Save
          </Button>
        )}
        {holiday && (
          <DeleteActionButton
            id={holiday.id}
            action={HolidayService.deleteHoliday}
            objectName={"Holiday"}
            afterDelete={() => router.push("/settings/discounts")}
          />
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        {/* Name */}
        <div>
          <TextInput
            name="holidayType"
            control={control}
            required
            isReadOnly={isReadOnly}
            label="Name"
            placeholder="Enter a holiday name"
          />
        </div>

        {/* Start Date */}
        <div>
          <DateSelect
            control={control}
            name="startDate"
            required
            label="Start Date"
            rules={{
              validate: {
                notGreater: () => {
                  if (startDate > endDate)
                    return "Start Date must be less than or equal End Date";
                },
              },
            }}
            defaultValue={holiday?.startDate}
            isReadOnly={isReadOnly}
          />
        </div>

        {/* End Date */}
        <div>
          <DateSelect
            control={control}
            name="endDate"
            required
            label="End Date"
            rules={{
              validate: {
                notSmaller: () => {
                  if (startDate > endDate)
                    return "End Date must be less than or equal Start Date";
                },
              },
            }}
            defaultValue={holiday?.endDate}
            isReadOnly={isReadOnly}
          />
        </div>

        {/* Description */}
        <div>
          <TextArea
            control={control}
            name="description"
            label="Description"
            placeholder="Enter description"
            isReadOnly={isReadOnly}
          />
        </div>
      </div>
    </form>
  );
};

export default Form;

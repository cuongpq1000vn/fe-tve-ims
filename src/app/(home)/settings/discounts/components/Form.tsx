"use client";

import { DeleteActionButton } from "@/components";
import {
  EditButton,
  SubmitButton,
  TextArea,
  TextInput,
} from "@/components/molecules/form";
import { NewOrEditContext } from "@/contexts/NewOrEditContext";
import { DiscountDTO, DiscountRequestDTO } from "@/dtos";
import { useMeaningfulContext } from "@/hooks";
import { DiscountService } from "@/services";
import { useRouter } from "next/navigation";
import { SubmitHandler, useForm } from "react-hook-form";
import { toast } from "sonner";

type Props = {
  discount?: DiscountDTO;
};

const Form: React.FC<Props> = ({ discount }) => {
  const router = useRouter();
  const { isNew, isEdit } = useMeaningfulContext(NewOrEditContext);
  const isReadOnly = discount && !isEdit && !isNew;
  const { handleSubmit, control } = useForm<DiscountRequestDTO>({
    defaultValues: {
      type: discount?.type,
      description: discount?.description,
    },
  });

  const onSubmit: SubmitHandler<DiscountRequestDTO> = async (discountData) => {
    try {
      const response = await (discount
        ? DiscountService.updateDiscount(discountData, discount.id)
        : DiscountService.createDiscount(discountData));
      if (!response.data) {
        toast.error(`Failed to ${isNew ? "create" : "update"} discount`);
      } else {
        toast.success(
          `${isNew ? "Created" : "Updated"} discount successfully!`
        );

        router.push(`/settings/discounts/${response.data.id}`);
      }
    } catch (error) {
      console.error("Error submitting the form: ", error);
      toast.error(`Failed to ${isNew ? "create" : "update"} discount`);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div className="flex gap-3 my-5 justify-end">
        {!isEdit && !isNew ? (
          <EditButton
            href={`/settings/discounts/${(discount as DiscountDTO)?.id}/edit`}
          />
        ) : (
          <SubmitButton />
        )}
        {discount && (
          <DeleteActionButton
            id={discount.id}
            action={DiscountService.deleteDiscount}
            objectName={"Discount"}
            afterDelete={() => router.push("/settings/discounts")}
          />
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        {/* Type */}
        <div>
          <TextInput
            name="type"
            control={control}
            required
            isReadOnly={isReadOnly}
            label="Type"
            placeholder="Enter type"
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

"use client";

import { SessionContext } from "@/contexts";
import { useMeaningfulContext } from "@/hooks";
import { Button } from "@nextui-org/react";
import Link from "next/link";
import { FaPen } from "react-icons/fa";

const EditButton = ({
  href,
  onPress,
  isIconOnly,
  disabled,
}: {
  href?: string | undefined;
  onPress?: () => void;
  isIconOnly?: boolean;
  disabled?: boolean;
}) => {
  const { isTeacher } = useMeaningfulContext(SessionContext);
  return href ? (
    <Button
      as={Link}
      isDisabled={disabled || isTeacher}
      isIconOnly={isIconOnly}
      startContent={<FaPen />}
      href={href}
    >
      {!isIconOnly && "Edit"}
    </Button>
  ) : (
    <Button
      isDisabled={disabled || isTeacher}
      isIconOnly={isIconOnly}
      startContent={<FaPen />}
      onPress={onPress}
    >
      {!isIconOnly && "Edit"}
    </Button>
  );
};

export default EditButton;

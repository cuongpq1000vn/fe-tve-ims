"use client";

import { SessionContext } from "@/contexts";
import { useMeaningfulContext } from "@/hooks";
import { Button } from "@nextui-org/react";

const SubmitButton = () => {
  const { isTeacher } = useMeaningfulContext(SessionContext);

  return (
    <Button type="submit" disabled={isTeacher} color="primary">
      Save
    </Button>
  );
};

export default SubmitButton;

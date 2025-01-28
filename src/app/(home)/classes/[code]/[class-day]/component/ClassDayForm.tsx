"use client";

import Image from "next/image";
import {
  Switch,
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Button,
  Input,
} from "@nextui-org/react";
import { toast } from "sonner";
import { AbsenceRequestDTO } from "@/dtos/absence/AbsenceDTO";
import { markAbsence } from "@/services/AbsenceService";
import { StudentAbsenceDTO } from "@/dtos";
import { useState } from "react";
import { updateClassDay } from "@/services/ClassDayService";
import { useRouter } from "next/navigation";
import FormContextProvider from "../../../new/component/Form/FormContext";
import { Rating } from "./Rating";

interface Props {
  students: StudentAbsenceDTO[];
  code: string;
  classDay: number;
  isReadonly?: boolean;
  isDisabled?: boolean;
  defaultClassDay?: {
    id: number;
    comment: string;
    homeWork: string;
    rating: number;
  };
}

export default function ClassDayForm({
  students,
  code,
  classDay,
  isReadonly,
  isDisabled,
  defaultClassDay,
}: Readonly<Props>) {
  const [updatedStudents, setUpdatedStudents] = useState(students);
  const [rating, setRating] = useState(defaultClassDay?.rating || 3);
  const router = useRouter();

  const handleSwitchChange = (studentId: number, isAbsent: boolean) => {
    setUpdatedStudents((prevStudents) =>
      prevStudents.map((student) =>
        student.id === studentId ? { ...student, isAbsent } : student
      )
    );
  };

  const onSubmit = async (formData: FormData) => {
    const comment = formData.get("comment") as string;
    const homework = formData.get("homework") as string;

    if (!defaultClassDay?.id) {
      toast.error("Class Day not found");
      return;
    }

    try {
      const response = await updateClassDay(defaultClassDay.id, {
        comment,
        homework,
        rating,
      });

      if (!response.data) {
        throw new Error("Failed to update class day");
      }

      for (const student of updatedStudents) {
        const originalStudent = students.find((s) => s.id === student.id);
        if (originalStudent && originalStudent.isAbsent !== student.isAbsent) {
          await markAbsence({
            studentId: student.id,
            classCode: code,
            classDayId: classDay,
            checkAbsent: !student.isAbsent,
          } as AbsenceRequestDTO);
        }
      }
      toast.success("Class day and attendance updated successfully.");
      router.push(`/classes/${response.data.classTvms}/${response.data.id}`);
    } catch (error) {
      toast.error(
        "Failed to save updates. Please try again." + (error as Error).message
      );
    }
  };

  return (
    <FormContextProvider>
      <form action={onSubmit}>
        <div className="w-full flex gap-3 justify-between">
          <h1 className="text-2xl font-bold mb-4">Class Day Form</h1>
          {!(isDisabled || isReadonly) && (
            <Button color="primary" type="submit">
              Save
            </Button>
          )}
        </div>
        <div className="w-full flex gap-3 items-end">
          <Input
            isReadOnly={isReadonly}
            isDisabled={isDisabled}
            defaultValue={defaultClassDay?.comment}
            name="comment"
            isRequired
            label="Overall Comment"
            placeholder="Input Text"
            labelPlacement="outside"
            variant="bordered"
            size="sm"
            classNames={{
              base: "w-1/4",
            }}
          />
          <Input
            isReadOnly={isReadonly}
            isDisabled={isDisabled}
            defaultValue={defaultClassDay?.homeWork}
            name="homework"
            isRequired
            label="Homework"
            placeholder="Input Text"
            labelPlacement="outside"
            variant="bordered"
            size="sm"
            classNames={{
              base: "w-1/4",
            }}
          />
          <div className="flex items-center gap-2">
            <label className="font-bold text-sm">Class Day Rating:</label>
            <Rating
              initialValue={rating}
              count={5}
              onChange={(value) => setRating(value)}
              isReadOnly={isReadonly}
              isDisabled={isDisabled}
            />
          </div>
        </div>
        <div className="mt-6">
          <h1 className="text-2xl font-bold mb-4">Student List</h1>
          <Table aria-label="Student Attendance Table">
            <TableHeader>
              <TableColumn>Avatar</TableColumn>
              <TableColumn>Name</TableColumn>
              <TableColumn>Attendance</TableColumn>
            </TableHeader>
            <TableBody>
              {updatedStudents.map((student) => (
                <TableRow key={student.id}>
                  <TableCell>
                    <div className="relative w-10 h-10 overflow-hidden rounded-full">
                      <Image
                        src={`/api/images?filePath=${student.avatar}` || "/default/avatar.png"}
                        alt={`${student.name}'s avatar`}
                        fill
                        className="object-cover"
                      />
                    </div>
                  </TableCell>
                  <TableCell>{student.name}</TableCell>
                  <TableCell>
                    <Switch
                      isDisabled={isDisabled}
                      isSelected={student.isAbsent}
                      isReadOnly={isReadonly}
                      onValueChange={(isChecked) =>
                        !isReadonly && handleSwitchChange(student.id, isChecked)
                      }
                      aria-label={`Mark ${student.name} as ${
                        student.isAbsent ? "absent" : "present"
                      }`}
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </form>
    </FormContextProvider>
  );
}

"use client";

import { ActionButton } from "@/components";
import { SubmitButton } from "@/components/molecules/form";
import TableWrapper from "@/components/molecules/table/TableWrapper";
import { Rest } from "@/components/type";
import { TypeOfTest } from "@/constants/typeOfTest";
import { LessonRequest } from "@/dtos";
import { LessonDTO } from "@/dtos/lesson/LessonDTO";
import { createLesson, updateLesson } from "@/services/LessonService";
import {
  Button,
  Modal,
  ModalBody,
  ModalContent,
  ModalHeader,
  useDisclosure,
  Input,
  Select,
  SelectItem,
} from "@nextui-org/react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { FaPen } from "react-icons/fa";
import { IoMdAddCircleOutline } from "react-icons/io";
import { toast } from "sonner";

type Props = {
  defaultLessons?: LessonDTO[];
  disabled?: boolean;
  isReadonly?: boolean;
  courseCode?: string;
};

export default function OutlineTable({
  defaultLessons,
  isReadonly,
  courseCode,
}: Readonly<Props>) {
  const router = useRouter();
  const [data] = useState(defaultLessons ?? []);
  const [loading] = useState(false);
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const [currentLesson, setCurrentLesson] = useState<LessonDTO | null>(null);
  const [lessons, setLessons] = useState<Array<LessonRequest>>([]);

  const columns = [
    { name: "Id", key: "id", align: "start" },
    { name: "Description", key: "description" },
    { name: "Lesson Type", key: "lessonType" },
    { name: "Action", key: "action" },
  ];

  const renderCell = (key: string, data: LessonDTO) => {
    switch (key) {
      case "id":
        return <div>{data.id}</div>;
      case "description":
        return <div>{data.description}</div>;
      case "lessonType":
        return <span>{data.lessonType}</span>;
      case "action":
        return (
          <div className="w-full relative flex justify-center">
            <div className="cursor-pointer">
              <ActionButton
                icon={FaPen}
                onClick={() => {
                  setCurrentLesson(data);
                  onOpen();
                }}
              />
            </div>
          </div>
        );
    }
  };

  const handleAddLesson = () => {
    setLessons((prev) => [
      ...prev,
      {
        courseId: courseCode || "",
        description: "",
        lessonType: TypeOfTest.MIDTERM,
      },
    ]);
  };

  const handleRemoveLesson = (index: number) => {
    setLessons((prev) => prev.filter((_, i) => i !== index));
  };

  const handleChangeLesson = (
    index: number,
    field: string,
    value: string | number
  ) => {
    setLessons((prev) =>
      prev.map((lesson, i) =>
        i === index ? { ...lesson, [field]: value } : lesson
      )
    );
  };

  const rest: Rest | undefined = {
    totalElements: data.length,
    totalPages: 0,
    size: data.length,
    number: data.length,
    pageable: {
      pageNumber: 0,
      pageSize: data.length,
      offset: 0,
      sort: [],
      paged: true,
      unpaged: false,
    },
    sort: [],
    first: true,
    last: true,
    empty: false,
    numberOfElements: data.length,
  };

  const handleUpdate = async (formData: FormData) => {
    const testType = formData.get("lessonType") as TypeOfTest;
    const description = formData.get("description") as string;
    if (!courseCode) {
      toast.error("Course not found");
      return;
    }
    const lessonRequest: LessonRequest = {
      courseId: courseCode,
      description: description,
      lessonType: testType,
    };
    try {
      let response;
      if (currentLesson) {
        response = await updateLesson(lessonRequest, currentLesson.id);
        if (!response.data) {
          toast.error(`Failed to create lesson`);
        }

        toast.success(`lesson update successfully`);
        onOpenChange();
        window.location.reload();
      }
    } catch (error) {
      console.log(error);
      toast.error("An error occurred. Please try again.");
    }
  };

  const handleSubmit = async () => {
    try {
      const responses = await createLesson(lessons);

      if (!responses.data) {
        toast.error(`Failed to create some lessons`);
        return;
      }

      toast.success(`Lessons created successfully`);
      setLessons([]);
      onOpenChange();
      router.push(`/courses/${courseCode}`);
    } catch (error) {
      console.log(error);
      toast.error("An error occurred. Please try again.");
    }
  };

  return (
    <>
      <TableWrapper<LessonDTO>
        rest={rest}
        columns={columns}
        renderCell={renderCell}
        data={data}
        isLoading={loading}
        showControls={false}
      />
      {!isReadonly && (
        <div className="flex justify-center mt-4">
          <Button isIconOnly color="primary" onPress={onOpen}>
            <IoMdAddCircleOutline size={30} />
          </Button>
        </div>
      )}
      <Modal isOpen={isOpen} onOpenChange={onOpenChange}>
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                {currentLesson ? "Update Lesson" : "Create Lesson"}
              </ModalHeader>
              {!currentLesson ? (
                <ModalBody>
                  {lessons.map((lesson, index) => (
                    <div key={index} className="flex flex-col gap-4">
                      <Select
                        name="lessonType"
                        label="Test Type"
                        placeholder="Select Test Type"
                        className="w-full"
                        labelPlacement="outside"
                        isRequired
                        defaultSelectedKeys={
                          lesson?.lessonType
                            ? [lesson?.lessonType]
                            : [TypeOfTest.MIDTERM]
                        }
                        onSelectionChange={(selected) => {
                          const selectedValue = Array.from(selected)[0];
                          handleChangeLesson(index, "lessonType", selectedValue);
                        }}
                      >
                        {Object.values(TypeOfTest).map((value) => (
                          <SelectItem value={value} key={value}>
                            {value}
                          </SelectItem>
                        ))}
                      </Select>
                      <Input
                        label="Description"
                        name="description"
                        placeholder="Enter description"
                        defaultValue={lesson?.description}
                        onChange={(e) =>
                          handleChangeLesson(
                            index,
                            "description",
                            e.target.value
                          )
                        }
                        required
                      />
                      <Button
                        isIconOnly
                        onPress={() => handleRemoveLesson(index)}
                      >
                        X
                      </Button>
                    </div>
                  ))}
                  <Button onPress={handleAddLesson}>Add Lesson</Button>
                  <div className="flex justify-end gap-2">
                    <Button type="button" onPress={onClose}>
                      Cancel
                    </Button>
                    <Button onPress={handleSubmit} color="primary">
                      Save
                    </Button>
                  </div>
                </ModalBody>
              ) : (
                <ModalBody>
                  <form action={handleUpdate} className="flex flex-col gap-4">
                    <Select
                      name="lessonType"
                      label="Test Type"
                      placeholder="Select Test Type"
                      className="w-full"
                      labelPlacement="outside"
                      isRequired
                      defaultSelectedKeys={
                        currentLesson?.lessonType
                          ? [currentLesson?.lessonType]
                          : [TypeOfTest.MIDTERM]
                      }
                    >
                      {Object.values(TypeOfTest).map((value) => (
                        <SelectItem value={value} key={value}>
                          {value}
                        </SelectItem>
                      ))}
                    </Select>
                    <Input
                      label="Description"
                      name="description"
                      placeholder="Enter description"
                      defaultValue={currentLesson?.description}
                      required
                    />
                    <div className="flex justify-end gap-2">
                      <Button type="button" onPress={onClose}>
                        Cancel
                      </Button>
                      <SubmitButton />
                    </div>
                  </form>
                </ModalBody>
              )}
            </>
          )}
        </ModalContent>
      </Modal>
    </>
  );
}

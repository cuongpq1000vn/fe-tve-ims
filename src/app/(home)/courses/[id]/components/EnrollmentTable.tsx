"use client";
import { useRouter } from "next/navigation";
import { EnrollmentDTO } from "@/dtos/enrollment/EnrollmentDTO";
import { useState } from "react";
import {
  Button,
  DatePicker,
  Link,
  Modal,
  ModalBody,
  ModalContent,
  ModalHeader,
  Select,
  SelectItem,
  useDisclosure,
} from "@nextui-org/react";
import { EnrollmentRequest, StudentDTO } from "@/dtos";
import { ActionButton } from "@/components";
import { FaPen } from "react-icons/fa";
import Image from "next/image";
import { DateToStringWithoutTime } from "@/utils/DateUtils";
import { Rest } from "@/components/type";
import TableWrapper from "@/components/molecules/table/TableWrapper";
import { IoMdAddCircleOutline } from "react-icons/io";
import { getStudentsWithoutClassCode } from "@/services/StudentService";
import { SubmitButton } from "@/components/molecules/form";
import { toast } from "sonner";
import {
  createEnrollment,
  updateEnrollment,
} from "@/services/EnrollmentService";
import {
  getLocalTimeZone,
  parseAbsolute,
  today,
} from "@internationalized/date";
type Props = {
  defaultEnrollments?: EnrollmentDTO[];
  disabled?: boolean;
  isReadonly?: boolean;
  courseCode?: string;
  courseId?: number;
};

export default function EnrollmentTable({
  defaultEnrollments,
  isReadonly,
  courseCode,
  courseId,
}: Readonly<Props>) {
  const router = useRouter();
  const [data] = useState(defaultEnrollments ?? []);
  const [loading] = useState(false);
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const [currentEnrollment, setCurrentEnrollment] =
    useState<EnrollmentDTO | null>(null);
  const [enrollments, setEnrollments] = useState<Array<EnrollmentRequest>>([]);
  const [students, setStudents] = useState<StudentDTO[]>([]);

  const handleDropdownFocus = async () => {
    try {
      const response = await getStudentsWithoutClassCode();
      setStudents(response.data || []);
    } catch (error) {
      console.error("Failed to fetch students:", error);
    }
  };
  const columns = [
    { name: "Id", key: "id", align: "start" },
    { name: "Avatar", key: "avatar" },
    { name: "Student Code", key: "studentCode" },
    { name: "Enrollment Date", key: "enrollmentDate" },
    { name: "Phone Number", key: "phoneNumber" },
    { name: "Date Of Birth", key: "dateOfBirth" },
    { name: "Action", key: "action" },
  ];

  const renderCell = (key: string, data: EnrollmentDTO) => {
    switch (key) {
      case "id":
        return <div>{data.id}</div>;
      case "avatar":
        return (
          <div>
            {data.student?.avatarUrl ? (
              <Image
                src={
                  `/api/images?filePath=${data.student.avatarUrl}` ||
                  "/default/avatar.png"
                }
                alt="Avatar"
                className="rounded-full h-8 w-8"
                width={250}
                height={250}
              />
            ) : (
              "No Avatar"
            )}
          </div>
        );
      case "studentCode":
        return (
          <Link
            href={`/students/${data.student?.code}`}
            className="m-4 hover:underline hover:text-blue-600"
          >
            {data.student?.code}
          </Link>
        );
      case "enrollmentDate":
        return <div>{DateToStringWithoutTime(data.enrollmentDate)}</div>;
      case "phoneNumber":
        return <div>{data.student.phoneNumber}</div>;
      case "dateOfBirth":
        return (
          <div>
            {DateToStringWithoutTime(new Date(data.student.dateOfBirth))}
          </div>
        );
      case "action":
        return (
          <div className="w-full relative flex justify-center">
            <div className="cursor-pointer">
              <ActionButton
                icon={FaPen}
                onClick={() => {
                  setCurrentEnrollment(data);
                  onOpen();
                }}
              />
            </div>
          </div>
        );
    }
  };

  const handleUpdate = async (formData: FormData) => {
    const student = Number(formData.get("student"));
    const enrollmentDate = new Date(
      (formData.get("enrollmentDate") as string).split("[")[0]
    );
    try {
      let response;
      if (currentEnrollment) {
        const enrollmentRequest: EnrollmentRequest = {
          studentId: student,
          courseId: currentEnrollment?.course,
          classCode: currentEnrollment?.classCode,
          enrollmentDate: enrollmentDate,
        };
        response = await updateEnrollment(
          enrollmentRequest,
          currentEnrollment.id
        );
        if (!response.data) {
          toast.error(`Failed to create lesson`);
        }

        toast.success(`lesson update successfully`);
        onOpenChange();
        router.push(`/courses/${courseCode}`);
      }
    } catch (error) {
      console.log(error);
      toast.error("An error occurred. Please try again.");
    }
  };

  const handleAddEnrollment = () => {
    if (!courseId) {
      toast.error("Course ID is required to add an enrollment.");
      return;
    }
    setEnrollments((prev) => [
      ...prev,
      {
        studentId: 0,
        courseId,
        classCode: "",
        enrollmentDate: new Date(),
      },
    ]);
  };

  const handleRemoveEnrollment = (index: number) => {
    setEnrollments((prev) => prev.filter((_, i) => i !== index));
  };

  const handleChangeLesson = (
    index: number,
    field: string,
    value: string | number
  ) => {
    setEnrollments((prev) =>
      prev.map((enrollment, i) =>
        i === index ? { ...enrollment, [field]: value } : enrollment
      )
    );
  };

  const handleSubmit = async () => {
    if (!courseId) {
      toast.error("Course ID is missing. Cannot create enrollments.");
      return;
    }
    try {
      const groupEnrollment: EnrollmentRequest[] = [];
      enrollments.forEach((enrollment) => {
        const request: EnrollmentRequest = {
          ...enrollment,
          courseId,
        };
        groupEnrollment.push(request);
      });
      const responses = await createEnrollment(groupEnrollment);

      if (!responses.data) {
        toast.error(`Failed to create enrollments`);
        return;
      }

      toast.success(`Enrollments created successfully`);
      setEnrollments([]);
      onOpenChange();
      router.push(`/courses/${courseCode}`);
    } catch (error) {
      console.log(error);
      toast.error("An error occurred. Please try again.");
    }
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

  return (
    <>
      <TableWrapper<EnrollmentDTO>
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
                {currentEnrollment ? "Update Enrollment" : "Create Enrollment"}
              </ModalHeader>
              {!currentEnrollment ? (
                <ModalBody>
                  {enrollments.map((enrollment, index) => (
                    <div key={index} className="flex flex-col gap-4">
                      <Select
                        name="student"
                        label="Student"
                        placeholder="Select a student"
                        className="w-full"
                        labelPlacement="outside"
                        isRequired
                        isLoading={loading}
                        onOpenChange={handleDropdownFocus}
                        onSelectionChange={(selected) => {
                          const selectedValue = Array.from(selected)[0];
                          handleChangeLesson(index, "studentId", selectedValue);
                        }}
                      >
                        {students.map((student) => (
                          <SelectItem key={student.id} value={student.id}>
                            {student.name}
                          </SelectItem>
                        ))}
                      </Select>
                      <DatePicker
                        hideTimeZone
                        granularity="day"
                        minValue={today(getLocalTimeZone())}
                        isRequired
                        name="enrollmentDate"
                        label="Enrollment Date"
                        labelPlacement="outside"
                        variant="bordered"
                        onChange={(date) =>
                          handleChangeLesson(
                            index,
                            "enrollmentDate",
                            date?.toString() || ""
                          )
                        }
                      />
                      <Button
                        isIconOnly
                        onPress={() => handleRemoveEnrollment(index)}
                      >
                        X
                      </Button>
                    </div>
                  ))}
                  <Button onPress={handleAddEnrollment}>Add Enrollment</Button>
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
                      name="student"
                      label="Student"
                      placeholder="Select a student"
                      className="w-full"
                      labelPlacement="outside"
                      isRequired
                      isLoading={loading}
                      onOpenChange={handleDropdownFocus}
                    >
                      {students.map((student) => (
                        <SelectItem key={student.id} value={student.id}>
                          {student.name}
                        </SelectItem>
                      ))}
                    </Select>
                    <DatePicker
                      defaultValue={
                        currentEnrollment?.enrollmentDate
                          ? parseAbsolute(
                              currentEnrollment.enrollmentDate.toString(),
                              getLocalTimeZone()
                            )
                          : undefined
                      }
                      hideTimeZone
                      granularity="day"
                      minValue={today(getLocalTimeZone())}
                      isRequired
                      name="enrollmentDate"
                      label="Enrollment Date"
                      labelPlacement="outside"
                      variant="bordered"
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

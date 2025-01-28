"use client";

import { EditButton } from "@/components/molecules/form";
import DeleteActionButton from "@/components/molecules/table/DeleteButton";
import TableWrapper from "@/components/molecules/table/TableWrapper";
import { FilterOptionType, Rest } from "@/components/type";
import { Classification } from "@/constants/classification";
import { SkillName } from "@/constants/skillName";
import { TypeOfTest } from "@/constants/typeOfTest";
import { GradeDTO } from "@/dtos";
import { ClassDTO } from "@/dtos/classes/ClassDTO";
import { FormulaDTO } from "@/dtos/formula/FormulaDTO";
import {
  GradeRequestDTO,
  GradeUpdateRequestDTO,
} from "@/dtos/grade/GradeRequestDTO";
import { SkillRequestDTO } from "@/dtos/grade/SkillRequestDTO";
import { FormulaService, GradeService } from "@/services";
import { deleteGrade } from "@/services/GradeService";
import { updateSearchParams } from "@/utils/UrlUtil";
import {
  Autocomplete,
  AutocompleteItem,
  Button,
  ButtonGroup,
  Chip,
  Input,
  Selection,
  User,
} from "@nextui-org/react";
import { evaluate } from "mathjs";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { FaSave } from "react-icons/fa";
import { IoMdAddCircleOutline } from "react-icons/io";
import { MdCancel } from "react-icons/md";
import { toast } from "sonner";

type Props = {
  classData?: ClassDTO | undefined;
};

const GradesTable: React.FC<Props> = ({ classData }) => {
  const router = useRouter();
  const path = usePathname();
  const [data, setData] = useState<GradeDTO[] | undefined>();
  const [newData, setNewData] = useState<GradeRequestDTO | undefined>(
    undefined
  );
  const [editData, setEditData] = useState<GradeUpdateRequestDTO | undefined>(
    undefined
  );
  const [studentScores, setStudentScores] = useState<GradeDTO[]>([]);
  const [formula, setFormula] = useState<FormulaDTO | undefined>();
  const [loading, setLoading] = useState(false);
  const haveFormula = !!classData?.course?.formula?.id;
  const searchParams = useSearchParams();
  const testTypeParam = searchParams.get("testType")
    ? String(searchParams.get("testType"))
    : "MIDTERM";
  const [testType, setTestType] = useState<Selection>(
    new Set(testTypeParam?.split(", "))
  );

  const getScoresOfStudent = async (studentId: number) => {
    const response = await GradeService.getAllGradesByStudentId(
      studentId,
      undefined,
      undefined,
      undefined,
      classData?.id as number
    );

    if (!response.data) {
      toast.error("This student don't have enough grade to calculate result");
      return;
    }

    setStudentScores(response.data.content);
  };

  useEffect(() => {
    if (testTypeParam == "RESULT" && newData?.studentId) {
      getScoresOfStudent(newData.studentId);
    }
  }, [testTypeParam, newData?.studentId]);

  useEffect(() => {
    if (
      studentScores.length > 0 &&
      newData?.skills &&
      testTypeParam === "RESULT" &&
      formula
    ) {
      const midtermGrade = studentScores.find(
        (grade) => grade.testType.type === "MIDTERM"
      )?.score;
      const finaltermGrade = studentScores.find(
        (grade) => grade.testType.type === "FINALTERM"
      )?.score;

      const bonus = newData.skills.filter(
        (skill) => skill.name == SkillName.BONUS
      )[0]?.score;

      if (!midtermGrade || !finaltermGrade || !bonus) return;

      const percentageScore =
        formula.midtermGradeWeight * midtermGrade +
        formula.finalGradeWeight * finaltermGrade +
        formula.bonusGradeWeight * bonus;

      const classification = evaluate(formula.classificationFormula, {
        percentageScore: percentageScore,
      });

      setNewData(
        (prev) =>
          ({
            ...prev,
            score: percentageScore,
            classification: classification,
          } as GradeRequestDTO)
      );
    }
  }, [studentScores, newData?.skills, testTypeParam, formula]);

  useEffect(() => {
    if (
      studentScores.length > 0 &&
      editData?.skills &&
      testTypeParam === "RESULT" &&
      formula
    ) {
      const midtermGrade = studentScores.find(
        (grade) => grade.testType.type === "MIDTERM"
      )?.score;
      const finaltermGrade = studentScores.find(
        (grade) => grade.testType.type === "FINALTERM"
      )?.score;

      const bonus = editData.skills.filter(
        (skill) => skill.name == SkillName.BONUS
      )[0]?.score;

      if (!midtermGrade || !finaltermGrade || !bonus) return;

      const percentageScore =
        formula.midtermGradeWeight * midtermGrade +
        formula.finalGradeWeight * finaltermGrade +
        formula.bonusGradeWeight * bonus;

      const classification = evaluate(formula.classificationFormula, {
        percentageScore: percentageScore,
      });

      setEditData(
        (prev) =>
          ({
            ...prev,
            score: percentageScore,
            classification: classification,
          } as GradeUpdateRequestDTO)
      );
    }
  }, [studentScores, editData?.skills, testTypeParam, formula]);

  useEffect(() => {
    if (newData?.skills && testTypeParam != "RESULT") {
      const scope = Object.fromEntries(
        newData.skills.map((skill) => [
          skill.name.toLocaleLowerCase(),
          skill.score,
        ])
      );
      const sumFormula =
        testTypeParam == "MIDTERM"
          ? formula?.midtermSumFormula
          : formula?.finalSumFormula;
      const percentageFormula =
        testTypeParam == "MIDTERM"
          ? formula?.midtermPercentageFormula
          : formula?.finalPercentageFormula;
      const classificationFormula =
        testTypeParam == "MIDTERM"
          ? formula?.midtermClassificationFormula
          : formula?.finalClassificationFormula;
      const sum = evaluate(sumFormula as string, scope);

      const percentageScore = evaluate(percentageFormula as string, {
        sum: sum,
      });
      const classification = evaluate(classificationFormula as string, {
        percentageScore: percentageScore,
      });

      setNewData(
        (prev) =>
          ({
            ...prev,
            score: percentageScore,
            classification: classification,
          } as GradeRequestDTO)
      );
    }
  }, [newData?.skills]);

  useEffect(() => {
    if (editData?.skills && testTypeParam != "RESULT") {
      const scope = Object.fromEntries(
        editData.skills.map((skill) => [
          skill.name.toLocaleLowerCase(),
          skill.score,
        ])
      );
      const sumFormula =
        testTypeParam == "MIDTERM"
          ? formula?.midtermSumFormula
          : formula?.finalSumFormula;
      const percentageFormula =
        testTypeParam == "MIDTERM"
          ? formula?.midtermPercentageFormula
          : formula?.finalPercentageFormula;
      const classificationFormula =
        testTypeParam == "MIDTERM"
          ? formula?.midtermClassificationFormula
          : formula?.finalClassificationFormula;
      const sum = evaluate(sumFormula as string, scope);

      const percentageScore = evaluate(percentageFormula as string, {
        sum: sum,
      });
      const classification = evaluate(classificationFormula as string, {
        percentageScore: percentageScore,
      });

      setEditData(
        (prev) =>
          ({
            ...prev,
            score: percentageScore,
            classification: classification,
          } as GradeUpdateRequestDTO)
      );
    }
  }, [editData?.skills]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const dataResponse = await GradeService.getAllGradesByClassId(
        undefined,
        undefined,
        testTypeParam,
        classData?.id
      );
      setData(dataResponse.data?.content);
      setLoading(false);
    };
    fetchData();
  }, [testTypeParam, classData?.id]);

  useEffect(() => {
    const fetchFormula = async () => {
      if (haveFormula) {
        setLoading(true);
        const formulaResponse = await FormulaService.getFormula(
          classData?.course.formula.id as number
        );

        setFormula(formulaResponse.data);
        setLoading(false);
      }
    };

    fetchFormula();
  }, []);

  const skillSetEnable = useMemo(() => {
    if (testTypeParam === "RESULT") {
      return {
        bonus: true,
      };
    } else if (testTypeParam === "FINALTERM") {
      return {
        listening:
          formula?.finalListeningMaxScore &&
          formula?.finalListeningMaxScore > 0,
        reading:
          formula?.finalReadingMaxScore && formula?.finalReadingMaxScore > 0,
        writing:
          formula?.finalWritingMaxScore && formula?.finalWritingMaxScore > 0,
        speaking:
          formula?.finalSpeakingMaxScore && formula?.finalSpeakingMaxScore > 0,
      };
    } else {
      return {
        listening:
          formula?.midtermListeningMaxScore &&
          formula?.midtermListeningMaxScore > 0,
        reading:
          formula?.midtermReadingMaxScore &&
          formula?.midtermReadingMaxScore > 0,
        writing:
          formula?.midtermWritingMaxScore &&
          formula?.midtermWritingMaxScore > 0,
        speaking:
          formula?.midtermSpeakingMaxScore &&
          formula?.midtermSpeakingMaxScore > 0,
      };
    }
    return {};
  }, [formula, testTypeParam]);

  const columns = useMemo(() => {
    const skillColumns = Object.entries(skillSetEnable)
      .filter((sk) => sk[1])
      .map(([skill]) => ({
        name: skill.charAt(0).toUpperCase() + skill.slice(1),
        key: skill,
      }));

    return [
      { name: "Student", key: "student" },
      { name: "Comment", key: "comment" },
      ...skillColumns,
      { name: "Score", key: "score" },
      { name: "Classification", key: "classification" },
      { name: "Action", key: "action" },
    ];
  }, [skillSetEnable]);

  const onCreate = async () => {
    if (!newData) return;
    try {
      const response = await GradeService.createGrade(newData);

      if (!response.data) {
        toast.error("Failed to create grade");
      } else {
        setData([response.data, ...(data?.slice(1) as GradeDTO[])]);
        setNewData(undefined);
        toast.success("Grade created successfully!");
      }
    } catch (e) {
      console.error(e);
      toast.error("Failed to create grade");
    }
  };

  const onUpdate = async () => {
    if (!editData) return;
    try {
      const response = await GradeService.updateGrade(
        editData as GradeRequestDTO,
        editData.id
      );

      if (!response.data) {
        toast.error("Failed to update grade");
      } else {
        if (!data) return;
        const temp = structuredClone(data);
        const index = temp.findIndex((t) => t.id === editData.id);
        temp.splice(index, 1, response.data);
        setData(temp);
        setEditData(undefined);
        toast.success("Grade updated successfully!");
      }
    } catch (e) {
      console.log(e);
      toast.error("Failed to update grade");
    }
  };

  const renderCell = (key: string, data: GradeDTO) => {
    if (data.id == -1) {
      switch (key) {
        case "student":
          return (
            <Autocomplete
              className="max-w-xs"
              defaultItems={classData?.students}
              label="Student"
              placeholder="Search an student"
              onSelectionChange={(id) => {
                setNewData(
                  (prev) => ({ ...prev, studentId: id } as GradeRequestDTO)
                );
              }}
            >
              {(student) => (
                <AutocompleteItem key={student.id}>
                  {student.name}
                </AutocompleteItem>
              )}
            </Autocomplete>
          );
        case "comment":
          return (
            <Input
              label="Comment"
              type="text"
              defaultValue={newData?.comment as string}
              onValueChange={(value) =>
                setNewData(
                  (prev) => ({ ...prev, comment: value } as GradeRequestDTO)
                )
              }
            />
          );
        case "bonus":
          return (
            <Input
              label="Bonus"
              type="number"
              defaultValue={newData?.skills
                ?.find((skill) => skill.name === SkillName.BONUS)
                ?.score.toString()}
              onValueChange={(value) =>
                setNewData(
                  (prev) =>
                    ({
                      ...prev,
                      skills: prev?.skills.map((skill) =>
                        skill.name === SkillName.BONUS
                          ? { ...skill, score: Number(value) }
                          : skill
                      ),
                    } as GradeRequestDTO)
                )
              }
            />
          );
        case "listening":
          return (
            <Input
              label="Listening"
              type="number"
              defaultValue={newData?.skills
                ?.find((skill) => skill.name === SkillName.LISTENING)
                ?.score.toString()}
              onValueChange={(value) =>
                setNewData(
                  (prev) =>
                    ({
                      ...prev,
                      skills: prev?.skills.map((skill) =>
                        skill.name === SkillName.LISTENING
                          ? { ...skill, score: Number(value) }
                          : skill
                      ),
                    } as GradeRequestDTO)
                )
              }
            />
          );
        case "reading":
          return (
            <Input
              label="Reading"
              type="number"
              defaultValue={newData?.skills
                ?.find((skill) => skill.name === SkillName.READING)
                ?.score.toString()}
              onValueChange={(value) =>
                setNewData(
                  (prev) =>
                    ({
                      ...prev,
                      skills: prev?.skills.map((skill) =>
                        skill.name === SkillName.READING
                          ? { ...skill, score: Number(value) }
                          : skill
                      ),
                    } as GradeRequestDTO)
                )
              }
            />
          );
        case "writing":
          return (
            <Input
              label="Writing"
              type="number"
              defaultValue={newData?.skills
                ?.find((skill) => skill.name === SkillName.WRITING)
                ?.score.toString()}
              onValueChange={(value) =>
                setNewData(
                  (prev) =>
                    ({
                      ...prev,
                      skills: prev?.skills.map((skill) =>
                        skill.name === SkillName.WRITING
                          ? { ...skill, score: Number(value) }
                          : skill
                      ),
                    } as GradeRequestDTO)
                )
              }
            />
          );
        case "speaking":
          return (
            <Input
              label="Speaking"
              type="number"
              defaultValue={newData?.skills
                ?.find((skill) => skill.name === SkillName.SPEAKING)
                ?.score.toString()}
              onValueChange={(value) =>
                setNewData(
                  (prev) =>
                    ({
                      ...prev,
                      skills: prev?.skills.map((skill) =>
                        skill.name === SkillName.SPEAKING
                          ? { ...skill, score: Number(value) }
                          : skill
                      ),
                    } as GradeRequestDTO)
                )
              }
            />
          );
        case "score":
          return (
            <Input
              label="Score"
              type="text"
              isReadOnly
              value={newData?.score.toString()}
            />
          );
        case "classification":
          return <Chip variant="solid">{newData?.classification}</Chip>;
        case "action":
          return (
            <ButtonGroup>
              <Button
                isDisabled={loading}
                isIconOnly
                color={"success"}
                onPress={async () => await onCreate()}
              >
                <FaSave />
              </Button>
              <Button
                isDisabled={loading}
                isIconOnly
                onPress={() => {
                  setNewData(undefined);
                  setData((prev) => prev?.slice(1));
                }}
              >
                <MdCancel />
              </Button>
            </ButtonGroup>
          );
      }
    } else if (editData?.id == data.id) {
      switch (key) {
        case "student":
          return (
            <Autocomplete
              className="max-w-xs"
              defaultItems={classData?.students}
              label="Student"
              defaultSelectedKey={editData.studentId.toString()}
              placeholder="Search an student"
              isReadOnly
            >
              {(student) => (
                <AutocompleteItem key={student.id}>
                  {student.name}
                </AutocompleteItem>
              )}
            </Autocomplete>
          );
        case "comment":
          return (
            <Input
              label="Comment"
              type="text"
              defaultValue={editData.comment as string}
              onValueChange={(value) =>
                setEditData(
                  (prev) =>
                    ({ ...prev, comment: value } as GradeUpdateRequestDTO)
                )
              }
            />
          );
        case "bonus":
          return (
            <Input
              label="Bonus"
              type="number"
              defaultValue={editData.skills
                ?.find((skill) => skill.name === SkillName.BONUS)
                ?.score.toString()}
              onValueChange={(value) =>
                setEditData(
                  (prev) =>
                    ({
                      ...prev,
                      skills: prev?.skills.map((skill) =>
                        skill.name === SkillName.BONUS
                          ? { ...skill, score: Number(value) }
                          : skill
                      ),
                    } as GradeUpdateRequestDTO)
                )
              }
            />
          );
        case "listening":
          return (
            <Input
              label="Listening"
              type="number"
              defaultValue={editData.skills
                ?.find((skill) => skill.name === SkillName.LISTENING)
                ?.score.toString()}
              onValueChange={(value) =>
                setEditData(
                  (prev) =>
                    ({
                      ...prev,
                      skills: prev?.skills.map((skill) =>
                        skill.name === SkillName.LISTENING
                          ? { ...skill, score: Number(value) }
                          : skill
                      ),
                    } as GradeUpdateRequestDTO)
                )
              }
            />
          );
        case "reading":
          return (
            <Input
              label="Reading"
              type="number"
              defaultValue={editData.skills
                ?.find((skill) => skill.name === SkillName.READING)
                ?.score.toString()}
              onValueChange={(value) =>
                setEditData(
                  (prev) =>
                    ({
                      ...prev,
                      skills: prev?.skills.map((skill) =>
                        skill.name === SkillName.READING
                          ? { ...skill, score: Number(value) }
                          : skill
                      ),
                    } as GradeUpdateRequestDTO)
                )
              }
            />
          );
        case "writing":
          return (
            <Input
              label="Writing"
              type="number"
              defaultValue={editData.skills
                ?.find((skill) => skill.name === SkillName.WRITING)
                ?.score.toString()}
              onValueChange={(value) =>
                setEditData(
                  (prev) =>
                    ({
                      ...prev,
                      skills: prev?.skills.map((skill) =>
                        skill.name === SkillName.WRITING
                          ? { ...skill, score: Number(value) }
                          : skill
                      ),
                    } as GradeUpdateRequestDTO)
                )
              }
            />
          );
        case "speaking":
          return (
            <Input
              label="Speaking"
              type="number"
              defaultValue={editData.skills
                ?.find((skill) => skill.name === SkillName.SPEAKING)
                ?.score.toString()}
              onValueChange={(value) =>
                setEditData(
                  (prev) =>
                    ({
                      ...prev,
                      skills: prev?.skills.map((skill) =>
                        skill.name === SkillName.SPEAKING
                          ? { ...skill, score: Number(value) }
                          : skill
                      ),
                    } as GradeUpdateRequestDTO)
                )
              }
            />
          );
        case "score":
          return (
            <Input
              label="Score"
              type="number"
              isReadOnly
              value={editData?.score.toString()}
            />
          );
        case "classification":
          return <Chip variant="solid">{editData?.classification}</Chip>;
        case "action":
          return (
            <ButtonGroup>
              <Button
                isDisabled={loading}
                isIconOnly
                color={"success"}
                onPress={async () => await onUpdate()}
              >
                <FaSave />
              </Button>
              <Button
                isDisabled={loading}
                isIconOnly
                onPress={() => {
                  setEditData(undefined);
                }}
              >
                <MdCancel />
              </Button>
            </ButtonGroup>
          );
      }
    } else {
      switch (key) {
        case "student":
          return (
            <User
              {...(data.student?.avatarUrl
                ? {
                    avatarProps: {
                      src: `/api/images?filePath=${data.student?.avatarUrl}`,
                    },
                  }
                : {})}
              description={data.student?.emailAddress}
              name={data.student?.name.toString()}
            >
              {data.student?.emailAddress}
            </User>
          );
        case "comment":
          return (
            <div className="flex justify-center items-center">
              {data.comment.toString()}
            </div>
          );
        case "bonus":
          return (
            <p>
              {
                data.skills?.filter((skill) => skill.name == SkillName.BONUS)[0]
                  ?.score
              }
            </p>
          );
        case "listening":
          return (
            <p>
              {
                data.skills?.filter(
                  (skill) => skill.name == SkillName.LISTENING
                )[0]?.score
              }
            </p>
          );
        case "reading":
          return (
            <p>
              {
                data.skills?.filter(
                  (skill) => skill.name == SkillName.READING
                )[0]?.score
              }
            </p>
          );
        case "writing":
          return (
            <p>
              {
                data.skills?.filter(
                  (skill) => skill.name == SkillName.WRITING
                )[0]?.score
              }
            </p>
          );
        case "speaking":
          return (
            <p>
              {
                data.skills?.filter(
                  (skill) => skill.name == SkillName.SPEAKING
                )[0]?.score
              }
            </p>
          );

        case "score":
          return (
            <Chip
              color={
                data.classification == Classification.GOOD
                  ? "success"
                  : data.classification == Classification.AVERAGE
                  ? "warning"
                  : "danger"
              }
              variant="solid"
              radius="sm"
            >
              {data.score}
            </Chip>
          );
        case "classification":
          return (
            <Chip
              variant="flat"
              color={
                data.classification == Classification.GOOD
                  ? "success"
                  : data.classification == Classification.AVERAGE
                  ? "warning"
                  : "danger"
              }
            >
              {data.classification}
            </Chip>
          );
        case "action":
          return (
            <ButtonGroup>
              <EditButton
                isIconOnly
                disabled={!haveFormula}
                onPress={() => {
                  setEditData({
                    id: data.id,
                    studentId: data.student.id,
                    classId: data.classTvms.id,
                    typeOfTest: data.testType.type,
                    comment: data.comment,
                    score: data.score,
                    classification: data.classification,
                    skills: Object.entries(skillSetEnable)
                      .filter(([isEnabled]) => isEnabled)
                      .map(([skill]) => ({
                        name: skill.toUpperCase(),
                        score:
                          data.skills?.find(
                            (k) => k.name.toString() === skill.toUpperCase()
                          )?.score || 0,
                      })) as SkillRequestDTO[],
                  });
                }}
              />

              <DeleteActionButton
                id={data.id}
                disable={!haveFormula}
                action={deleteGrade}
                objectName={"Grade"}
                isIconOnly
                afterDelete={() => {
                  setData((prev) => {
                    return prev?.filter((grade) => grade.id != data.id);
                  });
                }}
              />
            </ButtonGroup>
          );
      }
    }
  };

  const addGrade = () => {
    const newEmptyGrade = {
      id: -1,
      student: classData?.students[0],
      comment: "",
      score: 0,
      skills: [{}],
      classification: Classification.AVERAGE,
    } as GradeDTO;
    setNewData({
      studentId: undefined,
      classId: classData?.id as number,
      typeOfTest: Object.keys(TypeOfTest).filter(
        (key) => key == testTypeParam
      )[0] as TypeOfTest,
      comment: "",
      score: 0,
      classification: Classification.AVERAGE,
      skills: Object.entries(skillSetEnable)
        .filter((sk) => sk[1])
        .map(([skill]) => ({
          name: skill.toUpperCase(),
          score: 0,
        })) as SkillRequestDTO[],
    });
    setData((prev) => (prev ? [newEmptyGrade, ...prev] : [newEmptyGrade]));
  };

  const rest: Rest | undefined = {
    totalElements: data?.length || 0,
    totalPages: 0,
    size: data?.length || 0,
    number: data?.length || 0,
    pageable: {
      pageNumber: 0,
      pageSize: data?.length || 0,
      offset: 0,
      sort: [],
      paged: true,
      unpaged: false,
    },
    sort: [],
    first: true,
    last: true,
    empty: false,
    numberOfElements: data?.length || 0,
  };
  const filterOptions: FilterOptionType = [
    {
      label: "Type",
      props: {
        disallowEmptySelection: true,
        selectedKeys: testType,
        selectionMode: "single",
        onSelectionChange: (selection: Selection) => {
          setTestType(selection);
          const selectedKeys = Array.from(selection)
            .join(", ")
            .replace(/_/g, "");
          const updatedParams = updateSearchParams(
            new URLSearchParams(searchParams.toString()),
            {
              testType: selectedKeys,
            }
          );
          router.push(`${path}?${updatedParams}`);
        },
      },
      options: Object.entries(TypeOfTest).map(([key, value]) => ({
        key: key,
        label: value,
      })),
    },
  ];

  return (
    <div className="flex flex-col items-center gap-2">
      <TableWrapper<GradeDTO>
        rest={rest}
        data={data ?? []}
        columns={columns}
        renderCell={renderCell}
        isLoading={loading}
        filterOptions={filterOptions}
        onPrint={() => window.print()}
        showControls={false}
      />
      {!newData && !loading && haveFormula && (
        <Button
          onPress={addGrade}
          isIconOnly
          color="primary"
          aria-label="add-student"
        >
          <IoMdAddCircleOutline size={30} />
        </Button>
      )}
    </div>
  );
};

export default GradesTable;

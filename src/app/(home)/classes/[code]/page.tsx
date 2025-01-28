import { EditButton } from "@/components/molecules/form";
import { getClassByCode } from "@/services/ClassService";
import { notFound } from "next/navigation";
import Form from "../new/component/Form";

export default async function ClassDetail({
  params,
}: Readonly<{ params: Promise<{ code: string }> }>) {
  const { code } = await params;
  const response = await getClassByCode(code);

  if (!response.data) {
    notFound();
  }

  return (
    <>
      <div className="w-full mt-8 flex gap-3 justify-between">
        <h1 className="font-bold uppercase">{response.data.code}</h1>
        <EditButton href={`/classes/${code}/edit`} />
      </div>
      <Form isReadonly defaultClass={response.data} />
    </>
  );
}

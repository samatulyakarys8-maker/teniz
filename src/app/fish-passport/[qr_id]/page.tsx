import { notFound } from "next/navigation";
import { PassportView } from "@/components/PassportView";
import { getPassport } from "@/lib/data";

export default async function FishPassportPage({
  params,
}: {
  params: { qr_id: string };
}) {
  const passport = await getPassport(decodeURIComponent(params.qr_id));
  if (!passport) notFound();

  return <PassportView passport={passport} />;
}

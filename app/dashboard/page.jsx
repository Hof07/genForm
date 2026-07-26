import { redirect } from "next/navigation";
import { getSession } from "@/app/lib/auth";
import DashboardClient from "./DashboardClient";

export default async function DashboardPage() {
  const session = await getSession();

  if (!session) {
    redirect("/sign-in");
  }

  return <DashboardClient user={session} />;
}
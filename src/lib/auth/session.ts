import { getServerSession as nextAuthGetServerSession } from "next-auth";
import { authOptions } from "./auth-options";

export async function getServerSession() {
  return nextAuthGetServerSession(authOptions);
}

export async function requireServerSession() {
  const session = await getServerSession();
  if (!session?.user) {
    throw new Error("Unauthorized");
  }
  return session;
}

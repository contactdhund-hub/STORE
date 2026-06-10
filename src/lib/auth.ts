import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function requireAdmin() {
  const session = await getServerSession(authOptions);
  
  if (!session || (session.user as any /* eslint-disable-line @typescript-eslint/no-explicit-any */)?.role !== 'ADMIN') {
    throw new Error("Unauthorized");
  }
  
  return session;
}

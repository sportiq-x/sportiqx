import HomePageClient from "./HomePageClient";
import { prisma } from "@/lib/prisma";

const EARLY_USERS_BASE = 47;

export default async function Home() {
  let initialEarlyUsers = EARLY_USERS_BASE;

  try {
    const waitlistCount = await prisma.waitlistEntry.count();
    initialEarlyUsers = EARLY_USERS_BASE + waitlistCount;
  } catch {
    initialEarlyUsers = EARLY_USERS_BASE;
  }

  return <HomePageClient initialEarlyUsers={initialEarlyUsers} />;
}


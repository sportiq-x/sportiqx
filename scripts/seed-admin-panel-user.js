/* eslint-disable @typescript-eslint/no-require-imports */
const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");

const prisma = new PrismaClient();

function generatePassword(length = 14) {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#$%";
  const bytes = crypto.randomBytes(length * 2);
  let value = "";

  for (const byte of bytes) {
    value += chars[byte % chars.length];
    if (value.length === length) {
      break;
    }
  }

  return value;
}

async function main() {
  const email = "mukundjha204@gmail.com";
  const password = generatePassword();
  const passwordHash = await bcrypt.hash(password, 12);

  await prisma.sportiqxPanel.upsert({
    where: { email },
    update: {
      passwordHash,
      role: "ADMIN",
      isActive: true,
    },
    create: {
      email,
      passwordHash,
      role: "ADMIN",
      isActive: true,
    },
  });

  console.log(`ADMIN_EMAIL=${email}`);
  console.log(`GENERATED_ADMIN_PASSWORD=${password}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

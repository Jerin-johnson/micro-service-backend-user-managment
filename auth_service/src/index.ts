import { prisma } from "../lib/prisma";

async function main() {
  // Create a user with a post in one query
  const user = await prisma.authUser.create({
    data: {
      email: "alice@example.com",
      password: "12121",
      role: "USER",
    },
  });

  console.log("Created:", user);

  // Fetch all users with their posts
  const all = await prisma.authUser.findMany({});
  console.log("All users:", JSON.stringify(all, null, 2));
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });

import { prisma } from "../lib/prisma";

async function main() {
  const count = await prisma.film.count();
  const films = await prisma.film.findMany({
    orderBy: [{ releaseYear: "asc" }, { title: "asc" }],
    take: 5,
    select: {
      slug: true,
      title: true,
      releaseYear: true,
      oscarNominations: true,
      oscarWins: true,
      ggNominations: true,
      ggWins: true,
    },
  });

  console.log(`Film count: ${count}`);
  console.table(films);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());

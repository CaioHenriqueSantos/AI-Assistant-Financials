import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Limpando dados anteriores...");
  await prisma.chatMessage.deleteMany();
  await prisma.transaction.deleteMany();
  await prisma.recurringRule.deleteMany();

  console.log("Criando recorrências...");
  await prisma.recurringRule.createMany({
    data: [
      { name: "Salário", amount: 5000, type: "INCOME", category: "SALARY", frequency: "MONTHLY", nextDate: new Date("2026-04-01") },
      { name: "Aluguel", amount: 1800, type: "EXPENSE", category: "HOUSING", frequency: "MONTHLY", nextDate: new Date("2026-04-05") },
      { name: "Internet", amount: 120, type: "EXPENSE", category: "HOUSING", frequency: "MONTHLY", nextDate: new Date("2026-04-10") },
      { name: "Academia", amount: 100, type: "EXPENSE", category: "HEALTH", frequency: "MONTHLY", nextDate: new Date("2026-04-10") },
    ],
  });

  console.log("Criando transações dos últimos 3 meses...");

  const transactions = [
    // Janeiro
    { amount: 5000, type: "INCOME", category: "SALARY", description: "Salário janeiro", date: new Date("2026-01-05") },
    { amount: 1800, type: "EXPENSE", category: "HOUSING", description: "Aluguel janeiro", date: new Date("2026-01-05") },
    { amount: 650, type: "EXPENSE", category: "FOOD", description: "Mercado", date: new Date("2026-01-08") },
    { amount: 200, type: "EXPENSE", category: "TRANSPORT", description: "Combustível", date: new Date("2026-01-10") },
    { amount: 120, type: "EXPENSE", category: "HOUSING", description: "Internet", date: new Date("2026-01-10") },
    { amount: 100, type: "EXPENSE", category: "HEALTH", description: "Academia", date: new Date("2026-01-10") },
    { amount: 350, type: "EXPENSE", category: "FOOD", description: "Restaurantes", date: new Date("2026-01-15") },
    { amount: 180, type: "EXPENSE", category: "ENTERTAINMENT", description: "Streaming + lazer", date: new Date("2026-01-20") },
    { amount: 90, type: "EXPENSE", category: "CLOTHING", description: "Roupas", date: new Date("2026-01-22") },

    // Fevereiro
    { amount: 5000, type: "INCOME", category: "SALARY", description: "Salário fevereiro", date: new Date("2026-02-05") },
    { amount: 1800, type: "EXPENSE", category: "HOUSING", description: "Aluguel fevereiro", date: new Date("2026-02-05") },
    { amount: 720, type: "EXPENSE", category: "FOOD", description: "Mercado", date: new Date("2026-02-08") },
    { amount: 200, type: "EXPENSE", category: "TRANSPORT", description: "Combustível", date: new Date("2026-02-10") },
    { amount: 120, type: "EXPENSE", category: "HOUSING", description: "Internet", date: new Date("2026-02-10") },
    { amount: 100, type: "EXPENSE", category: "HEALTH", description: "Academia", date: new Date("2026-02-10") },
    { amount: 420, type: "EXPENSE", category: "FOOD", description: "Restaurantes", date: new Date("2026-02-14") },
    { amount: 250, type: "EXPENSE", category: "HEALTH", description: "Consulta médica", date: new Date("2026-02-18") },
    { amount: 150, type: "EXPENSE", category: "ENTERTAINMENT", description: "Cinema e lazer", date: new Date("2026-02-22") },

    // Março (mês atual)
    { amount: 5000, type: "INCOME", category: "SALARY", description: "Salário março", date: new Date("2026-03-05") },
    { amount: 1800, type: "EXPENSE", category: "HOUSING", description: "Aluguel março", date: new Date("2026-03-05") },
    { amount: 580, type: "EXPENSE", category: "FOOD", description: "Mercado", date: new Date("2026-03-08") },
    { amount: 200, type: "EXPENSE", category: "TRANSPORT", description: "Combustível", date: new Date("2026-03-10") },
    { amount: 120, type: "EXPENSE", category: "HOUSING", description: "Internet", date: new Date("2026-03-10") },
    { amount: 100, type: "EXPENSE", category: "HEALTH", description: "Academia", date: new Date("2026-03-10") },
    { amount: 300, type: "EXPENSE", category: "FOOD", description: "Restaurantes", date: new Date("2026-03-15") },
    { amount: 200, type: "EXPENSE", category: "EDUCATION", description: "Curso online", date: new Date("2026-03-18") },
  ] as const;

  await prisma.transaction.createMany({ data: transactions });

  console.log(`Seed concluído! ${transactions.length} transações criadas.`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());

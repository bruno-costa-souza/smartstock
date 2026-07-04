import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('Iniciando seed...');

  const adminHash = await bcrypt.hash('admin', 12);

  await prisma.user.upsert({
    where: { email: 'admin@admin.com' },
    update: { passwordHash: adminHash, email: 'admin@admin.com' },
    create: {
      nome: 'Administrador',
      email: 'admin@admin.com',
      passwordHash: adminHash,
      role: 'ADMIN',
    },
  });

  const produtos = [
    { nome: 'Caderno Universitário 200 folhas', descricao: 'Caderno espiral, capa dura, 200 folhas', preco: 29.90, categoria: 'Cadernos', estoque: 50, estoqueMin: 10 },
    { nome: 'Caderno Brochura 96 folhas', descricao: 'Capa flexível, 96 folhas pautadas', preco: 12.50, categoria: 'Cadernos', estoque: 80, estoqueMin: 15 },
    { nome: 'Caneta Esferográfica Azul', descricao: 'Ponta 1.0mm, tinta azul', preco: 2.50, categoria: 'Canetas', estoque: 200, estoqueMin: 50 },
    { nome: 'Caneta Esferográfica Preta', descricao: 'Ponta 1.0mm, tinta preta', preco: 2.50, categoria: 'Canetas', estoque: 150, estoqueMin: 50 },
    { nome: 'Lápis HB nº 2', descricao: 'Caixa com 12 unidades', preco: 8.90, categoria: 'Lápis', estoque: 60, estoqueMin: 20 },
    { nome: 'Borracha Branca', descricao: 'Borracha macia, não mancha', preco: 1.50, categoria: 'Acessórios', estoque: 120, estoqueMin: 30 },
    { nome: 'Régua 30cm', descricao: 'Plástico transparente graduado', preco: 3.90, categoria: 'Acessórios', estoque: 45, estoqueMin: 10 },
    { nome: 'Tesoura Escolar', descricao: 'Ponta arredondada, 13cm', preco: 7.90, categoria: 'Acessórios', estoque: 30, estoqueMin: 8 },
    { nome: 'Cola Bastão 40g', descricao: 'Cola sem solvente, não tóxica', preco: 4.50, categoria: 'Adesivos', estoque: 75, estoqueMin: 20 },
    { nome: 'Fita Adesiva Transparente 12mm', descricao: 'Rolo com 50 metros', preco: 3.20, categoria: 'Adesivos', estoque: 90, estoqueMin: 25 },
    { nome: 'Marca Texto Amarelo', descricao: 'Ponta bisel, tinta fluorescente', preco: 5.90, categoria: 'Canetas', estoque: 40, estoqueMin: 10 },
    { nome: 'Post-it 76x76mm', descricao: 'Bloco com 100 folhas, amarelo', preco: 9.90, categoria: 'Adesivos', estoque: 3, estoqueMin: 10 },
  ];

  for (const p of produtos) {
    await prisma.produto.create({ data: p });
  }

  console.log('Seed concluído!');
  console.log('Login: admin@admin.com / admin');
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());

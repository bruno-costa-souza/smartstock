import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../config/prisma/prisma.service';
import { CreateProdutoDto } from './dto/create-produto.dto';
import { UpdateProdutoDto } from './dto/update-produto.dto';

@Injectable()
export class ProdutosService {
  constructor(private prisma: PrismaService) {}

  async findAll(
    page = 1,
    limit = 20,
    search?: string,
    categoria?: string,
    apenasAtivos = false,
  ) {
    const where: Record<string, unknown> = {};
    if (apenasAtivos) where.ativo = true;
    if (categoria) where.categoria = categoria;
    if (search) where.nome = { contains: search, mode: 'insensitive' };

    const [data, total] = await Promise.all([
      this.prisma.produto.findMany({
        where,
        orderBy: { nome: 'asc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.produto.count({ where }),
    ]);

    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async findOne(id: string) {
    const produto = await this.prisma.produto.findUnique({ where: { id } });
    if (!produto) throw new NotFoundException('Produto não encontrado');
    return produto;
  }

  async create(dto: CreateProdutoDto) {
    return this.prisma.produto.create({ data: dto });
  }

  async update(id: string, dto: UpdateProdutoDto) {
    await this.findOne(id);
    return this.prisma.produto.update({ where: { id }, data: dto });
  }

  async updateImagem(id: string, imagemUrl: string) {
    await this.findOne(id);
    return this.prisma.produto.update({ where: { id }, data: { imagemUrl } });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.produto.update({ where: { id }, data: { ativo: false } });
  }

  async getCategorias(): Promise<string[]> {
    const rows = await this.prisma.produto.findMany({
      where: { ativo: true },
      select: { categoria: true },
      distinct: ['categoria'],
      orderBy: { categoria: 'asc' },
    });
    return rows.map((r) => r.categoria);
  }
}

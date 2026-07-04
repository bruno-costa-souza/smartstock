import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../config/prisma/prisma.service';
import { MovimentacaoDto } from './dto/movimentacao.dto';

@Injectable()
export class EstoqueService {
  constructor(private prisma: PrismaService) {}

  async entrada(dto: MovimentacaoDto) {
    const produto = await this.prisma.produto.findUnique({ where: { id: dto.produtoId } });
    if (!produto) throw new NotFoundException('Produto não encontrado');

    const estoqueApos = produto.estoque + dto.quantidade;

    const [mov] = await this.prisma.$transaction([
      this.prisma.movimentacaoEstoque.create({
        data: { produtoId: dto.produtoId, tipo: 'ENTRADA', quantidade: dto.quantidade, motivo: dto.motivo, estoqueApos },
      }),
      this.prisma.produto.update({ where: { id: dto.produtoId }, data: { estoque: estoqueApos } }),
    ]);

    return mov;
  }

  async saida(dto: MovimentacaoDto) {
    const produto = await this.prisma.produto.findUnique({ where: { id: dto.produtoId } });
    if (!produto) throw new NotFoundException('Produto não encontrado');
    if (produto.estoque < dto.quantidade) {
      throw new BadRequestException(`Estoque insuficiente. Disponível: ${produto.estoque}`);
    }

    const estoqueApos = produto.estoque - dto.quantidade;

    const [mov] = await this.prisma.$transaction([
      this.prisma.movimentacaoEstoque.create({
        data: { produtoId: dto.produtoId, tipo: 'SAIDA', quantidade: dto.quantidade, motivo: dto.motivo, estoqueApos },
      }),
      this.prisma.produto.update({ where: { id: dto.produtoId }, data: { estoque: estoqueApos } }),
    ]);

    return mov;
  }

  async historico(produtoId?: string, page = 1, limit = 20) {
    const where = produtoId ? { produtoId } : {};
    const [data, total] = await Promise.all([
      this.prisma.movimentacaoEstoque.findMany({
        where,
        include: { produto: { select: { nome: true, categoria: true } } },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.movimentacaoEstoque.count({ where }),
    ]);
    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async resumo() {
    const produtos = await this.prisma.produto.findMany({
      where: { ativo: true },
      select: { id: true, nome: true, categoria: true, estoque: true, estoqueMin: true, imagemUrl: true, preco: true },
      orderBy: { nome: 'asc' },
    });

    return {
      total: produtos.length,
      baixoEstoque: produtos.filter((p) => p.estoque > 0 && p.estoque <= p.estoqueMin),
      semEstoque: produtos.filter((p) => p.estoque === 0),
      produtos,
    };
  }
}

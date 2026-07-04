import { Controller, DefaultValuePipe, Get, Param, ParseIntPipe, Query } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { ProdutosService } from '../produtos/produtos.service';

@ApiTags('vitrine')
@Controller('vitrine')
export class VitrineController {
  constructor(private readonly produtosService: ProdutosService) {}

  @Get('produtos')
  @ApiOperation({ summary: 'Catálogo público de produtos (sem autenticação)' })
  findAll(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(24), ParseIntPipe) limit: number,
    @Query('search') search?: string,
    @Query('categoria') categoria?: string,
  ) {
    return this.produtosService.findAll(page, limit, search, categoria, true);
  }

  @Get('categorias')
  @ApiOperation({ summary: 'Listar categorias disponíveis' })
  getCategorias() {
    return this.produtosService.getCategorias();
  }

  @Get('produtos/:id')
  @ApiOperation({ summary: 'Detalhe público de um produto' })
  findOne(@Param('id') id: string) {
    return this.produtosService.findOne(id);
  }
}

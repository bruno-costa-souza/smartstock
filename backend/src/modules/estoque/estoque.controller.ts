import {
  Body, Controller, DefaultValuePipe, Get, ParseIntPipe, Post, Query, UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { MovimentacaoDto } from './dto/movimentacao.dto';
import { EstoqueService } from './estoque.service';

@ApiTags('estoque')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('admin/estoque')
export class EstoqueController {
  constructor(private readonly estoqueService: EstoqueService) {}

  @Get('resumo')
  @ApiOperation({ summary: 'Resumo do estoque com alertas de baixo estoque' })
  resumo() {
    return this.estoqueService.resumo();
  }

  @Get('historico')
  @ApiOperation({ summary: 'Histórico de movimentações de estoque' })
  historico(
    @Query('produtoId') produtoId?: string,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page?: number,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit?: number,
  ) {
    return this.estoqueService.historico(produtoId, page, limit);
  }

  @Post('entrada')
  @ApiOperation({ summary: 'Registrar entrada de estoque' })
  entrada(@Body() dto: MovimentacaoDto) {
    return this.estoqueService.entrada(dto);
  }

  @Post('saida')
  @ApiOperation({ summary: 'Registrar saída de estoque' })
  saida(@Body() dto: MovimentacaoDto) {
    return this.estoqueService.saida(dto);
  }
}

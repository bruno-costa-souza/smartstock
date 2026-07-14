import {
  BadRequestException, Body, Controller, DefaultValuePipe, Delete, Get, Param,
  ParseIntPipe, Patch, Post, Query, UploadedFile, UseGuards, UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CreateProdutoDto } from './dto/create-produto.dto';
import { UpdateProdutoDto } from './dto/update-produto.dto';
import { ProdutosService } from './produtos.service';

@ApiTags('produtos')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('admin/produtos')
export class ProdutosController {
  constructor(private readonly produtosService: ProdutosService) {}

  @Get()
  @ApiOperation({ summary: 'Listar produtos' })
  findAll(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit: number,
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

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.produtosService.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Criar produto' })
  create(@Body() dto: CreateProdutoDto) {
    return this.produtosService.create(dto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Atualizar produto' })
  update(@Param('id') id: string, @Body() dto: UpdateProdutoDto) {
    return this.produtosService.update(id, dto);
  }

  @Post(':id/imagem')
  @ApiOperation({ summary: 'Upload da foto do produto' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: { type: 'object', properties: { imagem: { type: 'string', format: 'binary' } } },
  })
  @UseInterceptors(FileInterceptor('imagem'))
  uploadImagem(@Param('id') id: string, @UploadedFile() file?: Express.Multer.File) {
    if (!file) throw new BadRequestException('Arquivo de imagem obrigatório (campo "imagem")');
    return this.produtosService.updateImagem(id, file.buffer);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Desativar produto (soft delete)' })
  remove(@Param('id') id: string) {
    return this.produtosService.remove(id);
  }
}

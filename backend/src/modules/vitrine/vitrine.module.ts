import { Module } from '@nestjs/common';
import { ProdutosModule } from '../produtos/produtos.module';
import { VitrineController } from './vitrine.controller';

@Module({
  imports: [ProdutosModule],
  controllers: [VitrineController],
})
export class VitrineModule {}

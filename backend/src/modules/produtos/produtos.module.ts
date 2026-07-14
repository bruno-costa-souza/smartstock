import { Module } from '@nestjs/common';
import { MulterModule } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { extname } from 'path';
import { CloudinaryModule } from '../../config/cloudinary/cloudinary.module';
import { ProdutosController } from './produtos.controller';
import { ProdutosService } from './produtos.service';

@Module({
  imports: [
    CloudinaryModule,
    MulterModule.register({
      // Em memória: o arquivo é repassado ao Cloudinary, nunca gravado em
      // disco (o filesystem do Railway é efêmero e some a cada deploy).
      storage: memoryStorage(),
      fileFilter: (_req, file, cb) => {
        const validMimetype = file.mimetype.match(/^image\/(jpg|jpeg|png|gif|webp)$/);
        const validExtension = extname(file.originalname).toLowerCase().match(/^\.(jpg|jpeg|png|gif|webp)$/);
        if (validMimetype && validExtension) {
          cb(null, true);
        } else {
          cb(new Error('Apenas imagens são permitidas (jpg, jpeg, png, gif, webp)'), false);
        }
      },
      limits: { fileSize: 5 * 1024 * 1024 },
    }),
  ],
  controllers: [ProdutosController],
  providers: [ProdutosService],
  exports: [ProdutosService],
})
export class ProdutosModule {}

import { Injectable, Logger, ServiceUnavailableException } from '@nestjs/common';
import { v2 as cloudinary, UploadApiResponse } from 'cloudinary';

@Injectable()
export class CloudinaryService {
  private readonly logger = new Logger(CloudinaryService.name);
  private readonly enabled: boolean;

  constructor() {
    const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
    const apiKey = process.env.CLOUDINARY_API_KEY;
    const apiSecret = process.env.CLOUDINARY_API_SECRET;

    this.enabled = Boolean(cloudName && apiKey && apiSecret);

    if (this.enabled) {
      cloudinary.config({ cloud_name: cloudName, api_key: apiKey, api_secret: apiSecret });
    } else {
      this.logger.warn(
        'CLOUDINARY_CLOUD_NAME/API_KEY/API_SECRET ausentes — upload de imagens indisponível',
      );
    }
  }

  /** Envia a imagem e retorna a URL pública (https) no CDN. */
  async upload(buffer: Buffer): Promise<string> {
    if (!this.enabled) {
      throw new ServiceUnavailableException(
        'Upload de imagens não configurado (variáveis CLOUDINARY_*)',
      );
    }

    const result = await new Promise<UploadApiResponse>((resolve, reject) => {
      cloudinary.uploader
        .upload_stream({ folder: 'papelaria/produtos', resource_type: 'image' }, (err, res) =>
          err || !res ? reject(err ?? new Error('Upload sem resposta')) : resolve(res),
        )
        .end(buffer);
    });

    return result.secure_url;
  }

  async removeByUrl(url?: string | null): Promise<void> {
    if (!this.enabled || !url) return;
    let host: string;
    try {
      host = new URL(url).hostname;
    } catch {
      return;
    }
    if (host !== 'res.cloudinary.com') return;

    const match = url.match(/\/upload\/(?:v\d+\/)?(papelaria\/produtos\/[^.]+)\.\w+$/);
    if (!match) return;

    try {
      await cloudinary.uploader.destroy(match[1]);
    } catch (err) {
      this.logger.warn(`Falha ao remover imagem antiga do Cloudinary: ${err}`);
    }
  }
}

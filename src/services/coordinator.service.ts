import { HttpClientService } from './http-client.service.js';
import { env } from '../config/env.js';
import { logger } from '../utils/logger.js';

export class CoordinatorService {
  private readonly httpClient: HttpClientService;

  constructor() {
    this.httpClient = new HttpClientService(env.coordinatorServiceUrl);
  }

  /**
   * Obtiene el ID del usuario autenticado desde el servicio coordinador
   * @param token - Token de autenticación Bearer
   * @returns ID del usuario (UUID)
   */
  async getUserId(token: string): Promise<string> {
    try {
      const response = await this.httpClient.get<{
        success: boolean;
        data: { id: string; [key: string]: unknown };
      }>('/auth/me', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.data.data?.id) {
        logger.error('Usuario ID no encontrado en respuesta del coordinador');
        throw new Error('Usuario ID no encontrado en respuesta del coordinador');
      }

      logger.info(`Usuario obtenido del coordinador: ${response.data.data.id}`);
      return response.data.data.id;
    } catch (error) {
      logger.error('Error obteniendo usuario del coordinador:', error);
      throw new Error('No se pudo obtener el ID del usuario del coordinador');
    }
  }
}

export const coordinatorService = new CoordinatorService();

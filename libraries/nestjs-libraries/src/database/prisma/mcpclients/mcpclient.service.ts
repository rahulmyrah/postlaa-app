import { Injectable } from '@nestjs/common';
import { MCPClientRepository } from '@gitroom/nestjs-libraries/database/prisma/mcpclients/mcpclient.repository';
import { MCPClientDto } from '@gitroom/nestjs-libraries/dtos/mcpclients/mcpclient.dto';

@Injectable()
export class MCPClientService {
  constructor(private _mcpClientRepository: MCPClientRepository) {}

  getAll(orgId: string) {
    return this._mcpClientRepository.getAll(orgId);
  }

  getEnabled(orgId: string) {
    return this._mcpClientRepository.getEnabled(orgId);
  }

  getById(orgId: string, id: string) {
    return this._mcpClientRepository.getById(orgId, id);
  }

  create(orgId: string, body: MCPClientDto) {
    return this._mcpClientRepository.create(orgId, body);
  }

  update(orgId: string, id: string, body: Partial<MCPClientDto>) {
    return this._mcpClientRepository.update(orgId, id, body);
  }

  delete(orgId: string, id: string) {
    return this._mcpClientRepository.delete(orgId, id);
  }
}

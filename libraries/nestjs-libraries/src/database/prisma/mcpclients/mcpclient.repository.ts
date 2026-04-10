import { PrismaRepository } from '@gitroom/nestjs-libraries/database/prisma/prisma.service';
import { Injectable } from '@nestjs/common';
import { MCPClientDto } from '@gitroom/nestjs-libraries/dtos/mcpclients/mcpclient.dto';

@Injectable()
export class MCPClientRepository {
  constructor(private _mcpClient: PrismaRepository<'mCPClient'>) {}

  getAll(orgId: string) {
    return this._mcpClient.model.mCPClient.findMany({
      where: {
        organizationId: orgId,
        deletedAt: null,
      },
      select: {
        id: true,
        name: true,
        url: true,
        authType: true,
        enabled: true,
        createdAt: true,
        updatedAt: true,
        // authValue intentionally omitted from list response
      },
      orderBy: { createdAt: 'asc' },
    });
  }

  getEnabled(orgId: string) {
    return this._mcpClient.model.mCPClient.findMany({
      where: {
        organizationId: orgId,
        deletedAt: null,
        enabled: true,
      },
      select: {
        id: true,
        name: true,
        url: true,
        authType: true,
        authValue: true,
        enabled: true,
      },
    });
  }

  getById(orgId: string, id: string) {
    return this._mcpClient.model.mCPClient.findFirst({
      where: {
        id,
        organizationId: orgId,
        deletedAt: null,
      },
      select: {
        id: true,
        name: true,
        url: true,
        authType: true,
        enabled: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  create(orgId: string, body: MCPClientDto) {
    return this._mcpClient.model.mCPClient.create({
      data: {
        organizationId: orgId,
        name: body.name,
        url: body.url,
        authType: body.authType ?? 'none',
        authValue: body.authValue,
        enabled: body.enabled ?? true,
      },
      select: {
        id: true,
        name: true,
        url: true,
        authType: true,
        enabled: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  update(orgId: string, id: string, body: Partial<MCPClientDto>) {
    return this._mcpClient.model.mCPClient.update({
      where: {
        id,
        organizationId: orgId,
      },
      data: {
        ...(body.name !== undefined && { name: body.name }),
        ...(body.url !== undefined && { url: body.url }),
        ...(body.authType !== undefined && { authType: body.authType }),
        ...(body.authValue !== undefined && { authValue: body.authValue }),
        ...(body.enabled !== undefined && { enabled: body.enabled }),
      },
      select: {
        id: true,
        name: true,
        url: true,
        authType: true,
        enabled: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  delete(orgId: string, id: string) {
    return this._mcpClient.model.mCPClient.update({
      where: {
        id,
        organizationId: orgId,
      },
      data: {
        deletedAt: new Date(),
      },
    });
  }
}

import { PrismaRepository } from '@gitroom/nestjs-libraries/database/prisma/prisma.service';
import { Injectable } from '@nestjs/common';
import { UserAgentDto } from '@gitroom/nestjs-libraries/dtos/useragents/useragent.dto';

@Injectable()
export class UserAgentRepository {
  constructor(private _userAgent: PrismaRepository<'userAgent'>) {}

  getAll(orgId: string) {
    return this._userAgent.model.userAgent.findMany({
      where: {
        organizationId: orgId,
        deletedAt: null,
      },
      orderBy: { createdAt: 'asc' },
    });
  }

  getById(orgId: string, id: string) {
    return this._userAgent.model.userAgent.findFirst({
      where: {
        id,
        organizationId: orgId,
        deletedAt: null,
      },
    });
  }

  create(orgId: string, body: UserAgentDto) {
    return this._userAgent.model.userAgent.create({
      data: {
        organizationId: orgId,
        name: body.name,
        role: body.role,
        description: body.description,
        instructions: body.instructions,
        model: body.model ?? 'gpt-4.1',
        avatar: body.avatar,
        enabled: body.enabled ?? true,
      },
    });
  }

  update(orgId: string, id: string, body: Partial<UserAgentDto>) {
    return this._userAgent.model.userAgent.update({
      where: {
        id,
        organizationId: orgId,
      },
      data: {
        ...(body.name !== undefined && { name: body.name }),
        ...(body.role !== undefined && { role: body.role }),
        ...(body.description !== undefined && { description: body.description }),
        ...(body.instructions !== undefined && { instructions: body.instructions }),
        ...(body.model !== undefined && { model: body.model }),
        ...(body.avatar !== undefined && { avatar: body.avatar }),
        ...(body.enabled !== undefined && { enabled: body.enabled }),
      },
    });
  }

  delete(orgId: string, id: string) {
    return this._userAgent.model.userAgent.update({
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

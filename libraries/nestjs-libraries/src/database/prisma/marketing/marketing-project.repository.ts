import { Injectable } from '@nestjs/common';
import { PrismaRepository } from '@gitroom/nestjs-libraries/database/prisma/prisma.service';
import { MarketingProjectDto } from '@gitroom/nestjs-libraries/dtos/marketing/marketing-project.dto';

@Injectable()
export class MarketingProjectRepository {
  constructor(
    private _project: PrismaRepository<'marketingProject'>
  ) {}

  getAll(orgId: string) {
    return this._project.model.marketingProject.findMany({
      where: { organizationId: orgId, deletedAt: null },
      orderBy: { createdAt: 'desc' },
      include: { campaigns: { where: { deletedAt: null }, orderBy: { createdAt: 'desc' } } },
    });
  }

  getById(orgId: string, id: string) {
    return this._project.model.marketingProject.findFirst({
      where: { id, organizationId: orgId, deletedAt: null },
      include: {
        campaigns: {
          where: { deletedAt: null },
          orderBy: { createdAt: 'desc' },
          include: { researchRuns: { orderBy: { createdAt: 'desc' } } },
        },
      },
    });
  }

  create(orgId: string, body: MarketingProjectDto) {
    return this._project.model.marketingProject.create({
      data: {
        organizationId: orgId,
        name: body.name,
        description: body.description,
        url: body.url,
        niche: body.niche,
        targetAudience: body.targetAudience,
        brandVoice: body.brandVoice,
        brandColors: body.brandColors,
        competitors: body.competitors,
        goals: body.goals,
        active: body.active ?? true,
      },
    });
  }

  update(orgId: string, id: string, body: Partial<MarketingProjectDto>) {
    return this._project.model.marketingProject.update({
      where: { id, organizationId: orgId },
      data: {
        ...(body.name !== undefined && { name: body.name }),
        ...(body.description !== undefined && { description: body.description }),
        ...(body.url !== undefined && { url: body.url }),
        ...(body.niche !== undefined && { niche: body.niche }),
        ...(body.targetAudience !== undefined && { targetAudience: body.targetAudience }),
        ...(body.brandVoice !== undefined && { brandVoice: body.brandVoice }),
        ...(body.brandColors !== undefined && { brandColors: body.brandColors }),
        ...(body.competitors !== undefined && { competitors: body.competitors }),
        ...(body.goals !== undefined && { goals: body.goals }),
        ...(body.active !== undefined && { active: body.active }),
      },
    });
  }

  delete(orgId: string, id: string) {
    return this._project.model.marketingProject.update({
      where: { id, organizationId: orgId },
      data: { deletedAt: new Date() },
    });
  }
}

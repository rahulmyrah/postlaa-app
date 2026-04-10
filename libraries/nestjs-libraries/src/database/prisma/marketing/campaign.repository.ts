import { Injectable } from '@nestjs/common';
import { PrismaRepository } from '@gitroom/nestjs-libraries/database/prisma/prisma.service';
import { CampaignDto } from '@gitroom/nestjs-libraries/dtos/marketing/campaign.dto';

@Injectable()
export class CampaignRepository {
  constructor(private _campaign: PrismaRepository<'campaign'>) {}

  getAllForProject(projectId: string) {
    return this._campaign.model.campaign.findMany({
      where: { projectId, deletedAt: null },
      orderBy: { createdAt: 'desc' },
      include: { researchRuns: { orderBy: { createdAt: 'desc' } } },
    });
  }

  getById(projectId: string, id: string) {
    return this._campaign.model.campaign.findFirst({
      where: { id, projectId, deletedAt: null },
      include: { researchRuns: { orderBy: { createdAt: 'desc' } } },
    });
  }

  create(projectId: string, body: CampaignDto) {
    return this._campaign.model.campaign.create({
      data: {
        projectId,
        name: body.name,
        goal: body.goal,
        status: (body.status as any) ?? 'RESEARCHING',
        startDate: body.startDate ? new Date(body.startDate) : null,
        endDate: body.endDate ? new Date(body.endDate) : null,
      },
    });
  }

  update(projectId: string, id: string, body: Partial<CampaignDto>) {
    return this._campaign.model.campaign.update({
      where: { id, projectId },
      data: {
        ...(body.name !== undefined && { name: body.name }),
        ...(body.goal !== undefined && { goal: body.goal }),
        ...(body.status !== undefined && { status: body.status as any }),
        ...(body.startDate !== undefined && { startDate: body.startDate ? new Date(body.startDate) : null }),
        ...(body.endDate !== undefined && { endDate: body.endDate ? new Date(body.endDate) : null }),
      },
    });
  }

  updateBrief(id: string, brief: object) {
    return this._campaign.model.campaign.update({
      where: { id },
      data: { brief, status: 'PLANNING' },
    });
  }

  updateContentPlan(id: string, contentPlan: object) {
    return this._campaign.model.campaign.update({
      where: { id },
      data: { contentPlan, status: 'ACTIVE' },
    });
  }

  delete(projectId: string, id: string) {
    return this._campaign.model.campaign.update({
      where: { id, projectId },
      data: { deletedAt: new Date() },
    });
  }

  addResearchRun(campaignId: string, agentType: string, findings: object) {
    return this._campaign.model.researchRun.create({
      data: { campaignId, agentType, findings },
    });
  }
}

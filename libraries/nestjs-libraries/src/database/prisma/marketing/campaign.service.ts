import { Injectable } from '@nestjs/common';
import { CampaignRepository } from '@gitroom/nestjs-libraries/database/prisma/marketing/campaign.repository';
import { CampaignDto } from '@gitroom/nestjs-libraries/dtos/marketing/campaign.dto';

@Injectable()
export class CampaignService {
  constructor(private _repo: CampaignRepository) {}

  getAllForProject(projectId: string) {
    return this._repo.getAllForProject(projectId);
  }

  getById(projectId: string, id: string) {
    return this._repo.getById(projectId, id);
  }

  create(projectId: string, body: CampaignDto) {
    return this._repo.create(projectId, body);
  }

  update(projectId: string, id: string, body: Partial<CampaignDto>) {
    return this._repo.update(projectId, id, body);
  }

  updateBrief(id: string, brief: object) {
    return this._repo.updateBrief(id, brief);
  }

  updateContentPlan(id: string, contentPlan: object) {
    return this._repo.updateContentPlan(id, contentPlan);
  }

  delete(projectId: string, id: string) {
    return this._repo.delete(projectId, id);
  }

  addResearchRun(campaignId: string, agentType: string, findings: object) {
    return this._repo.addResearchRun(campaignId, agentType, findings);
  }

  acceptPlan(campaignId: string, feedback?: string) {
    return this._repo.acceptPlan(campaignId, feedback);
  }
}

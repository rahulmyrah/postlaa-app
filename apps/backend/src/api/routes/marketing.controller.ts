import {
  Body,
  Controller,
  Delete,
  Get,
  HttpException,
  NotFoundException,
  Param,
  Post,
  Put,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { GetOrgFromRequest } from '@gitroom/nestjs-libraries/user/org.from.request';
import { Organization } from '@prisma/client';
import { MarketingProjectService } from '@gitroom/nestjs-libraries/database/prisma/marketing/marketing-project.service';
import { CampaignService } from '@gitroom/nestjs-libraries/database/prisma/marketing/campaign.service';
import { MarketingProjectDto } from '@gitroom/nestjs-libraries/dtos/marketing/marketing-project.dto';
import { CampaignDto } from '@gitroom/nestjs-libraries/dtos/marketing/campaign.dto';
import { MarketingTeamOrchestrator } from '@gitroom/nestjs-libraries/agent/marketing.team.orchestrator';

@ApiTags('Marketing')
@Controller('/marketing')
export class MarketingController {
  constructor(
    private _projectService: MarketingProjectService,
    private _campaignService: CampaignService,
    private _orchestrator: MarketingTeamOrchestrator
  ) {}

  // ─── Projects ────────────────────────────────────────────────────────────────

  @Get('/projects')
  getAllProjects(@GetOrgFromRequest() org: Organization) {
    return this._projectService.getAll(org.id);
  }

  @Get('/projects/:id')
  async getProject(
    @GetOrgFromRequest() org: Organization,
    @Param('id') id: string
  ) {
    const project = await this._projectService.getById(org.id, id);
    if (!project) throw new NotFoundException('Project not found');
    return project;
  }

  @Post('/projects')
  createProject(
    @GetOrgFromRequest() org: Organization,
    @Body() body: MarketingProjectDto
  ) {
    return this._projectService.create(org.id, body);
  }

  @Put('/projects/:id')
  updateProject(
    @GetOrgFromRequest() org: Organization,
    @Param('id') id: string,
    @Body() body: Partial<MarketingProjectDto>
  ) {
    return this._projectService.update(org.id, id, body);
  }

  @Delete('/projects/:id')
  deleteProject(
    @GetOrgFromRequest() org: Organization,
    @Param('id') id: string
  ) {
    return this._projectService.delete(org.id, id);
  }

  // ─── Campaigns ───────────────────────────────────────────────────────────────

  @Get('/projects/:projectId/campaigns')
  async getCampaigns(
    @GetOrgFromRequest() org: Organization,
    @Param('projectId') projectId: string
  ) {
    // Verify project belongs to org
    const project = await this._projectService.getById(org.id, projectId);
    if (!project) throw new NotFoundException('Project not found');
    return this._campaignService.getAllForProject(projectId);
  }

  @Get('/projects/:projectId/campaigns/:id')
  async getCampaign(
    @GetOrgFromRequest() org: Organization,
    @Param('projectId') projectId: string,
    @Param('id') id: string
  ) {
    const project = await this._projectService.getById(org.id, projectId);
    if (!project) throw new NotFoundException('Project not found');
    const campaign = await this._campaignService.getById(projectId, id);
    if (!campaign) throw new NotFoundException('Campaign not found');
    return campaign;
  }

  @Post('/projects/:projectId/campaigns')
  async createCampaign(
    @GetOrgFromRequest() org: Organization,
    @Param('projectId') projectId: string,
    @Body() body: CampaignDto
  ) {
    const project = await this._projectService.getById(org.id, projectId);
    if (!project) throw new NotFoundException('Project not found');
    return this._campaignService.create(projectId, body);
  }

  @Put('/projects/:projectId/campaigns/:id')
  async updateCampaign(
    @GetOrgFromRequest() org: Organization,
    @Param('projectId') projectId: string,
    @Param('id') id: string,
    @Body() body: Partial<CampaignDto>
  ) {
    const project = await this._projectService.getById(org.id, projectId);
    if (!project) throw new NotFoundException('Project not found');
    return this._campaignService.update(projectId, id, body);
  }

  @Post('/projects/:projectId/campaigns/:id/run')
  async runMarketingTeam(
    @GetOrgFromRequest() org: Organization,
    @Param('projectId') projectId: string,
    @Param('id') id: string
  ) {
    const project = await this._projectService.getById(org.id, projectId);
    if (!project) throw new NotFoundException('Project not found');

    const campaign = await this._campaignService.getById(projectId, id);
    if (!campaign) throw new NotFoundException('Campaign not found');

    // Fire-and-forget — the orchestrator updates the DB progressively.
    // The client polls GET .../campaigns/:id every 5s to track progress.
    this._orchestrator
      .run({
        orgId: org.id,
        projectId,
        campaignId: id,
        project: {
          url: project.url,
          niche: project.niche,
          competitors: (project as any).competitors ?? null,
          targetAudience: (project as any).targetAudience ?? null,
          brandVoice: (project as any).brandVoice ?? null,
          goals: (project as any).goals ?? null,
        },
        campaign: {
          name: campaign.name,
          goal: campaign.goal ?? '',
        },
      })
      .catch(() => {
        // Errors are handled inside the orchestrator; swallow here to avoid
        // unhandled promise rejection crashing the process.
      });

    return { campaignId: id, status: 'RESEARCHING', message: 'AI team started' };
  }

  @Post('/projects/:projectId/campaigns/:id/accept')
  async acceptCampaignPlan(
    @GetOrgFromRequest() org: Organization,
    @Param('projectId') projectId: string,
    @Param('id') id: string,
    @Body() body: { feedback?: string }
  ) {
    const project = await this._projectService.getById(org.id, projectId);
    if (!project) throw new NotFoundException('Project not found');
    const campaign = await this._campaignService.getById(projectId, id);
    if (!campaign) throw new NotFoundException('Campaign not found');
    if (campaign.status !== 'ACTIVE') {
      throw new HttpException('Plan can only be accepted when campaign is ACTIVE', 400);
    }
    return this._campaignService.acceptPlan(campaign.id, body.feedback);
  }

  @Delete('/projects/:projectId/campaigns/:id')
  async deleteCampaign(
    @GetOrgFromRequest() org: Organization,
    @Param('projectId') projectId: string,
    @Param('id') id: string
  ) {
    const project = await this._projectService.getById(org.id, projectId);
    if (!project) throw new NotFoundException('Project not found');
    return this._campaignService.delete(projectId, id);
  }
}

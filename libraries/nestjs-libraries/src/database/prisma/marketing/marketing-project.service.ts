import { Injectable } from '@nestjs/common';
import { MarketingProjectRepository } from '@gitroom/nestjs-libraries/database/prisma/marketing/marketing-project.repository';
import { MarketingProjectDto } from '@gitroom/nestjs-libraries/dtos/marketing/marketing-project.dto';

@Injectable()
export class MarketingProjectService {
  constructor(private _repo: MarketingProjectRepository) {}

  getAll(orgId: string) {
    return this._repo.getAll(orgId);
  }

  getById(orgId: string, id: string) {
    return this._repo.getById(orgId, id);
  }

  create(orgId: string, body: MarketingProjectDto) {
    return this._repo.create(orgId, body);
  }

  update(orgId: string, id: string, body: Partial<MarketingProjectDto>) {
    return this._repo.update(orgId, id, body);
  }

  delete(orgId: string, id: string) {
    return this._repo.delete(orgId, id);
  }
}

import { Injectable } from '@nestjs/common';
import { UserAgentRepository } from '@gitroom/nestjs-libraries/database/prisma/useragents/useragent.repository';
import { UserAgentDto } from '@gitroom/nestjs-libraries/dtos/useragents/useragent.dto';

@Injectable()
export class UserAgentService {
  constructor(private _userAgentRepository: UserAgentRepository) {}

  getAll(orgId: string) {
    return this._userAgentRepository.getAll(orgId);
  }

  getById(orgId: string, id: string) {
    return this._userAgentRepository.getById(orgId, id);
  }

  create(orgId: string, body: UserAgentDto) {
    return this._userAgentRepository.create(orgId, body);
  }

  update(orgId: string, id: string, body: Partial<UserAgentDto>) {
    return this._userAgentRepository.update(orgId, id, body);
  }

  delete(orgId: string, id: string) {
    return this._userAgentRepository.delete(orgId, id);
  }
}

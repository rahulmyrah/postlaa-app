import {
  Body,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  Post,
  Put,
} from '@nestjs/common';
import { GetOrgFromRequest } from '@gitroom/nestjs-libraries/user/org.from.request';
import { Organization } from '@prisma/client';
import { ApiTags } from '@nestjs/swagger';
import { UserAgentService } from '@gitroom/nestjs-libraries/database/prisma/useragents/useragent.service';
import { UserAgentDto } from '@gitroom/nestjs-libraries/dtos/useragents/useragent.dto';

@ApiTags('User Agents')
@Controller('/user-agents')
export class UserAgentController {
  constructor(private _userAgentService: UserAgentService) {}

  @Get('/')
  getAll(@GetOrgFromRequest() org: Organization) {
    return this._userAgentService.getAll(org.id);
  }

  @Get('/:id')
  async getById(
    @GetOrgFromRequest() org: Organization,
    @Param('id') id: string
  ) {
    const agent = await this._userAgentService.getById(org.id, id);
    if (!agent) throw new NotFoundException('Agent not found');
    return agent;
  }

  @Post('/')
  create(
    @GetOrgFromRequest() org: Organization,
    @Body() body: UserAgentDto
  ) {
    return this._userAgentService.create(org.id, body);
  }

  @Put('/:id')
  update(
    @GetOrgFromRequest() org: Organization,
    @Param('id') id: string,
    @Body() body: UserAgentDto
  ) {
    return this._userAgentService.update(org.id, id, body);
  }

  @Delete('/:id')
  delete(
    @GetOrgFromRequest() org: Organization,
    @Param('id') id: string
  ) {
    return this._userAgentService.delete(org.id, id);
  }
}

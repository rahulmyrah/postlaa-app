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
import { MCPClientService } from '@gitroom/nestjs-libraries/database/prisma/mcpclients/mcpclient.service';
import { MCPClientDto } from '@gitroom/nestjs-libraries/dtos/mcpclients/mcpclient.dto';

@ApiTags('MCP Clients')
@Controller('/mcp-clients')
export class MCPClientController {
  constructor(private _mcpClientService: MCPClientService) {}

  @Get('/')
  getAll(@GetOrgFromRequest() org: Organization) {
    return this._mcpClientService.getAll(org.id);
  }

  @Get('/:id')
  async getById(
    @GetOrgFromRequest() org: Organization,
    @Param('id') id: string
  ) {
    const client = await this._mcpClientService.getById(org.id, id);
    if (!client) throw new NotFoundException('MCP client not found');
    return client;
  }

  @Post('/')
  create(
    @GetOrgFromRequest() org: Organization,
    @Body() body: MCPClientDto
  ) {
    return this._mcpClientService.create(org.id, body);
  }

  @Put('/:id')
  update(
    @GetOrgFromRequest() org: Organization,
    @Param('id') id: string,
    @Body() body: MCPClientDto
  ) {
    return this._mcpClientService.update(org.id, id, body);
  }

  @Delete('/:id')
  delete(
    @GetOrgFromRequest() org: Organization,
    @Param('id') id: string
  ) {
    return this._mcpClientService.delete(org.id, id);
  }
}

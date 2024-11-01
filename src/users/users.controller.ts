import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { User } from './dto/create-user.dto';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  create(@Body() userData: User) {
    return this.usersService.create(userData);
  }

  @Post('/response')
  responseEmail(
    @Body() data: { subject: string; title: string; message: string; userEmail: string, userMessage: string },
  ) {
    return this.usersService.responseEmail(data);
  }

  @Post('sendEmailToAll')
  sendEmailToAll(
    @Body()
    {
      subject,
      title,
      message,
      emails,
    }: {
      subject: string;
      title: string;
      message: string;
      emails: string[];
    },
  ) {
    return this.usersService.sendEmailToAll({ subject, title, message, emails });
  }

  @Get()
  findAll() {
    return this.usersService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(Number(id));
  }

  @Patch()
  update(@Body() updatedUserData: User) {
    return this.usersService.update(updatedUserData);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    const res = this.usersService.remove(Number(id));
    return res;
  }
}

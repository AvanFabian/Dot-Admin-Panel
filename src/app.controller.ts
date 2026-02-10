import { Controller, Get, Req, Res } from '@nestjs/common';
import { Request, Response } from 'express';

@Controller()
export class AppController {
  @Get()
  redirectToDashboard(@Req() req: Request, @Res() res: Response) {
    const session = req.session as any;
    if (session.user) {
      return res.redirect('/departments');
    }
    return res.redirect('/auth/login');
  }
}

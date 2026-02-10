import { Controller, Get, Post, Req, Res, Body } from '@nestjs/common';
import { Request, Response } from 'express';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) { }

    @Get('login')
    loginPage(@Req() req: Request, @Res() res: Response) {
        const session = req.session as any;
        // Already logged in? Redirect to dashboard
        if (session.user) {
            return res.redirect('/departments');
        }
        const error = session.flash?.error;
        if (session.flash) delete session.flash.error;

        return res.render('auth/login', {
            layout: 'layouts/main',
            title: 'Login - Admin Panel',
            error,
            isLoginPage: true,
        });
    }

    @Post('login')
    async login(
        @Body() body: { username: string; password: string },
        @Req() req: Request,
        @Res() res: Response,
    ) {
        const { username, password } = body;

        if (!username || !password) {
            const session = req.session as any;
            session.flash = { error: 'Username and password are required.' };
            return res.redirect('/auth/login');
        }

        const user = await this.authService.validateUser(username, password);

        if (!user) {
            const session = req.session as any;
            session.flash = { error: 'Invalid username or password.' };
            return res.redirect('/auth/login');
        }

        const session = req.session as any;
        session.user = {
            id: user.id,
            username: user.username,
            name: user.name,
        };

        return res.redirect('/departments');
    }

    @Get('logout')
    logout(@Req() req: Request, @Res() res: Response) {
        req.session.destroy((err) => {
            if (err) {
                console.error('Session destroy error:', err);
            }
            res.redirect('/auth/login');
        });
    }
}

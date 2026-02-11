import {
    Controller,
    Get,
    Post,
    Put,
    Delete,
    Param,
    Body,
    Query,
    Req,
    Res,
    UseGuards,
    ParseIntPipe,
    HttpException,
    HttpStatus,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { DepartmentService } from './department.service';
import { AuthGuard } from '../common/guards/auth.guard';

@Controller('departments')
@UseGuards(AuthGuard)
export class DepartmentController {
    constructor(private readonly departmentService: DepartmentService) { }

    @Get()
    async index(
        @Query('page') page: string = '1',
        @Query('search') search: string = '',
        @Req() req: Request,
        @Res() res: Response,
    ) {
        const currentPage = parseInt(page) || 1;
        const result = await this.departmentService.findAll(currentPage, 10, search);
        const session = req.session as any;
        const success = session.flash?.success;
        const error = session.flash?.error;
        if (session.flash) {
            delete session.flash.success;
            delete session.flash.error;
        }

        if (req.headers.accept?.includes('application/json')) {
            return res.json(result);
        }

        return res.render('department/index', {
            layout: 'layouts/main',
            title: 'Departments - Admin Panel',
            departments: result.data,
            pagination: {
                page: result.page,
                totalPages: result.totalPages,
                total: result.total,
                limit: result.limit,
            },
            search,
            success,
            error,
            user: session.user,
            activeMenu: 'departments',
        });
    }

    @Get('create')
    createForm(@Req() req: Request, @Res() res: Response) {
        const session = req.session as any;
        return res.render('department/create', {
            layout: 'layouts/main',
            title: 'Create Department - Admin Panel',
            user: session.user,
            activeMenu: 'departments',
        });
    }

    @Post()
    async create(
        @Body() body: { name: string; description: string },
        @Req() req: Request,
        @Res() res: Response,
    ) {
        const session = req.session as any;
        try {
            if (!body.name || body.name.trim() === '') {
                if (req.headers.accept?.includes('application/json')) {
                    return res.status(400).json({ error: 'Department name is required.' });
                }
                session.flash = { error: 'Department name is required.' };
                return res.redirect('/departments/create');
            }

            const department = await this.departmentService.create({
                name: body.name.trim(),
                description: body.description?.trim() || null,
            });

            if (req.headers.accept?.includes('application/json')) {
                return res.status(201).json({ message: 'Department created successfully', department });
            }

            session.flash = { success: 'Department created successfully.' };
            return res.redirect('/departments');
        } catch (error) {
            if (req.headers.accept?.includes('application/json')) {
                return res.status(400).json({ error: (error as Error).message });
            }
            session.flash = { error: 'Failed to create department. ' + (error as Error).message };
            return res.redirect('/departments/create');
        }
    }

    @Get(':id')
    async show(
        @Param('id', ParseIntPipe) id: number,
        @Req() req: Request,
        @Res() res: Response,
    ) {
        const department = await this.departmentService.findOne(id);
        if (!department) {
            throw new HttpException('Department not found', HttpStatus.NOT_FOUND);
        }

        const session = req.session as any;
        if (req.headers.accept?.includes('application/json')) {
            return res.json(department);
        }

        return res.render('department/show', {
            layout: 'layouts/main',
            title: `${department.name} - Department Detail`,
            department,
            user: session.user,
            activeMenu: 'departments',
        });
    }

    @Get(':id/edit')
    async editForm(
        @Param('id', ParseIntPipe) id: number,
        @Req() req: Request,
        @Res() res: Response,
    ) {
        const department = await this.departmentService.findOne(id);
        if (!department) {
            throw new HttpException('Department not found', HttpStatus.NOT_FOUND);
        }

        const session = req.session as any;
        return res.render('department/edit', {
            layout: 'layouts/main',
            title: `Edit ${department.name} - Admin Panel`,
            department,
            user: session.user,
            activeMenu: 'departments',
        });
    }

    @Put(':id')
    async update(
        @Param('id', ParseIntPipe) id: number,
        @Body() body: { name: string; description: string },
        @Req() req: Request,
        @Res() res: Response,
    ) {
        const session = req.session as any;
        try {
            const department = await this.departmentService.findOne(id);
            if (!department) {
                throw new HttpException('Department not found', HttpStatus.NOT_FOUND);
            }

            if (!body.name || body.name.trim() === '') {
                if (req.headers.accept?.includes('application/json')) {
                    return res.status(400).json({ error: 'Department name is required.' });
                }
                session.flash = { error: 'Department name is required.' };
                return res.redirect(`/departments/${id}/edit`);
            }

            await this.departmentService.update(id, {
                name: body.name.trim(),
                description: body.description?.trim() || null,
            });

            const updatedDepartment = await this.departmentService.findOne(id);

            if (req.headers.accept?.includes('application/json')) {
                return res.json({ message: 'Department updated successfully', department: updatedDepartment });
            }

            session.flash = { success: 'Department updated successfully.' };
            return res.redirect('/departments');
        } catch (error) {
            if (error instanceof HttpException) throw error;
            if (req.headers.accept?.includes('application/json')) {
                return res.status(400).json({ error: (error as Error).message });
            }
            session.flash = { error: 'Failed to update department. ' + (error as Error).message };
            return res.redirect(`/departments/${id}/edit`);
        }
    }

    @Delete(':id')
    async remove(
        @Param('id', ParseIntPipe) id: number,
        @Req() req: Request,
        @Res() res: Response,
    ) {
        const session = req.session as any;
        try {
            const department = await this.departmentService.findOne(id);
            if (!department) {
                throw new HttpException('Department not found', HttpStatus.NOT_FOUND);
            }

            await this.departmentService.remove(id);

            if (req.headers.accept?.includes('application/json')) {
                return res.json({ message: 'Department deleted successfully' });
            }

            session.flash = { success: 'Department deleted successfully.' };
            return res.redirect('/departments');
        } catch (error) {
            if (error instanceof HttpException) throw error;
            if (req.headers.accept?.includes('application/json')) {
                return res.status(400).json({ error: (error as Error).message });
            }
            session.flash = { error: 'Failed to delete department. ' + (error as Error).message };
            return res.redirect('/departments');
        }
    }
}

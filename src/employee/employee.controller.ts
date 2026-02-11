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
import { EmployeeService } from './employee.service';
import { DepartmentService } from '../department/department.service';
import { AuthGuard } from '../common/guards/auth.guard';

@Controller('employees')
@UseGuards(AuthGuard)
export class EmployeeController {
    constructor(
        private readonly employeeService: EmployeeService,
        private readonly departmentService: DepartmentService,
    ) { }

    @Get()
    async index(
        @Query('page') page: string = '1',
        @Query('search') search: string = '',
        @Req() req: Request,
        @Res() res: Response,
    ) {
        const currentPage = parseInt(page) || 1;
        const result = await this.employeeService.findAll(currentPage, 10, search);
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

        return res.render('employee/index', {
            layout: 'layouts/main',
            title: 'Employees - Admin Panel',
            employees: result.data,
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
            activeMenu: 'employees',
        });
    }

    @Get('create')
    async createForm(@Req() req: Request, @Res() res: Response) {
        const departments = await this.departmentService.findAllNoPagination();
        const session = req.session as any;
        const error = session.flash?.error;
        if (session.flash) delete session.flash.error;

        return res.render('employee/create', {
            layout: 'layouts/main',
            title: 'Create Employee - Admin Panel',
            departments,
            error,
            user: session.user,
            activeMenu: 'employees',
        });
    }

    @Post()
    async create(
        @Body()
        body: {
            name: string;
            email: string;
            phone: string;
            position: string;
            hire_date: string;
            salary: string;
            department_id: string;
        },
        @Req() req: Request,
        @Res() res: Response,
    ) {
        const session = req.session as any;
        try {
            // Validation
            const errors: string[] = [];
            if (!body.name?.trim()) errors.push('Name is required');
            if (!body.email?.trim()) errors.push('Email is required');
            if (!body.position?.trim()) errors.push('Position is required');
            if (!body.hire_date) errors.push('Hire date is required');
            if (!body.salary) errors.push('Salary is required');
            if (!body.department_id) errors.push('Department is required');

            if (errors.length > 0) {
                if (req.headers.accept?.includes('application/json')) {
                    return res.status(400).json({ error: errors.join(', ') });
                }
                session.flash = { error: errors.join(', ') };
                return res.redirect('/employees/create');
            }

            const employee = await this.employeeService.create({
                name: body.name.trim(),
                email: body.email.trim(),
                phone: body.phone?.trim() || null,
                position: body.position.trim(),
                hire_date: new Date(body.hire_date),
                salary: parseFloat(body.salary),
                department_id: parseInt(body.department_id),
            });

            if (req.headers.accept?.includes('application/json')) {
                return res.status(201).json({ message: 'Employee created successfully', employee });
            }

            session.flash = { success: 'Employee created successfully.' };
            return res.redirect('/employees');
        } catch (error) {
            if (req.headers.accept?.includes('application/json')) {
                return res.status(400).json({ error: (error as Error).message });
            }
            session.flash = {
                error: 'Failed to create employee. ' + (error as Error).message,
            };
            return res.redirect('/employees/create');
        }
    }

    @Get(':id')
    async show(
        @Param('id', ParseIntPipe) id: number,
        @Req() req: Request,
        @Res() res: Response,
    ) {
        const employee = await this.employeeService.findOne(id);
        if (!employee) {
            throw new HttpException('Employee not found', HttpStatus.NOT_FOUND);
        }

        const session = req.session as any;

        if (req.headers.accept?.includes('application/json')) {
            return res.json(employee);
        }

        return res.render('employee/show', {
            layout: 'layouts/main',
            title: `${employee.name} - Employee Detail`,
            employee,
            user: session.user,
            activeMenu: 'employees',
        });
    }

    @Get(':id/edit')
    async editForm(
        @Param('id', ParseIntPipe) id: number,
        @Req() req: Request,
        @Res() res: Response,
    ) {
        const employee = await this.employeeService.findOne(id);
        if (!employee) {
            throw new HttpException('Employee not found', HttpStatus.NOT_FOUND);
        }

        const departments = await this.departmentService.findAllNoPagination();
        const session = req.session as any;
        const error = session.flash?.error;
        if (session.flash) delete session.flash.error;

        return res.render('employee/edit', {
            layout: 'layouts/main',
            title: `Edit ${employee.name} - Admin Panel`,
            employee,
            departments,
            error,
            user: session.user,
            activeMenu: 'employees',
        });
    }

    @Put(':id')
    async update(
        @Param('id', ParseIntPipe) id: number,
        @Body()
        body: {
            name: string;
            email: string;
            phone: string;
            position: string;
            hire_date: string;
            salary: string;
            department_id: string;
        },
        @Req() req: Request,
        @Res() res: Response,
    ) {
        const session = req.session as any;
        try {
            const employee = await this.employeeService.findOne(id);
            if (!employee) {
                throw new HttpException('Employee not found', HttpStatus.NOT_FOUND);
            }

            // Validation
            const errors: string[] = [];
            if (!body.name?.trim()) errors.push('Name is required');
            if (!body.email?.trim()) errors.push('Email is required');
            if (!body.position?.trim()) errors.push('Position is required');
            if (!body.hire_date) errors.push('Hire date is required');
            if (!body.salary) errors.push('Salary is required');
            if (!body.department_id) errors.push('Department is required');

            if (errors.length > 0) {
                if (req.headers.accept?.includes('application/json')) {
                    return res.status(400).json({ error: errors.join(', ') });
                }
                session.flash = { error: errors.join(', ') };
                return res.redirect(`/employees/${id}/edit`);
            }

            await this.employeeService.update(id, {
                name: body.name.trim(),
                email: body.email.trim(),
                phone: body.phone?.trim() || null,
                position: body.position.trim(),
                hire_date: new Date(body.hire_date),
                salary: parseFloat(body.salary),
                department_id: parseInt(body.department_id),
            });

            const updatedEmployee = await this.employeeService.findOne(id);

            if (req.headers.accept?.includes('application/json')) {
                return res.json({ message: 'Employee updated successfully', employee: updatedEmployee });
            }

            session.flash = { success: 'Employee updated successfully.' };
            return res.redirect('/employees');
        } catch (error) {
            if (error instanceof HttpException) throw error;
            if (req.headers.accept?.includes('application/json')) {
                return res.status(400).json({ error: (error as Error).message });
            }
            session.flash = {
                error: 'Failed to update employee. ' + (error as Error).message,
            };
            return res.redirect(`/employees/${id}/edit`);
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
            const employee = await this.employeeService.findOne(id);
            if (!employee) {
                throw new HttpException('Employee not found', HttpStatus.NOT_FOUND);
            }

            await this.employeeService.remove(id);

            if (req.headers.accept?.includes('application/json')) {
                return res.json({ message: 'Employee deleted successfully' });
            }

            session.flash = { success: 'Employee deleted successfully.' };
            return res.redirect('/employees');
        } catch (error) {
            if (error instanceof HttpException) throw error;
            if (req.headers.accept?.includes('application/json')) {
                return res.status(400).json({ error: (error as Error).message });
            }
            session.flash = {
                error: 'Failed to delete employee. ' + (error as Error).message,
            };
            return res.redirect('/employees');
        }
    }
}

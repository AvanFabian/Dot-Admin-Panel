import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';
import { Employee } from './entities/employee.entity';
import { PaginatedResult } from '../department/department.service';

@Injectable()
export class EmployeeService {
    constructor(
        @InjectRepository(Employee)
        private readonly employeeRepository: Repository<Employee>,
    ) { }

    async findAll(
        page: number = 1,
        limit: number = 10,
        search?: string,
    ): Promise<PaginatedResult<Employee>> {
        const skip = (page - 1) * limit;

        const queryBuilder = this.employeeRepository
            .createQueryBuilder('employee')
            .leftJoinAndSelect('employee.department', 'department')
            .orderBy('employee.created_at', 'ASC')
            .skip(skip)
            .take(limit);

        if (search) {
            queryBuilder.where(
                'employee.name ILIKE :search OR employee.email ILIKE :search OR employee.position ILIKE :search OR department.name ILIKE :search',
                { search: `%${search}%` },
            );
        }

        const [data, total] = await queryBuilder.getManyAndCount();

        return {
            data,
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
        };
    }

    async findOne(id: number): Promise<Employee | null> {
        return this.employeeRepository.findOne({
            where: { id },
            relations: ['department'],
        });
    }

    async create(data: Partial<Employee>): Promise<Employee> {
        const employee = this.employeeRepository.create(data);
        return this.employeeRepository.save(employee);
    }

    async update(id: number, data: Partial<Employee>): Promise<Employee | null> {
        await this.employeeRepository.update(id, data);
        return this.findOne(id);
    }

    async remove(id: number): Promise<void> {
        await this.employeeRepository.delete(id);
    }

    async count(): Promise<number> {
        return this.employeeRepository.count();
    }
}

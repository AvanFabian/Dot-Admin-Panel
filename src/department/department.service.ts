import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';
import { Department } from './entities/department.entity';

export interface PaginatedResult<T> {
    data: T[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}

@Injectable()
export class DepartmentService {
    constructor(
        @InjectRepository(Department)
        private readonly departmentRepository: Repository<Department>,
    ) { }

    async findAll(
        page: number = 1,
        limit: number = 10,
        search?: string,
    ): Promise<PaginatedResult<Department>> {
        const skip = (page - 1) * limit;

        const whereCondition = search
            ? [
                { name: Like(`%${search}%`) },
                { description: Like(`%${search}%`) },
            ]
            : {};

        const [data, total] = await this.departmentRepository.findAndCount({
            where: whereCondition,
            relations: ['employees'],
            order: { created_at: 'DESC' },
            skip,
            take: limit,
        });

        return {
            data,
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
        };
    }

    async findOne(id: number): Promise<Department | null> {
        return this.departmentRepository.findOne({
            where: { id },
            relations: ['employees'],
        });
    }

    async findAllNoPagination(): Promise<Department[]> {
        return this.departmentRepository.find({
            order: { name: 'ASC' },
        });
    }

    async create(data: Partial<Department>): Promise<Department> {
        const department = this.departmentRepository.create(data);
        return this.departmentRepository.save(department);
    }

    async update(id: number, data: Partial<Department>): Promise<Department | null> {
        await this.departmentRepository.update(id, data);
        return this.findOne(id);
    }

    async remove(id: number): Promise<void> {
        await this.departmentRepository.delete(id);
    }

    async count(): Promise<number> {
        return this.departmentRepository.count();
    }
}

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SeedService } from './seed.service';
import { Department } from '../department/entities/department.entity';
import { Employee } from '../employee/entities/employee.entity';

@Module({
    imports: [TypeOrmModule.forFeature([Department, Employee])],
    providers: [SeedService],
    exports: [SeedService],
})
export class SeedModule { }

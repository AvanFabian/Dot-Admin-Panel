import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Department } from '../department/entities/department.entity';
import { Employee } from '../employee/entities/employee.entity';

@Injectable()
export class SeedService implements OnModuleInit {
    constructor(
        @InjectRepository(Department)
        private readonly departmentRepository: Repository<Department>,
        @InjectRepository(Employee)
        private readonly employeeRepository: Repository<Employee>,
    ) { }

    async onModuleInit() {
        await this.seedDepartments();
        await this.seedEmployees();
    }

    private async seedDepartments() {
        const count = await this.departmentRepository.count();
        if (count > 0) return;

        const departments = [
            { name: 'Human Resources', description: 'Managing employee relations and recruitment.' },
            { name: 'Engineering', description: 'Product development and technical operations.' },
            { name: 'Marketing', description: 'Brand management and customer outreach.' },
            { name: 'Sales', description: 'Revenue generation and client partnerships.' },
            { name: 'Finance', description: 'Financial planning and accounting.' },
        ];

        for (const dept of departments) {
            const department = this.departmentRepository.create(dept);
            await this.departmentRepository.save(department);
        }
        console.log('Sample departments seeded.');
    }

    private async seedEmployees() {
        const count = await this.employeeRepository.count();
        if (count > 0) return;

        const depts = await this.departmentRepository.find();
        if (depts.length === 0) return;

        const names = [
            'Alice Johnson', 'Bob Smith', 'Charlie Brown', 'Diana Prince', 'Edward Norton',
            'Fiona Gallagher', 'George Clooney', 'Hannah Abbott', 'Ian Wright', 'Jane Doe',
            'Kevin Hart', 'Laura Palmer', 'Michael Jordan', 'Nina Simone', 'Oscar Isaac',
            'Peter Parker', 'Quinn Fabray', 'Rachel Green', 'Steven Strange', 'Tony Stark'
        ];

        const positions = ['Manager', 'Senior Developer', 'Junior Developer', 'Specialist', 'Analyst', 'Lead'];

        for (let i = 0; i < names.length; i++) {
            const randomDept = depts[Math.floor(Math.random() * depts.length)];
            const randomPos = positions[Math.floor(Math.random() * positions.length)];

            const employee = this.employeeRepository.create({
                name: names[i],
                email: `${names[i].toLowerCase().replace(' ', '.')}@example.com`,
                phone: `0812${Math.floor(10000000 + Math.random() * 90000000)}`,
                position: randomPos,
                hire_date: new Date(2023, Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1),
                salary: Math.floor(5000000 + Math.random() * 20000000),
                department: randomDept,
            });
            await this.employeeRepository.save(employee);
        }
        console.log('Sample employees seeded.');
    }
}

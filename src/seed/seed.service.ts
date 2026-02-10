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
        const departments = [
            { name: 'Human Resources', description: 'Managing employee relations and recruitment.' },
            { name: 'Engineering', description: 'Product development and technical operations.' },
            { name: 'Marketing', description: 'Brand management and customer outreach.' },
            { name: 'Sales', description: 'Revenue generation and client partnerships.' },
            { name: 'Finance', description: 'Financial planning and accounting.' },
        ];

        for (const dept of departments) {
            const exists = await this.departmentRepository.findOne({ where: { name: dept.name } });
            if (!exists) {
                const department = this.departmentRepository.create(dept);
                await this.departmentRepository.save(department);
                console.log(`Department ${dept.name} seeded.`);
            }
        }
    }

    private async seedEmployees() {
        const depts = await this.departmentRepository.find();
        if (depts.length === 0) return;

        const employees = [
            { name: 'Alice Johnson', email: 'alice.johnson@example.com' },
            { name: 'Bob Smith', email: 'bob.smith@example.com' },
            { name: 'Charlie Brown', email: 'charlie.brown@example.com' },
            { name: 'Diana Prince', email: 'diana.prince@example.com' },
            { name: 'Edward Norton', email: 'edward.norton@example.com' },
            { name: 'Fiona Gallagher', email: 'fiona.gallagher@example.com' },
            { name: 'George Clooney', email: 'george.clooney@example.com' },
            { name: 'Hannah Abbott', email: 'hannah.abbott@example.com' },
            { name: 'Ian Wright', email: 'ian.wright@example.com' },
            { name: 'Jane Doe', email: 'jane.doe@example.com' },
            { name: 'Kevin Hart', email: 'kevin.hart@example.com' },
            { name: 'Laura Palmer', email: 'laura.palmer@example.com' },
            { name: 'Michael Jordan', email: 'michael.jordan@example.com' },
            { name: 'Nina Simone', email: 'nina.simone@example.com' },
            { name: 'Oscar Isaac', email: 'oscar.isaac@example.com' },
            { name: 'Peter Parker', email: 'peter.parker@example.com' },
            { name: 'Quinn Fabray', email: 'quinn.fabray@example.com' },
            { name: 'Rachel Green', email: 'rachel.green@example.com' },
            { name: 'Steven Strange', email: 'steven.strange@example.com' },
            { name: 'Tony Stark', email: 'tony.stark@example.com' },
        ];

        const positions = ['Manager', 'Senior Developer', 'Junior Developer', 'Specialist', 'Analyst', 'Lead'];

        for (const empData of employees) {
            const exists = await this.employeeRepository.findOne({ where: { email: empData.email } });
            if (!exists) {
                const randomDept = depts[Math.floor(Math.random() * depts.length)];
                const randomPos = positions[Math.floor(Math.random() * positions.length)];

                const employee = this.employeeRepository.create({
                    ...empData,
                    phone: `0812${Math.floor(10000000 + Math.random() * 90000000)}`,
                    position: randomPos,
                    hire_date: new Date(2023, Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1),
                    salary: Math.floor(5000000 + Math.random() * 20000000),
                    department: randomDept,
                });
                await this.employeeRepository.save(employee);
                console.log(`Employee ${empData.name} seeded.`);
            }
        }
    }
}

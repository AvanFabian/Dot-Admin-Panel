import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    ManyToOne,
    JoinColumn,
} from 'typeorm';
import { Department } from '../../department/entities/department.entity';

@Entity('employees')
export class Employee {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ length: 100 })
    name: string;

    @Column({ length: 100 })
    email: string;

    @Column({ length: 20, nullable: true })
    phone: string;

    @Column({ length: 100 })
    position: string;

    @Column({ type: 'date' })
    hire_date: Date;

    @Column({ type: 'decimal', precision: 12, scale: 2 })
    salary: number;

    @ManyToOne(() => Department, (department) => department.employees, {
        onDelete: 'CASCADE',
    })
    @JoinColumn({ name: 'department_id' })
    department: Department;

    @Column()
    department_id: number;

    @CreateDateColumn()
    created_at: Date;

    @UpdateDateColumn()
    updated_at: Date;
}

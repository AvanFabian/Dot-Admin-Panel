import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AuthModule } from './auth/auth.module';
import { DepartmentModule } from './department/department.module';
import { EmployeeModule } from './employee/employee.module';
import { Department } from './department/entities/department.entity';
import { Employee } from './employee/entities/employee.entity';
import { User } from './auth/entities/user.entity';
import { SeedModule } from './seed/seed.module';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: '127.0.0.1',
      port: 5432,
      username: 'postgres',
      password: 'bian2004',
      database: 'dot_admin_panel',
      entities: [Department, Employee, User],
      synchronize: true, // Auto-create tables (dev only)
    }),
    AuthModule,
    DepartmentModule,
    EmployeeModule,
    SeedModule,
  ],
  controllers: [AppController],
  providers: [],
})
export class AppModule { }

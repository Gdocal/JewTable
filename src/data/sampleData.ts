/**
 * Sample data for testing DataTable
 */

import { DataTableColumnDef } from '../components/DataTable/types/column.types';
import { CellType } from '../components/DataTable/types/cell.types';
import { RowData } from '../components/DataTable/types/table.types';

export interface Employee extends RowData {
  id: string;
  name: string;
  position: string;
  department: string;
  salary: number;
  commission: number;
  startDate: Date;
  active: boolean;
}

export const employeeColumns: DataTableColumnDef<Employee>[] = [
  {
    accessorKey: 'name',
    header: 'Name',
    cellType: CellType.TEXT,
  },
  {
    accessorKey: 'position',
    header: 'Position',
    cellType: CellType.TEXT,
  },
  {
    accessorKey: 'department',
    header: 'Department',
    cellType: CellType.TEXT,
  },
  {
    accessorKey: 'salary',
    header: 'Salary',
    cellType: CellType.NUMBER,
    cellOptions: {
      numberFormat: 'currency',
      decimals: 0,
      currencySymbol: '$',
    },
  },
  {
    accessorKey: 'commission',
    header: 'Commission',
    cellType: CellType.NUMBER,
    cellOptions: {
      numberFormat: 'percent',
      decimals: 1,
    },
  },
  {
    accessorKey: 'startDate',
    header: 'Start Date',
    cellType: CellType.DATE,
  },
  {
    accessorKey: 'active',
    header: 'Active',
    cellType: CellType.CHECKBOX,
  },
];

export const employeeData: Employee[] = [
  {
    id: '1',
    name: 'Oleksandr Petrenko',
    position: 'Senior Developer',
    department: 'Engineering',
    salary: 95000,
    commission: 0.15,
    startDate: new Date('2020-03-15'),
    active: true,
  },
  {
    id: '2',
    name: 'Mariya Kovalenko',
    position: 'Product Manager',
    department: 'Product',
    salary: 105000,
    commission: 0.12,
    startDate: new Date('2019-07-22'),
    active: true,
  },
  {
    id: '3',
    name: 'Ivan Shevchenko',
    position: 'UX Designer',
    department: 'Design',
    salary: 78000,
    commission: 0.08,
    startDate: new Date('2021-01-10'),
    active: true,
  },
  {
    id: '4',
    name: 'Anna Bondarenko',
    position: 'DevOps Engineer',
    department: 'Engineering',
    salary: 92000,
    commission: 0.10,
    startDate: new Date('2020-11-05'),
    active: true,
  },
  {
    id: '5',
    name: 'Dmytro Lysenko',
    position: 'Junior Developer',
    department: 'Engineering',
    salary: 62000,
    commission: 0.05,
    startDate: new Date('2022-06-01'),
    active: true,
  },
  {
    id: '6',
    name: 'Kateryna Moroz',
    position: 'Marketing Manager',
    department: 'Marketing',
    salary: 88000,
    commission: 0.20,
    startDate: new Date('2021-09-14'),
    active: true,
  },
  {
    id: '7',
    name: 'Serhiy Kravchenko',
    position: 'Sales Representative',
    department: 'Sales',
    salary: 72000,
    commission: 0.25,
    startDate: new Date('2022-02-20'),
    active: true,
  },
  {
    id: '8',
    name: 'Oksana Melnyk',
    position: 'HR Manager',
    department: 'Human Resources',
    salary: 82000,
    commission: 0.08,
    startDate: new Date('2019-12-01'),
    active: true,
  },
  {
    id: '9',
    name: 'Yuriy Tkachenko',
    position: 'QA Engineer',
    department: 'Engineering',
    salary: 75000,
    commission: 0.07,
    startDate: new Date('2021-05-18'),
    active: false,
  },
  {
    id: '10',
    name: 'Natalia Kovalchuk',
    position: 'Content Writer',
    department: 'Marketing',
    salary: 58000,
    commission: 0.06,
    startDate: new Date('2022-08-25'),
    active: true,
  },
  {
    id: '11',
    name: 'Andriy Savchenko',
    position: 'Data Analyst',
    department: 'Analytics',
    salary: 85000,
    commission: 0.09,
    startDate: new Date('2020-10-12'),
    active: true,
  },
  {
    id: '12',
    name: 'Tetiana Koval',
    position: 'Customer Support',
    department: 'Support',
    salary: 55000,
    commission: 0.04,
    startDate: new Date('2023-01-09'),
    active: true,
  },
  {
    id: '13',
    name: 'Volodymyr Pavlenko',
    position: 'Tech Lead',
    department: 'Engineering',
    salary: 125000,
    commission: 0.18,
    startDate: new Date('2018-04-03'),
    active: true,
  },
  {
    id: '14',
    name: 'Iryna Sobko',
    position: 'Financial Analyst',
    department: 'Finance',
    salary: 79000,
    commission: 0.07,
    startDate: new Date('2021-11-22'),
    active: true,
  },
  {
    id: '15',
    name: 'Maksym Rudenko',
    position: 'System Administrator',
    department: 'IT',
    salary: 70000,
    commission: 0.06,
    startDate: new Date('2022-03-30'),
    active: false,
  },
];

/**
 * Generate a large dataset for testing virtualization (Phase 7)
 * @param count - Number of rows to generate (default: 5000)
 * @returns Array of Employee records
 */
export function generateLargeDataset(count: number = 5000): Employee[] {
  const firstNames = [
    'Oleksandr', 'Mariya', 'Ivan', 'Anna', 'Dmytro', 'Kateryna', 'Serhiy', 'Oksana',
    'Yuriy', 'Natalia', 'Andriy', 'Tetiana', 'Volodymyr', 'Iryna', 'Maksym', 'Olena',
    'Vasyl', 'Svitlana', 'Mykola', 'Yulia', 'Petro', 'Oksana', 'Viktor', 'Ludmila',
  ];

  const lastNames = [
    'Petrenko', 'Kovalenko', 'Shevchenko', 'Bondarenko', 'Lysenko', 'Moroz', 'Kravchenko',
    'Melnyk', 'Tkachenko', 'Kovalchuk', 'Savchenko', 'Koval', 'Pavlenko', 'Sobko', 'Rudenko',
    'Polishchuk', 'Boyko', 'Kozak', 'Tkachuk', 'Marchenko', 'Symonenko', 'Levchenko',
  ];

  const positions = [
    'Senior Developer', 'Junior Developer', 'Product Manager', 'UX Designer', 'DevOps Engineer',
    'Marketing Manager', 'Sales Representative', 'HR Manager', 'QA Engineer', 'Content Writer',
    'Data Analyst', 'Customer Support', 'Tech Lead', 'Financial Analyst', 'System Administrator',
  ];

  const departments = [
    'Engineering', 'Product', 'Design', 'Marketing', 'Sales', 'Human Resources',
    'Analytics', 'Support', 'Finance', 'IT',
  ];

  const result: Employee[] = [];
  const startYear = 2018;
  const endYear = 2024;

  for (let i = 0; i < count; i++) {
    const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
    const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
    const position = positions[Math.floor(Math.random() * positions.length)];
    const department = departments[Math.floor(Math.random() * departments.length)];

    // Generate random date between startYear and endYear
    const startDate = new Date(
      startYear + Math.floor(Math.random() * (endYear - startYear + 1)),
      Math.floor(Math.random() * 12),
      Math.floor(Math.random() * 28) + 1
    );

    result.push({
      id: `${i + 1}`,
      name: `${firstName} ${lastName}`,
      position,
      department,
      salary: Math.floor(Math.random() * (150000 - 50000) + 50000),
      commission: Math.random() * 0.3,
      startDate,
      active: Math.random() > 0.1, // 90% active
    });
  }

  return result;
}

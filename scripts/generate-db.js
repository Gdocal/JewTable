/**
 * Generate db.json for json-server mock API
 * Phase 8: Server Integration
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Mock data generation (similar to sampleData.ts)
function generateLargeDataset(count = 5000) {
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

  const result = [];
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
      startDate: startDate.toISOString(),
      active: Math.random() > 0.1, // 90% active
    });
  }

  return result;
}

// Generate database
const db = {
  employees: generateLargeDataset(5000),
};

// Write to db.json
const dbPath = path.join(__dirname, '..', 'db.json');
fs.writeFileSync(dbPath, JSON.stringify(db, null, 2));

console.log(`✅ Generated db.json with ${db.employees.length} employees`);
console.log(`📁 Location: ${dbPath}`);
console.log(`🚀 Run: npm run api`);

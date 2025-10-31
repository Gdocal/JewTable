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

  // Map to match mock API departments (id: 1-8)
  const departmentMap = [
    { id: 1, name: 'Engineering' },
    { id: 2, name: 'Sales' },
    { id: 3, name: 'Marketing' },
    { id: 4, name: 'Human Resources' },
    { id: 5, name: 'Finance' },
    { id: 6, name: 'Operations' },
    { id: 7, name: 'Customer Support' },
    { id: 8, name: 'Research & Development' },
  ];

  const statuses = [
    { label: 'Active', variant: 'success', icon: '✓' },
    { label: 'On Leave', variant: 'warning', icon: '⏸' },
    { label: 'Training', variant: 'info', icon: '📚' },
    { label: 'Probation', variant: 'warning', icon: '⚠' },
    { label: 'New Hire', variant: 'primary', icon: '🆕' },
    { label: 'Lead', variant: 'info', icon: '★' },
    { label: 'Inactive', variant: 'secondary', icon: '○' },
  ];

  const result = [];
  const startYear = 2018;
  const endYear = 2024;

  for (let i = 0; i < count; i++) {
    const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
    const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
    const position = positions[Math.floor(Math.random() * positions.length)];

    // Pick random department with ID
    const departmentData = departmentMap[Math.floor(Math.random() * departmentMap.length)];

    const isActive = Math.random() > 0.1; // 90% active

    // Generate random date between startYear and endYear
    const startDate = new Date(
      startYear + Math.floor(Math.random() * (endYear - startYear + 1)),
      Math.floor(Math.random() * 12),
      Math.floor(Math.random() * 28) + 1
    );

    // Generate random status (favor Active for active employees)
    let status;
    let statusId;
    if (!isActive) {
      status = { label: 'Inactive', variant: 'secondary', icon: '○' };
      statusId = 2; // Inactive ID
    } else {
      const statusIndex = Math.floor(Math.random() * (statuses.length - 1)); // Exclude Inactive
      status = statuses[statusIndex];
      // Map to reference status IDs (mostly Active)
      statusId = Math.random() > 0.8 ? 3 : 1; // 80% Active (1), 20% Pending (3)
    }

    // Generate random performance (0-100, favor 60-90 range)
    const performance = Math.floor(Math.random() * 40 + 60); // 60-100 range

    result.push({
      id: `${i + 1}`,
      name: `${firstName} ${lastName}`,
      position,
      department: departmentData.name,
      departmentId: departmentData.id,
      salary: Math.floor(Math.random() * (150000 - 50000) + 50000),
      commission: Math.random() * 0.3,
      startDate: startDate.toISOString(),
      active: isActive,
      status,
      statusId,
      performance,
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

const fs = require('fs');

const files = [
  'src/app/staff/tasks/page.tsx',
  'src/app/staff/history/page.tsx',
  'src/app/private/billing/page.tsx',
  'src/app/patient-portal/history/page.tsx',
  'src/app/lab/page.tsx',
  'src/app/doctor/reports/page.tsx',
  'src/app/doctor/page.tsx',
  'src/app/doctor/appointments/page.tsx',
  'src/app/admin/page.tsx'
];

files.forEach(file => {
  if (!fs.existsSync(file)) return;
  
  let content = fs.readFileSync(file, 'utf8');
  let original = content;

  // 1. Remove Tabs, Tab from HeroUI
  content = content.replace(/, Tabs, Tab/, '');
  content = content.replace(/Tabs, Tab, /, '');
  content = content.replace(/, Tabs/, '');
  content = content.replace(/Tabs, /, '');
  content = content.replace(/, Tab/, '');
  content = content.replace(/Tab, /, '');

  // 2. Import them from our component
  if (content !== original && !content.includes('ClientTabs')) {
    const importStatement = `\nimport { Tabs, Tab } from "@/components/ui/ClientTabs";`;
    content = content.replace('"lucide-react";', '"lucide-react";' + importStatement);
    
    fs.writeFileSync(file, content);
    console.log('Patched:', file);
  }
});

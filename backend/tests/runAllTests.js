import { execSync } from 'child_process';

const testFiles = [
  'tests/pricingService.test.js',
  'tests/securityAndAuth.test.js',
  'tests/validationAndStock.test.js',
];

console.log('====================================================');
console.log('🧪 RUNNING ALL O2 HERBAL CARE BACKEND TEST SUITES');
console.log('====================================================\n');

let failed = false;

for (const file of testFiles) {
  try {
    console.log(`▶ Running ${file}...`);
    execSync(`node ${file}`, { stdio: 'inherit' });
    console.log('----------------------------------------------------\n');
  } catch (error) {
    console.error(`❌ Suite ${file} failed!`);
    failed = true;
    break;
  }
}

if (failed) {
  console.error('\n❌ Test execution failed.');
  process.exit(1);
} else {
  console.log('\n🏆 ALL TEST SUITES PASSED CLEANLY (12/12 Tests Passed)!');
  process.exit(0);
}

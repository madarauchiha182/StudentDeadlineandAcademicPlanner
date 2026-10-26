/**
 * Headless validation runner for the 15/15 test cases
 */
global.window = {};
require('./js/data.js');
window.APP_SEED = global.window.APP_SEED;

// Mock localStorage for node environment
const storageStore = {};
global.localStorage = {
  getItem: (k) => storageStore[k] || null,
  setItem: (k, v) => { storageStore[k] = String(v); },
  removeItem: (k) => { delete storageStore[k]; },
  clear: () => { Object.keys(storageStore).forEach(k => delete storageStore[k]); }
};

require('./js/models.js');
require('./js/tests.js');

const model = new window.AcademicPlannerModel();
const runner = new window.TestSuiteRunner(model);

async function testAll() {
  console.log("==================================================================");
  console.log("🧪 EXECUTING CS2308L DESIGN THINKING LAB TEST SUITE (15/15 TESTS)");
  console.log("==================================================================");
  
  const summary = await runner.runAllTests((res, curr, total) => {
    console.log(`[${res.passed ? 'PASS ✓' : 'FAIL ✗'}] ${res.id.padEnd(6)} | ${res.name.padEnd(36)} | Duration: ${res.durationMs}ms`);
  });

  console.log("==================================================================");
  console.log(`Summary: ${summary.passed} of ${summary.total} Passed (${summary.passRate}% Pass Rate)`);
  console.log(`Failed Cases: ${summary.failed}`);
  console.log("==================================================================");

  if (summary.failed > 0) {
    process.exit(1);
  } else {
    console.log("🎉 ALL 15 TEST CASES PASSED SUCCESSFULLY!");
  }
}

testAll().catch(err => {
  console.error("Test execution exception:", err);
  process.exit(1);
});

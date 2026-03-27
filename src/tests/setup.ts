// Set CLI args before any module loads so yargs doesn't exit
process.argv = [
  "node",
  "test",
  "--organizze-username=test@example.com",
  "--organizze-api-key=test-api-key",
];

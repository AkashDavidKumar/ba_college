/**
 * setup.ts — Jest setupFiles entry
 *
 * Runs in EACH test worker process before any module is required.
 * Sets environment variables so tests are self-contained and do not
 * require a .env file.
 *
 * Note: This is a setupFiles file (not globalSetup), so it runs in the
 * same process as the tests and its process.env changes ARE visible
 * to all modules imported during tests.
 */

// Set a complete, valid environment for all tests
process.env['NODE_ENV'] = 'test';
process.env['PORT'] = '5002';
process.env['MONGODB_URI'] = 'mongodb://localhost:27017/bac_test';
process.env['CORS_ORIGINS'] = 'http://localhost:3000';
process.env['TRUST_PROXY'] = '0';
process.env['LOG_LEVEL'] = 'silent';
process.env['REQUEST_ID_HEADER'] = 'X-Request-Id';
process.env['JWT_SECRET'] = 'test_jwt_secret_with_more_than_32_characters_for_unit_tests';
process.env['JWT_EXPIRES_IN'] = '8h';
process.env['COOKIE_SECRET'] = 'test_cookie_secret_12345';

// Set CI_NO_MONGO=1 to skip DB-available health tests unless overridden
if (!process.env['CI_NO_MONGO']) {
  process.env['CI_NO_MONGO'] = '1';
}

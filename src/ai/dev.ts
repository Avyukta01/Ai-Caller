
import { initializeDatabase } from '@/lib/db';

// Flows will be imported for their side effects in this file.

async function main() {
  console.log('Attempting to initialize database and add sample users...');
  try {
    await initializeDatabase(); // Ensure this promise is awaited
    console.log('Database initialization process completed successfully (see logs above for details).');
    console.log('Sample user credentials for testing (from Users table):');
    console.log('  Super Admin Panel -> User Identifier: testUser, Password: password123');
    console.log('  Client Admin Panel -> User Identifier: clientTestUser, Password: password123');
    console.log('  Client Admin Panel (Dinesh) -> User Identifier: dineshUser, Password: password123');

  } catch (error) {
    console.error('Failed to initialize database during dev startup:', error);
    console.error('Please ensure your database server is running and credentials in .env.local are correct.');
    // Optionally, re-throw or process.exit if this is critical for dev startup
    // throw error; 
  }
}

// Run the main function
main().catch(error => {
  console.error('Error running main function in dev.ts:', error);
  // Optionally exit if critical, but for dev server, logging might be enough
  // process.exit(1); 
});

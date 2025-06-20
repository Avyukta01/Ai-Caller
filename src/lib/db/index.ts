
'use server';
// Next.js automatically loads .env.local and other .env files.
// Ensure your DB_HOST, DB_USER, DB_PASSWORD, DB_NAME are in .env.local

import mysql from 'mysql2/promise';
import bcrypt from 'bcryptjs';

const dbConfig = {
  host: process.env.DB_HOST|| '',
  user: process.env.DB_USER || '',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || '',
};

let connection: mysql.Connection | null = null;

export async function getDbConnection(): Promise<mysql.Connection> {
  const loggableConfig = { ...dbConfig, password: dbConfig.password ? '********' : undefined };
  console.log('Effective DB config being used for connection attempt:', loggableConfig);

  if (connection){
    try {
      await connection.ping();
      console.log('DB connection ping successful.');
      return connection;
    } catch (pingError) {
      console.warn('DB ping failed. Reconnecting...', pingError);
      try {
        await connection.end();
      } catch (endError) {
        console.warn('Error closing stale DB connection:', endError);
      }
      connection = null;
    }
  }

  try {
    connection = await mysql.createConnection(dbConfig);
    console.log(`Successfully connected to database '${dbConfig.database}' on host '${dbConfig.host}'.`);
    return connection;
  } catch (error) {
    console.error('DB connection error:', error);
    throw new Error('Could not connect to DB.');
  }
}

export async function closeDbConnection(): Promise<void> {
  if (connection) {
    try {
      await connection.end();
      console.log('Connection closed.');
      connection = null;
    } catch (error) {
      console.error('Close error:', error);
    }
  }
}

async function initializeUsersTable(): Promise<void> {
  const conn = await getDbConnection();
  await conn.execute(`
    CREATE TABLE IF NOT EXISTS Users (
      id INT AUTO_INCREMENT PRIMARY KEY,
      user_identifier VARCHAR(255) NOT NULL UNIQUE,
      password_hash VARCHAR(255) NOT NULL,
      full_name VARCHAR(255),
      email VARCHAR(255) UNIQUE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    );
  `);
  console.log("Users table checked/created successfully.");
}

interface SampleUserCredentials {
  userIdentifier: string;
  plainPassword_DO_NOT_USE_IN_PROD: string;
  roleHint: 'super_admin' | 'client_admin';
}

async function addSpecificSampleUser(
  userIdentifier: string,
  plainPassword: string,
  roleHint: 'super_admin' | 'client_admin',
  fullName?: string,
  email?: string
): Promise<SampleUserCredentials | null> {
  const conn = await getDbConnection();
  const [rows] = await conn.execute<mysql.RowDataPacket[]>(
    'SELECT user_identifier FROM Users WHERE user_identifier = ?',
    [userIdentifier]
  );

  if (rows.length > 0) {
    console.log(`User '${userIdentifier}' already exists in Users table.`);
    return { userIdentifier, plainPassword_DO_NOT_USE_IN_PROD: plainPassword, roleHint };
  }

  const hashedPassword = await bcrypt.hash(plainPassword, 10);
  await conn.execute(
    'INSERT INTO Users (user_identifier, password_hash, full_name, email) VALUES (?, ?, ?, ?)',
    [userIdentifier, hashedPassword, fullName || userIdentifier, email || `${userIdentifier}@example.com`]
  );
  console.log(`User '${userIdentifier}' added to Users table successfully.`);
  return { userIdentifier, plainPassword_DO_NOT_USE_IN_PROD: plainPassword, roleHint };
}

export async function initializeDatabase(): Promise<void> {
  try {
    console.log("Starting database initialization...");
    const conn = await getDbConnection();
    
    console.log("Dropping 'Users' table if it exists for a clean setup...");
    await conn.execute('DROP TABLE IF EXISTS Users;');
    console.log("'Users' table dropped successfully (or did not exist).");
    
    await initializeUsersTable();

    console.log("Adding sample users...");
    const superAdminUser = await addSpecificSampleUser('testUser', 'password123', 'super_admin', 'Test Super Admin', 'superadmin@example.com');
    const clientAdminUser = await addSpecificSampleUser('clientTestUser', 'password123', 'client_admin', 'Test Client Admin', 'clientadmin@example.com');
    const dineshUser = await addSpecificSampleUser('dineshUser', 'password123', 'client_admin', 'Dinesh', 'dinesh@example.com');


    console.log("--- Sample User Credentials (for Users table) ---");
    if (superAdminUser) {
      console.log(`Super Admin -> User Identifier: ${superAdminUser.userIdentifier}, Password: ${superAdminUser.plainPassword_DO_NOT_USE_IN_PROD}`);
    }
    if (clientAdminUser) {
      console.log(`Client Admin -> User Identifier: ${clientAdminUser.userIdentifier}, Password: ${clientAdminUser.plainPassword_DO_NOT_USE_IN_PROD}`);
    }
    if (dineshUser) {
      console.log(`Client Admin (Dinesh) -> User Identifier: ${dineshUser.userIdentifier}, Password: ${dineshUser.plainPassword_DO_NOT_USE_IN_PROD}`);
    }
    console.log("Database initialization process completed.");
  } catch (err) {
    console.error("DB initialization failed:", err);
    throw err; 
  }
}

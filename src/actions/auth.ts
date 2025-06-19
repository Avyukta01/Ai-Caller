'use server';

import { z } from 'zod';
import bcrypt from 'bcryptjs';
import { getDbConnection } from '@/lib/db';
import type { RowDataPacket } from 'mysql2';

const signInSchema = z.object({
  user_Id: z.string().min(1, { message: "User ID is required." }), // Will map to user_identifier
  password: z.string().min(1, { message: "Password is required." }),
});

export async function signInUserAction(values: z.infer<typeof signInSchema>) {
  const validatedFields = signInSchema.safeParse(values);
  if (!validatedFields.success) {
    return { success: false, message: 'Invalid input.', user: null };
  }

  const { user_Id: userIdentifier, password: inputPassword } = validatedFields.data;

  // Static test credentials for admin panel access
  if (userIdentifier === 'admin' && inputPassword === 'admin123') {
    return {
      success: true,
      message: 'Sign in successful! (Super Admin)',
      user: { userId: userIdentifier, role: 'super_admin' },
    };
  }

  return {
    success: false,
    message: 'Invalid User ID or password.',
    user: null,
  };
}

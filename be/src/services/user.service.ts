import { z } from 'zod';
import bcrypt from 'bcrypt';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import nodemailer from 'nodemailer';
import config from '../configs/config.js';
import * as userValidation from '../zod/user.js'
import * as userTypes from '../types/user.js'
import { prisma } from '../configs/db.js'

export async function signup(userData: z.infer<typeof userValidation.signupSchema>): Promise<{ user: Omit<userTypes.User, 'password'>, token: string }> {
  const validatedData = userValidation.signupSchema.parse(userData);
  
  const existingUser = await prisma.user.findUnique({
    where: { email: validatedData.email }
  });
  
  if (existingUser) {
    throw new Error('User with this email already exists');
  }
  
  const hashedPassword = await bcrypt.hash(validatedData.password, 10);
  
  const user = await prisma.user.create({
    data: {
      email: validatedData.email,
      password: hashedPassword,
      name: validatedData.name,
    },
  });
  
  const token = jwt.sign({ userId: user.id }, config.auth.jwt , { expiresIn: '7d' });
  
  const { password, ...userWithoutPassword } = user;
  return { user: userWithoutPassword, token };
}

export async function login(credentials: z.infer<typeof userValidation.loginSchema>): Promise<{ user: Omit<userTypes.User, 'password'>, token: string }> {
  const validatedData = userValidation.loginSchema.parse(credentials);
  
  const user = await prisma.user.findUnique({
    where: { email: validatedData.email }
  });
  
  if (!user) {
    throw new Error('Invalid email or password');
  }
  
  const passwordValid = await bcrypt.compare(validatedData.password, user.password);
  
  if (!passwordValid) {
    throw new Error('Invalid email or password');
  }
  
  const token = jwt.sign({ userId: user.id }, config.auth.jwt, { expiresIn: '7d' });
  
  const { password, ...userWithoutPassword } = user;
  return { user: userWithoutPassword, token };
}

export async function forgotPassword(data: z.infer<typeof userValidation.forgotPasswordSchema>): Promise<{ message: string }> {
  const validatedData = userValidation.forgotPasswordSchema.parse(data);
  
  const user = await prisma.user.findUnique({
    where: { email: validatedData.email }
  });
  
  if (!user) {
    return { message: 'If an account with that email exists, a password reset link has been sent' };
  }
  
  const resetToken = crypto.randomBytes(32).toString('hex');
  const resetTokenHash = crypto.createHash('sha256').update(resetToken).digest('hex');
  
  await prisma.user.update({
    where: { id: user.id },
    data: {
      resetToken: resetTokenHash,
      resetTokenExpiry: new Date(Date.now() + config.auth.token_expiry),
    },
  });
  
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: parseInt(process.env.EMAIL_PORT || '587'),
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD,
    },
  });
  
  const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;
  
  try {
    await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to: user.email,
      subject: 'Password Reset Request',
      html: `
        <p>You requested a password reset.</p>
        <p>Click <a href="${resetUrl}">here</a> to reset your password.</p>
        <p>This link is valid for 1 hour.</p>
      `,
    });
  } catch (error) {
    console.error('Error sending email:', error);
    await prisma.user.update({
      where: { id: user.id },
      data: {
        resetToken: null,
        resetTokenExpiry: null,
      },
    });
    throw new Error('Failed to send reset email');
  }
  
  return { message: 'If an account with that email exists, a password reset link has been sent' };
}

export async function resetPassword(data: z.infer<typeof userValidation.resetPasswordSchema>): Promise<{ message: string }> {
  const validatedData = userValidation.resetPasswordSchema.parse(data);
  
  const resetTokenHash = crypto.createHash('sha256').update(validatedData.token).digest('hex');
  
  const user = await prisma.user.findFirst({
    where: {
      resetToken: resetTokenHash,
      resetTokenExpiry: {
        gt: new Date(),
      },
    },
  });
  
  if (!user) {
    throw new Error('Invalid or expired reset token');
  }
  
  const hashedPassword = await bcrypt.hash(validatedData.password, 10);
  
  await prisma.user.update({
    where: { id: user.id },
    data: {
      password: hashedPassword,
      resetToken: null,
      resetTokenExpiry: null,
    },
  });
  
  return { message: 'Password has been reset successfully' };
}

export async function getUserProfile(userId: string): Promise<Omit<userTypes.User, 'password'>> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });
  
  if (!user) {
    throw new Error('User not found');
  }
  
  const { password, ...userWithoutPassword } = user;
  return userWithoutPassword;
}

export async function updateProfile(
  userId: string, 
  data: z.infer<typeof userValidation.updateProfileSchema>
): Promise<Omit<userTypes.User, 'password'>> {
  const validatedData = userValidation.updateProfileSchema.parse(data);
  
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });
  
  if (!user) {
    throw new Error('User not found');
  }
  
  if (validatedData.newPassword) {
    if (!validatedData.currentPassword) {
      throw new Error('Current password is required to set a new password');
    }
    
    const passwordValid = await bcrypt.compare(validatedData.currentPassword, user.password);
    
    if (!passwordValid) {
      throw new Error('Current password is incorrect');
    }
  }
  
  const updateData: any = {};

  if (validatedData.name) updateData.name = validatedData.name;
  if (validatedData.email) updateData.email = validatedData.email;
  if (validatedData.orgName !== undefined) updateData.orgName = validatedData.orgName;
  if (validatedData.newPassword) {
    updateData.password = await bcrypt.hash(validatedData.newPassword, 10);
  }
  
  const updatedUser = await prisma.user.update({
    where: { id: userId },
    data: updateData,
  });
  
  const { password, ...userWithoutPassword } = updatedUser;
  return userWithoutPassword;
}

export async function deleteAccount(userId: string, password: string): Promise<{ message: string }> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });
  
  if (!user) {
    throw new Error('User not found');
  }
  
  const passwordValid = await bcrypt.compare(password, user.password);
  
  if (!passwordValid) {
    throw new Error('Password is incorrect');
  }
  
  await prisma.user.delete({
    where: { id: userId },
  });
  
  return { message: 'Account deleted successfully' };
} 
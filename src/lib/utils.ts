import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import { v4 as uuidv4 } from 'uuid'
import { randomBytes } from 'crypto'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Generates a unique token for invitations
 * @returns A string token that can be used in invitation URLs
 */
export function generateInvitationToken(): string {
  // Use a combination of UUID and random bytes to ensure uniqueness
  const uuid = uuidv4().replace(/-/g, '')
  const randomString = randomBytes(8).toString('hex')
  return `${uuid}${randomString}`
}

/**
 * Calculates the expiration date for an invitation
 * @param days Number of days until the invitation expires (default: 7)
 * @returns Date object representing the expiration date
 */
export function calculateInvitationExpiry(days: number = 7): Date {
  // Create a new date instance to avoid any reference issues
  const expiryDate = new Date()
  
  // Ensure we're working with a valid number
  const validDays = Number.isInteger(days) && days > 0 ? days : 7
  
  // Add the days to the current date
  expiryDate.setDate(expiryDate.getDate() + validDays)
  
  return expiryDate
}

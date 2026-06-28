'use server';

import { doc, updateDoc } from 'firebase/firestore';
import { db } from './firebase';
import type { Order } from './types';
import { revalidatePath } from 'next/cache';

/**
 * Updates the status of a specific order in Firestore.
 * @param orderId The ID of the order to update.
 * @param newStatus The new status to set for the order.
 */
export async function updateOrderStatus(orderId: string, newStatus: Order['status']) {
  if (!orderId || !newStatus) {
    throw new Error('Order ID and new status are required.');
  }
  const orderRef = doc(db, 'orders', orderId);
  await updateDoc(orderRef, { status: newStatus });
  revalidatePath('/admin/orders'); // Revalidate the page to show the change
}


/**
 * Sets the admin role for a user.
 * NOTE: This is an insecure action and should be replaced by a proper Cloud Function
 * with authentication checks. This is for prototype purposes only.
 * @param uid The UID of the user to modify.
 * @param isAdmin Boolean indicating if the user should be an admin.
 */
export async function setUserAdminRole(uid: string, isAdmin: boolean) {
    if (!uid) {
        throw new Error("User ID is required.");
    }
    // IMPORTANT: In a real app, you MUST validate that the calling user
    // is an admin before performing this action. This would be done in a
    // Cloud Function.
    
    const userRef = doc(db, "users", uid);
    await updateDoc(userRef, { role: isAdmin ? 'admin' : 'user' });
    revalidatePath('/admin/users');
}

    
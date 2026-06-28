// src/lib/helpers.ts
import { collection, getDocs, doc, getDoc } from 'firebase/firestore';
import { db } from './firebase';
import type { Order, OrderWithUser, UserProfile } from './types';

// A map to cache user data to avoid redundant Firestore reads
const userCache = new Map<string, UserProfile>();

/**
 * Fetches user data for a list of orders.
 * It caches user data to minimize Firestore reads.
 */
export const fetchUsersForOrders = async (orders: any[]): Promise<OrderWithUser[]> => {
    const userIds = [...new Set(orders.map(order => order.userId).filter(Boolean))];
    const usersToFetch = userIds.filter(id => !userCache.has(id));

    if (usersToFetch.length > 0) {
        // In a real app with many users, fetching one-by-one is inefficient.
        // Firestore's `in` query is limited to 30 items. For a larger scale,
        // you'd need a more complex solution, like fetching in batches or
        // denormalizing userEmail onto the order document itself.
        // For this prototype, we'll fetch them individually for simplicity.
        const userPromises = usersToFetch.map(async (userId) => {
            const userDocRef = doc(db, 'users', userId);
            const userDoc = await getDoc(userDocRef);
            if (userDoc.exists()) {
                const userData = userDoc.data() as UserProfile;
                userCache.set(userId, userData);
            }
        });
        await Promise.all(userPromises);
    }
    
    return orders.map(order => {
        const user = userCache.get(order.userId);
        return {
            ...order,
            userEmail: user?.email || 'Unknown User'
        } as OrderWithUser;
    });
};

/**
 * Fetches all user profiles from the 'users' collection.
 */
export const fetchAllUsers = async (): Promise<UserProfile[]> => {
    const usersCollectionRef = collection(db, "users");
    const querySnapshot = await getDocs(usersCollectionRef);
    const users = querySnapshot.docs.map(doc => ({
      uid: doc.id,
      ...doc.data()
    } as UserProfile));

    // After fetching all users, we can populate our cache
    // This is useful if we navigate between pages and need the data again
    users.forEach(user => {
        if (!userCache.has(user.uid)) {
            userCache.set(user.uid, user);
        }
    });
    
    return users;
};

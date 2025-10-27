import { db, admin } from '../firebase.js';
import bcrypt from 'bcryptjs';

const User = {
  collection: db.collection('users'),

  async create({ email, password, name, phone }) {
    // Check if user already exists
    const userExists = await this.collection.where('email', '==', email).limit(1).get();
    if (!userExists.empty) {
      throw new Error('User already exists with this email');
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user
    const userRef = await this.collection.add({
      email,
      password: hashedPassword,
      name,
      phone,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });

    const userDoc = await userRef.get();
    return { id: userRef.id, ...userDoc.data() };
  },

  async findByEmail(email) {
    const snapshot = await this.collection.where('email', '==', email).limit(1).get();
    if (snapshot.empty) return null;
    
    const userDoc = snapshot.docs[0];
    return { id: userDoc.id, ...userDoc.data() };
  },

  async comparePassword(candidatePassword, hashedPassword) {
    return await bcrypt.compare(candidatePassword, hashedPassword);
  }
};

export default User;

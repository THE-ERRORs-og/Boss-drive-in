import { createClient } from 'next-sanity';
import mongoose from 'mongoose';
import User from '../models/User.js';
import SafeBalance from '../models/SafeBalance.js';
import OrderItem from '../models/OrderItem.js';
import OrderSummary from '../models/OrderSummary.js';
import CashSummary from '../models/CashSummary.js';
import Constant from '../models/Constant.js';
import { config } from 'dotenv';
import { resolve } from 'path';
import { fileURLToPath } from 'url';

// Load environment variables from .env.local
const __dirname = fileURLToPath(new URL('.', import.meta.url));
config({ path: resolve(__dirname, '../.env.local') });

// Sanity client configuration
const sanityClient = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
  token: process.env.SANITY_WRITE_TOKEN,
  apiVersion: '2024-04-03',
  useCdn: false,
});

// MongoDB connection
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB connected successfully');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

// Helper function to convert Sanity references to MongoDB ObjectIds
const convertReference = async (ref) => {
  if (!ref) return null;
  
  try {
    // If ref is a string (direct reference), fetch the user from Sanity
    if (typeof ref === 'string') {
      const user = await sanityClient.fetch('*[_id == $ref][0]', { ref });
      if (user) {
        const mongoUser = await User.findOne({ userid: user.userid });
        return mongoUser?._id || null;
      }
    }
    // If ref is an object (expanded reference), use the userid directly
    else if (ref.userid) {
      const mongoUser = await User.findOne({ userid: ref.userid });
      return mongoUser?._id || null;
    }
    // If ref is a reference object with _ref
    else if (ref._ref) {
      const user = await sanityClient.fetch('*[_id == $ref][0]', { ref: ref._ref });
      if (user) {
        const mongoUser = await User.findOne({ userid: user.userid });
        return mongoUser?._id || null;
      }
    }
    
    return null;
  } catch (error) {
    console.error('Error converting reference:', error);
    return null;
  }
};

// Migrate Users
const migrateUsers = async () => {
  console.log('Starting user migration...');
  const users = await sanityClient.fetch('*[_type == "user"]');
  console.log(`Found ${users.length} users to migrate`);
  
  for (const user of users) {
    try {
      const existingUser = await User.findOne({ userid: user.userid });
      if (!existingUser) {
        await User.create({
          name: user.name,
          userid: user.userid,
          password: user.password,
          role: user.role,
          isActive: user.isActive,
          lastLogin: user.lastLogin ? new Date(user.lastLogin) : null,
        });
        console.log(`Migrated user: ${user.name}`);
      } else {
        console.log(`User already exists: ${user.name}`);
      }
    } catch (error) {
      console.error(`Error migrating user ${user.name}:`, error);
    }
  }
  console.log('User migration completed');
};

// Migrate Order Items
const migrateOrderItems = async () => {
  console.log('Starting order items migration...');
  const orderItems = await sanityClient.fetch('*[_type == "order_item"]');
  console.log(`Found ${orderItems.length} order items to migrate`);
  
  for (const item of orderItems) {
    try {
      const existingItem = await OrderItem.findOne({ name: item.name });
      if (!existingItem) {
        console.log('Order Item createdBy reference:', JSON.stringify(item.createdBy, null, 2));
        const createdBy = await convertReference(item.createdBy);
        if (createdBy) {
          await OrderItem.create({
            name: item.name,
            order: item.Order,
            isEnabled: item.isEnabled,
            createdBy,
          });
          console.log(`Migrated order item: ${item.name}`);
        } else {
          console.log(`Skipping order item ${item.name} - createdBy reference not found`);
        }
      } else {
        console.log(`Order item already exists: ${item.name}`);
      }
    } catch (error) {
      console.error(`Error migrating order item ${item.name}:`, error);
    }
  }
  console.log('Order items migration completed');
};

// Migrate Order Summaries
const migrateOrderSummaries = async () => {
  console.log('Starting order summaries migration...');
  const orderSummaries = await sanityClient.fetch('*[_type == "order_summary"]');
  console.log(`Found ${orderSummaries.length} order summaries to migrate`);

  for (const summary of orderSummaries) {
    try {
      const existing = await OrderSummary.findOne({
        date: new Date(summary.date),
        shiftNumber: summary.shiftNumber || 1
      });

      if (existing) {
        console.log(`Order summary already exists for date: ${summary.date}, shift: ${summary.shiftNumber || 1}`);
        continue;
      }

      console.log('Order Summary createdBy reference:', summary.createdBy);

      const createdBy = await convertReference(summary.createdBy);
      if (!createdBy) {
        console.log('Skipping order summary due to missing createdBy reference');
        continue;
      }

      const orderSummary = new OrderSummary({
        date: new Date(summary.date),
        shiftNumber: summary.shiftNumber || 1,
        submissionDate: new Date(summary.submissionDate || summary.date),
        items: (summary.items || []).map(item => ({
          itemName: item.itemName,
          boh: item.boh || 0,
          cashOrder: item.cashOrder || 0,
          inventory: item.inventory || 0
        })),
        totalOrders: summary.totalOrders || 0,
        totalAmount: summary.totalAmount || 0,
        createdBy: createdBy,
        createdAt: summary._createdAt,
        updatedAt: summary._updatedAt
      });

      await orderSummary.save();
      console.log(`Migrated order summary for date: ${summary.date}, shift: ${summary.shiftNumber || 1}`);
    } catch (error) {
      console.error(`Error migrating order summary for ${summary.date}:`, error);
    }
  }
  console.log('Order summaries migration completed');
};

// Migrate Cash Summaries
const migrateCashSummaries = async () => {
  console.log('Starting cash summaries migration...');
  const summaries = await sanityClient.fetch('*[_type == "cash_summary"]');
  console.log(`Found ${summaries.length} cash summaries to migrate`);
  
  for (const summary of summaries) {
    try {
      const existingSummary = await CashSummary.findOne({
        datetime: new Date(summary.datetime),
        shiftNumber: summary.shiftNumber
      });
      
      if (!existingSummary) {
        console.log('Cash Summary createdBy reference:', JSON.stringify(summary.createdBy, null, 2));
        const createdBy = await convertReference(summary.createdBy);
        if (createdBy) {
          await CashSummary.create({
            expectedCloseoutCash: summary.expectedCloseoutCash,
            startingRegisterCash: summary.startingRegisterCash,
            onlineTipsToast: summary.onlineTipsToast || 0,
            onlineTipsKiosk: summary.onlineTipsKiosk || 0,
            onlineTipCash: summary.onlineTipCash || 0,
            totalTipDeduction: summary.totalTipDeduction || 0,
            ownedToRestaurantSafe: summary.ownedToRestaurantSafe || 0,
            removalAmount: summary.removalAmount || 0,
            removalItemCount: summary.removalItemCount || 0,
            discounts: summary.discounts || 0,
            datetime: new Date(summary.datetime),
            shiftNumber: summary.shiftNumber,
            createdBy,
          });
          console.log(`Migrated cash summary for date: ${summary.datetime}, shift: ${summary.shiftNumber}`);
        } else {
          console.log(`Skipping cash summary for ${summary.datetime} - createdBy reference not found`);
        }
      } else {
        console.log(`Cash summary already exists for date: ${summary.datetime}, shift: ${summary.shiftNumber}`);
      }
    } catch (error) {
      console.error(`Error migrating cash summary for ${summary.datetime}:`, error);
    }
  }
  console.log('Cash summaries migration completed');
};

// Migrate Safe Balances
const migrateSafeBalances = async () => {
  console.log('Starting safe balances migration...');
  const safeBalances = await sanityClient.fetch(
    '*[_type == "safe_balance_history"]'
  );
  console.log(`Found ${safeBalances.length} safe balances to migrate`);

  for (const safeBalance of safeBalances) {
    try {
      console.log('Processing safe balance:', safeBalance);
      
      // Check if safe balance already exists
      const existingSafeBalance = await SafeBalance.findOne({ date: new Date(safeBalance._createdAt) });
      if (existingSafeBalance) {
        console.log(`Safe balance for ${safeBalance._createdAt} already exists, skipping...`);
        continue;
      }

      // Convert submittedBy reference to MongoDB ObjectId
      const createdBy = await convertReference(safeBalance.submittedBy);
      if (!createdBy) {
        console.log(`Skipping safe balance due to missing submittedBy reference`);
        continue;
      }

      // Create new safe balance with required fields
      const newSafeBalance = new SafeBalance({
        amount: safeBalance.depositAmount || 0,
        date: new Date(safeBalance._createdAt),
        createdBy: createdBy,
        type: 'credit', // Since these are deposits
        description: 'Safe balance deposit from Sanity migration'
      });

      await newSafeBalance.save();
      console.log(`Successfully migrated safe balance for ${safeBalance._createdAt}`);
    } catch (error) {
      console.error(`Error migrating safe balance for ${safeBalance._createdAt}:`, error);
    }
  }
  console.log('Safe balances migration completed');
};

// Migrate Constants
const migrateConstants = async () => {
  console.log('Starting constants migration...');
  const constants = await sanityClient.fetch('*[_type == "constant"]');
  console.log(`Found ${constants.length} constants to migrate`);
  
  for (const constant of constants) {
    try {
      const existingConstant = await Constant.findOne({ name: constant.name });
      if (!existingConstant) {
        const lastUpdated_by = await convertReference(constant.lastUpdated_by);
        if (lastUpdated_by) {
          await Constant.create({
            name: constant.name,
            value: constant.value,
            lastUpdated_by,
          });
          console.log(`Migrated constant: ${constant.name}`);
        } else {
          console.log(`Skipping constant ${constant.name} - lastUpdated_by reference not found`);
        }
      } else {
        console.log(`Constant already exists: ${constant.name}`);
      }
    } catch (error) {
      console.error(`Error migrating constant ${constant.name}:`, error);
    }
  }
  console.log('Constants migration completed');
};

// Main migration function
const migrate = async () => {
  try {
    await connectDB();
    
    // Run migrations in sequence
    // await migrateUsers();
    // await migrateOrderItems();
    // await migrateOrderSummaries();
    // await migrateCashSummaries();
    await migrateSafeBalances();
    // await migrateConstants();
    
    console.log('All migrations completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
};

// Run the migration
migrate(); 
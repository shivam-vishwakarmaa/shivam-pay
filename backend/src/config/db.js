const mongoose = require('mongoose');

const connectDB = async () => {
    const mongoUri = process.env.MONGODB_URI;

    if (!mongoUri) {
        console.error('❌ Fatal Startup Error: MONGODB_URI environment variable is not set. Refusing to start without a secure database connection string.');
        process.exit(1);
    }

    try {
        console.log('🔄 Attempting connection to MongoDB...');
        await mongoose.connect(mongoUri, {
            serverSelectionTimeoutMS: 5000,
        });
        console.log('✅ MongoDB Connected successfully!');
    } catch (err) {
        console.warn('⚠️ MongoDB connection unreachable:', err.message || err.code);
        
        // Non-production fallback
        if (process.env.NODE_ENV !== 'production') {
            console.warn('⚠️ [LOCAL DEV WARNING] Attempting fallback to Zero-Configuration In-Memory MongoDB Engine for local testing...');
            try {
                const { MongoMemoryServer } = require('mongodb-memory-server');
                const mongoServer = await MongoMemoryServer.create({
                    instance: { dbName: 'shivampay' }
                });
                const memoryUri = mongoServer.getUri();
                await mongoose.connect(memoryUri);
                console.log('🚀 [LOCAL DEV WARNING] In-Memory MongoDB Connected! Do not use this in production.');
            } catch (memErr) {
                console.error('❌ Fatal: Failed to connect to any MongoDB engine:', memErr.message);
                process.exit(1);
            }
        } else {
            console.error('❌ Fatal Startup Error: MongoDB connection failed in production mode.');
            process.exit(1);
        }
    }
};

module.exports = connectDB;

const mongoose = require('mongoose');

const connectDB = async () => {
    const atlasUri = process.env.MONGODB_URI || "mongodb+srv://shivamvishwa844:Shivam$844@cluster0.4kxibsg.mongodb.net/shivampay?retryWrites=true&w=majority";
    const localUri = "mongodb://127.0.0.1:27017/shivampay";

    try {
        console.log('🔄 Attempting connection to MongoDB Atlas...');
        await mongoose.connect(atlasUri, {
            serverSelectionTimeoutMS: 4000,
        });
        console.log('✅ MongoDB Atlas Connected successfully!');
    } catch (err) {
        console.warn('⚠️ MongoDB Atlas unreachable or DNS SRV blocked:', err.message || err.code);
        console.log('🔄 Attempting fallback to Local MongoDB (mongodb://127.0.0.1:27017/shivampay)...');
        
        try {
            await mongoose.connect(localUri, {
                serverSelectionTimeoutMS: 2500,
            });
            console.log('✅ Local MongoDB Connected successfully!');
        } catch (localErr) {
            console.warn('⚠️ Local MongoDB unreachable. Starting Zero-Configuration In-Memory MongoDB Engine...');
            try {
                const { MongoMemoryServer } = require('mongodb-memory-server');
                const mongoServer = await MongoMemoryServer.create({
                    instance: {
                        dbName: 'shivampay'
                    }
                });
                const memoryUri = mongoServer.getUri();
                await mongoose.connect(memoryUri);
                console.log('🚀 Zero-Config In-Memory MongoDB Connected! (All features operational for testing/demo)');
            } catch (memErr) {
                console.error('❌ Fatal: Failed to connect to any MongoDB engine:', memErr.message);
                process.exit(1);
            }
        }
    }
};

module.exports = connectDB;

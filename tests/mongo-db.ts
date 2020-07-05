/**
 * mongo-db
 *
 * @author Jonas Tomanga <celleb@mrcelleb.com>
 * @copyright (c) 2020 Jonas Tomanga
 * All rights reserved
 * @license MIT
 */

import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';

const mongoDb = new MongoMemoryServer();

export const MongoDbConnection = {
    async connect() {
        const uri = await mongoDb.getConnectionString();

        const options = {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        };

        await mongoose.connect(uri, options);
    },

    async closeDatabase() {
        await mongoose.connection.dropDatabase();
        await mongoose.connection.close();
        await mongoDb.stop();
    },

    async clearCollections() {
        const collections = mongoose.connection.collections;

        for (const key in collections) {
            const collection = collections[key];
            await collection.deleteMany({});
        }
    },
};

/**
 * query-builder.spec
 *
 * @author Jonas Tomanga <celleb@mrcelleb.com>
 * @copyright (c) 2020 Jonas Tomanga
 * All rights reserved
 * @license MIT
 */

import { MongoDbConnection } from './mongo-db';
import { QueryBuilder } from '../src';
import mongoose, { Schema } from 'mongoose';

let qb!: QueryBuilder<any>;

const userSchema = new Schema({
    name: String,
    surname: String,
    likes: [String],
    car: {
        model: String,
        year: Number,
    },
    activities: [
        {
            name: String,
        },
    ],
});

const dictionary = {
    firstName: 'name',
    lastName: 'surname',
    likes: 'hobbies',
    'vehicle.model': 'car.model',
    'vehicle.year': 'car.year',
};

const User = mongoose.model('User', userSchema);

const collection = [
    {
        name: 'Jonas',
        surname: 'Tomanga',
        likes: ['Football', 'Volleyball'],
        car: [
            {
                model: 'Kalahari',
                year: 2007,
            },
        ],
    },
    {
        name: 'Jon',
        surname: 'Manga',
        likes: ['Dancing', 'Volleyball'],
        car: [
            {
                model: 'Oshakati',
                year: 1900,
            },
        ],
    },
];

describe('QueryBuilder tests', () => {
    beforeAll(async () => {
        // connect to database
        return await MongoDbConnection.connect();
    });
    beforeEach(async () => {
        await User.insertMany(collection);
        qb = new QueryBuilder(User, dictionary);
        return;
    });

    afterEach(async () => {
        return await MongoDbConnection.clearCollections();
    });

    afterAll(async () => {
        return await MongoDbConnection.connect();
    });

    it('must be defined', () => {
        expect(qb.build).toBeDefined;
    });

    it('must return a matching result', async () => {
        const query = qb.build({
            match: { firstName: 'Jonas' },
            sort: '-firstName',
            limit: 1,
            select: ['firstName'],
            order: ['match'],
        });
        const results = await query.exec();
        expect(results.length).toEqual(1);
        expect(results[0].toObject().name).toEqual('Jonas');
    });
});

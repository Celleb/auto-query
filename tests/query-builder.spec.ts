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
    car: [
        {
            model: String,
            year: Number,
        },
    ],
    activities: [
        {
            name: String,
        },
    ],
});

const dictionary = {
    firstName: 'name',
    lastName: 'surname',
    hobbies: 'likes',
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
    {
        name: 'Jane',
        surname: 'Manga',
        likes: ['Dancing', 'Basketball'],
        car: [
            {
                model: 'Otavi',
                year: 2020,
            },
        ],
    },
    {
        name: 'Jonas',
        surname: 'Manga',
        likes: ['Dancing', 'Basketball'],
        car: [
            {
                model: 'Otavi',
                year: 2020,
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

    it('return a matching result', async () => {
        const query = qb.build({
            match: {},
            sort: '-firstName',
            skip: 1,
            limit: 1,
            select: ['firstName', 'lastName'],
            order: ['match'],
        });
        const results = await query.exec();
        expect(results.length).toEqual(1);
        expect(results[0].toObject().name).toEqual('Jonas');
        expect(results[0].toObject().surname).toEqual('Manga');
        expect(results[0].toObject().likes).toBeUndefined;
    });

    it('returns the full results', async () => {
        const query = qb.build({
            match: {},
        });
        const results = await query.exec();
        expect(results.length).toEqual(collection.length);
    });

    it('returns a match based on a subdoc query', async () => {
        const query = qb.build({
            match: { 'vehicle.model': 'Kalahari' },
        });
        const results = await query.exec();
        expect(results.length).toEqual(1);
        expect(results[0].toObject().name).toEqual('Jonas');
    });

    it('returns a match based on an item in an array, skip 1 and limit 1', async () => {
        const query = qb.build({
            match: { hobbies: 'Dancing' },
            skip: 1,
            limit: 1,
        });
        const results = await query.exec();
        expect(results.length).toEqual(1);
        expect(results[0].toObject().name).toEqual('Jane');
    });
});

/**
 * query-builder.spec
 *
 * @author Jonas Tomanga <celleb@mrcelleb.com>
 * @copyright (c) 2020 Jonas Tomanga
 * All rights reserved
 * @license MIT
 */

import { QueryBuilder } from './query-builder';
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

describe('QueryBuilder', () => {
    it('must be defined', () => {
        expect(QueryBuilder).toBeDefined;
    });
    describe('.build', () => {
        beforeEach(() => {
            qb = new QueryBuilder(User, dictionary);
        });

        it('must be defined', () => {
            expect(qb.build).toBeDefined;
        });

        it('must return a instance of mongoose Query', () => {
            const query = qb.build({
                match: { firstName: 'Jonas' },
                sort: '-firstName',
                skip: 1,
                limit: 1,
                select: ['firstName'],
                order: ['match'],
            });
            expect(query).toBeInstanceOf(mongoose.Query);
        });
    });
});

/**
 * query-builder
 *
 * @author Jonas Tomanga <celleb@mrcelleb.com>
 * @copyright (c) 2020 Jonas Tomanga
 * All rights reserved
 * @license MIT
 */

import { Dictionary, QueryValue, QueryFilter, QueryParams } from './@types';
import { Query, Model, Document } from 'mongoose';
import { shallowTransform } from '@celleb/js-utils/obj';
import { sortByReference } from '@celleb/js-utils/arrays';
import { RegExpOps } from './operators';

export class QueryBuilder<M extends Model<Document>> {
    private defaultOrder: QueryFilter[] = ['match', 'sort', 'skip', 'limit', 'select'];
    constructor(private model: M, private dictionary: Dictionary = {}) {}

    private match($query: Query<any>, match?: QueryParams['match']): Query<any> {
        const $match = shallowTransform(match || {}, this.dictionary);

        for (const [key, value] of Object.entries($match)) {
            $query = this.buildWhereQuery($query, key, value);
        }

        return $query;
    }

    private applyFilters<K extends QueryFilter, P extends Required<QueryParams>[K]>(
        param: P,
        $query: Query<any>,
        filter: K
    ) {
        switch (filter) {
            case 'match':
                return this.match($query, param as QueryParams['match']);
            case 'sort':
                return this.sort($query, param as string);
            case 'skip':
                return this.skip($query, param as number);
            case 'limit':
                return this.limit($query, param as number);
            case 'select':
                return this.select($query, param as string[]);
            default:
                return $query;
        }
    }

    build<P extends QueryParams>(queryParams: P) {
        let $query = this.model.find({});

        const filters = queryParams.order
            ? sortByReference(this.defaultOrder, [...queryParams.order])
            : this.defaultOrder;

        for (const filter of filters) {
            if (![undefined, null, ''].includes(queryParams[filter] as any)) {
                $query = this.applyFilters(queryParams[filter]!, $query, filter);
            }
        }

        return $query;
    }

    private buildWhereQuery($query: Query<any>, key: string, value: QueryValue) {
        if (typeof value === 'string') {
            // greater than or equal to operations
            if (RegExpOps.gte.test(value)) {
                return $query.where(key).gte(value.replace(RegExpOps.gte, ''));
            }
            if (RegExpOps.gt.test(value)) {
                return $query.where(key).gt(value.replace(RegExpOps.gt, ''));
            }

            // less than or equal to operations
            if (RegExpOps.lte.test(value)) {
                return $query.where(key).lte(value.replace(RegExpOps.lte, ''));
            }
            if (RegExpOps.lt.test(value)) {
                return $query.where(key).lt(value.replace(RegExpOps.lt, ''));
            }
        }
        // arrays [not-in and in]

        if (Array.isArray(value)) {
            const $nin = value
                .filter((val) => RegExpOps.not.test(`${val}`))
                .map((val) => `${val}`.replace(RegExpOps.not, ''));
            const $in = value.filter((val) => !RegExpOps.not.test(`${val}`));
            if ($nin.length > 0) {
                $query.where(key).nin($nin);
            }
            if ($in.length > 0) {
                $query.where(key).in($in);
            }

            return $query;
        }

        return $query.where(key).equals(value);
    }

    private limit($query: Query<any>, limit: number) {
        return $query.limit(limit);
    }

    private select($query: Query<any>, select: string[]) {
        return $query.select(select.map((i) => this.dictionary[i]).filter((i) => !!i));
    }

    private skip($query: Query<any>, limit: number) {
        return $query.skip(limit);
    }

    private sort($query: Query<any>, sort: string) {
        const match = /^(\-|\+)/;
        const sign = match.test(sort) ? sort.slice(0, 1) : '';
        const key = this.dictionary[sort.replace(match, '')];
        if (!key) {
            return $query;
        }
        return $query.sort(sign + key);
    }
}

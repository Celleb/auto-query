import { Dictionary, QueryValue, QueryFilter, QueryParams } from './@types';
import { Query, Model, Document } from 'mongoose';
import { shallowTransform } from '@celleb/js-utils/obj';
import { sortByReference } from '@celleb/js-utils/arrays';
import { RegExpOps } from './operators';

export class QueryBuilder<D extends Document> {
    private defaultOrder: QueryFilter[] = ['match', 'sort', 'skip', 'limit', 'select'];
    constructor(private model: Model<D>, private dictionary: Dictionary = {}) {}

    private match($query: Query<any>, match?: QueryParams['match']): Query<any> {
        const $match = shallowTransform(match || {}, this.dictionary);

        for (const [key, value] of Object.entries($match)) {
            $query = this.buildWhereQuery($query, key, value);
        }

        return $query;
    }

    private applyFilters<K extends QueryFilter, P extends QueryParams[K]>(
        param: P,
        $query: Query<any>,
        filter: K
    ) {
        switch (filter) {
            case 'match':
                return param ? this.match($query, param as QueryParams['match']) : $query;
            case 'limit':
                return param ? this.limit($query, param as number) : $query;

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
            $query = this.applyFilters(queryParams[filter], $query, filter);
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
}

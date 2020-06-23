/**
 * @types
 *
 * @author Jonas Tomanga <celleb@logicpp.com.na>
 * @copyright (c) 2020 Logic Plus Information Technologies CC
 * All rights reserved
 */

export interface Dictionary extends Record<string, string> {}

export type QueryValue = string | number | Array<string | number>;

export type QueryFilter = 'match' | 'sort' | 'skip' | 'limit' | 'select';

export type QueryParams = {
    match?: Record<string, QueryValue>;
    sort?: string;
    skip?: number;
    limit?: number;
    select?: string[];
    order?: Array<QueryFilter>;
};

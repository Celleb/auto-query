/**
 * operators
 *
 * @author Jonas Tomanga <celleb@mrcelleb.com>
 * @copyright (c) 2020 Jonas Tomanga
 * All rights reserved
 * @license MIT
 */

export const Op = {
    gt: Symbol('gt'),
    gte: Symbol('gte'),
    lt: Symbol('lt'),
    lte: Symbol('lte'),
    not: Symbol('not'),
};

export const Operators = {
    gt: '>',
    gte: '>:',
    lt: '<',
    lte: '<:',
    not: '!',
};

export const RegExpOps = {
    gt: /^\>/,
    gte: /^\>\:/,
    lt: /^\</,
    lte: /^\<\:/,
    not: /\!/,
};

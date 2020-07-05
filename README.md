# mongoorrhea

Restful query builder for mongodb with mongoose using your url query

## Usage

### Define your mongoose model as usual

```typescript
import { Schema } from 'mongoose';
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
```

### Define your dictionary

The dictionary is used to transform the api fields to the database fields.
If the fields are the same then you can exclude it from the dictionary.
The dictionary is POJO with string for both keys and values.

For example `{apiField: 'databaseField' }`

```typescript
// shallow/flat dictionary/map
const dictionary = {
 firstName: 'name',
 lastName: 'surname',
 'vehicle.model': 'car.model',
 'vehicle.year': 'car.year',
};
```

### Create your model and instantiate the query builder

The `QueryBuilder` takes a model and a dictionary.

```typescript
import { QueryBuilder } from '@celleb/mongorrhea';
import mongoose from 'mongoose';

const User = mongoose.model('User', userSchema);

const qb = new QueryBuilder(User, dictionary);
```

### Use the query builder instance in your route handler

Call the query builder's `.build` method with the request query.
The build method returns a `Mongoose` query and you can chain other methods before calling `.exec()`.

```typescript
async function routHandler(req: Request, res: Response) {
 return res.json(res.qb.build(req.query).exec());
}
```

## Query Parameter Interface

The following are fields support on the query

```typescript
interface QueryParams = {
    match?: Record<string, string|number|Array<string|number>>;
    sort?: string;
    skip?: number;
    limit?: number;
    select?: string[];
}
```

For example: `url?match[firstName]=Jonas&sort=firstName&skip=0&limit=10&select=firstName&select=lastName`.

### URL Query Fields

You decide how you encode and decode your url query but the decoded query must match the Query Parameter Interface above.

### match

Allows you to query the database using specific fields and operators.

#### Supported operations

| Symbol | Description                                           | Usage                                                                            |
| ------ | ----------------------------------------------------- | -------------------------------------------------------------------------------- |
| =      | Equal to or [in]. Do not add an additional equal sign | `url?match[firstName]=Jonas` or with array `url?match[firstName]=Jonas,Jon`'     |
| !      | Not equal to to or not in [nin].                      | `url?match[firstName]=!Jonas` or with array `url?match[likes]=Football,!Tennis`' |
| >:     | Greater than or equal                                 | `url?match[vehicle.year]=>:2017`                                                 |
| >      | Greater than                                          | `url?match[vehicle.year]=>2017`                                                  |
| <:     | Less than or equal                                    | `url?match[vehicle.year]=<:2017`                                                 |
| <      | Less than or equal                                    | `url?match[vehicle.year]=<2017`                                                  |

More operations will be added in the future

### sort

Specifies the field and the order by which to sort the results.

Use `sort?=-fieldName` for descending order and `sort=fieldName` for ascending order.

### skip

Specifies the number of records to skip in the database.

For example `skip=10` skips the first 10 records.

### limit

Limits the number of matching records returned.

Example `limit=10` returns the first 10 results.

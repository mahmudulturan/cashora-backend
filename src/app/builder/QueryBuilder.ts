import { FilterQuery, Query } from 'mongoose';

class QueryBuilder<T> {
    public modelQuery: Query<T[], T>;
    public query: Record<string, unknown>;

    constructor(modelQuery: Query<T[], T>, query: Record<string, unknown>) {
        this.modelQuery = modelQuery;
        this.query = query;
    }


    // search functionalities with specific fields
    search(searchableFields: string[]) {
        const searchKey = this?.query?.searchKey;
        if (searchKey) {
            this.modelQuery = this.modelQuery.find({
                $or: searchableFields.map(
                    (field) =>
                        ({
                            [field]: { $regex: searchKey, $options: 'i' },
                        }) as FilterQuery<T>,
                ),
            });
        }

        return this;
    }


    // filter functionalities
    filter(exceptFields: string[] = []) {
        const queryObj = { ...this.query };

        const excludeFields = ['searchKey', 'limit', 'page', 'sort', 'fields', 'populate', ...exceptFields];

        excludeFields.forEach((el) => delete queryObj[el]);

        this.modelQuery = this.modelQuery.find(queryObj as FilterQuery<T>);

        return this;
    }


    // sorting functionalities
    sort() {
        const sort =
            (this?.query?.sort as string)?.split(',')?.join(' ') || '-createdAt';
        this.modelQuery = this.modelQuery.sort(sort as string);

        return this;
    }


    // fields selection functionalities
    fields() {
        const fields =
            (this?.query?.fields as string)?.split(',')?.join(' ') || '-__v';

        this.modelQuery = this.modelQuery.select(fields);
        return this;
    }


    // pagination functionalities
    paginate() {
        const page = Number(this?.query?.page) || 1;
        const limit = Number(this?.query?.limit) || 10;
        const skip = (page - 1) * limit;

        this.modelQuery = this.modelQuery.skip(skip).limit(limit);

        return this;
    }


    // count the total of documents that match the query
    async countTotal() {
        const totalQueries = this.modelQuery.getFilter();
        const totalData = await this.modelQuery.model.countDocuments(totalQueries);
        const page = Number(this?.query?.page) || 1;
        const limit = Number(this?.query?.limit) || 10;
        const totalPage = Math.ceil(totalData / limit);

        return {
            page,
            limit,
            totalData,
            totalPage,
        };
    }
}

export default QueryBuilder;
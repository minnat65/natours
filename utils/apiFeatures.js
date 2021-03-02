class APIfeatures {
    constructor(query, queryString) {
        this.query = query;
        this.queryString = queryString;
    }
    filter() {
        //Build the query and Filtering
        const queryObj = { ...this.queryString }; //... will make an independent object
        const excludeFileds = ['page', 'limit', 'sort', 'fields']; //an array of 4 elements
        excludeFileds.forEach(el => delete queryObj[el]);

        //Advance filtering
        let queryStr = JSON.stringify(queryObj);
        queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, match => `$${match}`); //replace gte to $gte through RegEx

        this.query = this.query.find(JSON.parse(queryStr));
        //console.log(JSON.parse(queryStr));
        //let query = Tour.find(JSON.parse(queryStr)); //find() will return an array of elements or object.

        return this;
    }
    sorting() {
        if (this.queryString.sort) {
            const sortBy = this.queryString.sort.split(',').join(' ');
            this.query = this.query.sort(sortBy);
            //console.log(sortBy);
        } else {
            this.query = this.query.sort('-createdAt');
        }
        return this;
    }
    limitFields() {
        if (this.queryString.fields) {
            const fields = this.queryString.fields.split(',').join(' ');
            this.query = this.query.select(fields); //onle selected field will be returned
        } else {
            this.query = this.query.select('-__v'); // -ve sign will exclude this field. 
        }
        return this;
    }
    paginate() {
        const page = this.queryString.page * 1 || 1; //default page is 1.
        const limit = this.queryString.limit * 1 || 100; //default limit is 100.
        const skip = (page - 1) * limit;
        this.query = this.query.skip(skip).limit(limit);

        /*if (this.queryString.page) {
            const totalTours = Tour.countDocuments();
            if (skip >= totalTours) throw new Error('Page does not exist');

        }*/
        return this;
    }

}

module.exports= APIfeatures;
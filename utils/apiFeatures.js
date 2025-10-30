class APIFeatures {
  constructor(query, queryString) {
    this.query = query;
    this.queryString = queryString;
  }

  // 1) Filtering
  filter() {
    const queryObj = { ...this.queryString };
    const excludedFields = ['page', 'sort', 'limit', 'fields'];
    excludedFields.forEach((el) => delete queryObj[el]);

    // 1B) Advanced Filtering
    let QueryStr = JSON.stringify(queryObj);
    QueryStr = QueryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`); // regular expression to match the gte to $gte and so on...
    this.query = this.query.find(JSON.parse(QueryStr));

    return this;
  }

  // 2) Sorting
  sort() {
    if (this.queryString.sort) {
      const sortBy = this.queryString.sort.split(',').join(' ');
      this.query = this.query.sort(sortBy);
    } else {
      // default sorting by created date in case the user didn't use sorting anymore (hint: the minus '-' is for desending order to show the newest date)
      this.query = this.query.sort('-createdAt');
    }
    return this;
  }

  // 3) Limitting Fields
  limitFields() {
    if (this.queryString.fields) {
      const fields = this.queryString.fields.split(',').join(' ');
      this.query = this.query.select(fields);
    } else {
      // the default here is to select all fields except the '__v' field by adding minus '-' before it
      this.query = this.query.select('-__v');
    }
    return this;
  }

  // 4) Pagination
  paginate() {
    const page = this.queryString.page * 1 || 1; // multiply by 1 is a trick to convert the string to a number and the '||' is to set the default page to 1
    const limit = this.queryString.limit * 1 || 100; // multiply by 1 is a trick to convert the string to a number and the '||' is to set the default limit to 100
    const skip = (page - 1) * limit; // this formula used to skip the fields we want to show the desired page (E.g: page3 -> (3-1)*10 = 20)
    // page=2&limit=10 --- 1,10 -> page1 - 11,20 -> page2 - 21,30 -> page3 , so we use skip to select which page that we want
    this.query = this.query.skip(skip).limit(limit);

    return this;
  }
}

module.exports = APIFeatures;

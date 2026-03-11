// ===== src/utils/apiFeatures.js =====
const { Op } = require('sequelize');

/**
 * Sequelize-friendly API features for filtering, sorting, pagination, and field limiting.
 */
class APIFeatures {
  constructor(queryString) {
    this.queryString = queryString;
    this.where = {};
    this.order = [];
    this.attributes = null;
    this.limitValue = 100;
    this.offsetValue = 0;
  }

  filter() {
    const queryObj = { ...this.queryString };
    const excludedFields = ['page', 'sort', 'limit', 'fields', 'search', 'startDate', 'endDate'];
    excludedFields.forEach((el) => delete queryObj[el]);

    Object.keys(queryObj).forEach((key) => {
      const value = queryObj[key];
      const match = key.match(/^(.+)\[(gte|gt|lte|lt|in|nin|ne|eq)\]$/);

      if (match) {
        const field = match[1];
        const op = match[2];
        const operatorMap = {
          gte: Op.gte,
          gt: Op.gt,
          lte: Op.lte,
          lt: Op.lt,
          in: Op.in,
          nin: Op.notIn,
          ne: Op.ne,
          eq: Op.eq
        };
        const operator = operatorMap[op];
        const parsedValue = op === 'in' || op === 'nin'
          ? String(value).split(',').map((v) => v.trim())
          : value;

        if (!this.where[field]) this.where[field] = {};
        this.where[field][operator] = parsedValue;
      } else {
        this.where[key] = value;
      }
    });

    return this;
  }

  sort() {
    if (this.queryString.sort) {
      const sortFields = this.queryString.sort.split(',');
      this.order = sortFields.map((field) => {
        if (field.startsWith('-')) {
          return [field.slice(1), 'DESC'];
        }
        return [field, 'ASC'];
      });
    } else {
      this.order = [['created_at', 'DESC']];
    }

    return this;
  }

  limitFields() {
    if (this.queryString.fields) {
      this.attributes = this.queryString.fields.split(',').map((field) => field.trim());
    }
    return this;
  }

  paginate() {
    const page = parseInt(this.queryString.page, 10) || 1;
    const limit = parseInt(this.queryString.limit, 10) || 100;
    const offset = (page - 1) * limit;

    this.limitValue = limit;
    this.offsetValue = offset;
    return this;
  }

  search(fields = []) {
    if (this.queryString.search && fields.length > 0) {
      const searchValue = `%${this.queryString.search}%`;
      this.where[Op.or] = fields.map((field) => ({
        [field]: { [Op.iLike]: searchValue }
      }));
    }
    return this;
  }

  dateRange(dateField = 'created_at') {
    const { startDate, endDate } = this.queryString;
    if (startDate || endDate) {
      const range = {};
      if (startDate) range[Op.gte] = new Date(startDate);
      if (endDate) range[Op.lte] = new Date(endDate);
      this.where[dateField] = range;
    }
    return this;
  }

  build() {
    return {
      where: this.where,
      order: this.order,
      attributes: this.attributes || undefined,
      limit: this.limitValue,
      offset: this.offsetValue
    };
  }
}

module.exports = APIFeatures;

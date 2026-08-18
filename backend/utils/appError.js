class AppError extends Error {
  constructor(message, status) {
    super(message);
    this.status = status;
  }
  create(message, statusCode, statusText) {
    this.message = message;
    this.statusCode = statusCode;
    this.statusText = statusText;
    return this;
  }
}
module.exports = new AppError();
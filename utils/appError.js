const app = require("../app");

class appError extends Error {
    constructor(message, statusCode){
        super(message);
        this.statusCode= statusCode;
        this.status= `${statusCode}`.startsWith('4') ? 'Failed' : 'error';
        this.isOperation = true;

        Error.captureStackTrace(this, this.constructor);
    }
}

module.exports= appError;
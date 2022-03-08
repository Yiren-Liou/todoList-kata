const { headers } = require('./headers');

const errorHandler = (res, status, message) => {
  res.writeHead(status, headers);
  res.write(JSON.stringify({
    status: 'false',
    message
  }));
  res.end();
}

const successHandler = (res, todoList, message) => {
  res.writeHead(200, headers)
  res.write(JSON.stringify({
    status: 'success',
    message,
    data: todoList
  }));
  res.end();
}

module.exports = {
  errorHandler,
  successHandler
}
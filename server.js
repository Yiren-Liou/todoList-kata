// 載入 node.js 內部套件
const http = require('http');
// 載入 npm 外部套件
const { v4: uuidv4 } = require('uuid');
// 載入 自行撰寫 套件
const errorHandler = require('./errorHandler');

const todoList = [];

const reqFunction = function (req, res) {
  const headers = {
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, Content-Length, X-Requested-With',
    'Access-Control-Allow-Origin': '*', // 跨網域
    'Access-Control-Allow-Methods': 'PATCH, POST, GET,OPTIONS,DELETE',
    'Content-Type': 'application/json'
  };
  let body = '';
  req.on('data', chunk => {
    body += chunk;
  })
  if(req.url == '/todos' && req.method == 'GET') {
    res.writeHead(200, headers);
    res.write(JSON.stringify({
      'status': 'success',
      'data': todoList
    }));
    res.end();
  } else if(req.url == '/todos' && req.method == 'POST') {
    req.on('end', () => {
      try {
        const title = JSON.parse(body).title; // 將 字串 轉為 物件 格式
        if(title !== undefined) {
          const todo = {
            "id": uuidv4(),
            "title": title
          };
          todoList.push(todo);
          res.writeHead(200, headers);
          res.write(JSON.stringify({
            'status': 'success',
            'data': todoList
          }));
          res.end();
        } else {
          errorHandler(res);
        }
      }
      catch {
        errorHandler(res)
      }
    })
  } else if(req.url == '/todos' && req.method == 'DELETE'){
    // delete 請求 因為不需要接收 res 是否有資料傳過來
    // 所以不用寫 res.on
    todoList.length = 0;
    res.writeHead(200, headers);
    res.write(JSON.stringify({
      'status': 'success',
      'data': todoList,
    }));
    res.end();
  } else if(req.url.startsWith('/todos/') && req.method == 'DELETE'){
    const id = req.url.split('/').pop();
    const delIndex = todoList.findIndex(e => e.id == id);
    if(delIndex !== -1) {
      todoList.splice(delIndex, 1);
      res.writeHead(200, headers);
      res.write(JSON.stringify({
        'status': 'success',
        'data': todoList,
      }));
      res.end();
    } else {
      errorHandler(res);
    }
  } else if(req.url.startsWith('/todos/') && req.method == 'PATCH') {
    req.on('end', () => {
      try {
        const updateTitle = JSON.parse(body).title;
        const id = req.url.split('/').pop();
        const patchIndex = todoList.findIndex(e => e.id == id);
        if(updateTitle !== undefined && patchIndex !== -1) {
          todoList[patchIndex].title = updateTitle;
          res.writeHead(200, headers);
          res.write(JSON.stringify({
            'status': 'success',
            'data': todoList,
          }));
          res.end();
        } else {
          errorHandler(res);
        }
      }
      catch{
        errorHandler(res);
      }
    })
  } else if (req.url == '/todos' && req.method == 'OPTIONS') {
    res.writeHead(200, headers);
    res.end();
  } else {
    res.writeHead(404, headers);
    res.write(JSON.stringify({
      'status': 'error',
      'message': '來錯地方了'
    }));
    res.end();
  }
}

const server = http.createServer(reqFunction);
server.listen(process.env.PORT || 8080);
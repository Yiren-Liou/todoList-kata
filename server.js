// 載入 node.js 內部套件
const http = require('http');
// 載入 npm 外部套件
const { v4: uuidv4 } = require('uuid');
// 載入 自行撰寫 套件
const {errorHandler, successHandler} = require('./handlers/responseHandler');

const todoList = [];

const reqFunction = function (req, res) {
  const apiMethod = req.method;
  const apiUrl = req.url;
  let body = '';

  req.on('data', chunk => {
    body += chunk;
  })

  if(apiUrl == '/todos' && apiMethod == 'GET') {
    const message = todoList.length > 0? '代辦事項取得成功': '目前沒有代辦事項呦';
    successHandler(res, todoList, message);
  } else if(apiUrl == '/todos' && apiMethod == 'POST') {
    req.on('end', () => {
      try {
        const title = JSON.parse(body).title;
        if(title !== undefined) {
          const todo = {
            "id": uuidv4(),
            title
          };
          todoList.push(todo);
          successHandler(res, todoList, '資料新增成功');
        } else {
          errorHandler(res, '400', '資料輸入錯誤');
        }
      }
      catch {
        errorHandler(res, '400', '建立資料失敗');
      }
    })
  } else if(apiUrl == '/todos' && apiMethod == 'DELETE'){
    todoList.length = 0;
    successHandler(res, todoList, '全部資料刪除成功');
  } else if(apiUrl.startsWith('/todos/') && apiMethod == 'DELETE'){
    const id = apiUrl.split('/').pop();
    const delIndex = todoList.findIndex(e => e.id == id);
    if(delIndex !== -1) {
      todoList.splice(delIndex, 1);
      successHandler(res, todoList, `刪除 ${id} 成功`);
    } else {
      errorHandler(res, '400', `刪除失敗,資料輸入錯誤或找不到此 id = ${id}`);
    }
  } else if(apiUrl.startsWith('/todos/') && apiMethod == 'PATCH') {
    req.on('end', () => {
      try {
        const updateTitle = JSON.parse(body).title;
        const id = apiUrl.split('/').pop();
        const patchIndex = todoList.findIndex(e => e.id == id);
        if(updateTitle !== undefined && patchIndex !== -1) {
          todoList[patchIndex].title = updateTitle;
          successHandler(res, todoList, `修改 ${id} 成功`);
        } else {
          errorHandler(res, '400', `修改失敗,資料輸入錯誤或找不到此 id = ${id}`);
        }
      }
      catch{
        errorHandler(res, '400', '更新失敗');
      }
    })
  } else if (apiUrl == '/todos' && apiMethod == 'OPTIONS') {
    res.writeHead(200, headers);
    res.end();
  } else {
    errorHandler(res, '404', '來錯地方了');
  }
}

const server = http.createServer(reqFunction);
server.listen(process.env.PORT || 8080);

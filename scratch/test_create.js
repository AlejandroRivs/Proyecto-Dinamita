const http = require('http');

async function testCreate() {
  // 1. Login to get cookie
  const loginData = JSON.stringify({ username: 'alejandro', password: 'admin123' });
  
  const loginReq = http.request({
    hostname: 'localhost',
    port: 3000,
    path: '/api/auth/login',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': loginData.length
    }
  }, (res) => {
    let cookie = res.headers['set-cookie'] ? res.headers['set-cookie'][0].split(';')[0] : '';
    console.log('Login Status:', res.statusCode);
    
    // 2. Create Task
    const taskData = JSON.stringify({
      title: 'Validación Automática',
      description: 'Esta es una tarea creada desde script para validación.',
      assigned_to: null,
      complexity: 'Simple',
      is_extra: true,
      time_limit_minutes: 30
    });

    const createReq = http.request({
      hostname: 'localhost',
      port: 3000,
      path: '/api/tasks/create',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(taskData),
        'Cookie': cookie
      }
    }, (resCreate) => {
      let body = '';
      resCreate.on('data', chunk => body += chunk);
      resCreate.on('end', () => {
        console.log('Create Task Status:', resCreate.statusCode);
        console.log('Create Task Response:', body);
      });
    });
    
    createReq.on('error', console.error);
    createReq.write(taskData);
    createReq.end();
  });

  loginReq.on('error', console.error);
  loginReq.write(loginData);
  loginReq.end();
}

testCreate();

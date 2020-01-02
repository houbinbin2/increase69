const child_process = require('child_process');
const os = require("os")
const number = os.cpus().length > 4 ? 4 : os.cpus().length;
console.log('cpus number', number)

for (let i = 0; i < number; i++) {
  const worker_process = child_process.fork("index.js", [i]);
  worker_process.on('close', function (code) {
    console.log('process exit' + code);
  });
}
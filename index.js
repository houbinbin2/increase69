const fs = require('fs-extra');

const fire = require('./common');
const projectName = JSON.parse(fs.readFileSync('./package.json')).name;


const options = {
  showIp: false,
  project: `/data/${projectName}`,
}

options.CIType = process.argv[2];

fire(options);

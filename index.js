const puppeteer = require('puppeteer');
const _ = require('lodash');
const fs = require('fs');
// const getIP = require('./src/getIP');
const showAds = require('./src/showAds');
const devices = require('./src/deviceInfo');
const sleep = require('./src/sleep');

const EventEmitter = require('events').EventEmitter;
const event = new EventEmitter();
const browserCount = 4;
const browserTabs = 6;

const options = {
  args: [
    '--disable-dev-shm-usage',
    '-–no-sandbox',
    '-–disable-setuid-sandbox',
    '--lang=en-US,en;q=0.9',
  ],
  // executablePath: './chromium/chrome.exe',
  ignoreHTTPSErrors: 'true',
  headless: false,
  timeout: 60000,
}

const projectName = JSON.parse(fs.readFileSync('./package.json')).name;
const files = fs.readdirSync(`./data/${projectName}`);
const randomIndex = _.random(files.length - 1);
const source = JSON.parse(fs.readFileSync(`./data/${projectName}/${files[randomIndex]}`));
const datas = _.chunk(source, browserTabs);


async function browserGo(urls) {
  const browser = await puppeteer.launch(options);
  const length = urls.length;
  let count = 0;
  const deviceIndex = parseInt(Math.random() * devices.length, 10);
  const device = devices[deviceIndex];
  console.log(device.name);
  for (let i = 0; i < length; i++) {
    await sleep(2000);
    browser.newPage()
      .then(async (page) => {
        await page.emulate(device);
        return page;
      })
      .then(page => {
        page.goto(urls[i], {timeout: 0}).then(async () => {
          await showAds(page);
          console.log(urls[i]);
          const cookies = await page.cookies();
          for (let i = 0; i < cookies.length; i++) {
            await page.deleteCookie({ name: cookies[i].name });
          }
          count = count + 1;
          if (count === length) {
            browser.close();
            console.log('browser finish');
            setTimeout(() => {
              const urls = datas.pop();
              if (urls) {
                event.emit('taskEvent', _.partial(browserGo, urls));
              } else {
                console.log('over');
              }
            }, 2000);
          }
        }).catch(async () => {
          await showAds(page);
          const cookies = await page.cookies();
          for (let i = 0; i < cookies.length; i++) {
            await page.deleteCookie({ name: cookies[i].name });
          }
          count = count + 1;
          if (count === length) {
            browser.close();
            console.log('finish');
            setTimeout(() => {
              const urls = datas.pop();
              if (urls) {
                event.emit('taskEvent', _.partial(browserGo, urls));
              } else {
                console.log('over');
              }
            }, 2000);
          }
        })
      });
  }
};

event.setMaxListeners(browserCount)
event.on('taskEvent', fn => fn());

async function fire() {
  for (let i = 0; i < browserCount; i++) {
    const urls = datas.pop();
    browserGo(urls)
  }
}

fire()

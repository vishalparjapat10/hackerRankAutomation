const puppeteer = require('puppeteer');

let credentials= require('./secrets');
let emailId = credentials.emailId;
let password = credentials.password;

let cTab;

let browserOpenPromise = puppeteer.launch({
    headless:false,//browser(chromium) will not be open if set to true,although work/testing will be being done behind the scenes
    defaultViewport:null,//Sets the viewport for each page.
    args:["--start-maximized"],
    // to get executable path just search chrome://version in chrome browser
    executablePath:"C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe"
});

browserOpenPromise.then(function(browser){
    // console.log("browser is open");
    
    // An array of all open pages inside the Browser.
    let allTabsPromise = browser.pages();// to open a new tab & and it all returns a promise
    return allTabsPromise;
}).then(function (allTabsArr){
    cTab = allTabsArr[0];
    let visitingLoginPagePromise = cTab.goto("https://www.hackerrank.com/auth/login");//, URL to navigate page to & it returns a promise
    return visitingLoginPagePromise;
}).then(function(){
    console.log("Opened Hackerrank Login page");
    let emailWillBeTypedPromise = cTab.type("#input-1",emailId);// this will type the text(email) to provide element
    return emailWillBeTypedPromise;
}).then(function(){
    console.log("email is typed");
    let passwordWillBeTypedPromise = cTab.type("#input-2",password);
    return passwordWillBeTypedPromise;
}).then(function(){
    console.log("password is typed");
    let willBeLoggedInPromise = cTab.click('button[data-analytics="LoginPassword"]');
    return willBeLoggedInPromise;
   
}).then(function(){
    console.log("Logged In");
})
.catch(function(err){
    console.log(err);
});

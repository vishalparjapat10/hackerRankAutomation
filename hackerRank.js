const puppeteer = require('puppeteer');

let credentials= require('./secrets');
let emailId = credentials.emailId;
let password = credentials.password;
let {answer} = require("./codes");

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
    // let algorithmTabWillBeOpenedPromise = cTab.click('div[data-automation="algorithms"]');// sometimes a certain page or tab takes time to load and in the meantime it searches for the given selector and don't wait to relaod the page and then doesn't find the given selector and give error.
    // So to overcome above problem we do the following

    // waitAndClick will wait for the entire webPage or selector to load, and then it will find the needed node and then click the button/element
    let algorithmTabWillBeOpenedPromise = waitAndClick('div[data-automation="algorithms"]');
    return algorithmTabWillBeOpenedPromise;
}).then(function(){
    console.log("Algorithm pages is opened");
    let allQuesPromise = cTab.waitForSelector('a[data-analytics="ChallengeListChallengeName"]');
    return allQuesPromise;
}).then(function(){
    function getAllQuesLinks(){
        let allElemArr = document.querySelectorAll('a[data-analytics="ChallengeListChallengeName"]');
        let linksArr = [];
        for(let i = 0;i < allElemArr.length;i++){
            linksArr.push(allElemArr[i].getAttribute("href"));
        }
        return linksArr;
    }

    // .evaluate will execute the above function in the current tab because we want to execute here in current tab
    let linksArrPromise = cTab.evaluate(getAllQuesLinks);// evauluate also returns a promise
    return linksArrPromise;
    
}).then(function(linksArr){
    console.log("linsk to all questions received");
    console.log(linksArr);

    let questionWillBeSolvedPromise = questionSolver(linksArr[0],0);// link to the question to be solved,idx of the linksArr
    for (let i = 1; i < linksArr.length; i++){
        questionWillBeSolvedPromise = questionWillBeSolvedPromise.then(function () {
          return questionSolver(linksArr[i], i);
        })
      }

    return questionWillBeSolvedPromise;
}).then(function(){
    console.log("questions is solved");
})
.catch(function(err){
    console.log(err);
});

function waitAndClick(algoBtn){
    let myPromise = new Promise(function(resolve,reject){
        let waitForSelectorPromise = cTab.waitForSelector(algoBtn);// it is an inbult function whoch will wait and find the selector,if it is find then the promise will be fullfilled
        waitForSelectorPromise.then(function(){
            console.log("algo button is found");
            let clickPromise = cTab.click(algoBtn);
            return clickPromise;
        }).then(function (){
            console.log("algo button is clicked");
            resolve(); 
        })
        .catch(function (err){
            reject(err);
        })
    })
    return myPromise;
}

function questionSolver(url, idx) {
    return new Promise(function (resolve, reject) {
      let fullLink = `https://www.hackerrank.com${url}`;
      let goToQuesPagePromise = cTab.goto(fullLink);
      goToQuesPagePromise
        .then(function () {
          console.log("question opened");
          //tick the custom input box mark
          let waitForCheckBoxAndClickPromise = waitAndClick(".checkbox-input");
          return waitForCheckBoxAndClickPromise;
        })
        .then(function () {
          //select the box where code will be typed
          let waitForTextBoxPromise = cTab.waitForSelector(".custominput");
          return waitForTextBoxPromise;
        })
        .then(function () {
          let codeWillBeTypedPromise = cTab.type(".custominput", answer[idx], {
            delay: 100,
          });
          return codeWillBeTypedPromise;
        })
        .then(function () {
          //control key is pressed promise
          let controlPressedPromise = cTab.keyboard.down("Control");
          return controlPressedPromise;
        })
        .then(function () {
          let aKeyPressedPromise = cTab.keyboard.press("a");
          return aKeyPressedPromise;
        })
        .then(function () {
          let xKeyPressedPromise = cTab.keyboard.press("x");
          return xKeyPressedPromise;
        })
        .then(function () {
          let ctrlIsReleasedPromise = cTab.keyboard.up("Control");
          return ctrlIsReleasedPromise;
        })
        .then(function () {
          //select the editor promise
          let cursorOnEditorPromise = cTab.click(
            ".monaco-editor.no-user-select.vs"
          );
          return cursorOnEditorPromise;
        })
        .then(function () {
          //control key is pressed promise
          let controlPressedPromise = cTab.keyboard.down("Control");
          return controlPressedPromise;
        })
        .then(function () {
          let aKeyPressedPromise = cTab.keyboard.press("A");
          return aKeyPressedPromise;
        })
        .then(function () {
          let vKeyPressedPromise = cTab.keyboard.press("V");
          return vKeyPressedPromise;
        })
        .then(function () {
          let controlDownPromise = cTab.keyboard.up("Control");
          return controlDownPromise;
        })
        .then(function () {
          let submitButtonClickedPromise = cTab.click(".hr-monaco-submit");
          return submitButtonClickedPromise;
        })
        .then(function () {
          console.log("code submitted successfully");
          resolve();
        })
        .catch(function (err) {
          reject(err);
        });
    });
  }
  
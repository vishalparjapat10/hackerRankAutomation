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
    let linksArrPromise = cTab.evaluate(getAllQuesLinks);
    return linksArrPromise;
    
}).then(function(linksArr){
    console.log("linsk to all questions received");
    console.log(linksArr);

    let questionsWillBeSolvedPromise = questionSolver(linksArr[0],0);// link to the question to be solved,idx of the linksArr

    return questionsWillBeSolvedPromise;
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

function questionSolver(url,idx){

    return new Promise(function(resolve,reject){
        let fullLink = `https://www.hackerrank.com${url}`;
        let goToQuesPagePromise = cTab.goto(fullLink);
        goToQuesPagePromise.then(function(){
            console.log("question opened");
            // steps to solve a question :-
            // 1. tick the custom input puppeteer.BrowserContext(CIB)
            // 2. type the code in CIB
            // 3. ctrl + a code from CIB
            // 4. ctrl+x code from CIB
            // 5. select editor
            // 6. ctrl + a editor
            // 7. ctrl + v editor -> code paste
            // 8. Run code btn click 

            // tick the custome input mark
            let waitForCheckBoxAndClickPromise = waitAndClick(".checkbox-input");
            return waitForCheckBoxAndClickPromise;
        }).then(function(){
            // select the box CIB to type the code
            let waitForTExtBoxPromise = cTab.waitForSelector(".custominput");
            return waitForTExtBoxPromise;
        }).then(function(){
            let codeWillBeTypedPromise = cTab.type(".custominput",answer[idx]);
            return codeWillBeTypedPromise;
        }).then(function(){
            // select all code from box(CIB)
            // control key is pressed from keyboard
            let controlPressedPromise = cTab.keyboard.press("Control");
            return controlPressedPromise;
        }).then(function(){
            let aKeyPressedPromise = cTab.keyboard.press("a");
            return aKeyPressedPromise;
        }).then(function(){
            let xKeyPressedPromise = cTab.keyboard.press("x");
            return xKeyPressedPromise;
        }).then(function(){
            // select editor
            let cursorOnEditorPromise = cTab.click('.monaco-editor.no-user-select.vs')
        }).then(function(){
            // control + a,control is already being pressed, so we will press only a
            let aKeyPressedPromise = cTab.keyboard.press("a");
            return aKeyPressedPromise;
        }).then(function(){
            let vKeyPressedPromise = cTab.keyboard.press("v");
            return vKeyPressedPromise;
        }).then(function(){
            let submitButtonClickedPromise = cTab.click('.hr-monaco-submit');
            return submitButtonClickedPromise;
        }).then(function(){
            let controlDownPromise = cTab.keyboard.up("Control");
            return controlDownPromise;
        }).then(function(){
            console.log("Code submitted successfully");
            resolve();
        })
        .catch(function(err){
            reject(err);
        })
    });
  
}

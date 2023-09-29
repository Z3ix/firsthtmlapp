// Consts
const HISTORY_MAX_SIZE=10;
const MEMORY_MAX_SIZE=16;

// Variables
var curInput="0";
var firstArg="";
var secondArg="";
var curOperation="";
var lastResult="0";
var calcHistory=[];
var calcMemory=[];
// Elements
const numbers = document.querySelector('.numbers');
const operation = document.querySelector('.operation');
const historyContainer = document.querySelector('.history-container');
const memoryContainer =  document.querySelector('.memory-container');
numbers.innerHTML=curInput;

// Event Handlers
document.querySelector('body').addEventListener('keypress',keyEvent);
document.querySelector('.buttons-container').addEventListener('click',buttonEvent);
document.querySelector('#clear-memory').addEventListener('click',clearMemory);
document.querySelector('#clear-history').addEventListener('click',clearHistory);
memoryContainer.addEventListener('click', memoryHandler);







loadFromStorage();

function updateStorageHistory(){
    if (calcHistory.length>0){
        localStorage.setItem('history',JSON.stringify(calcHistory));
    }else{
        localStorage.removeItem('history');
    }
}

function updateStorageMemory(){
    if (calcMemory.length>0){
        localStorage.setItem('memory',JSON.stringify(calcMemory));
    }else{
        localStorage.removeItem('memory');
    }
}
function loadFromStorage(){
    let h = localStorage.getItem('history');
    if(h){
        calcHistory=JSON.parse(h);
        let temp=JSON.parse(h).reverse();
        temp.forEach((item)=>{
            insertItem('history',item);
        });
    }
    let m = localStorage.getItem('memory');
    if(m){
        calcMemory=JSON.parse(m);
        let temp=JSON.parse(m).reverse();
        temp.forEach((item)=>{
            insertItem('memory',item);
        });
        
    }
}
function validateNum(num){
    return isFinite(num);
}
function clearHistory(){
    document.querySelectorAll('.history-item').forEach((item)=>{
        item.remove();
    });
    calcHistory=[];
    updateStorageHistory();
    
}
function clearMemory(){
    document.querySelectorAll('.memory-item').forEach((item)=>{
        item.remove();
    });
    calcMemory=[];
    updateStorageMemory();
}

function updateInput(i,b=true){
    curInput=i;
    if(b){
        numbers.innerHTML=curInput;
    }
}
function submitNumber(){
    if(curInput!==""){
        if(curOperation===""){
            firstArg=new Decimal(curInput);
        }else{
            secondArg=new Decimal(curInput);
        }
        updateInput("",false);
    }
}

function pushNumber(num){
    if (curInput.length>17){
        return;
    }
    if(curInput==="0" && num!=="."){
        updateInput(num);
    }else{
        updateInput(curInput+num);
    }


   
}
function pushOperation(op){
    submitNumber();
    if(secondArg!=="" && curOperation!==""){
        calculate();
    }
    curOperation=op;
    operation.innerHTML=curOperation;
}
function addition(a,b){
    return a.plus(b);
}
function subtraction(a,b){
    return a.minus(b);
}
function division(a,b){
    return a.dividedBy(b);
}
function multiplication(a,b){
    return a.times(b);
}
function power(a,b){
    return a.toPower(b);
}
function sin(a){
    return a.sine();
}
function cos(a){
    return a.cosine();
}
function sqrt(a){
    return a.squareRoot();
}
function pushE(){
    updateInput(Math.E);
}
function pushPi(){
    updateInput(Math.PI);
}

function getLastOperation(){
    if(calcHistory.length>0){
        return calcHistory[0]['operation'];
    }
    return "";
    
}

function getLastsecondArg(){
    if(calcHistory.length>0){
        return calcHistory[0]['secondArg'];
    }
    return "";
}
function getLastResult(){
    if(calcHistory.length>0){
        return calcHistory[0]['result'];
    }
    return lastResult;
}

function calculate(){
    submitNumber();
    if (curOperation===""){
        curOperation=getLastOperation();
        secondArg=getLastsecondArg();
    }
    if(firstArg===""){
        firstArg =getLastResult();
    }
    if(secondArg===""){
        secondArg=firstArg;
    }
    let result;
    if(curOperation=="+"){
        result=addition(firstArg,secondArg);
    }else if(curOperation=="-"){
        result=subtraction(firstArg,secondArg);
    }else if(curOperation=="/"){
        result=division(firstArg,secondArg);
    }else if(curOperation=="*"){
        result=multiplication(firstArg,secondArg);
    }else if (curOperation=="^"){
        result=power(firstArg,secondArg);
    }else if (curOperation=="sin"){
        result=sin(firstArg);
    }else if (curOperation=="cos"){
        result=cos(firstArg);
    }else if (curOperation=="sqrt"){
        result=sqrt(firstArg);
    }else{
        return;
    }
    logHistory({
        firstArg : firstArg,
        operation : curOperation,
        secondArg : secondArg,
        result : result,});
    curInput="";
    firstArg="";
    secondArg="";
    lastResult=result;
    numbers.innerHTML=lastResult.toString();
    curOperation="";
    operation.innerHTML=curOperation;
    
}

function insertItem(type,data){
    let html;
    let item=document.createElement("div");
    item.classList.add(`${type}-item`);  
    if(type=='memory'){
        html=`<button class="memory-remove">x</button><button class="memory-value">${data.toString()}</button>`;
        memoryContainer.appendChild(item);
        memoryContainer.insertBefore(item,memoryContainer.children[0]); 
    }else if(type=='history'){
        html=`<div></div><div>${data['firstArg'].toString()}</div><div class='right'>${data['operation']}</div><div>${data['secondArg']}</div><div class='right'>=</div><div class='bold'>${data['result']}</div>`;
        historyContainer.appendChild(item);
        historyContainer.insertBefore(item,historyContainer.children[0]);
    }else{
        item.remove();
        return;
    }
    item.innerHTML=html;
}
function removeLastHistoryItem(){
    calcHistory.pop();
    let items=document.querySelectorAll('.history-item');
    items[items.length-1].remove();
}
function logHistory(data){
    // We need only one argument for some operations
    if(data[operation]=="sin" || data[operation]=="cos" || data[operation]=="sqrt"){
        data[firstArg]="";
    }
    calcHistory.unshift(data);
    // Drawing UI element
    insertItem('history',data);

    // Checking for exceeding maximum size
    if(calcHistory.length>HISTORY_MAX_SIZE){
        removeLastHistoryItem();
    }
    // Updating local storage
    updateStorageHistory();
}
function logMemory(){
    let logInput;
    // Looking what we are going to remember
    if (curInput!=="" && curInput!=="0"){
        logInput=curInput;
    } else if (lastResult.toString()!="0"){
        logInput=lastResult.toString();
    } else {
        return;
    }
    // Is it already there? 
    // Did we hit the limit?
    if (calcMemory.find((item)=>item.toString()==logInput) || calcMemory.length>=MEMORY_MAX_SIZE){
        return;
    }

    calcMemory.unshift(new Decimal(logInput));

    insertItem('memory',logInput);

    updateStorageMemory();
}
function deleteItemFromMemory(e){
    // Getting parent Item element
    let parent=e.target.parentElement;
    let value = parent.children[1].textContent;
    parent.remove();

    // Removing value from Memory
    calcMemory=calcMemory.filter((item)=>(item.toString()!=value));

    //Updating local storage
    updateStorageMemory();

}
function restoreMemory(e){
    let item=e.target.parentElement;
    updateInput(item.children[1].textContent);
}
function memoryHandler(e){
    if(e.target.classList.contains('memory-remove')){
        deleteItemFromMemory(e);
    }else if(e.target.classList.contains('memory-value')){
        restoreMemory(e);
    }

}
function clearInput(){
    updateInput("0");
    curOperation="";
    operation.innerHTML=curOperation;
}
function reverseSign(){
    updateInput(curInput*-1);
}
function popNumber(){
    updateInput(curInput.substring(0,curInput.length-1));
}
function buttonEvent(e){
    if(!e.target.classList.contains('btn')){
        return;
    }
    let id=e.target.id
    if(id>=0 || id=="."){
        pushNumber(id);
    }else if(id=="/" || id=="*" || id=="+" || id=="-"|| id=="^"){
        pushOperation(id);
    }else if(id=="="){
        calculate();
    }else if(id=="m+"){
        logMemory();
    }else if(id=="c"){
        clearInput();
    }else if(id=="sign"){
        reverseSign();
    }else if(id=="backspace"){
        popNumber();
    }else if(id=="e"){
        pushE();
    }else if(id=="pi"){
        pushPi();
    }else if(id=="sin"|| id=="cos" || id=="sqrt"){
        pushOperation(id);
        calculate();
    }
}
function keyEvent(e){
    e.preventDefault();
    if(e.key>=0 || e.key == "."){
        pushNumber(e.key);
    }else if(e.key=="/" || e.key=="*" || e.key=="+" || e.key=="-"){
        pushOperation(e.key);
    }else if(e.key=="=" || e.key=="Enter"){
        calculate();
    }else if(e.key=="c"){
        clearInput();
    }else if(e.key=="e"){
        pushE();
    }else if(e.key=="p"){
        pushPi();
    }
}
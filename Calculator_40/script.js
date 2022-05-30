let numbers = document.querySelectorAll(".number");
let ops = document.querySelectorAll(".operator");
let decimalBtn = document.getElementById("decimal"),
    clearBtns = document.querySelectorAll(".clear-btn"),
    display = document.getElementById("display"),
    memoryCurrentNum = 0,
    memoryNewNum = false,
    memoryPendOp = "";

for (let i=0; i<numbers.length; i++){
    let number = numbers[i];
    number.addEventListener("click", function (el) {
        numberPress(el.target.textContent)
    })
}

for (let i=0; i<ops.length; i++){
    let op = ops[i];
    op.addEventListener("click", function (el) {
        operation(el.target.textContent)
    })
}

for (let i=0; i<clearBtns.length; i++){
    let clearBtn = clearBtns[i];
    clearBtn.addEventListener("click", function (el) {
        clear(el.target.id)
    })
}


function numberPress(num) {
    if (display.value.length > 10 && memoryPendOp === "") {
        alert("the number should not exceed 10 symbols");
    } else if(memoryNewNum){
        display.value = num;
        memoryNewNum = false;
    } else {
        (display.value === "0") ? display.value = num : display.value += num;
    }

}

function operation(op) {
    let localOpMem = display.value;
    if (memoryNewNum && memoryPendOp !== "=") {
        display.value = memoryCurrentNum
    } else {
        memoryNewNum = true;
        (memoryPendOp === "+") ? memoryCurrentNum += +localOpMem :
        (memoryPendOp === "-") ?  memoryCurrentNum -= +localOpMem :
        (memoryPendOp === "*") ? memoryCurrentNum *= +localOpMem :
        (memoryPendOp === "/") ?  memoryCurrentNum /= +localOpMem :
        memoryCurrentNum = +localOpMem
    }
    display.value = memoryCurrentNum;
    memoryPendOp = op;
}

decimalBtn.addEventListener("click", decimal);

function decimal() {
    let localDecMem = display.value;
    if(memoryNewNum ){
        localDecMem = "0."
        memoryNewNum = false;
    } else{
        if (localDecMem.indexOf(".") === -1) {
            localDecMem += "."
        }
    }
    display.value = localDecMem
}

function clear(id) {
    if (id === "ce") {
        display.value = 0;
        memoryNewNum = true;
    } else if(id === "c") {
        display.value = 0;
        memoryNewNum = true;
        memoryCurrentNum = 0;
        memoryPendOp = ""
    }
}

let asd = [];
let asdasd = {};

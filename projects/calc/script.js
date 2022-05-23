const disp = document.querySelector('.disp');
const numbers = document.querySelectorAll('.numbers>div');
const opBtns = document.querySelectorAll('#plus,#min,#mult,#div');
const clear = document.querySelector('#clr');
const equals = document.querySelector(".equal");



function calculate(calcString) {
  const numsArr = calcString.split(/\+|\-|\*|\//);
  const opsArr = calcString.split(/[0-9|\.]+/);
  opsArr.pop();
  opsArr.shift();
  console.log(numsArr, opsArr);

  const ops = {
    "+": (a, b) => a + b,
    "-": (a, b) => a - b,
    "*": (a, b) => a * b,
    "/": (a, b) => a / b,
  }

  function performOperation(operator){
    let operatorIndex = opsArr.indexOf(operator);
    console.log(numsArr[operatorIndex], numsArr[operatorIndex+1]);
    numsArr.splice(operatorIndex,
                    2, 
                    ops[operator](parseFloat(numsArr[operatorIndex]), parseFloat(numsArr[operatorIndex+1]))
                  );
    opsArr.splice(operatorIndex, 1);
  }
  
  while (opsArr.includes('*')){
    performOperation('*');
  }
  while (opsArr.includes('/')){
    performOperation('/');
  }
  while (opsArr.includes('+')){
    performOperation('+');
  }
  while (opsArr.includes('-')){
    performOperation('-');
  }
  
  console.log(numsArr, opsArr);

  return numsArr[0];
}


numbers.forEach( num => {
  num.addEventListener('click', () => {
    if (num.textContent==='.' && disp.innerHTML.endsWith('.')) return;
    disp.innerHTML += num.textContent;
  })
})

clear.addEventListener('click', () => {
  disp.innerHTML = "";
})

opBtns.forEach(op => {
  op.addEventListener('click', () => {
    const regex = new RegExp(/[\+|\-|\*|\/]$/);
    if (disp.innerHTML==='' || disp.innerHTML.match(regex)){
      return;
    }
    disp.innerHTML += op.textContent;
  })
})

equals.addEventListener('click', () => {
  disp.innerHTML = calculate(disp.innerHTML);
})


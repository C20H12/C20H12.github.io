function getPrecedence(operator) {
  // power > mul or div > add or sub > functions
  switch (operator) {
    case "^":
      return 4;
    case "×":
    case "÷":
    case "%":
    case "!":
      return 3;
    case "+":
    case "−":
      return 2;
    default:
      return 0;
  }
}

function getTokenType(token) {
  // returns the type of the token
  // numbers include e and pi
  const operators = ["+", "−", "×", "÷", "^", "%", "!"];
  const functions = [
    "sin", "cos", "tan", "asin", "acos",
    "atan", "ln", "log", "√", 
  ];

  if (operators.includes(token)) {
    return "operator";
  } else if (token === "e" || token === "π" || !isNaN(token)) {
    return "number";
  } else if (functions.includes(token)) {
    return "function";
  } else if (token === "(") {
    return "leftParenthesis";
  } else if (token === ")") {
    return "rightParenthesis";
  }
}

function isBinaryOperator(operator) {
  // returns true if the operator is binary
  // binary operators takes 2 oprands
  return ['+', '−', '×', '÷', '^'].includes(operator)
}

function toRPN(infixTokenList) {
  // shunting yard algorithm
  const outputQ = []
  const operatorStack = []

  for (const token of infixTokenList) {
    const tokenType = getTokenType(token)
    if (tokenType === "number") {
      outputQ.push(token)
    }
    else if (tokenType === "function") {
      operatorStack.push(token)
    }
    else if (tokenType === "operator") {
      while (operatorStack.at(-1) != undefined && 
             operatorStack.at(-1) !== '(') {
        // as long as the stack is not empty 
        // loop until it finds a left parenthesis or an operator with lower or equal precedence
        const lastOperator = operatorStack.at(-1)
        if (!(getPrecedence(lastOperator) >= getPrecedence(token))) {
          break
        }
        outputQ.push(operatorStack.pop())
      }
      operatorStack.push(token)
    }
    else if (tokenType === "leftParenthesis") {
      operatorStack.push(token)
    }
    else if (tokenType === "rightParenthesis") {
      while (operatorStack.at(-1) !== '(') {
        // loops back to find a left parenthesis
        if (operatorStack.length <= 0) throw new SyntaxError("Mismatched parentheses");
        outputQ.push(operatorStack.pop())
      }
      if (operatorStack.at(-1) !== '(') throw new SyntaxError("Mismatched parentheses");
      
      // if there is one correctly, pop it off
      // if this ( is to call a function, push the function on
      operatorStack.pop()
      if (getTokenType(operatorStack.at(-1)) === "function") {
        outputQ.push(operatorStack.pop())
      }
    }
  }

  while (operatorStack.length > 0) {
    if (operatorStack.at(-1) === '(') throw new SyntaxError("Mismatched parentheses");
    
    outputQ.push(operatorStack.pop())
  }

  return outputQ
}

function calculate(stringToCalculate) {

  const tokenArr = stringToCalculate.split(
    /(\+|\−|×|÷|\^|\(|\)|√|%|sin|cos|tan|asin|acos|atan|ln|log|!)/
  ).filter(t => t !== '')
  
  let RPNtokenArr;
  try {
    RPNtokenArr = toRPN(tokenArr)
  } catch (e) {
    console.error(e)
    alert("Invalid expression - check your parentheses")
    return "Err"
  }
  
  const operations = {
    "+": (a, b) => a + b,
    "−": (a, b) => a - b,
    "×": (a, b) => a * b,
    "÷": (a, b) => a / b,
    "^": (a, b) => Math.pow(a, b),
    "%": a => a / 100,
    "!": a => a === 0 ? 1 : a * operations['!'](a - 1),
    "sin": a => Math.sin(a),
    "cos": a => Math.cos(a),
    "tan": a => Math.tan(a),
    "asin": a => Math.asin(a),
    "acos": a => Math.acos(a),
    "atan": a => Math.atan(a),
    "ln": a => Math.log(a),
    "log": a => Math.log10(a),
    "√": a => Math.sqrt(a),
  }

  const stack = []

  for (const token of RPNtokenArr) {
    if (isBinaryOperator(token)) {
      // pop 2 numbers off the stack, operate the latter one on the prior one
      const a = stack.pop()
      const b = stack.pop()
      stack.push(operations[token](b, a))
    }
    else if (getTokenType(token) === 'number') {
      if (token === 'e') {
        stack.push(Math.E)
      }
      else if (token === 'π') {
        stack.push(Math.PI)
      }
      else{
        stack.push(parseFloat(token))
      }
    }
    else {
      // pop 1 off for unary
      stack.push(operations[token](stack.pop()))
    }
    console.log(stack, token)
  }


  console.log(tokenArr)
  console.log(RPNtokenArr)

  return stack[0]
}

// console.log(calculate("3.0+4×2÷(1--5)^2^3+sin(1)-√(4)"));


// Handlers
const disp = document.querySelector('.disp');

document.querySelectorAll('.numbers>div').forEach( num => {
  num.addEventListener('click', () => {
    // prevent multiple dots
    if (num.textContent === '.' && disp.textContent.endsWith('.')) return;
    disp.textContent += num.textContent;
  })
})

document.querySelectorAll('.operators>div').forEach(op => {
  op.addEventListener('click', () => {
    // if it ends with a basic operator, prevens entering another
    if (op.textContent.match(/[+|−|×|÷]/) && disp.textContent.match(/[+|×|÷]$|--$/)){
      return;
    }
    disp.textContent += op.textContent;
  })
})

// clear all
document.querySelector('#clr').addEventListener('click', () => {
  disp.textContent = "";
})

// backspace
document.querySelector('#del').addEventListener('click', () => {
  disp.textContent = disp.textContent.slice(0, -1);
})

// memory recall and back
const recordedExpressions = []
let currentPostionInRecord = 0
document.querySelectorAll("#mem-up, #mem-down").forEach(button => {
    button.addEventListener('click', () => {
      // console.log(recordedExpressions)
      currentPostionInRecord += button.id === "mem-up" ? -1 : 1;
      const expression = recordedExpressions.at(currentPostionInRecord)
      if (expression != undefined) {
        disp.textContent = expression
      } else {
        currentPostionInRecord = 0
        disp.textContent = ""
      }
  })
})

// get the final result
document.querySelector(".equal").addEventListener('click', e => {
  if (e.target.textContent === '') return;
  const result = calculate(disp.textContent);
  disp.textContent = parseFloat(result.toPrecision(12));
  recordedExpressions.push(disp.textContent)
})


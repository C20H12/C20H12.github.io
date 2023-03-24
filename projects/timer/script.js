function padding0(number) {
  if (number === 0) return '00';
  if (number >= 10) return number;
  return '0' + number;
}

function updateDisplay(outputSet, currTime) {
  const timeValsArr = Object.values(currTime);
  for (let i = 0; i < outputSet.length; i++) {
    outputSet[i].value = padding0(timeValsArr[i]);
  }
}


// === Timer Section
(() => {
  const inputs = document.querySelectorAll('#timer>.numberWrap>input');
  const outputs = document.querySelectorAll('#timer>.outputWrap>output');
  const startBtn = document.querySelector('#timer [data-start]');
  const resetBtn = document.querySelector('#timer [data-reset]');
  const time = {
    h: 0,
    m: 0,
    s: 0,
  };

  inputs.forEach((input, i) => {
    input.addEventListener('input', (e) => {
      const outputDataset = outputs[i].dataset;
      const thisInput = e.target;
      let thisValue = thisInput.value;

      if ('h' in outputDataset && 'h' in thisInput.dataset) {
        outputs[i].value = padding0(thisInput.value);
        time.h = parseInt(thisValue, 10) || 0;
      }
      if ('m' in outputDataset && 'm' in thisInput.dataset) {
        outputs[i].value = padding0(thisValue);
        time.m = parseInt(thisValue, 10) || 0;
      }
      if ('s' in outputDataset && 's' in thisInput.dataset) {
        outputs[i].value = padding0(thisValue);
        time.s = parseInt(thisValue, 10) || 0;
      }
    });
  });

  let interval;
  startBtn.addEventListener('click', () => {
    for (const i of inputs) {
      i.setAttribute('disabled', '');
    }
    startBtn.setAttribute('disabled', '')
    interval = setInterval(() => {
      if (time.s == 0) {
        if (time.m == 0) {
          if (time.h == 0) {
            console.log('end');
            alert("END")
            resetTimer();
            return;
          } else {
            time.h -= 1;
            time.m += 59;
            time.s += 59; 
          }
        } else {
          time.m -= 1;
          time.s += 59;
        }
      } else {
        time.s -= 1;
      }
      updateDisplay(outputs, time);
      console.log(time);
    }, 1000);
  });

  function resetTimer() {
    clearInterval(interval);
    
    for (const i of inputs) {
      i.removeAttribute('disabled');
      i.value = '';
    }
    startBtn.removeAttribute('disabled')
    time.s = 0;
    time.m = 0;
    time.h = 0;
    updateDisplay(outputs, { h: 0, m: 0, s: 0 });
  }

  resetBtn.addEventListener('click', resetTimer);
})();


// === Strowatch section
(() => {
  const outputs = document.querySelectorAll('#stopwatch>.outputWrap>output');
  const startBtn = document.querySelector('#stopwatch [data-start]');
  const resetBtn = document.querySelector('#stopwatch [data-reset]');
  const pauseBtn = document.querySelector('#stopwatch [data-pause]');
  const tickBtn = document.querySelector('#stopwatch [data-tick]');
  const tickRecordArea = document.querySelector("#ticks");
  const time = {
    m: 0,
    s: 0,
    cs: 0
  };

  let interval;
  startBtn.addEventListener("click", () => {
    startBtn.setAttribute('disabled', '')
    interval = setInterval(() => {
      if (time.cs == 99) {
        if (time.s == 59) {
          if (time.m == 59) {
            console.log('end');
            resetStopWatch();
            return;
          } else {
            time.m += 1;
            time.s = 0;
            time.cs = 0; 
          }
        } else {
          time.s += 1;
          time.cs = 0;
        }
      } else {
        time.cs += 1;
      }
      updateDisplay(outputs, time);
      // console.log(time);
    }, 10);
  });

  function resetStopWatch() {
    clearInterval(interval)
    startBtn.removeAttribute('disabled')
    time.m = 0;
    time.s = 0;
    time.cs = 0;
    updateDisplay(outputs, { h: 0, m: 0, s: 0 });
    tickRecordArea.value = '';
  }

  resetBtn.addEventListener("click", resetStopWatch)

  pauseBtn.addEventListener("click", () => {
    clearInterval(interval)
    startBtn.removeAttribute('disabled')
  })

  let tickCnt = 0;
  tickBtn.addEventListener("click", () => {
    tickRecordArea.value += `
    ${++tickCnt} == At ${time.m} min, ${time.s} s, ${time.cs}`
    tickRecordArea.scrollTop = tickRecordArea.scrollHeight;
  })
})()
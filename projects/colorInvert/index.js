const rgbInputs = document.querySelectorAll("#r,#g,#b");
const rgbArr = ["r", "g", "b"];
const inputs = document.querySelectorAll("input[type=number");

function invert(number) {
  const maxRgb = 255;
  return maxRgb - number;
}

function toHex(numberStr) {
  const hexString = parseInt(numberStr, 10).toString(16);
  if (hexString.length === 2) return hexString;
  return "0" + hexString;
}

function getOutputFields(id) {
  const out = document.querySelector(`output[for=${id}]`);
  const outHex = document.querySelector(`output[for=${id}][data-hex]`);
  return { out, outHex };
}

function getAllColorValues() {
  let hexAll = "#";
  let hexInvAll = "#";
  let rgbInvAll = [];

  rgbInputs.forEach(color => {
    let hex = toHex(color.value);
    let hexInv = toHex(invert(color.value));
    hexAll += hex;
    hexInvAll += hexInv;
    rgbInvAll.push(invert(color.value));
  });

  return { hexAll, hexInvAll, rgbInvAll };
}

function updateDisplays() {
  const { hexAll, hexInvAll, rgbInvAll } = getAllColorValues();

  document.querySelector(".outputColor").innerText = hexAll;
  document.querySelector(".outputColorInv>.hex").innerText = hexInvAll;

  for (let i in rgbInvAll) {
    document.querySelector(`.outputColorInv>.${rgbArr[i]}`).innerText =
      rgbInvAll[i];
  }

  document.querySelector(".outputColorPreBox").style.backgroundColor = hexAll;
  document.querySelector(".outputColorInvBox").style.backgroundColor =
    hexInvAll;
}

rgbInputs.forEach(elem => {
  
  elem.addEventListener("input", e => {
    const { out, outHex } = getOutputFields(elem.id);
    out.value = elem.value;
    outHex.value = toHex(elem.value);

    updateDisplays();

    document.querySelector(`[data-color=${e.target.id}]`).value = e.target.value
  });
});

inputs.forEach(elem => {
  elem.addEventListener("input", e => {
    const numberValue = e.target.value;
    const color = e.target.dataset.color

    if (numberValue > 255) {
      window.alert("This value must be under 255!");
      e.target.value = numberValue.substring(0, numberValue.length - 1);
      return;
    }

    document.querySelector(`input#${color}`).value =
      numberValue || 0;

    updateDisplays();

    const {out, outHex} = getOutputFields(color);
    out.value = numberValue;
    outHex.value = toHex(numberValue);
  });
});

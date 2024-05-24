function sleep(ms) {
  // Helper: to stop execution until given time is passed
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Defining it here instead of inside pressEnter() to prevent making a new event each time pressEnter() is called.
const pressEnterEvent = new KeyboardEvent('keydown', { key: 'Enter' });

function pressEnter() {
  document.body.dispatchEvent(pressEnterEvent);
}

function typeMessage(msg) {
  const inputElements = [...document.getElementsByClassName('input-message-input')];
  inputElements.forEach(inp => {inp.innerText = `${msg}`});
}

// const tPopup = document.querySelector('.popup popup-date-picker.popup-schedule.active');
function enterTime(hh = '01', mm = '00') {
  const timeInputs = document.querySelectorAll('.date-picker-time > .input-field > .input-field-input');
  const hrInp = timeInputs[0];
  const minInp = timeInputs[1];
  hrInp.value = `${hh}`;
  minInp.value = `${mm}`;
}

async function autoSend(jsonInp, delay = 500) {
  for (let i = 0; i < jsonInp.length; i++) {
    typeMessage(`${jsonInp[i].msg}`);
    pressEnter();
    await sleep(delay);
    enterTime(`${jsonInp[i].hh}`, `${jsonInp[i].mm}`);
    pressEnter();
    await sleep(delay);
  }
}

// For future:
// Check if we are in the schedule messages section and not in the main chat section
// Check if the time input popup is open before entering time

const testInputs =
[
  {
    "hh": "11",
    "mm": "59",
    "msg": "Heyy Jon, welcome back"
  },
  {
    "hh": "12",
    "mm": "1",
    "msg": "Hey Jon! It’s pretty sunny here"
  },
]

console.log('Script Loaded!!')

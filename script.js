async function main() {
  // Utility function to create a delay
  function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  const pressEnterEvent = new KeyboardEvent('keydown', { key: 'Enter' });
  // Function to simulate pressing the Enter key
  function pressEnter() {
    document.body.dispatchEvent(pressEnterEvent);
  }

  // Function to type a message into the input field
  function typeMessage(msg) {
    const inputElements = [...document.getElementsByClassName('input-message-input')];
    inputElements.forEach(inp => { inp.innerText = msg });
  }

  // Function to enter time into specified input fields
  function enterTime(hh = '01', mm = '00') {
    // hh and mm must be integers or integers in a string
    const timeInputs = document.querySelectorAll('.date-picker-time > .input-field > .input-field-input');
    timeInputs[0].value = `${hh}`;
    timeInputs[1].value = `${mm}`;
  }

  // Function to check if the current message time is before the specified time
  function isLateMsg(msgHr, msgMin, minHr, minMin) {
    return ((msgHr < minHr) || (msgHr === minHr && msgMin < minMin));
  }
  // Function to automate sending messages
  async function autoSend(messages, fromHr = 0, fromMin = 0) {
    // jsonInp must be a list of js objects
    // fromHr and fromMin must be numbers

    fromHr = typeof fromHr === 'number' ? fromHr : Number.parseInt(fromHr);
    fromMin = typeof fromMin === 'number' ? fromMin : Number.parseInt(fromMin);
    const delay = 500;

    const confirmationMessage = (fromHr === 0 && fromMin === 0) ? `Send all messages from dataset? \n(Press Alt+X to stop anytime)` : `Sending messages from: ${fromHr}:${fromMin}. \nPlease confirm to continue. \n(Press Alt+X to stop anytime)`;
    if (!confirm(confirmationMessage)) return;

    for (const { hh, mm, msg } of messages) {
      if (!continueExecution) {
        console.log('Execution stopped by user on message: ', {'hh':hh,'mm':mm,'msg':msg});
        document.removeEventListener('keydown', haltExecution);
        return;
      }
      const messageHour = Number.parseInt(hh);
      const messageMinute = Number.parseInt(mm);
      const currentTime = new Date();
      const currentHour = currentTime.getHours();
      const currentMinute = currentTime.getMinutes();

      if (isLateMsg(messageHour, messageMinute, fromHr, fromMin) || isLateMsg(messageHour, messageMinute, currentHour, currentMinute)) continue;

      typeMessage(msg);
      pressEnter();
      await sleep(delay);

      enterTime(hh, mm);
      pressEnter();
      await sleep(delay);
    }
  };

  async function initiateMsgSending(messages) {
    const activeChat = document.querySelector('.chat.tabs-tab.active');
    if (!activeChat) {
      alert("Open a Telegram web chat first!")
      console.error("Make sure you are on Telegram web first!");
      return;
    }

    if (activeChat.getAttribute('data-type') !== 'scheduled') {
      alert('Open the schedule messages section of a chat first!');
      return;
    }

    let minInp = prompt('Send messages from what time (hh:mm)?\nUSE 24-hour FORMAT (i.e DON\'T USE AM or PM).\n(Leave empty to send all messages)');
    if (minInp == null) return;

    minInp = minInp.trim();
    if (minInp === '') {
      await autoSend(messages);
      return;
    }

    const timeSeparator = [':', ';', ',', '.'].find(sep => minInp.includes(sep));
    if (!timeSeparator) {
      alert('Please enter the time in the correct format!');
      return initiateMsgSending();
    }

    const [fromHr, fromMin] = minInp.split(timeSeparator).map(part => parseInt(part, 10));

    if (isNaN(fromHr) || isNaN(fromMin) || fromHr < 0 || fromHr > 23 || fromMin < 0 || fromMin > 59) {
      alert('Please enter the time in the correct format!');
      return initiateMsgSending();
    }

    await autoSend(messages, fromHr, fromMin);
  };

  // Helper function to check if the given string only contains digits (0-9)
  function isNum(str) { return /^\d+$/.test(`${str}`) }
  // Function to check correctness of input data
  function isDataCorrect(jsonData) {
    const errors = [];
    let rowNumber = -1;
    jsonData.forEach(data => {
      ++rowNumber;
      if ((
        !isNum(`${data.hh}`) || parseInt(data.hh) < 0 || parseInt(data.hh) > 23 ||
        !isNum(`${data.mm}`) || parseInt(data.mm) < 0 || parseInt(data.mm) > 59 ||
        typeof data.msg !== 'string'
      )) {
        let errorMessages = [];
        if (!isNum(`${data.hh}`) || parseInt(data.hh) < 0 || parseInt(data.hh) > 23) errorMessages.push('Invalid hour');
        if (!isNum(`${data.mm}`) || parseInt(data.mm) < 0 || parseInt(data.mm) > 59) errorMessages.push('Invalid minute');
        if (typeof data.msg !== 'string') errorMessages.push('Invalid message');
        errors.push({ 'rowNo': rowNumber, 'errors': errorMessages, 'data': data });
      }
    });
    if (errors.length > 0) {
      console.error("Errors found in dataset: ");
      console.error(errors);
      return false;
    }
    return true;
  }

  const testInputs = [
    { hh: "22", mm: "5", msg: "Heyy Jon, welcome back" },
    { hh: "22", mm: "1", msg: "Hey Jon! It’s pretty sunny here" },
    { hh: "22", mm: "1", msg: "H124ey Jon! It’s pretty sunny here" },
    { hh: "22", mm: "01", msg: "Hey1521 Jon! It’s pretty sunny here" },
    { hh: "22", mm: "10", msg: "Hey Jo155n! It’s pretty sunnyasf here" },
    { hh: "22", mm: "12", msg: "Hey J15115on! It’s pretty sunny heffre" },
    { hh: "22", mm: "21", msg: "He511y J15115o1n! It’s pretty sunny here" },
    { hh: "22", mm: "1", msg: "He1y J15115215on! It’s pretty sunny here" },
    { hh: "22", mm: "53", msg: "He1y qwrqJ15115215on! It’s pretty sunny here" },
    { hh: "22", mm: "6", msg: "sdgsdHe1y J15115215on! It’s pretty sunny here" },
    { hh: "22", mm: "15", msg: "He1y J15115215on! It’s pretty sun25ny here" },
  ];

  // Flag for stopping execution
  let continueExecution = true;
  // Event listener to stop execution on key press (Alt + X)
  function haltExecution(event) {
    if (event.altKey && event.key === 'x') {
      continueExecution = false;
      event.stopPropagation();
      event.preventDefault();
    }
  }
  document.addEventListener('keydown', haltExecution);

  if (isDataCorrect(testInputs)) initiateMsgSending(testInputs);
}

main();

// For future:
// Code should not rely on sleep function.
// Check if the time input popup is open before entering time
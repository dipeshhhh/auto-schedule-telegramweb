function main() {
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

  // Function to automate sending messages
  async function autoSend(messages, fromHr = 0, fromMin = 0) {
    // jsonInp must be a list of js objects
    // fromHr and fromMin must be numbers

    fromHr = typeof fromHr === 'number' ? fromHr : Number.parseInt(fromHr);
    fromMin = typeof fromMin === 'number' ? fromMin : Number.parseInt(fromMin);
    const delay = 500;

    if (!confirm(`Sending messages from: ${fromHr}:${fromMin}.\n Please confirm to continue.`)) return;

    for (const { hh, mm, msg } of messages) {
      const messageHour = Number.parseInt(hh);
      const messageMinute = Number.parseInt(mm);

      if (messageHour < fromHr || (messageHour === fromHr && messageMinute < fromMin)) {
        continue;
      }

      typeMessage(msg);
      pressEnter();
      await sleep(delay);

      enterTime(hh, mm);
      pressEnter();
      await sleep(delay);
    }
  };

  async function lessgo(messages) {
    const activeChat = document.querySelector('.chat.tabs-tab.active');
    if (!activeChat) {
      console.error("Make sure you are on Telegram web first");
      return;
    }

    if (activeChat.getAttribute('data-type') !== 'scheduled') {
      alert('Open the schedule messages section of chat!');
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
      return lessgo();
    }

    const [fromHr, fromMin] = minInp.split(timeSeparator).map(part => parseInt(part, 10));

    if (isNaN(fromHr) || isNaN(fromMin) || fromHr < 0 || fromMin < 0) {
      alert('Please enter the time in the correct format!');
      return lessgo();
    }

    await autoSend(messages, fromHr, fromMin);
  };

  // Helper function to check if the given string only contains digits (0-9)
  function isNum(str) { return /^\d+$/.test(`${str}`) }

  function isDataCorrect(jsonData) {
    const errors = [];
    let rowNumber = -1;
    jsonData.forEach(data => {
      ++rowNumber;
      if ((!isNum(`${data.hh}`) || parseInt(data.hh) < 0 || !isNum(`${data.mm}`) || parseInt(data.mm) < 0 || typeof data.msg !== 'string')) {
        let errorMessages = [];
        if (!isNum(`${data.hh}`) || parseInt(data.hh) < 0) errorMessages.push('Invalid hour');
        if (!isNum(`${data.mm}`) || parseInt(data.mm) < 0) errorMessages.push('Invalid minute');
        if (typeof data.msg !== 'string') errorMessages.push('Invalid message');
        errors.push({ 'rowNo': rowNumber, 'errors': errorMessages,'data': data});
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
    { hh: "20", mm: "5", msg: "Heyy Jon, welcome back" },
    { hh: "20", mm: "1", msg: "Hey Jon! It’s pretty sunny here" },
  ];

  if(isDataCorrect(testInputs)) lessgo(testInputs);
}

main();

// For future:
// Check if the time input popup is open before entering time
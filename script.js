async function main() {
  //==================== Telegram elements functions ====================
  /**
   * Use: Change the .innerText property of all tags here to enter message in telegram. 
   * @returns {HTMLElement[]} - The array of HTML elements containing input tags for writing text message in, or an empty array if none are found.
   */
  function getTeleMsgInputElements() {
    return [...document.getElementsByClassName('input-message-input')];
  }

  /**
   * Use: Check if telegram's schedule message popup which takes time input is active or not.  
   * @returns {HTMLElement | null} - Telegram's shedule message popup, or 'null' if not found.
   */
  function getTeleSchedulerPopupElement() {
    return document.querySelector('.popup.popup-date-picker.popup-schedule.active');
  }

  /**
   * Use: to check if telegram web is opened or not.
   * @returns {HTMLElement | null} - Active chat div, or 'null' if not found.
   */
  function getTeleActiveChatElement() {
    return document.querySelector('.chat.tabs-tab.active');
  }

  /**
   * Checks if telegram chat's schedule messages section is open or not. 
   * @returns {boolean} - true if open, else false.
   */
  function isTeleScheduleChatSectionOpen() {
    return getTeleActiveChatElement()?.getAttribute('data-type') === 'scheduled';
  }

  //==================== AST elements functions ====================
  //-------------------- Independent functions (no predefined values required) --------------------
  /**
   * Creates required HTML elements and appends it to the DOM.
   */
  function loadAstPopupIntoDom() {
    const astBackdrop = document.createElement('div');
    astBackdrop.id = 'ast-backdrop';

    const astFileInput = document.createElement('input');
    astFileInput.id = 'ast-file-input';
    astFileInput.type = 'file';
    astFileInput.accept = '.json';

    const astPopup = document.createElement('div');
    astPopup.id = 'ast-popup';
    astPopup.innerHTML = `
    <h3 id="ast-heading">
      <span>Auto Schedule</span>
      <span id="ast-close-button" class="btn-icon popup-close">×</span>
    </h3>
    <form id="ast-popup-form">
      <div id="ast-form-input-container">
        <div class="ast-input-container">
          <div id="ast-from-time-input-container">
            <label for="ast-from-input">From</label>
            <input id="ast-from-input" type="time" maxlength="5" />
          </div>
          <small id="ast-from-input-error" class="ast-error-message"></small>
        </div>
        <div class="ast-input-container">
          <label>Select message set</label>
          <div id="ast-select-input-container">
            <select id="ast-message-set-select" required>
              <option value="This_value_is_for_this_SelectAnOption_Option_TryingToMakeThisUnique">-- Select an option --
              </option>
              <optgroup label="Functions">
                <option value="upload_new_set">Upload new set</option>
                <option value="clear_user_sets">Clear your sets</option>
              </optgroup>
              <optgroup label="Your sets" id="ast-user-sets-optgroup">
                <!-- User uploads from local storage -->
              </optgroup>
            </select>
            <button id="ast-delete-selected-set-button" class="ast-button btn-primary btn-transparent danger rp">Delete set</button>
          </div>
          <small id="ast-file-input-error" class="ast-error-message"></small>
        </div>
      </div>
      <div id="ast-preview-msgs-container">
        <span id="ast-preview-msgs-heading">Preview/Edit messages</span>
        <div id="ast-preview-msgs-background">
          <div id="ast-preview-msgs">
            <span>#</span>
            <span>HH</span>
            <span>MM</span>
            <span>Message</span>
          </div>
        </div>
      </div>
      <small id="ast-preview-msgs-warning" class="ast-warning-message"></small>
      <small id="ast-preview-msgs-error" class="ast-error-message"></small>
      <button id="ast-confirm-button" class="ast-button btn-primary btn-color-primary">Confirm</button>
    </form>
    `;

    const astStyleTag = document.createElement('style');
    astStyleTag.innerHTML = `
    :root {
      --ast-popup-bg-color: #fff;
      --ast-border-radius: 10px;
      --ast-padding: 1rem;
      --ast-input-padding: 1rem;
      --ast-body-font-size: 16px;
    }

    #ast-backdrop {
      position: fixed;
      top: 0px;
      background: rgba(0, 0, 0, 0.25);
      height: 100vh;
      width: 100vw;
      margin: 0px;
      padding: 0px;
      z-index: 99995;
      opacity: 0;
      visibility: hidden;
      transition-property: opacity, visibility;
      transition-duration: 0.15s, 0s;
      transition-delay: 0s, 0s;
      transition-timing-function: cubic-bezier(0.4, 0, 0.2, 0.1);
    }

    #ast-popup {
      flex-direction: column;
      gap: 1rem;
      position: absolute;
      top: 60%;
      left: 50%;
      transform: translate(-50%, -50%);
      background-color: var(--ast-popup-bg-color);
      padding: var(--ast-padding);
      border-radius: var(--ast-border-radius);
      max-width: min(99vw, 524px);
      max-height: 95vh;
      overflow: auto;
      scrollbar-width: thin;
      z-index: 99996;
      opacity: 0;
      visibility: hidden;
      transition-property: opacity, visibility, top;
      transition-duration: 0.15s, 0s, 0.15s;
      transition-delay: 0s, 0s, 0s;
      transition-timing-function: cubic-bezier(0.4, 0, 0.2, 0.1);
    }

    #ast-heading {
      display: flex;
      flex-direction: row;
      align-items: center;
      justify-content: space-between;
      padding: 0px;
      margin: 0px;
      font-weight: var(--font-weight-bold, 500);
      margin-top: -0.5rem;
      /* -ve Half of padding */
      font-size: 20px;
    }

    #ast-close-button {
      cursor: pointer;
      margin: 0px !important;
    }

    #ast-popup-form,
    .ast-input-container {
      display: flex;
      flex-direction: column;
    }

    #ast-popup-form {
      gap: 1.5rem;
    }

    #ast-form-input-container {
      display: flex;
      flex-direction: row;
      gap: var(--ast-padding, 1rem);
    }

    #ast-from-time-input-container {
      display: flex;
      flex-direction: column;
    }

    #ast-from-input {
      padding: var(--ast-input-padding);
      width: calc(12ch + var(--ast-input-padding) * 2);
      height: var(--height, 54px);
      border-radius: var(--ast-border-radius);
      border: 1px solid grey;
      transition: 0.2s border-color;
    }

    .ast-error-message {
      color: red;
      display: none;
      overflow-wrap: anywhere;
    }

    .ast-warning-message {
      color: orange;
      display: none;
      overflow-wrap: anywhere;
    }

    #ast-select-input-container {
      display: flex;
      flex-direction: row;
      justify-content: space-between;
      align-items: center;
      gap: var(--ast-padding);
    }

    #ast-message-set-select {
      flex-grow: 1;
      height: var(--height, 54px);
      border-radius: var(--ast-border-radius);
      font-size: var(--ast-body-font-size);
      padding: 0px var(--ast-padding);
      cursor: pointer;
      border: 1px solid grey;
      transition: 0.2s border-color;
    }
    
    #ast-from-input:hover,
    #ast-from-input:focus,
    #ast-from-input:focus-within,
    #ast-from-input:focus-visible,
    #ast-message-set-select:hover,
    #ast-message-set-select:focus,
    #ast-message-set-select:focus-within,
    #ast-message-set-select:focus-visible {
      border-color: var(--primary-color, #3390ec);
      outline: none;
    }

    .ast-button {
      border-radius: var(--ast-border-radius);
      width: 100%;
      text-align: center;
      height: var(--height, 54px);
      border: none;
      font-weight: var(--font-weight-bold, 500);
      cursor: pointer;
      overflow: hidden;
      position: relative;
      padding: 0px var(--ast-padding);
      transition: .2s opacity;
    }

    #ast-delete-selected-set-button {
      width: max-content !important;
    }

    #ast-preview-msgs-container {
      display: none;
    }
    
    #ast-preview-msgs-background {
      background-color: rgb(228, 228, 228);
      border-radius: var(--ast-border-radius);
    }

    #ast-preview-msgs {
      display: grid;
      grid-template-columns: min-content 4ch 4ch 39ch;
      gap: 1ch;
      overflow: auto;
      max-height: calc(50vh - 150px);
      padding: 2px;
      min-height: 60px;
      scrollbar-width: thin;
    }

    .ast-preview-item {
      height: max-content;
    }

    .ast-preview-item:not(.ast-preview-item-row) {
      border: 1px solid grey;
      border-radius: 3px;
      background-color: #fff;
    }

    .late-message-preview.ast-preview-item-row {
      background-color: orange;
    }    

    #ast-file-input {
      position: absolute;
      z-index: -99999;
      height: 1px;
      width: 1px;
    }
    
    @media screen and (max-width: 500px) {
      #ast-form-input-container {
        flex-direction: column;
        gap: 1.5rem;
      }

      #ast-from-time-input-container {
        flex-direction: row;
        align-items: center;
        justify-content: start;
        gap: 1ch;
      }
      #ast-preview-msgs {
        grid-template-columns: min-content 4ch 4ch 36ch;
      }
    }

    @media screen and (max-width: 369px) {
      #ast-select-input-container {
        flex-direction: column;
        justify-content: center;
        align-items: start;
        gap: 1ch;
      }

      #ast-popup-form,
      #ast-form-input-container {
        gap: 1rem;
      }
    }
    `;
    document.head.append(astStyleTag);
    document.body.append(astBackdrop, astPopup, astFileInput);
  }

  /**
   * Use: to check if ast-popup is already loaded in DOM or not.
   * @returns {HTMLElement | null} - ast-popup div or 'null' if not found.
   */
  function getAstPopup() {
    return document.getElementById('ast-popup');
  }

  /**
   * Display HTML tag and message inside the tag.
   * @param {HTMLElement} htmlElement - HTML tag to show the message inside.
   * @param {string} message - The message.
   */
  function showMessage(htmlElement, message) {
    htmlElement.style.display = 'initial';
    htmlElement.innerText = message;
  }

  /**
   * Hides HTML tag and innerText of the tag.
   * @param {HTMLElement} htmlElement - HTML tag to hide.
   */
  function hideMessage(htmlElement) {
    htmlElement.style.display = 'none';
    htmlElement.innerText = '';
  }

  /**
   * Generates warning message for old/late messages.
   * @param {string[] | number[]} oldMsgsRows - Array of row numbers.
   * @returns {string} - Generated warning message for late/old messages.
   */
  function generateOldMsgsWarning(oldMsgsRows) {
    const isSingleRow = oldMsgsRows.length === 1;
    return `Warning: Old ${isSingleRow ? 'message' : 'messages'} in the following ${isSingleRow ? 'row' : 'rows'} won't be scheduled - ${oldMsgsRows}`;
  }

  //-------------------- Opening and Closing AST popup with backdrop --------------------
  /**
   * Hides the ast popup and backdrop while triggering their transitions.
   * Also sets timout of 150ms to hide popup and backdrop after transition is complete.
   ** Ensure 'backdrop' and 'popup' elements are defined before calling this function.
   */
  function hideAstPopup() {
    document.removeEventListener('keydown', hideAstPopupOnAltX);
    document.removeEventListener('pointerdown', hideAstPopupOnOutsideClick);

    backdrop.style.transitionDelay = '0s, 0.15s';
    popup.style.transitionDelay = '0s, 0.15s, 0s';
    backdrop.style.opacity = '0';
    popup.style.opacity = '0';
    popup.style.top = '60%'
    backdrop.style.visibility = 'hidden';
    popup.style.visibility = 'hidden';

    // closePopupTransitionTimeout = // search for KnownBug[1] to understand why this is commented out.
    setTimeout(() => { // set display = none after transitions are complete.
      backdrop.style.display = 'none';
      popup.style.display = 'none';
    }, 150); // 150ms is the transition time set in css (0.15s).
  }

  /**
   * Displays the ast popup and backdrop while triggering their transitions.
   ** Ensure 'backdrop' and 'popup' elements are defined before calling this function.
   */
  async function showAstPopup() {
    document.addEventListener('keydown', hideAstPopupOnAltX);
    document.addEventListener('pointerdown', hideAstPopupOnOutsideClick);

    // KnownBug[1] : This is not working right now, (ReferenceError: Cannot access before initialization)
    // Idea here is to remove the timeout set by hideAstPopup.
    // clearTimeout(closePopupTransitionTimeout);

    backdrop.style.display = 'flex';
    popup.style.display = 'flex';
    await sleep(1); // wait for the display property to change or the transition won't happen.

    backdrop.style.transitionDelay = '0s, 0s';
    popup.style.transitionDelay = '0s, 0s, 0s';
    backdrop.style.visibility = 'visible';
    popup.style.visibility = 'visible';
    popup.style.top = '50%';
    backdrop.style.opacity = '1';
    popup.style.opacity = '1';
  }

  /**
   * Event handler function for hiding ast-popup on pressing Alt+X on Keyboard.
   * @param {Event} e - Event triggered by key-down.
   */
  function hideAstPopupOnAltX(e) {
    if (e.altKey && e.key === 'x') { // Esc key didn't work well due to telegram's predefined shortcuts.
      e.preventDefault();
      e.stopPropagation();
      hideAstPopup();
    }
  }

  /**
   * Event handler function for hiding ast-popup on clicking anywhere outside the popup.
   * @param {Event} e - Event triggered by mouse/pointer-down.
   */
  function hideAstPopupOnOutsideClick(e) {
    if (!popup.contains(e.target) && (e.target !== uploadTag)) {
      hideAstPopup();
    }
  }

  //-------------------- Message set handling --------------------
  /**
   * Sets required parameters for selecting a message set.
   ** Ensure 'selectTag' element and 'selectedMsgSetId' variable are defined before calling this function.
   * @param {string} msgSetId - ID of the message set to be seleted.
   */
  function selectMsgSet(msgSetId) {
    selectedMsgSetId = msgSetId;
    selectTag.value = selectedMsgSetId;
    selectTag.dispatchEvent(changeEvent);
  }

  /**
   * Set required parameters to previously selected message set.
   * Use: to revert selectTag.value when it is changed but selecteMsgSetId is not changed yet.
   ** Ensure 'selectTag' element and 'selectedMsgSetId' variable are defined before calling this function.
   */
  function setPreviouslySelectedMsgSet() {
    selectMsgSet(selectedMsgSetId);
  }

  /**
   * Get the message set option tag of the provided message set ID.
   * @param {string} msgSetId - ID of the message set to get tag of.
   * @returns {HTMLElement | null} - HTML option tag with provided msgSetId as value, or 'null' if not found.
   */
  function getSelectedMsgSetTag(msgSetId) {
    return document.querySelector(`[value="${msgSetId}"]`);
  }

  /**
   * Use: to check if user has selected a message set or not.
   ** Ensure 'selectedMsgSetId' variable is defined before calling this function.
   * @returns {boolean} - true if selected, else false.
   */
  function isAMsgSetSelected() {
    return getSelectedMsgSetTag(selectedMsgSetId)?.parentElement.id === 'ast-user-sets-optgroup';
  }

  /**
   * Gets the message set with the provided ID from the message sets defined in `msgSets`.
   ** Ensure 'msgSets' array is defined before calling this function.
   * @param {string} msgSetId - The ID of the message set to get/find.
   * @returns {object | null} - The desired message set, or `null` if not found.
   */
  function getMsgSet(msgSetId) {
    return msgSets.find((msgSet => msgSet.id === msgSetId));
  }

  /**
   * Saves and overwrites previously stored message sets in localStorage.
   ** Ensure 'msgSets' array is defined before calling this function.
   */
  function saveMsgSetsToLocalStorage() {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(msgSets));
  }

  //-------------------- etc --------------------
  /**
   * Gets the value of 'from' time-input element.
   * Use: to send messages from this time onwards (messages with their schedule time after this from-time).
   ** Ensure 'fromInputTag' element is defined before calling this function.
   * @returns {string} - The time selected by the user in "HH:MM" format, or an empty string if not selected.
   */
  function getAstFromTimeInputValue() {
    return fromInputTag.value;
  }

  //==================== Functions for loadLocalMsgs ====================
  /**
   * Creates an option tag with value set as msgSetId and innerText set as msgSetName
   * @param {string} msgSetId - ID of the message set.
   * @param {string} msgSetName - Name of the message set.
   * @returns {HTMLElement} - The generated 'option' tag.
   */
  function createMsgSetOptionTag(msgSetId, msgSetName) {
    const newOptionTag = document.createElement('option');
    newOptionTag.value = msgSetId;
    newOptionTag.innerText = msgSetName;
    return newOptionTag;
  }

  /**
   * Loads the message set in the DOM.
   ** Ensure that 'msgSets' array and 'userUploadOptionGroup' element is defined before calling this function.
   * @param {object} msgSet - The message set object containing id, name, msgs parameters.
   * @param {string} msgSet.id - ID of the message set.
   * @param {string} msgSet.name - Name of the message set.
   * @param {object[]} msgSet.msgs - Array of message objects containing information about the messages.
   */
  function loadMsgSetToDOM(msgSet) {
    msgSets.push(msgSet);
    userUploadOptionGroup.append(createMsgSetOptionTag(msgSet.id, msgSet.name));
  }

  //==================== Functions for handleSelectChange ====================

  /**
   * Hides all ast-error-messages in DOM.
   */
  function hideAllErrors() {
    [...document.querySelectorAll('.ast-error-message')].map(hideMessage);
  }

  /**
   * Hides all ast-warning-messages in DOM.
   */
  function hideAllWarnings() {
    [...document.querySelectorAll('.ast-warning-message')].map(hideMessage);
  }

  /**
   * Triggers click() on uploadTag and selects previously selected message set in case upload is canceled.
   ** Ensure that 'uploadTag' element is defined and requirements of 'setPreviouslySelectedMsgSet()' function are satisfied before calling this function.
   */
  function triggerUpload() {
    setPreviouslySelectedMsgSet(); // in case upload cancels for any reason.
    uploadTag.click()
  }

  /**
   * Remove all previews from the DOM.
   ** Ensure that 'previewContainerDiv' element is defined before calling this function.
   */
  function removePreviews() {
    const previews = [...document.getElementsByClassName('ast-preview-item')];
    previews.forEach(preview => preview.remove());
    previewContainerDiv.style.display = 'none';
  }

  /**
   * Removes all user uploaded message sets from DOM and localStorage.
   ** Ensure that 'userUploadOptionGroup' element and 'LOCAL_STORAGE_KEY' is defined and requirements of 'setPreviouslySelectedMsgSet()' and 'selectMsgSet()' functions are met before calling this function.
   * @returns {void} - Returns if deletion is canceled.
   */
  function clearUserSets() {
    setPreviouslySelectedMsgSet(); // in case deletion cancels for any reason.
    if (!confirm("This will delete all your uploaded message sets! Confirm delete?")) return;

    localStorage.removeItem(LOCAL_STORAGE_KEY);
    userUploadOptionGroup.innerHTML = '';
    selectMsgSet(DEFAULT_OPTION_ID)
    removePreviews();
  }

  /**
   * Assigns row numbers to messages inside a message set.
   * @param {object} msgSet - The message set object to assign row numbers to.
   */
  function assignRowNoToMsgs(msgSet) {
    const tempMsgs = []
    msgSet.msgs.forEach((msg, index) => {
      tempMsgs.push({ ...msg, rowNo: index + 1 });
    })
    msgSet.msgs = tempMsgs;
  }

  //-------------------- Show previews functions --------------------
  /**
   * Creates and appends message rows to preview div in DOM.
   ** Ensure 'previewDiv' element is defined before calling this function.
   * @param {object} msg - The message object from a message set's array of message objects.
   * @param {string | number} msg.rowNo - Row number of the message.
   * @param {string | number} msg.hh - Hour value of the message.
   * @param {string | number} msg.mm - Minute value of the message.
   * @param {string} msg.msg - Text of the message.
   * @param {boolean} msg.isMsgLate - true if message is late (message's schedule time is before current time), else false.
   */
  function renderPreviewRow(msg) {
    const rowNoSpan = createPreviewTag(msg.rowNo, msg.rowNo, 'row', 'span', msg.isMsgLate);
    const hrsInput = createPreviewTag(msg.rowNo, msg.hh, 'hh', 'input', msg.isMsgLate);
    const minInput = createPreviewTag(msg.rowNo, msg.mm, 'mm', 'input', msg.isMsgLate);
    const msgInput = createPreviewTag(msg.rowNo, msg.msg, 'msg', 'input', msg.isMsgLate);

    previewDiv.append(rowNoSpan, hrsInput, minInput, msgInput);
  }

  /**
   * Creates an HTMLElement/Tag for message previews.
   * @param {string | number} rowNo - Row number of the message.
   * @param {string | number} value - Value to be placed in innerText or value property.
   * @param {'row' | 'hh' | 'mm' | 'msg'} dataType - Type of data for the tag ('row', 'hh', 'mm', or 'msg').
   * @param {string} tagName - HTMLElement/Tag name.
   * @param {boolean} isMsgLate - true if message is late (message's schedule time is before current time), else false.
   * @returns {HTMLElement} - The HTMLElement/Tag generated.
   */
  function createPreviewTag(rowNo, value, dataType, tagName, isMsgLate) {
    const tag = document.createElement(tagName);
    tag.className = `ast-preview-item ast-preview-row-${rowNo} ast-preview-item-${dataType} ${isMsgLate ? 'late-message-preview' : ''}`;
    if (tagName === 'input') {
      tag.type = 'text';
      tag.value = value;
      tag.onchange = handlePreviewEdit;
    }
    else {
      tag.innerText = value;
    }
    return tag;
  }

  /**
   * Shows messages for preview/edit on the DOM, and also highlights late messages.
   ** Ensure 'previewWarningTag', 'previewHeading' elements are defined and requirements for 'isAMsgSetSelected()', 'removePreviews()', 'getAstFromTimeInputValue()' and 'renderPreviewRow()' are met before calling this function.
   * @param {object[]} msgs - Array of message objects containing information about messages.
   * @param {string | number} msgs.msg.rowNo - Array of message objects containing information about messages.
   * @returns {void} - returns if a message set is not selected by the user.
   */
  function showPreviews(msgs) {
    if (!isAMsgSetSelected()) return;

    removePreviews();
    const lateMsgsRowNumbers = []
    const fromInputValue = getAstFromTimeInputValue();

    msgs.map(msg => {
      const isMsgLate = isMsgOlderThanCurrentTime(msg);
      if (isMsgLate) lateMsgsRowNumbers.push(msg.rowNo);
      renderPreviewRow({ ...msg, isMsgLate });
    });
    if (lateMsgsRowNumbers.length > 0) showMessage(previewWarningTag, generateOldMsgsWarning(lateMsgsRowNumbers));
    else hideMessage(previewWarningTag);

    if (fromInputValue) previewHeading.innerText = `Preview/Edit messages from ${fromInputValue}`
    previewContainerDiv.style.display = 'initial';
  }

  //==================== Functions for handleUploadChange ====================

  /**
 * Reads a file as text asynchronously using FileReader.
 * @param {File} file - The File object to read.
 * @returns {Promise<string>} - A Promise that resolves with the file's text content when successfully read. Rejects with an error if reading fails.
 */
  function readFileAsText(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = () => reject(reader.error);
      reader.readAsText(file);
    });
  }

  /**
   * Checks if all the messages of an array of message objects has required parameters or not
   * @param {object[]} msgs - Array of message objects.
   * @returns {boolean} - true if all messages have required properties 'hh', 'mm', 'msg', else false.
   */
  function msgsHasRequiredProperties(msgs) {
    for (msg of msgs) {
      if (!msg.mm || !msg.hh || !msg.msg) return false;
    }
    return true;
  }

  /**
   * Creates a new message set.
   * @param {string} fileName - Name of the message set to be created.
   * @param {object[]} msgs - Array of message object containing information about the messages.
   * @returns {object} - The generated message set object.
   */
  function createMsgSet(fileName, msgs) {
    const currentDate = new Date();
    return {
      "id": fileName + ' ' + String(currentDate),
      "name": fileName,
      "msgs": msgs
    }
  }

  /**
   * Extract the name without extension of the provided file.
   * @param {File} file - File object
   * @returns {string} - Name of the file
   */
  function extractNameFromFile(file) {
    const nameParts = file.name.split('.');
    if (nameParts.length > 1) {
      nameParts.pop(); // Remove the last element (the extension)
      return nameParts.join('.');
    }
    return file.name; // If no dots are present, return the full name
  }

  //==================== Functions for handleDelete ====================

  /**
   * Removes a message set from 'msgSets' array.
   ** Ensure that 'msgSets' array is defined before calling this function.
   * @param {string} msgSetId - ID of the message set to be removed.
   */
  function removeFromMsgSets(msgSetId) {
    const index = msgSets.findIndex(msgSet => msgSet.id === msgSetId);
    if (index === -1) throw new Error('Message set not found');
    msgSets.splice(index, 1);
  }

  //==================== Functions for handleConfirm. ====================
  //-------------------- Preview data to JSON conversion functions --------------------

  /**
   * Gets an array of row numbers of all row preview items in the DOM.
   * @returns {string[] | number[]} - Array of row numbers of preview items.
   */
  function getPreviewItemsRowNumbers() {
    return [...document.querySelectorAll('.ast-preview-item-row')].map(item => item.innerText);
  }

  /**
   * Gets value of the provided preview item on the provided row.
   * @param {string | number} rowNo - Row number of the preview item.
   * @param {'hh' | 'mm' | 'msg'} dataType - Data type of the preview item to get value from.
   * @returns {string} - Value of the required item, or an empty string if the item is not found.
   */
  function getPreviewValue(rowNo, dataType) {
    const element = document.querySelector(`.ast-preview-row-${rowNo}.ast-preview-item-${dataType}`);
    return element ? element.value : '';
  }

  /**
   * Gets all the data from preview and returns it in a JSON format (i.e. same format as 'msgs' array of message objects).
   * @returns {object[]} - Array of message objects.
   */
  function previewDataToJson() {
    const newData = [];
    if (!document.querySelector('.ast-preview-item')) return newData; // return an empty array if there is no preview data

    getPreviewItemsRowNumbers().forEach(rowNo => {
      newData.push({
        rowNo: rowNo,
        hh: getPreviewValue(rowNo, 'hh'),
        mm: getPreviewValue(rowNo, 'mm'),
        msg: getPreviewValue(rowNo, 'msg'),
      })
    })
    return newData;
  }

  //-------------------- Validate message and highlight error functions --------------------

  /**
   * Checks wether the string contains only numbers/digits or not.
   * @param {string} str - String to check.
   * @returns {boolean} - true if it's a string of numbers, else false.
   */
  function isNum(str) {
    return /^\d+$/.test(`${str}`);
  }

  /**
   * Resets the borders of preview items for a given row number to the default style.
   * @param {number} rowNo - The row number whose preview item borders need to be reset.
   */
  function resetPreviewItemBorders(rowNo) {
    [...document.querySelectorAll(`.ast-preview-row-${rowNo}:not(.ast-preview-item-row)`)].forEach(previewItem => {
      previewItem.style.border = '1px solid grey';
      previewItem.style.borderRadius = '3px';
    })
  }

  /**
   * Sets the border style to indicate an incorrect value for a specific data type in a given row.
   * @param {number} rowNo - The row number containing the incorrect value.
   * @param {string} dataType - The type of data that is incorrect (e.g., 'hh', 'mm' or 'msg').
   */
  function setBorderForIncorrectValue(rowNo, dataType) {
    const tempPreviewTag = document.querySelector(`.ast-preview-row-${rowNo}.ast-preview-item-${dataType}`);
    tempPreviewTag.style.border = '2px solid red';
    tempPreviewTag.style.borderRadius = '3px';
  }

  /**
   * Sets the backgroundColor style of a preview row item to indicate late message.
   * @param {number} rowNo - The row number containing the late message.
   */
  function setBgForOldMsg(rowNo) {
    document.querySelector(`.ast-preview-row-${rowNo}.ast-preview-item-row`).style.backgroundColor = 'orange';
  }

  /**
   * Resets the backgroundColor style of a preview row item to default.
   * @param {number} rowNo - The row number whose preview item borders need to be reset.
   */
  function resetBgForPreviewRowNo(rowNo) {
    document.querySelector(`.ast-preview-row-${rowNo}.ast-preview-item-row`).style.backgroundColor = 'transparent';
  }

  /**
   * Checks and highlights error and late messages.
   ** Ensure 'previewWarningTag' and 'previewErrorTag' elements are defined before calling this function.
   * @param {object[]} msgs - Array of message objects.
   * @returns {boolean} - true if no errors are found, else false.
   */
  function validateData(msgs) {
    const errors = [];
    const errorRows = [];
    const lateMsgsRowNumbers = [];
    msgs.forEach(msg => {
      // Check for late message
      if (isMsgOlderThanCurrentTime(msg)) {
        lateMsgsRowNumbers.push(msg.rowNo);
        setBgForOldMsg(msg.rowNo);
      }
      else {
        resetBgForPreviewRowNo(msg.rowNo);
      }

      // Check for incorrect values
      const invalidHr = (!isNum(`${msg.hh}`) || parseInt(msg.hh) < 0 || parseInt(msg.hh) > 23);
      const invalidMin = (!isNum(`${msg.mm}`) || parseInt(msg.mm) < 0 || parseInt(msg.mm) > 59);
      const invalidMsg = (typeof msg.msg !== 'string');

      if (!invalidHr && !invalidMin && !invalidMsg) { resetPreviewItemBorders(msg.rowNo); return; }

      const errorMessages = [];
      if (invalidHr) { setBorderForIncorrectValue(msg.rowNo, 'hh'); errorMessages.push('Invalid hour'); }
      if (invalidMin) { setBorderForIncorrectValue(msg.rowNo, 'mm'); errorMessages.push('Invalid minute'); }
      if (invalidMsg) { setBorderForIncorrectValue(msg.rowNo, 'msg'); errorMessages.push('Invalid message'); }

      errors.push({ 'rowNo': msg.rowNo, 'errors': errorMessages, 'data': msg });
      errorRows.push(msg.rowNo);
    });

    if (lateMsgsRowNumbers.length > 0) showMessage(previewWarningTag, generateOldMsgsWarning(lateMsgsRowNumbers));
    else hideMessage(previewWarningTag);

    if (errors.length > 0) {
      console.error("Errors found in dataset: \n", errors);
      showMessage(previewErrorTag, `Error in ${errorRows.length === 1 ? 'row' : 'rows'}: ${errorRows}`)
      return false;
    }
    hideMessage(previewErrorTag);
    return true;
  }

  //-------------------- Schedule message functions --------------------

  /**
   * Checks wether the given message object's time is before the current time.
   * @param {object} msg - A message object.
   * @param {string | number} msg.hh - Hour value of the message object.
   * @param {string | number} msg.mm - Minute value of the message object.
   * @param {string} msg.msg - Text of the message object.
   * @returns {boolean} - true if message is old, else false.
   */
  function isMsgOlderThanCurrentTime(msg) {
    const currentTime = new Date();
    const curHrs = currentTime.getHours();
    const curMin = currentTime.getMinutes();
    const msgHrs = parseInt(msg.hh);
    const msgMin = parseInt(msg.mm);
    return (msgHrs < curHrs || ((msgHrs === curHrs) && (msgMin < curMin)));
  }

  /**
   * Checks wether the given message object's time is not before the current time.
   * @param {object} msg - A message object.
   * @param {string | number} msg.hh - Hour value of the message object.
   * @param {string | number} msg.mm - Minute value of the message object.
   * @param {string} msg.msg - Text of the message object.
   * @returns {boolean} - true if message is not old, else false.
   */
  function isMsgNotOlderThanCurrentTime(msg) {
    return !isMsgOlderThanCurrentTime(msg);
  }

  /**
   * Simulates 'Escape' key press on document.body.
   ** Ensure that pressEscapeEvent is defined before calling this function.
   */
  function pressEscape() {
    document.body.dispatchEvent(pressEscapeEvent);
  }

  /**
   * Simulates 'Enter' key press on document.body.
   ** Ensure that pressEnterEvent is defined before calling this function.
   */
  function pressEnter() {
    document.body.dispatchEvent(pressEnterEvent);
  }

  /**
   * Gets telegram's time input tags in an HTMLElement array. 
   * Element at index 0 is for hours, and at index 1 is for minutes. Change their value property. 
   * @returns {HTMLElement[]} - Array of HTML elements containing time input tags.
   */
  function getTeleScheduleTimeInputs() {
    return [...document.querySelectorAll('.date-picker-time > .input-field > .input-field-input')];
  }

  /**
   * Enters the message into telegram's text input for messages.
   * @param {string} msg - Text value for the message.* 
   */
  function enterMsgIntoTeleMsgInputs(msg) {
    const msgInputElements = getTeleMsgInputElements();
    msgInputElements.forEach(msgInput => msgInput.innerText = msg);
  }

  /**
   * Enters the time for scheduling the message inside telegram's schedule message popup's time inputs.
   * @param {string | number} hh - Hour value.
   * @param {string | number} mm - Minute value.
   */
  function enterTimeIntoTeleScheduleTimeInputs(hh, mm) {
    const timeInputElements = getTeleScheduleTimeInputs();
    timeInputElements[0].value = hh;
    timeInputElements[1].value = mm;
  }

  /**
   * Pauses execution for a specified number of milliseconds. 
   ** Make sure to use it with await in an async function.
   * @param {number} ms - The number of milliseconds to sleep.
   * @returns {Promise<void>} A promise that resolves after the specified delay.
   */
  function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Schedules the messages from provided array of message objects.
   * @param {object[]} msgs - Array of message objects.
   * @returns {void} - Returns if a telegram chat's schedule messages section is not open.
   */
  async function scheduleMsgs(msgs) {
    // Rechecking here in-case user pressed Esc while popup was open to get out of chat.
    if (!getTeleActiveChatElement()) { alert('Open a telegram chat first!'); return; }
    if (!isTeleScheduleChatSectionOpen()) { alert('Open the schedule messages section of this chat first!'); return; }
    document.addEventListener('keydown', haltExecution); // Stop execution on pressing Alt + X.

    // Check if telegram's schedule time input popup is already open (press Escape to close it if it's open)
    if (getTeleSchedulerPopupElement()) { pressEscape(); await sleep(DELAY); }
    for (msg of msgs) {
      if (!continueExecutionFlag) {
        console.log('Execution stopped by user at message:\n', msg);
        document.removeEventListener('keydown', haltExecution);
        continueExecutionFlag = true;
        return;
      }
      if (isMsgOlderThanCurrentTime(msg)) continue;
      enterMsgIntoTeleMsgInputs(msg.msg);
      pressEnter();
      await sleep(DELAY);
      enterTimeIntoTeleScheduleTimeInputs(msg.hh, msg.mm);
      pressEnter();
      await sleep(DELAY);
    }
  }

  //==================== Main functions ====================

  /**
   * Loads message sets stored in localStorage to DOM.
   ** Ensure 'userUploadOptionGroup' element and 'LOCAL_STORAGE_KEY' variable are defined and requirements for 'loadMsgSetToDOM' are met before calling this function.
   * @returns {void} - Returns if messages are already loaded from localStorage
   */
  function loadLocalMsgSets() {
    if (userUploadOptionGroup.childElementCount > 0) return; // Checks if msgSets are already loaded!
    const localMsgSets = JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY)); // Gets the local message sets.
    if (localMsgSets) localMsgSets.map(loadMsgSetToDOM);
  }

  /**
   * Event handler function for handling change in 'from time-input'.
   ** Ensure that requirements for 'showPreviews()' function are met before calling this function.
   * @param {Event} e - Event object triggered by change in 'from time-input'.
   * @returns {void} - Returns if a message set is not selected by user.
   */
  function handleAstFromTimeInputChange(e) {
    if (!isAMsgSetSelected()) return;
    const tempFromTime = e.target.value.split(':');
    const fromHr = Number.parseInt(tempFromTime[0]);
    const fromMin = Number.parseInt(tempFromTime[1]);
    const tempMsgs = selectedMsgSet.msgs.filter(msg => (
      parseInt(msg.hh) > fromHr || (parseInt(msg.hh) === fromHr && parseInt(msg.mm) >= fromMin)
    )); // Getting messages which are to be scheduled after user's desired from-input time.
    showPreviews(tempMsgs);
  }

  /**
   * Event handler for change in select when user selects a new option.
   ** Ensure that requirements for 'triggerUpload()', 'clearUserSets()', 'removePreviews()', 'getMsgSet()', 'showPreviews()' and 'getAstFromTimeInputValue()' are met and 'DEFAULT_OPTION_ID', 'selectedMsgSetId', 'selectedMsgSet', 'fromInputTag' and 'changeEvent' are defined before calling this function.
   * @param {Event} e - Event object triggered by the selecting an option.
   */
  function handleSelectChange(e) {
    //! WARNING: using selectMsgSet() here may cause an infinite loop.
    hideAllErrors();
    hideAllWarnings();
    if (e.target.value === 'upload_new_set') triggerUpload();
    else if (e.target.value === 'clear_user_sets') clearUserSets();
    else if (e.target.value === DEFAULT_OPTION_ID) {
      selectedMsgSetId = e.target.value;
      selectedMsgSet = null;
      removePreviews();
    }
    else {
      selectedMsgSetId = e.target.value;
      selectedMsgSet = getMsgSet(selectedMsgSetId);
      assignRowNoToMsgs(selectedMsgSet);
      showPreviews(selectedMsgSet.msgs);
    }
    if (getAstFromTimeInputValue()) fromInputTag.dispatchEvent(changeEvent);
  }

  /**
   * Handles the file upload change event, reads the file, and processes its content.
   ** Ensure that requirements for 'loadMsgSetToDOM()', 'saveMsgSetsToLocalStorage()', 'selectMsgSet()', 'selectPreviouslySelectedMsgSet()' are met and 'fileInputErrorTag' element is defined before calling this function.
   * @param {Event} e - The change event triggered by the file input.
   * @returns {Promise<void>} - A promise that resolves when the file is successfully processed.
   * @throws {Error} - Throws an error if no file is selected, the file type is not JSON, the file content is invalid, or other processing errors occur.
   */
  async function handleUploadChange(e) {
    try {
      hideMessage(fileInputErrorTag);

      const file = e.target.files[0];
      if (!file) throw new Error('No files were selected');
      if (file.type !== 'application/json') throw new Error('Wrong type of file. \nAccepted file types: .json');

      const fileContent = await readFileAsText(file);
      const msgs = JSON.parse(fileContent);
      if (!msgsHasRequiredProperties(msgs)) throw new Error('Invalid message format');

      // Add new message set.
      const msgSet = createMsgSet(extractNameFromFile(file), msgs);
      loadMsgSetToDOM(msgSet);
      saveMsgSetsToLocalStorage();
      selectMsgSet(msgSet.id);
    }
    catch (error) {
      showMessage(fileInputErrorTag, error); // Currently not working since setPreviouslySelectedMsgSet triggers change on select tag which hides all errors.
      alert(error); // So, showing alerts instead.
      setPreviouslySelectedMsgSet();
    }
  }

  /**
   * Handles the deletion of the selected message set.
   ** Ensure that requirements for 'isAMsgSetSelected()', 'getMsgSet()', 'getSelectedMsgSetTag()', 'removeFromMsgSets()', 'saveMsgSetsToLocalStorage()', 'selectMsgSet()' are met, 'fileInputErrorTag' element, 'selectedMsgSetId' and 'DEFAULT_OPTION_ID' variables are defined before calling this function.
   * @param {Event} e - The event object triggered by the delete action.
   */
  function handleDeleteSet(e) {
    e.preventDefault();
    hideMessage(fileInputErrorTag);
    try {
      if (!isAMsgSetSelected()) throw new Error('Select a message set first');
      if (!confirm(`This will delete the selected message set (${getMsgSet(selectedMsgSetId).name}). Confirm delete?`)) return;
      const selectedMsgOptionTag = getSelectedMsgSetTag(selectedMsgSetId);
      removeFromMsgSets(selectedMsgSetId);
      saveMsgSetsToLocalStorage();
      selectMsgSet(DEFAULT_OPTION_ID);
      selectedMsgOptionTag.remove();
    }
    catch (error) {
      showMessage(fileInputErrorTag, error);
    }
  }

  /**
   * Handles the confirmation of message set.
   ** Ensure that 'fileInputErrorTag' element is defined and requirements for 'previewDataToJson()', 'getAstFromTimeInputValue()', 'hideAstPopup()', 'scheduleMsgs()' are met before calling this function. 
   * @param {Event} e - The event object triggered by the confirm action.
   */
  async function handleConfirm(e) {
    e.preventDefault();
    if (!selectedMsgSet) { showMessage(fileInputErrorTag, 'Error: Select a message set first'); return; }
    const previewMsgs = previewDataToJson();
    if (!validateData(previewMsgs)) return;
    await sleep(1); // Waiting for warning messages to show up.
    const msgsToBeSent = [...previewMsgs].filter(isMsgNotOlderThanCurrentTime);
    if (!confirm(`Confirm scheduling ${msgsToBeSent.length} messages from ${getAstFromTimeInputValue() || '00:00 (12AM)'}? \nPress ALT+X to stop at anytime.`)) return;
    hideAstPopup();
    scheduleMsgs(msgsToBeSent);
  }

  /**
   * Stops scheduling of further message. 
   ** Ensure that 'continueExecutionFlag' variable is defined before calling this function.
   * @param {Event} e - The event triggered by keypress.
   */
  function haltExecution(e) {
    if (e.altKey && e.key === 'x') {
      continueExecutionFlag = false;
      e.stopPropagation();
      e.preventDefault();
    }
  }

  /**
   * Handle change on editing preview messages.
   ** Ensure that requirements for 'previewDataToJson()' are met before calling this function.
   */
  function handlePreviewEdit() {
    const tempPreviewMsgs = previewDataToJson();
    validateData(tempPreviewMsgs);
  }

  //==================== Main program ====================
  if (!getTeleActiveChatElement()) { alert('Open a telegram chat first!'); return; }
  if (!isTeleScheduleChatSectionOpen()) { alert('Open the schedule messages section of this chat first!'); return; }
  let firstRun = false;
  if (!getAstPopup()) {
    firstRun = true;
    loadAstPopupIntoDom();
    await sleep(1); // 1ms delay for AST to load in DOM before going further. (Required for first run of transitions/animations)
  }

  // Events
  const changeEvent = new Event('change');
  const pressEnterEvent = new KeyboardEvent('keydown', { key: 'Enter' });
  const pressEscapeEvent = new KeyboardEvent('keydown', { key: 'Escape' });

  // Popup-DOM elements
  const backdrop = document.getElementById('ast-backdrop');
  const popup = document.getElementById('ast-popup');
  const closeButton = document.getElementById('ast-close-button');
  const fromInputTag = document.getElementById('ast-from-input');
  const uploadTag = document.getElementById('ast-file-input');
  const selectTag = document.getElementById('ast-message-set-select');
  const userUploadOptionGroup = document.getElementById('ast-user-sets-optgroup');
  const deleteSetButton = document.getElementById('ast-delete-selected-set-button');
  const previewContainerDiv = document.getElementById('ast-preview-msgs-container');
  const previewDiv = document.getElementById('ast-preview-msgs');
  const previewHeading = document.getElementById('ast-preview-msgs-heading');
  const confirmButton = document.getElementById('ast-confirm-button');
  const fileInputErrorTag = document.getElementById('ast-file-input-error');
  const previewErrorTag = document.getElementById('ast-preview-msgs-error');
  const previewWarningTag = document.getElementById('ast-preview-msgs-warning');

  if (!firstRun) { firstRun = false; showAstPopup(); return; }

  // Below values must not be redefined/initialized once the popup is already loaded inside the DOM (will break the code).

  // Constants and Variables
  const LOCAL_STORAGE_KEY = 'astMessageSets';
  const DEFAULT_OPTION_ID = 'This_value_is_for_this_SelectAnOption_Option_TryingToMakeThisUnique'
  const DELAY = 500; // delay between pressing enter and entering next message/time.
  const msgSets = []; // to store message sets from local storage
  let selectedMsgSetId = DEFAULT_OPTION_ID; // for keeping track of selected msg set
  let selectedMsgSet = null; // set -> jsObject.
  let continueExecutionFlag = true;
  // let closePopupTransitionTimeout = null; // Didn't work (will try again later).

  // Initializing elements
  selectTag.value = selectedMsgSetId;

  closeButton.onclick = hideAstPopup;
  fromInputTag.onchange = handleAstFromTimeInputChange;
  selectTag.onchange = handleSelectChange;
  uploadTag.onchange = handleUploadChange;
  deleteSetButton.onclick = handleDeleteSet;
  confirmButton.onclick = handleConfirm;

  // Start: Load and Open
  loadLocalMsgSets();
  showAstPopup();
}
main();
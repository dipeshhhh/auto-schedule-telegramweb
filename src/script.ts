async function main(): Promise<void> {
  //==================== Telegram elements functions ====================
  function getTeleMsgInputElements(): HTMLElement[] {
    return [...document.getElementsByClassName('input-message-input') as HTMLCollectionOf<HTMLElement>];
  }

  function getTeleSchedulerPopupElement(): HTMLElement | null {
    return document.querySelector('.popup.popup-date-picker.popup-schedule.active') as HTMLElement || null;
  }

  function getTeleActiveChatElement(): HTMLElement | null {
    return document.querySelector('.chat.tabs-tab.active') as HTMLElement || null;
  }

  function isTeleScheduleChatSectionOpen(): boolean {
    return getTeleActiveChatElement()?.getAttribute('data-type') === 'scheduled';
  }

  //==================== AST elements functions ====================
  //-------------------- Independent functions (no predefined values required) --------------------
  function loadAstPopupIntoDom(): void {
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

  function getAstPopup(): HTMLElement | null {
    return document.getElementById('ast-popup');
  }

  function showMessage(htmlElement: HTMLElement, message: string): void {
    htmlElement.style.display = 'initial';
    htmlElement.innerText = message;
  }

  function hideMessage(htmlElement: HTMLElement): void {
    htmlElement.style.display = 'none';
    htmlElement.innerText = '';
  }

  function generateOldMsgsWarning(oldMsgsRows: (string | number)[]): string {
    const isSingleRow = oldMsgsRows.length === 1;
    return `Warning: Old ${isSingleRow ? 'message' : 'messages'} in the following ${isSingleRow ? 'row' : 'rows'} won't be scheduled - ${oldMsgsRows}`;
  }

  //-------------------- Opening and Closing AST popup with backdrop --------------------
  //* Ensure 'backdrop' and 'popup' elements are defined before calling this function.
  function hideAstPopup(): void {
    if (!backdrop || !popup) return;
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

  //* Ensure 'backdrop' and 'popup' elements are defined before calling this function.
  async function showAstPopup(): Promise<void> {
    if (!backdrop || !popup) return;
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

  function hideAstPopupOnAltX(e: KeyboardEvent): void {
    if (e.altKey && e.key === 'x') { // Esc key didn't work well due to telegram's predefined shortcuts.
      e.preventDefault();
      e.stopPropagation();
      hideAstPopup();
    }
  }

  function hideAstPopupOnOutsideClick(e: PointerEvent): void {
    if (!popup) return;
    if (!popup.contains(e.target as Element) && (e.target !== uploadTag)) {
      hideAstPopup();
    }
  }

  //-------------------- Message set handling --------------------
  //* Ensure 'selectTag' element and 'selectedMsgSetId' variable are defined before calling this function.
  function selectMsgSet(msgSetId: string): void {
    if (!selectTag) return;
    selectedMsgSetId = msgSetId;
    selectTag.value = selectedMsgSetId;
    selectTag.dispatchEvent(changeEvent);
  }

  //* Ensure 'selectTag' element and 'selectedMsgSetId' variable are defined before calling this function.
  function setPreviouslySelectedMsgSet(): void {
    selectMsgSet(selectedMsgSetId);
  }

  //* Ensure 'selectedMsgSetId' variable is defined before calling this function.
  function getSelectedMsgSetTag(msgSetId: string): HTMLElement | null {
    return document.querySelector(`[value="${msgSetId}"]`) as HTMLElement || null;
  }

  //* Ensure 'selectedMsgSetId' variable is defined before calling this function.
  function isAMsgSetSelected(): boolean {
    const selectedElement = getSelectedMsgSetTag(selectedMsgSetId);
    return selectedElement !== null && selectedElement.parentElement?.id === 'ast-user-sets-optgroup';
  }

  //* Ensure 'msgSets' array is defined before calling this function.
  function getMsgSet(msgSetId: string): MessageSet | undefined {
    return msgSets.find((msgSet => msgSet.id === msgSetId));
  }

  //* Ensure 'msgSets' array is defined before calling this function.
  function saveMsgSetsToLocalStorage(): void {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(msgSets));
  }

  //-------------------- 'from' time-input --------------------
  function getAstFromTimeInputValue(): string | undefined {
    if (!fromInputTag) return;
    return fromInputTag.value;
  }

  //==================== Functions for loadLocalMsgs ====================
  function createMsgSetOptionTag(msgSetId: string, msgSetName: string): HTMLOptionElement {
    const newOptionTag = document.createElement('option');
    newOptionTag.value = msgSetId;
    newOptionTag.innerText = msgSetName;
    return newOptionTag;
  }

  //* Ensure that 'msgSets' array and 'userUploadOptionGroup' element is defined before calling this function.
  function loadMsgSetToDOM(msgSet: MessageSet): void {
    if (!userUploadOptionGroup) return;
    msgSets.push(msgSet);
    userUploadOptionGroup.append(createMsgSetOptionTag(msgSet.id, msgSet.name));
  }

  //==================== Functions for handleSelectChange ====================
  function hideAllErrors(): void {
    [...document.querySelectorAll('.ast-error-message')].map(errTag => hideMessage(errTag as HTMLElement));
  }

  function hideAllWarnings(): void {
    [...document.querySelectorAll('.ast-warning-message')].map(warnTag => hideMessage(warnTag as HTMLElement));
  }

  //* Ensure that 'uploadTag' element is defined and requirements of 'setPreviouslySelectedMsgSet()' function are satisfied before calling this function.
  function triggerUpload(): void {
    if (!uploadTag) return;
    setPreviouslySelectedMsgSet(); // in case upload cancels for any reason.
    uploadTag.click()
  }

  //* Ensure that 'previewContainerDiv' element is defined before calling this function.
  function removePreviews(): void {
    if (!previewContainerDiv) return;
    const previews = [...document.getElementsByClassName('ast-preview-item')];
    previews.forEach(preview => preview.remove());
    previewContainerDiv.style.display = 'none';
  }

  //* Ensure that 'userUploadOptionGroup' element and 'LOCAL_STORAGE_KEY' is defined and requirements of 'setPreviouslySelectedMsgSet()' and 'selectMsgSet()' functions are met before calling this function.
  function clearUserSets(): void {
    if (!userUploadOptionGroup) return
    setPreviouslySelectedMsgSet(); // in case deletion cancels for any reason.
    if (!confirm("This will delete all your uploaded message sets! Confirm delete?")) return;

    localStorage.removeItem(LOCAL_STORAGE_KEY);
    userUploadOptionGroup.innerHTML = '';
    selectMsgSet(DEFAULT_OPTION_ID)
    removePreviews();
  }

  function assignRowNoToMsgs(msgSet: MessageSet) {
    const tempMsgs: Messages = [];
    msgSet.msgs.forEach((msg, index) => {
      tempMsgs.push({ ...msg, rowNo: index + 1 });
    })
    msgSet.msgs = tempMsgs;
  }

  //-------------------- Show previews functions --------------------
  //* Ensure 'previewDiv' element is defined before calling this function.
  function renderPreviewRow(msg: Message) {
    if (!previewDiv || !msg.rowNo || (typeof msg.isMsgLate === 'undefined')) return;
    const rowNoSpan = createPreviewTag(msg.rowNo, msg.rowNo, 'row', 'span', msg.isMsgLate);
    const hrsInput = createPreviewTag(msg.rowNo, msg.hh, 'hh', 'input', msg.isMsgLate);
    const minInput = createPreviewTag(msg.rowNo, msg.mm, 'mm', 'input', msg.isMsgLate);
    const msgInput = createPreviewTag(msg.rowNo, msg.txt, 'txt', 'input', msg.isMsgLate);

    previewDiv.append(rowNoSpan, hrsInput, minInput, msgInput);
  }

  function createPreviewTag(rowNo: string | number, value: string | number, dataType: PreviewMessageProperties, tagName: string, isMsgLate: boolean): HTMLInputElement | HTMLSpanElement {
    const tag: HTMLInputElement | HTMLSpanElement = document.createElement(tagName);
    tag.className = `ast-preview-item ast-preview-row-${rowNo} ast-preview-item-${dataType} ${isMsgLate ? 'late-message-preview' : ''}`;
    if (tagName === 'input' && tag instanceof HTMLInputElement) {
      tag.type = 'text';
      tag.value = `${value}`;
      tag.onchange = handlePreviewEdit;
    }
    else {
      tag.innerText = `${value}`;
    }
    return tag;
  }

  //* Ensure 'previewWarningTag', 'previewHeading' elements are defined and requirements for 'isAMsgSetSelected()', 'removePreviews()', 'getAstFromTimeInputValue()' and 'renderPreviewRow()' are met before calling this function.
  function showPreviews(msgs: Messages): void {
    if (!previewWarningTag || !previewHeading || !previewContainerDiv) return;
    if (!isAMsgSetSelected()) return;

    removePreviews();
    const lateMsgsRowNumbers: (number | string)[] = []
    const fromInputValue = getAstFromTimeInputValue();

    msgs.map(msg => {
      if (!msg.rowNo) return;
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
  function readFileAsText(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(typeof reader.result === 'string' ? reader.result : '');
      reader.onerror = () => reject(reader.error);
      reader.readAsText(file);
    });
  }

  function msgsHasRequiredProperties(msgs: Messages): boolean {
    for (let msg of msgs) {
      if (!msg.mm || !msg.hh || !msg.txt) return false;
    }
    return true;
  }

  function createMsgSet(fileName: string, msgs: Messages): MessageSet {
    const currentDate = new Date();
    return {
      id: `fileName ${currentDate}`,
      name: fileName,
      msgs: msgs
    }
  }

  function extractNameFromFile(file: File): string {
    const nameParts = file.name.split('.');
    if (nameParts.length > 1) {
      nameParts.pop(); // Remove the last element (the extension)
      return nameParts.join('.');
    }
    return file.name; // If no dots are present, return the full name
  }

  //==================== Functions for handleDelete ====================
  //* Ensure that 'msgSets' array is defined before calling this function.
  function removeFromMsgSets(msgSetId: string) {
    const index = msgSets.findIndex(msgSet => msgSet.id === msgSetId);
    if (index === -1) throw new Error('Message set not found');
    msgSets.splice(index, 1);
  }

  //==================== Functions for handleConfirm. ====================
  //-------------------- Preview data to JSON conversion functions --------------------
  function getPreviewItemsRowNumbers(): string[] | number[] {
    return [...document.querySelectorAll('.ast-preview-item-row')].map((item: Element) => (item as HTMLElement).innerText);
  }

  function getPreviewValue(rowNo: string | number, dataType: PreviewInputDataType): string {
    const element = document.querySelector(`.ast-preview-row-${rowNo}.ast-preview-item-${dataType}`) as HTMLInputElement;
    return element ? element.value : '';
  }

  function previewDataToJson(): Messages {
    const newData: Messages = [];
    if (!document.querySelector('.ast-preview-item')) return newData; // return an empty array if there is no preview data

    getPreviewItemsRowNumbers().forEach(rowNo => {
      newData.push({
        rowNo: rowNo,
        hh: getPreviewValue(rowNo, 'hh'),
        mm: getPreviewValue(rowNo, 'mm'),
        txt: getPreviewValue(rowNo, 'txt'),
      })
    })
    return newData;
  }

  //-------------------- Validate message and highlight error functions --------------------
  function isNum(str: string | number): boolean {
    return /^\d+$/.test(`${str}`);
  }

  function resetPreviewItemBorders(rowNo: string | number): void {
    [...document.querySelectorAll(`.ast-preview-row-${rowNo}:not(.ast-preview-item-row)`)].forEach(previewItem => {
      (previewItem as HTMLElement).style.border = '1px solid grey';
      (previewItem as HTMLElement).style.borderRadius = '3px';
    })
  }

  function setBorderForIncorrectValue(rowNo: string | number, dataType: PreviewInputDataType): void {
    const tempPreviewTag = document.querySelector(`.ast-preview-row-${rowNo}.ast-preview-item-${dataType}`) as HTMLElement;
    tempPreviewTag.style.border = '2px solid red';
    tempPreviewTag.style.borderRadius = '3px';
  }

  function setBgForOldMsg(rowNo: string | number): void {
    (document.querySelector(`.ast-preview-row-${rowNo}.ast-preview-item-row`) as HTMLElement).style.backgroundColor = 'orange';
  }

  function resetBgForPreviewRowNo(rowNo: string | number) {
    (document.querySelector(`.ast-preview-row-${rowNo}.ast-preview-item-row`) as HTMLElement).style.backgroundColor = 'transparent';
  }

  function validateData(msgs: Messages) {
    if (!previewWarningTag || !previewErrorTag) return;
    type ErrorMsgs = string[]
    interface ErrorRow {
      rowNo: string | number,
      errors: ErrorMsgs,
      data: Message
    };
    const errors: ErrorRow[] = [];
    const errorRows: (string | number)[] = [];
    const lateMsgsRowNumbers: (string | number)[] = [];
    msgs.forEach(msg => {
      if (msg.rowNo === undefined) return;
      // Check for late message
      if (isMsgOlderThanCurrentTime(msg)) {
        lateMsgsRowNumbers.push(msg.rowNo);
        setBgForOldMsg(msg.rowNo);
      }
      else {
        resetBgForPreviewRowNo(msg.rowNo);
      }

      // Check for incorrect values
      const invalidHr = (!isNum(`${msg.hh}`) || parseInt(`${msg.hh}`) < 0 || parseInt(`${msg.hh}`) > 23);
      const invalidMin = (!isNum(`${msg.mm}`) || parseInt(`${msg.mm}`) < 0 || parseInt(`${msg.mm}`) > 59);
      const invalidMsg = (typeof msg.txt !== 'string');

      if (!invalidHr && !invalidMin && !invalidMsg) { resetPreviewItemBorders(msg.rowNo); return; }

      const errorMessages: ErrorMsgs = [];
      if (invalidHr) { setBorderForIncorrectValue(msg.rowNo, 'hh'); errorMessages.push('Invalid hour'); }
      if (invalidMin) { setBorderForIncorrectValue(msg.rowNo, 'mm'); errorMessages.push('Invalid minute'); }
      if (invalidMsg) { setBorderForIncorrectValue(msg.rowNo, 'txt'); errorMessages.push('Invalid message'); }

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
  function isMsgOlderThanCurrentTime(msg: Message): boolean {
    const currentTime = new Date();
    const curHrs = currentTime.getHours();
    const curMin = currentTime.getMinutes();
    const msgHrs = parseInt(`${msg.hh}`);
    const msgMin = parseInt(`${msg.mm}`);
    return (msgHrs < curHrs || ((msgHrs === curHrs) && (msgMin < curMin)));
  }

  function isMsgNotOlderThanCurrentTime(msg: Message): boolean {
    return !isMsgOlderThanCurrentTime(msg);
  }

  //* Ensure that pressEscapeEvent is defined before calling this function.
  function pressEscape(): void {
    document.body.dispatchEvent(pressEscapeEvent);
  }

  //* Ensure that pressEnterEvent is defined before calling this function.
  function pressEnter(): void {
    document.body.dispatchEvent(pressEnterEvent);
  }

  function getTeleScheduleTimeInputs(): HTMLInputElement[] {
    return [...document.querySelectorAll('.date-picker-time > .input-field > .input-field-input')].map(element => element as HTMLInputElement);
  }

  function enterMsgIntoTeleMsgInputs(msg: string): void {
    const msgInputElements = getTeleMsgInputElements();
    msgInputElements.forEach(msgInput => msgInput.innerText = msg);
  }

  function enterTimeIntoTeleScheduleTimeInputs(hh: string | number, mm: string | number) {
    const timeInputElements = getTeleScheduleTimeInputs();
    timeInputElements[0].value = `${hh}`;
    timeInputElements[1].value = `${mm}`;
  }

  //* Make sure to use it with await in an async function.
  function sleep(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async function scheduleMsgs(msgs: Messages): Promise<void> {
    // Rechecking here in-case user pressed Esc while popup was open to get out of chat.
    if (!getTeleActiveChatElement()) { alert('Open a telegram chat first!'); return; }
    if (!isTeleScheduleChatSectionOpen()) { alert('Open the schedule messages section of this chat first!'); return; }
    document.addEventListener('keydown', haltExecution); // Stop execution on pressing Alt + X.

    // Check if telegram's schedule time input popup is already open (press Escape to close it if it's open)
    if (getTeleSchedulerPopupElement()) { pressEscape(); await sleep(DELAY); }
    for (let msg of msgs) {
      if (!continueExecutionFlag) {
        console.log('Execution stopped by user at message:\n', msg);
        document.removeEventListener('keydown', haltExecution);
        continueExecutionFlag = true;
        return;
      }
      if (isMsgOlderThanCurrentTime(msg)) continue;
      enterMsgIntoTeleMsgInputs(msg.txt);
      pressEnter();
      await sleep(DELAY);
      enterTimeIntoTeleScheduleTimeInputs(msg.hh, msg.mm);
      pressEnter();
      await sleep(DELAY);
    }
  }

  //==================== Main functions ====================
  //* Ensure 'userUploadOptionGroup' element and 'LOCAL_STORAGE_KEY' variable are defined and requirements for 'loadMsgSetToDOM' are met before calling this function.
  function loadLocalMsgSets(): void {
    if (!userUploadOptionGroup || userUploadOptionGroup.childElementCount > 0) return; // Checks if msgSets are already loaded!
    const localMsgSetsString = localStorage.getItem(LOCAL_STORAGE_KEY); // Gets the local message sets string.
    if (!localMsgSetsString) return;

    const localMsgSets = JSON.parse(localMsgSetsString);
    localMsgSets.map(loadMsgSetToDOM);
  }

  //* Ensure that requirements for 'showPreviews()' function are met before calling this function.
  function handleAstFromTimeInputChange(e: Event): void {
    if (!selectedMsgSet) return;
    if (!isAMsgSetSelected()) return;
    const tempFromTime = (e.target as HTMLInputElement).value.split(':');
    const fromHr = Number.parseInt(tempFromTime[0]);
    const fromMin = Number.parseInt(tempFromTime[1]);
    const tempMsgs = selectedMsgSet.msgs.filter(msg => (
      parseInt(`${msg.hh}`) > fromHr || (parseInt(`${msg.hh}`) === fromHr && parseInt(`${msg.mm}`) >= fromMin)
    )); // Getting messages which are to be scheduled after user's desired from-input time.
    showPreviews(tempMsgs);
  }

  //* Ensure that requirements for 'triggerUpload()', 'clearUserSets()', 'removePreviews()', 'getMsgSet()', 'showPreviews()' and 'getAstFromTimeInputValue()' are met and 'DEFAULT_OPTION_ID', 'selectedMsgSetId', 'selectedMsgSet', 'fromInputTag' and 'changeEvent' are defined before calling this function.
  function handleSelectChange(e: Event): void {
    //! WARNING: using selectMsgSet() here may cause an infinite loop.
    if (!e.target) return;
    hideAllErrors();
    hideAllWarnings();
    const tempTarget = e.target as HTMLSelectElement;
    if (tempTarget.value === 'upload_new_set') triggerUpload();
    else if (tempTarget.value === 'clear_user_sets') clearUserSets();
    else if (tempTarget.value === DEFAULT_OPTION_ID) {
      selectedMsgSetId = tempTarget.value;
      selectedMsgSet = null;
      removePreviews();
    }
    else {
      selectedMsgSetId = tempTarget.value;
      selectedMsgSet = getMsgSet(selectedMsgSetId) as MessageSet;
      assignRowNoToMsgs(selectedMsgSet);
      showPreviews(selectedMsgSet.msgs);
    }
    if (fromInputTag && getAstFromTimeInputValue()) fromInputTag.dispatchEvent(changeEvent);
  }

  //* Ensure that requirements for 'loadMsgSetToDOM()', 'saveMsgSetsToLocalStorage()', 'selectMsgSet()', 'selectPreviouslySelectedMsgSet()' are met and 'fileInputErrorTag' element is defined before calling this function.
  async function handleUploadChange(e: Event): Promise<void> {
    if (!fileInputErrorTag || !(e.target instanceof HTMLInputElement)) return;
    try {
      hideMessage(fileInputErrorTag);

      const file = e.target.files?.[0];
      if (!file) throw new Error('No files were selected');
      if (file.type !== 'application/json') throw new Error('Wrong type of file. \nAccepted file types: .json');

      const fileContent = await readFileAsText(file);
      const msgs = JSON.parse(fileContent) as Messages;
      if (!msgsHasRequiredProperties(msgs)) throw new Error('Invalid message format');

      // Add new message set.
      const msgSet = createMsgSet(extractNameFromFile(file), msgs);
      loadMsgSetToDOM(msgSet);
      saveMsgSetsToLocalStorage();
      selectMsgSet(msgSet.id);
    }
    catch (error) {
      showMessage(fileInputErrorTag, `${error}`); // Currently not working since setPreviouslySelectedMsgSet triggers change on select tag which hides all errors.
      alert(error); // So, showing alerts instead.
      setPreviouslySelectedMsgSet();
    }
  }

  //* Ensure that requirements for 'isAMsgSetSelected()', 'getMsgSet()', 'getSelectedMsgSetTag()', 'removeFromMsgSets()', 'saveMsgSetsToLocalStorage()', 'selectMsgSet()' are met, 'fileInputErrorTag' element, 'selectedMsgSetId' and 'DEFAULT_OPTION_ID' variables are defined before calling this function.
  function handleDeleteSet(e: Event): void {
    if (!fileInputErrorTag) return;
    e.preventDefault();
    hideMessage(fileInputErrorTag);
    try {
      if (!isAMsgSetSelected()) throw new Error('Select a message set first');
      if (!confirm(`This will delete the selected message set (${getMsgSet(selectedMsgSetId)?.name}). Confirm delete?`)) return;
      const selectedMsgOptionTag = getSelectedMsgSetTag(selectedMsgSetId);
      removeFromMsgSets(selectedMsgSetId);
      saveMsgSetsToLocalStorage();
      selectMsgSet(DEFAULT_OPTION_ID);
      selectedMsgOptionTag?.remove();
    }
    catch (error) {
      showMessage(fileInputErrorTag, `${error}`);
    }
  }

  //* Ensure that 'fileInputErrorTag' element is defined and requirements for 'previewDataToJson()', 'getAstFromTimeInputValue()', 'hideAstPopup()', 'scheduleMsgs()' are met before calling this function.
  async function handleConfirm(e: Event): Promise<void> {
    e.preventDefault();
    if (!fileInputErrorTag) return;
    if (!selectedMsgSet) { showMessage(fileInputErrorTag, 'Error: Select a message set first'); return; }
    const previewMsgs = previewDataToJson();
    if (!validateData(previewMsgs)) return;
    await sleep(1); // Waiting for warning messages to show up.
    const msgsToBeSent = [...previewMsgs].filter(isMsgNotOlderThanCurrentTime);
    if (!confirm(`Confirm scheduling ${msgsToBeSent.length} messages from ${getAstFromTimeInputValue() || '00:00 (12AM)'}? \nPress ALT+X to stop at anytime.`)) return;
    hideAstPopup();
    scheduleMsgs(msgsToBeSent);
  }

  //* Ensure that 'continueExecutionFlag' variable is defined before calling this function.
  function haltExecution(e: KeyboardEvent) {
    if (e.altKey && e.key === 'x') {
      continueExecutionFlag = false;
      e.stopPropagation();
      e.preventDefault();
    }
  }

  function handlePreviewEdit(): void {
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

  // Types and Interfaces
  type MessageProperty = 'hh' | 'mm' | 'txt' | 'isLate' | 'rowNo';
  type PreviewMessageProperties = 'hh' | 'mm' | 'txt' | 'row';
  type PreviewInputDataType = 'hh' | 'mm' | 'txt';

  interface Message {
    hh: string | number,
    mm: string | number,
    txt: string,
    rowNo?: string | number,
    isMsgLate?: boolean,
  }

  type Messages = Message[];

  interface MessageSet {
    readonly id: string,
    name: string,
    msgs: Messages
  }

  type MessageSets = MessageSet[];

  // Events
  const changeEvent = new Event('change');
  const pressEnterEvent = new KeyboardEvent('keydown', { key: 'Enter' });
  const pressEscapeEvent = new KeyboardEvent('keydown', { key: 'Escape' });

  // Popup-DOM elements
  const backdrop = document.getElementById('ast-backdrop');
  const popup = document.getElementById('ast-popup');
  const closeButton = document.getElementById('ast-close-button');
  const fromInputTag: HTMLInputElement | null = document.getElementById('ast-from-input') as HTMLInputElement | null;
  const uploadTag = document.getElementById('ast-file-input');
  const selectTag: HTMLSelectElement | null = document.getElementById('ast-message-set-select') as HTMLSelectElement | null;
  const userUploadOptionGroup = document.getElementById('ast-user-sets-optgroup');
  const deleteSetButton = document.getElementById('ast-delete-selected-set-button');
  const previewContainerDiv = document.getElementById('ast-preview-msgs-container');
  const previewDiv = document.getElementById('ast-preview-msgs');
  const previewHeading = document.getElementById('ast-preview-msgs-heading');
  const confirmButton = document.getElementById('ast-confirm-button');
  const fileInputErrorTag = document.getElementById('ast-file-input-error');
  const previewErrorTag = document.getElementById('ast-preview-msgs-error');
  const previewWarningTag = document.getElementById('ast-preview-msgs-warning');

  if (!firstRun) { firstRun = false; showAstPopup(); return; } // Below values must not be redefined/initialized once the popup is already loaded inside the DOM (will break the code).

  // Constants and Variables
  const LOCAL_STORAGE_KEY = 'astMessageSets';
  const DEFAULT_OPTION_ID = 'This_value_is_for_this_SelectAnOption_Option_TryingToMakeThisUnique'
  const DELAY = 500; // delay between pressing enter and entering next message/time.

  const msgSets: MessageSets = []; // to store message sets from local storage
  let selectedMsgSetId = DEFAULT_OPTION_ID; // for keeping track of selected msg set
  let selectedMsgSet: MessageSet | null = null; // set -> jsObject.
  let continueExecutionFlag = true;
  // let closePopupTransitionTimeout = null; // Didn't work (will try again later).

  // Initializing elements
  if (selectTag) {
    selectTag.value = selectedMsgSetId;
    selectTag.onchange = handleSelectChange;
  }
  if (closeButton) closeButton.onclick = hideAstPopup;
  if (fromInputTag) fromInputTag.onchange = handleAstFromTimeInputChange;
  if (uploadTag) uploadTag.onchange = handleUploadChange;
  if (deleteSetButton) deleteSetButton.onclick = handleDeleteSet;
  if (confirmButton) confirmButton.onclick = handleConfirm;

  // Start: Load and Open
  loadLocalMsgSets();
  showAstPopup();
}
main();
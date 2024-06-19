"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
function main() {
    return __awaiter(this, void 0, void 0, function* () {
        function getTeleMsgInputElements() {
            return [...document.getElementsByClassName('input-message-input')];
        }
        function getTeleSchedulerPopupElement() {
            return document.querySelector('.popup.popup-date-picker.popup-schedule.active') || null;
        }
        function getTeleActiveChatElement() {
            return document.querySelector('.chat.tabs-tab.active') || null;
        }
        function isTeleScheduleChatSectionOpen() {
            var _a;
            return ((_a = getTeleActiveChatElement()) === null || _a === void 0 ? void 0 : _a.getAttribute('data-type')) === 'scheduled';
        }
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
        function getAstPopup() {
            return document.getElementById('ast-popup');
        }
        function showMessage(htmlElement, message) {
            htmlElement.style.display = 'initial';
            htmlElement.innerText = message;
        }
        function hideMessage(htmlElement) {
            htmlElement.style.display = 'none';
            htmlElement.innerText = '';
        }
        function generateOldMsgsWarning(oldMsgsRows) {
            const isSingleRow = oldMsgsRows.length === 1;
            return `Warning: Old ${isSingleRow ? 'message' : 'messages'} in the following ${isSingleRow ? 'row' : 'rows'} won't be scheduled - ${oldMsgsRows}`;
        }
        function hideAstPopup() {
            if (!backdrop || !popup)
                return;
            document.removeEventListener('keydown', hideAstPopupOnAltX);
            document.removeEventListener('pointerdown', hideAstPopupOnOutsideClick);
            backdrop.style.transitionDelay = '0s, 0.15s';
            popup.style.transitionDelay = '0s, 0.15s, 0s';
            backdrop.style.opacity = '0';
            popup.style.opacity = '0';
            popup.style.top = '60%';
            backdrop.style.visibility = 'hidden';
            popup.style.visibility = 'hidden';
            setTimeout(() => {
                backdrop.style.display = 'none';
                popup.style.display = 'none';
            }, 150);
        }
        function showAstPopup() {
            return __awaiter(this, void 0, void 0, function* () {
                if (!backdrop || !popup)
                    return;
                document.addEventListener('keydown', hideAstPopupOnAltX);
                document.addEventListener('pointerdown', hideAstPopupOnOutsideClick);
                backdrop.style.display = 'flex';
                popup.style.display = 'flex';
                yield sleep(1);
                backdrop.style.transitionDelay = '0s, 0s';
                popup.style.transitionDelay = '0s, 0s, 0s';
                backdrop.style.visibility = 'visible';
                popup.style.visibility = 'visible';
                popup.style.top = '50%';
                backdrop.style.opacity = '1';
                popup.style.opacity = '1';
            });
        }
        function hideAstPopupOnAltX(e) {
            if (e.altKey && e.key === 'x') {
                e.preventDefault();
                e.stopPropagation();
                hideAstPopup();
            }
        }
        function hideAstPopupOnOutsideClick(e) {
            if (!popup)
                return;
            if (!popup.contains(e.target) && (e.target !== uploadTag)) {
                hideAstPopup();
            }
        }
        function selectMsgSet(msgSetId) {
            if (!selectTag)
                return;
            selectedMsgSetId = msgSetId;
            selectTag.value = selectedMsgSetId;
            selectTag.dispatchEvent(changeEvent);
        }
        function setPreviouslySelectedMsgSet() {
            selectMsgSet(selectedMsgSetId);
        }
        function getSelectedMsgSetTag(msgSetId) {
            return document.querySelector(`[value="${msgSetId}"]`) || null;
        }
        function isAMsgSetSelected() {
            var _a;
            const selectedElement = getSelectedMsgSetTag(selectedMsgSetId);
            return selectedElement !== null && ((_a = selectedElement.parentElement) === null || _a === void 0 ? void 0 : _a.id) === 'ast-user-sets-optgroup';
        }
        function getMsgSet(msgSetId) {
            return msgSets.find((msgSet => msgSet.id === msgSetId));
        }
        function saveMsgSetsToLocalStorage() {
            localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(msgSets));
        }
        function getAstFromTimeInputValue() {
            if (!fromInputTag)
                return;
            return fromInputTag.value;
        }
        function createMsgSetOptionTag(msgSetId, msgSetName) {
            const newOptionTag = document.createElement('option');
            newOptionTag.value = msgSetId;
            newOptionTag.innerText = msgSetName;
            return newOptionTag;
        }
        function loadMsgSetToDOM(msgSet) {
            if (!userUploadOptionGroup)
                return;
            msgSets.push(msgSet);
            userUploadOptionGroup.append(createMsgSetOptionTag(msgSet.id, msgSet.name));
        }
        function hideAllErrors() {
            [...document.querySelectorAll('.ast-error-message')].map(errTag => hideMessage(errTag));
        }
        function hideAllWarnings() {
            [...document.querySelectorAll('.ast-warning-message')].map(warnTag => hideMessage(warnTag));
        }
        function triggerUpload() {
            if (!uploadTag)
                return;
            setPreviouslySelectedMsgSet();
            uploadTag.click();
        }
        function removePreviews() {
            if (!previewContainerDiv)
                return;
            const previews = [...document.getElementsByClassName('ast-preview-item')];
            previews.forEach(preview => preview.remove());
            previewContainerDiv.style.display = 'none';
        }
        function clearUserSets() {
            if (!userUploadOptionGroup)
                return;
            setPreviouslySelectedMsgSet();
            if (!confirm("This will delete all your uploaded message sets! Confirm delete?"))
                return;
            localStorage.removeItem(LOCAL_STORAGE_KEY);
            userUploadOptionGroup.innerHTML = '';
            selectMsgSet(DEFAULT_OPTION_ID);
            removePreviews();
        }
        function assignRowNoToMsgs(msgSet) {
            const tempMsgs = [];
            msgSet.msgs.forEach((msg, index) => {
                tempMsgs.push(Object.assign(Object.assign({}, msg), { rowNo: index + 1 }));
            });
            msgSet.msgs = tempMsgs;
        }
        function renderPreviewRow(msg) {
            if (!previewDiv || !msg.rowNo || (typeof msg.isMsgLate === 'undefined'))
                return;
            const rowNoSpan = createPreviewTag(msg.rowNo, msg.rowNo, 'row', 'span', msg.isMsgLate);
            const hrsInput = createPreviewTag(msg.rowNo, msg.hh, 'hh', 'input', msg.isMsgLate);
            const minInput = createPreviewTag(msg.rowNo, msg.mm, 'mm', 'input', msg.isMsgLate);
            const msgInput = createPreviewTag(msg.rowNo, msg.txt, 'txt', 'input', msg.isMsgLate);
            previewDiv.append(rowNoSpan, hrsInput, minInput, msgInput);
        }
        function createPreviewTag(rowNo, value, dataType, tagName, isMsgLate) {
            const tag = document.createElement(tagName);
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
        function showPreviews(msgs) {
            if (!previewWarningTag || !previewHeading || !previewContainerDiv)
                return;
            if (!isAMsgSetSelected())
                return;
            removePreviews();
            const lateMsgsRowNumbers = [];
            const fromInputValue = getAstFromTimeInputValue();
            msgs.map(msg => {
                if (!msg.rowNo)
                    return;
                const isMsgLate = isMsgOlderThanCurrentTime(msg);
                if (isMsgLate)
                    lateMsgsRowNumbers.push(msg.rowNo);
                renderPreviewRow(Object.assign(Object.assign({}, msg), { isMsgLate }));
            });
            if (lateMsgsRowNumbers.length > 0)
                showMessage(previewWarningTag, generateOldMsgsWarning(lateMsgsRowNumbers));
            else
                hideMessage(previewWarningTag);
            if (fromInputValue)
                previewHeading.innerText = `Preview/Edit messages from ${fromInputValue}`;
            previewContainerDiv.style.display = 'initial';
        }
        function readFileAsText(file) {
            return new Promise((resolve, reject) => {
                const reader = new FileReader();
                reader.onload = () => resolve(typeof reader.result === 'string' ? reader.result : '');
                reader.onerror = () => reject(reader.error);
                reader.readAsText(file);
            });
        }
        function msgsHasRequiredProperties(msgs) {
            for (let msg of msgs) {
                if (!msg.mm || !msg.hh || !msg.txt)
                    return false;
            }
            return true;
        }
        function createMsgSet(fileName, msgs) {
            const currentDate = new Date();
            return {
                id: `fileName ${currentDate}`,
                name: fileName,
                msgs: msgs
            };
        }
        function extractNameFromFile(file) {
            const nameParts = file.name.split('.');
            if (nameParts.length > 1) {
                nameParts.pop();
                return nameParts.join('.');
            }
            return file.name;
        }
        function removeFromMsgSets(msgSetId) {
            const index = msgSets.findIndex(msgSet => msgSet.id === msgSetId);
            if (index === -1)
                throw new Error('Message set not found');
            msgSets.splice(index, 1);
        }
        function getPreviewItemsRowNumbers() {
            return [...document.querySelectorAll('.ast-preview-item-row')].map((item) => item.innerText);
        }
        function getPreviewValue(rowNo, dataType) {
            const element = document.querySelector(`.ast-preview-row-${rowNo}.ast-preview-item-${dataType}`);
            return element ? element.value : '';
        }
        function previewDataToJson() {
            const newData = [];
            if (!document.querySelector('.ast-preview-item'))
                return newData;
            getPreviewItemsRowNumbers().forEach(rowNo => {
                newData.push({
                    rowNo: rowNo,
                    hh: getPreviewValue(rowNo, 'hh'),
                    mm: getPreviewValue(rowNo, 'mm'),
                    txt: getPreviewValue(rowNo, 'txt'),
                });
            });
            return newData;
        }
        function isNum(str) {
            return /^\d+$/.test(`${str}`);
        }
        function resetPreviewItemBorders(rowNo) {
            [...document.querySelectorAll(`.ast-preview-row-${rowNo}:not(.ast-preview-item-row)`)].forEach(previewItem => {
                previewItem.style.border = '1px solid grey';
                previewItem.style.borderRadius = '3px';
            });
        }
        function setBorderForIncorrectValue(rowNo, dataType) {
            const tempPreviewTag = document.querySelector(`.ast-preview-row-${rowNo}.ast-preview-item-${dataType}`);
            tempPreviewTag.style.border = '2px solid red';
            tempPreviewTag.style.borderRadius = '3px';
        }
        function setBgForOldMsg(rowNo) {
            document.querySelector(`.ast-preview-row-${rowNo}.ast-preview-item-row`).style.backgroundColor = 'orange';
        }
        function resetBgForPreviewRowNo(rowNo) {
            document.querySelector(`.ast-preview-row-${rowNo}.ast-preview-item-row`).style.backgroundColor = 'transparent';
        }
        function validateData(msgs) {
            if (!previewWarningTag || !previewErrorTag)
                return;
            ;
            const errors = [];
            const errorRows = [];
            const lateMsgsRowNumbers = [];
            msgs.forEach(msg => {
                if (msg.rowNo === undefined)
                    return;
                if (isMsgOlderThanCurrentTime(msg)) {
                    lateMsgsRowNumbers.push(msg.rowNo);
                    setBgForOldMsg(msg.rowNo);
                }
                else {
                    resetBgForPreviewRowNo(msg.rowNo);
                }
                const invalidHr = (!isNum(`${msg.hh}`) || parseInt(`${msg.hh}`) < 0 || parseInt(`${msg.hh}`) > 23);
                const invalidMin = (!isNum(`${msg.mm}`) || parseInt(`${msg.mm}`) < 0 || parseInt(`${msg.mm}`) > 59);
                const invalidMsg = (typeof msg.txt !== 'string');
                if (!invalidHr && !invalidMin && !invalidMsg) {
                    resetPreviewItemBorders(msg.rowNo);
                    return;
                }
                const errorMessages = [];
                if (invalidHr) {
                    setBorderForIncorrectValue(msg.rowNo, 'hh');
                    errorMessages.push('Invalid hour');
                }
                if (invalidMin) {
                    setBorderForIncorrectValue(msg.rowNo, 'mm');
                    errorMessages.push('Invalid minute');
                }
                if (invalidMsg) {
                    setBorderForIncorrectValue(msg.rowNo, 'txt');
                    errorMessages.push('Invalid message');
                }
                errors.push({ 'rowNo': msg.rowNo, 'errors': errorMessages, 'data': msg });
                errorRows.push(msg.rowNo);
            });
            if (lateMsgsRowNumbers.length > 0)
                showMessage(previewWarningTag, generateOldMsgsWarning(lateMsgsRowNumbers));
            else
                hideMessage(previewWarningTag);
            if (errors.length > 0) {
                console.error("Errors found in dataset: \n", errors);
                showMessage(previewErrorTag, `Error in ${errorRows.length === 1 ? 'row' : 'rows'}: ${errorRows}`);
                return false;
            }
            hideMessage(previewErrorTag);
            return true;
        }
        function isMsgOlderThanCurrentTime(msg) {
            const currentTime = new Date();
            const curHrs = currentTime.getHours();
            const curMin = currentTime.getMinutes();
            const msgHrs = parseInt(`${msg.hh}`);
            const msgMin = parseInt(`${msg.mm}`);
            return (msgHrs < curHrs || ((msgHrs === curHrs) && (msgMin < curMin)));
        }
        function isMsgNotOlderThanCurrentTime(msg) {
            return !isMsgOlderThanCurrentTime(msg);
        }
        function pressEscape() {
            document.body.dispatchEvent(pressEscapeEvent);
        }
        function pressEnter() {
            document.body.dispatchEvent(pressEnterEvent);
        }
        function getTeleScheduleTimeInputs() {
            return [...document.querySelectorAll('.date-picker-time > .input-field > .input-field-input')].map(element => element);
        }
        function enterMsgIntoTeleMsgInputs(msg) {
            const msgInputElements = getTeleMsgInputElements();
            msgInputElements.forEach(msgInput => msgInput.innerText = msg);
        }
        function enterTimeIntoTeleScheduleTimeInputs(hh, mm) {
            const timeInputElements = getTeleScheduleTimeInputs();
            timeInputElements[0].value = `${hh}`;
            timeInputElements[1].value = `${mm}`;
        }
        function sleep(ms) {
            return new Promise(resolve => setTimeout(resolve, ms));
        }
        function scheduleMsgs(msgs) {
            return __awaiter(this, void 0, void 0, function* () {
                if (!getTeleActiveChatElement()) {
                    alert('Open a telegram chat first!');
                    return;
                }
                if (!isTeleScheduleChatSectionOpen()) {
                    alert('Open the schedule messages section of this chat first!');
                    return;
                }
                document.addEventListener('keydown', haltExecution);
                if (getTeleSchedulerPopupElement()) {
                    pressEscape();
                    yield sleep(DELAY);
                }
                for (let msg of msgs) {
                    if (!continueExecutionFlag) {
                        console.log('Execution stopped by user at message:\n', msg);
                        document.removeEventListener('keydown', haltExecution);
                        continueExecutionFlag = true;
                        return;
                    }
                    if (isMsgOlderThanCurrentTime(msg))
                        continue;
                    enterMsgIntoTeleMsgInputs(msg.txt);
                    pressEnter();
                    yield sleep(DELAY);
                    enterTimeIntoTeleScheduleTimeInputs(msg.hh, msg.mm);
                    pressEnter();
                    yield sleep(DELAY);
                }
            });
        }
        function loadLocalMsgSets() {
            if (!userUploadOptionGroup || userUploadOptionGroup.childElementCount > 0)
                return;
            const localMsgSetsString = localStorage.getItem(LOCAL_STORAGE_KEY);
            if (!localMsgSetsString)
                return;
            const localMsgSets = JSON.parse(localMsgSetsString);
            localMsgSets.map(loadMsgSetToDOM);
        }
        function handleAstFromTimeInputChange(e) {
            if (!selectedMsgSet)
                return;
            if (!isAMsgSetSelected())
                return;
            const tempFromTime = e.target.value.split(':');
            const fromHr = Number.parseInt(tempFromTime[0]);
            const fromMin = Number.parseInt(tempFromTime[1]);
            const tempMsgs = selectedMsgSet.msgs.filter(msg => (parseInt(`${msg.hh}`) > fromHr || (parseInt(`${msg.hh}`) === fromHr && parseInt(`${msg.mm}`) >= fromMin)));
            showPreviews(tempMsgs);
        }
        function handleSelectChange(e) {
            if (!e.target)
                return;
            hideAllErrors();
            hideAllWarnings();
            const tempTarget = e.target;
            if (tempTarget.value === 'upload_new_set')
                triggerUpload();
            else if (tempTarget.value === 'clear_user_sets')
                clearUserSets();
            else if (tempTarget.value === DEFAULT_OPTION_ID) {
                selectedMsgSetId = tempTarget.value;
                selectedMsgSet = null;
                removePreviews();
            }
            else {
                selectedMsgSetId = tempTarget.value;
                selectedMsgSet = getMsgSet(selectedMsgSetId);
                assignRowNoToMsgs(selectedMsgSet);
                showPreviews(selectedMsgSet.msgs);
            }
            if (fromInputTag && getAstFromTimeInputValue())
                fromInputTag.dispatchEvent(changeEvent);
        }
        function handleUploadChange(e) {
            return __awaiter(this, void 0, void 0, function* () {
                var _a;
                if (!fileInputErrorTag || !(e.target instanceof HTMLInputElement))
                    return;
                try {
                    hideMessage(fileInputErrorTag);
                    const file = (_a = e.target.files) === null || _a === void 0 ? void 0 : _a[0];
                    if (!file)
                        throw new Error('No files were selected');
                    if (file.type !== 'application/json')
                        throw new Error('Wrong type of file. \nAccepted file types: .json');
                    const fileContent = yield readFileAsText(file);
                    const msgs = JSON.parse(fileContent);
                    if (!msgsHasRequiredProperties(msgs))
                        throw new Error('Invalid message format');
                    const msgSet = createMsgSet(extractNameFromFile(file), msgs);
                    loadMsgSetToDOM(msgSet);
                    saveMsgSetsToLocalStorage();
                    selectMsgSet(msgSet.id);
                }
                catch (error) {
                    showMessage(fileInputErrorTag, `${error}`);
                    alert(error);
                    setPreviouslySelectedMsgSet();
                }
            });
        }
        function handleDeleteSet(e) {
            var _a;
            if (!fileInputErrorTag)
                return;
            e.preventDefault();
            hideMessage(fileInputErrorTag);
            try {
                if (!isAMsgSetSelected())
                    throw new Error('Select a message set first');
                if (!confirm(`This will delete the selected message set (${(_a = getMsgSet(selectedMsgSetId)) === null || _a === void 0 ? void 0 : _a.name}). Confirm delete?`))
                    return;
                const selectedMsgOptionTag = getSelectedMsgSetTag(selectedMsgSetId);
                removeFromMsgSets(selectedMsgSetId);
                saveMsgSetsToLocalStorage();
                selectMsgSet(DEFAULT_OPTION_ID);
                selectedMsgOptionTag === null || selectedMsgOptionTag === void 0 ? void 0 : selectedMsgOptionTag.remove();
            }
            catch (error) {
                showMessage(fileInputErrorTag, `${error}`);
            }
        }
        function handleConfirm(e) {
            return __awaiter(this, void 0, void 0, function* () {
                e.preventDefault();
                if (!fileInputErrorTag)
                    return;
                if (!selectedMsgSet) {
                    showMessage(fileInputErrorTag, 'Error: Select a message set first');
                    return;
                }
                const previewMsgs = previewDataToJson();
                if (!validateData(previewMsgs))
                    return;
                yield sleep(1);
                const msgsToBeSent = [...previewMsgs].filter(isMsgNotOlderThanCurrentTime);
                if (!confirm(`Confirm scheduling ${msgsToBeSent.length} messages from ${getAstFromTimeInputValue() || '00:00 (12AM)'}? \nPress ALT+X to stop at anytime.`))
                    return;
                hideAstPopup();
                scheduleMsgs(msgsToBeSent);
            });
        }
        function haltExecution(e) {
            if (e.altKey && e.key === 'x') {
                continueExecutionFlag = false;
                e.stopPropagation();
                e.preventDefault();
            }
        }
        function handlePreviewEdit() {
            const tempPreviewMsgs = previewDataToJson();
            validateData(tempPreviewMsgs);
        }
        if (!getTeleActiveChatElement()) {
            alert('Open a telegram chat first!');
            return;
        }
        if (!isTeleScheduleChatSectionOpen()) {
            alert('Open the schedule messages section of this chat first!');
            return;
        }
        let firstRun = false;
        if (!getAstPopup()) {
            firstRun = true;
            loadAstPopupIntoDom();
            yield sleep(1);
        }
        const changeEvent = new Event('change');
        const pressEnterEvent = new KeyboardEvent('keydown', { key: 'Enter' });
        const pressEscapeEvent = new KeyboardEvent('keydown', { key: 'Escape' });
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
        if (!firstRun) {
            firstRun = false;
            showAstPopup();
            return;
        }
        const LOCAL_STORAGE_KEY = 'astMessageSets';
        const DEFAULT_OPTION_ID = 'This_value_is_for_this_SelectAnOption_Option_TryingToMakeThisUnique';
        const DELAY = 500;
        const msgSets = [];
        let selectedMsgSetId = DEFAULT_OPTION_ID;
        let selectedMsgSet = null;
        let continueExecutionFlag = true;
        if (selectTag) {
            selectTag.value = selectedMsgSetId;
            selectTag.onchange = handleSelectChange;
        }
        if (closeButton)
            closeButton.onclick = hideAstPopup;
        if (fromInputTag)
            fromInputTag.onchange = handleAstFromTimeInputChange;
        if (uploadTag)
            uploadTag.onchange = handleUploadChange;
        if (deleteSetButton)
            deleteSetButton.onclick = handleDeleteSet;
        if (confirmButton)
            confirmButton.onclick = handleConfirm;
        loadLocalMsgSets();
        showAstPopup();
    });
}
main();

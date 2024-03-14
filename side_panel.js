import { getDeck, getDeckList, createDeck, deleteDeck} from "./Storage.js";


/**
 * Sets the empty status message for the deck.
 * @param {boolean} display - Whether to display the empty status message.
 */

function setEmptyStatus(display){
    const emptyContainer = document.getElementById('empty-deck');
    if(display){
        emptyContainer.textContent = "Deck is empty"
        emptyContainer.style.display = 'block';
    }else{
        emptyContainer.style.display = 'none';
    }
}

/**
 * Updates the current deck in the background script.
 * @param {string} deck - The name of the deck to update to.
 */
async function updateCurrentDeck(deck){
    await chrome.runtime.sendMessage({ action: 'deckChange', newDeck : deck });
}


/**
 * Removes a selection option from the deck list.
 * @param {string} option - The deck name option to remove from the deck list displayed in the HTML.
 */
function removeSelectionOption(option){
    let select = document.getElementById("deck-list");
    let selectOption = select.options[select.selectedIndex].value
    if(selectOption === option){
        select.removeChild(select.options[select.selectedIndex]);
    }
}

/**
 * Gets the currently selected deck from the deck list.
 * @returns {string} The name of the currently selected deck.
 */
function getCurrentDeck(){
    let select = document.getElementById("deck-list");
    let selectOption = select.options[select.selectedIndex].value
    return selectOption
}

/**
 * Deletes a deck from the storage and updates the UI accordingly.
 * @param {string} deckName - The name of the deck to delete.
 */
function deleteDeckHTML(deckName){
    deleteDeck(deckName, result => {
        if(result.status === true){
            let sidePanelContent = document.getElementById("sidePanelContent");
            sidePanelContent.innerHTML = "";
            removeSelectionOption(deckName);
            toast(result.message);
        }else{
            toast(result.message);
        }
    })
}

/**
 * Displays a toast message on the screen.
 * @param {string} message - The message to display in the toast.
 */
function toast(message){
    const toastContainer = document.getElementById('toast-container');
    toastContainer.textContent = message
    toastContainer.style.display = 'block';
    setTimeout(() => {
        toastContainer.style.display = 'none';
    }, 3000);
}

/**
 * Creates a new deck in the storage and updates the UI accordingly.
 */
function createDeckHtml(){
    const deckName = document.getElementById("deck-name-input").value;
    if(deckName){
        createDeck(deckName, (result) => {
            if(result.status === true){
                updateDeckList(deckName);
                toast(result.message);
            }else {
                toast(result.message)
            }
        });
    }else{
        toast("Please enter a deck name");
    }
}

/**
 * Gets the list of decks from the storage and updates the deck list UI.
 */
function getCurrentDeckList(){
    var list = document.getElementById("deck-list");
    var option = document.createElement('option');
    getDeckList(result => {
        console.log(result);
        if(result){
            result.forEach((deck) => {
                var option = document.createElement('option');
                option.value = deck;
                option.innerText = deck;
                list.appendChild(option);
            })
        }
    })
}

/**
 * Updates the deck list UI with a new deck.
 * @param {string} deckName - The name of the deck to add to the list.
 */
function updateDeckList(deckName){
    var list = document.getElementById("deck-list");
    var option = document.createElement('option');
    option.value = deckName;
    option.innerText = deckName;
    list.appendChild(option);
    if(list){
        list.appendChild(option)
    }
}


/**
 * Creates a new card div element based on the card data.
 * @param {Object} card - The card object containing front and back properties.
 * @returns {HTMLElement} The created card div element.
 */
function createCardDiv(card) {
    // Create a new div element
    var cardDiv = document.createElement('div');
    cardDiv.classList.add('flashcard');
    
    // Create elements for the front and back of the flashcard
    var front = document.createElement('div');
    front.classList.add('front');
    front.textContent = card.Front;

    var back = document.createElement('div');
    back.classList.add('back');
    back.textContent = card.Back;

    // Append the front and back elements to the card div
    cardDiv.appendChild(front);
    cardDiv.appendChild(back);

    return cardDiv;
}


/**
 * Formats the card data into a string for download.
 * @param {Array<Object>} CardData - An array of card objects containing front and back properties.
 * @returns {string} The formatted card data string.
 */
function formatCardData(CardData){
    let outString = "";
    CardData.forEach((card) => {
        outString += card.Front + "\t" + card.Back + "\n";
    })

    return outString;
}

/**
 * Handles the download of a deck as a text file.
 */
function handleDownload(){
    const deckName = getCurrentDeck();

    if(deckName){
        getDeck(deckName, (result) => {
            if(result.length > 0){
                let data = formatCardData(result);
                const blob = new Blob([data], {type: 'text/plain'});
                chrome.downloads.download({
                    url : URL.createObjectURL(blob),
                    filename: deckName + ".txt",
                    saveAs: true
                })
            }else{
                toast("Deck is empty");
            }
        })
    }
}


document.addEventListener('DOMContentLoaded', function() {

    getCurrentDeckList();
    const createDeckDialog = document.getElementById('create-deck-dialog');
    const showDialogButton = document.getElementById('show-dialog');

    showDialogButton.addEventListener('click', (event) => {
        createDeckDialog.showModal();
    });

    createDeckDialog.addEventListener('close', () => {
        createDeckDialog.querySelector('form').reset();
    });

    createDeckDialog.addEventListener('submit', (event) => {
        event.preventDefault();
        const deckName = event.target.elements['deck-name'].value;
        createDeckHtml(deckName);
        createDeckDialog.close();
    });

    document.addEventListener('click', event => {
        if(event.target.id === "create-deck"){
            createDeckHtml()
        }else if(event.target.id === "delete-deck"){
            let currSelect = document.getElementById("deck-list")
            let option = currSelect.options[currSelect.selectedIndex].value
            deleteDeckHTML(option);
        }else if(event.target.id === "download-deck"){
            handleDownload();
        }
    })
    document.addEventListener('change', event => {
        let target = event.target.id;
        if(target === "deck-list"){
            let select = event.target;
            let deckName = select.options[select.selectedIndex].value
            updateCurrentDeck(deckName);
            getDeck(deckName, (deck) => {
                sidePanelContent.innerHTML = "";
                if(deck.length == 0 || !deckName){
                    setEmptyStatus(true);
                }else{
                    setEmptyStatus(false);
                    deck.forEach((card) => {
                        var cardDiv = createCardDiv(card);
                        sidePanelContent.appendChild(cardDiv);
                    });
                }
            });
        }
    })

    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
        if (message.action === 'cardAdded') {
            setEmptyStatus(false);
            var cardDiv = createCardDiv(message.card);
            sidePanelContent.appendChild(cardDiv);
        }
    })
})














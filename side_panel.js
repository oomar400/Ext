import { getDeck, getDeckList, createDeck, deleteDeck} from "./Storage.js";

function setEmptyStatus(display){
    const emptyContainer = document.getElementById('empty-deck');
    if(display){
        emptyContainer.textContent = "Deck is empty"
        emptyContainer.style.display = 'block';
    }else{
        emptyContainer.style.display = 'none';
    }
}

async function updateCurrentDeck(deck){
    await chrome.runtime.sendMessage({ action: 'deckChange', newDeck : deck });
}

function removeSelectionOption(option){
    let select = document.getElementById("deck-list");
    let selectOption = select.options[select.selectedIndex].value
    if(selectOption === option){
        select.removeChild(select.options[select.selectedIndex]);
    }
}

function getCurrentDeck(){
    let select = document.getElementById("deck-list");
    let selectOption = select.options[select.selectedIndex].value
    return selectOption
}
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
function toast(message){
    const toastContainer = document.getElementById('toast-container');
    toastContainer.textContent = message
    toastContainer.style.display = 'block';
    setTimeout(() => {
        toastContainer.style.display = 'none';
    }, 3000);
}
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

function formatCardData(CardData){
    let outString = "";
    CardData.forEach((card) => {
        outString += card.Front + "\t" + card.Back + "\n";
    })

    return outString;
}

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
        if (message.action === 'reloadPanel') {
            setEmptyStatus(false);
            var cardDiv = createCardDiv(message.card);
            sidePanelContent.appendChild(cardDiv);
        }
    })
})














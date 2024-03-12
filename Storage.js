export function saveCard(Card){
    chrome.storage.local.get("flashcards", function (result) {
        let flashcards = result.flashcards || {}
        let deck = flashcards[Card.Deck] || []
        deck.push(Card)
        flashcards[Card.Deck] = deck
        chrome.storage.local.set({ flashcards })
    })
}


export function getCard(Deck){
    chrome.storage.local.get("flashcards", function (result){
        if(!result.flashcards){
            return []
        }
        return flashcards[Deck] || []
    })
}


export function getDeckList(callback){
    chrome.storage.local.get("flashcards", result => {
        let flashcard = result.flashcards || {}
        if(flashcard){
            callback(Object.keys(flashcard));
        } else {
            callback({});
        }
    })
}


export function getDeck(deckName, callback) {
    
    chrome.storage.local.get("flashcards", (result) => {
        let flashcards = result.flashcards || {};
        let deck = flashcards[deckName] || [];
        callback(deck);
    });
}

export function createDeck(deckName, callback){
    chrome.storage.local.get("flashcards", (result) => {
        let flashcards = result.flashcards || {};
        if(!flashcards[deckName]){
            flashcards[deckName] = [];
            chrome.storage.local.set({ flashcards });
            callback({status : true, message : deckName + " Created!"})
        }else{
            callback({status : false, message : deckName + " Already exists"});
        }
    })
}
export function deleteDeck(deckName, callback){
    chrome.storage.local.get("flashcards", (result) => {
        let flashcards = result.flashcards || {};
        if(!flashcards){
            callback("No Decks");
        }else{
            if(!flashcards[deckName]){
                callback({status : false, message : deckName + " Does not exist"});
            }else{
                delete flashcards[deckName];
                chrome.storage.local.set({ flashcards }, () => {
                    callback({status : true, message : deckName + " Deleted"});
                });
            }
        }
    });
}

import { Card } from "./Card.js";
import { saveCard, getDeck } from "./Storage.js";

let currentCard = new Card(null, null, null);
let currDeck = null;

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'deckChange') {
    currDeck = message.newDeck
  }
})

chrome.contextMenus.removeAll(() => {
  chrome.contextMenus.create({
    id: "addFront",
    title: "Add as Flashcard Front",
    contexts: ["selection"]
  });
  chrome.contextMenus.create({
    id: "addBack",
    title: "Add as Flashcard Back",
    contexts: ["selection"]
  });
})


chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  if (info.menuItemId === "addFront") {
      currentCard.Front = info.selectionText;
  } else if (info.menuItemId === "addBack" && currentCard.Front != null) {
      currentCard.Deck = currDeck;
      currentCard.Back = info.selectionText;
      await chrome.runtime.sendMessage({ action: 'cardAdded', card : currentCard });
      createFlashcard(currentCard);
  }
});

function createFlashcard(card) {
  if (card.Back !== null && card.Front !== null) {
    saveCard(card);
    currentCard = new Card(null, null, null);
  }
}

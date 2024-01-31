// content.js

function extractJobDescription() {
  // const keywords = ['job description', 'job requirements', 'other keyword'];

  // const allElements = document.querySelectorAll('p, div, span, li, td, ...');

  // for (const element of allElements) {
  //   const elementText = element.textContent.toLowerCase();

  //   if (keywords.some(keyword => elementText.includes(keyword))) {
  //     return elementText.trim();
  //   }
  // }

  return 'Job description not found';
}

chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
  if (message.action === 'extractJobDescription') {
    const jobDescription = extractJobDescription();

    sendResponse({ jobDescription });
  }
});

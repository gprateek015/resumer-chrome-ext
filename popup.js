document.addEventListener('DOMContentLoaded', function () {
  // Request the job description from the background script
  chrome.runtime.sendMessage({ action: 'getJobDescription' });
});

// Handle the message when the job description is updated
chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
  if (message.action === 'jobDescriptionUpdated') {
    const jobDescriptionInput = document.getElementById('job-description');
    jobDescriptionInput.value = message.job_description;
  }
});

// function extractJobDescription() {
//   // Define keywords that might indicate the presence of job description
//   const keywords = ['job description', 'job requirements', 'other keyword'];

//   // Loop through elements and check for keywords in text content
//   const allElements = document.querySelectorAll('p'); // Add more element types as needed

//   for (const element of allElements) {
//     const elementText = element.textContent.toLowerCase();

//     // Check if any of the keywords is present in the text content
//     // if (keywords.some(keyword => elementText.includes(keyword))) {
//     return elementText.trim();
//     // }
//   }

//   // If job description is not found, return an indication
//   return allElements.length;
// }

// document.addEventListener('DOMContentLoaded', () => {
//   const jobDescriptionInput = document.getElementById('job-description');

//   jobDescriptionInput.value = extractJobDescription();
// });

document.getElementById('download-button').addEventListener('click', () => {
  const jobDescriptionInput = document.getElementById('job-description');
  chrome.runtime.sendMessage({
    action: 'downloadPDF',
    job_description: jobDescriptionInput.value
  });
});

document.getElementById('signup-button').addEventListener('click', () => {
  window.location = 'localhost:3000';
});

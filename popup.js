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

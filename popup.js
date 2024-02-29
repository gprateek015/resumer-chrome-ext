document
  .getElementById('download-button')
  .addEventListener('click', async () => {
    const jobDescriptionInput = document.getElementById('job-description');

    document.getElementById('download-button').innerText = 'Processing...';
    const resp = await chrome.runtime.sendMessage({
      method: 'downloadPDF',
      job_description: jobDescriptionInput.value
    });
    if (resp?.success) {
      document.getElementById('download-button').innerText = 'Download';
    }
  });

document.addEventListener('DOMContentLoaded', function () {
  chrome.runtime.sendMessage({ method: 'clear' }, () => {
    chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
      chrome.scripting.executeScript(
        {
          target: { tabId: tabs[0].id },
          function: getDocumentInfo
        },
        result => {
          if (chrome.runtime.lastError) {
            document.getElementById('job-description').value =
              'Error: ' + chrome.runtime.lastError.message;
          } else {
            chrome.runtime.sendMessage({ method: 'get' }, response => {
              document.getElementById('job-description').value = response.value;
            });
          }
        }
      );
    });
  });
});

function getDocumentInfo() {
  let elements;
  let host = window.location.host;

  // Check the host to determine the appropriate class name
  if (host.includes('linkedin')) {
    elements = document.getElementsByClassName(
      'jobs-search__job-details--wrapper'
    );
  } else if (host.includes('glassdoor')) {
    elements = document.getElementsByClassName(
      'JobDetails_jobDescriptionWrapper__BTDTA'
    );
  } else {
    // Handle other hosts or provide a default class name
    elements = document.getElementsByClassName('default-class-name');
  }

  let plainTextContents = [];

  for (let i = 0; i < elements.length; i++) {
    let plainTextContent = elements[i].innerText || elements[i].textContent;
    plainTextContents.push(plainTextContent.trim());
  }

  chrome.runtime.sendMessage(
    { method: 'set', value: plainTextContents },
    msg => {
      console.log(msg);
    }
  );
}

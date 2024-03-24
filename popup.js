const disableBtns = () => {
  const btn = document.getElementById('download-button');
  const btn2 = document.getElementById('customize-button');
  btn.setAttribute('disabled', true);
  btn2.setAttribute('disabled', true);
};
const enableBtns = () => {
  const btn = document.getElementById('download-button');
  const btn2 = document.getElementById('customize-button');
  btn.removeAttribute('disabled');
  btn2.removeAttribute('disabled');
};

document
  .getElementById('download-button')
  .addEventListener('click', async () => {
    const jobDescriptionInput = document.getElementById('job-description');

    document.getElementById('download-button').innerText = 'Downloading...';
    chrome.runtime.sendMessage({
      method: 'downloadPDF',
      job_description: jobDescriptionInput.value
    });
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
              'Error: Cannot find job description in this page.';
            disableBtns();
          } else {
            chrome.runtime.sendMessage({ method: 'get' }, response => {
              if (!response.value || response.value === 'NA') {
                document.getElementById('job-description').value =
                  'No job description found...';
                disableBtns();
              } else {
                document.getElementById('job-description').value =
                  response.value;
              }
            });
          }
        }
      );
    });
  });
});

document.getElementById('job-description').addEventListener('input', e => {
  if (!!e.target.value) {
    enableBtns();
  } else {
    disableBtns();
  }
});

document.getElementById('signup-button').addEventListener('click', () => {
  window.open('https://resumer.cloud');
});

document.getElementById('customize-button').addEventListener('click', () => {
  const jobDescription = document.getElementById('job-description').value;
  window.open(
    `https://resumer.cloud/job-description?jd=${encodeURI(jobDescription)}`
  );
});

function getDocumentInfo() {
  let elements;
  let host = window.location.host;
  let platform = '';
  // Check the host to determine the appropriate class name
  if (host.includes('linkedin')) {
    elements = document.getElementsByClassName(
      'jobs-search__job-details--wrapper'
    );
    platform = 'linkedin';
  } else if (host.includes('glassdoor')) {
    elements = document.getElementsByClassName(
      'JobDetails_jobDescription__uW_fK'
    );
    platform = 'glassdoor';
  } else {
    // Handle other hosts or provide a default class name
    elements = document.getElementsByTagName('body');
    platform = 'other';
  }

  let plainTextContents = [];

  for (let i = 0; i < elements.length; i++) {
    let plainTextContent = elements[i].innerText || elements[i].textContent;
    plainTextContent = plainTextContent.replace(/\n+/g, '\n');
    plainTextContents.push(plainTextContent.trim());
  }

  chrome.runtime.sendMessage(
    { method: 'set', value: plainTextContents, platform },
    msg => {
      console.log(msg);
    }
  );
}

chrome.runtime.onMessage.addListener(async (message, sender, sendResponse) => {
  if (message.status === 'error' && message.error === 'unauthorized') {
    window.open('https://resumer.cloud');
  } else if (message.status === 'success') {
    document.getElementById('download-button').innerText = 'Download';
  }
});

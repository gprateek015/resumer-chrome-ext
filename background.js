const fetchResumeData = async ({ job_description }) => {
  const getResumeDataApiUrl =
    'http://localhost:8000/resume/data-new?rewrite=false';
  const resp = await fetch(getResumeDataApiUrl, {
    method: 'POST',
    headers: {
      authorization:
        'eyJhbGciOiJIUzI1NiJ9.NjUwYmZkMGU5MDE1ZmI4MzQ4OTFkZDdm.qgRxfHTLdhJCamd950gQJA4-jHUjs4XlUmEQ8bg4k-Q',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ job_description })
  });
  if (!resp.ok) throw new Error('Cannot fetch resume data');
  return resp.json();
};

const fetchPdfArray = async ({ resumeData }) => {
  const apiUrl = 'http://localhost:8000/resume/engineering/0/load';
  const response = await fetch(apiUrl, {
    method: 'POST',
    body: JSON.stringify(resumeData),
    headers: {
      authorization:
        'eyJhbGciOiJIUzI1NiJ9.NjUwYmZkMGU5MDE1ZmI4MzQ4OTFkZDdm.qgRxfHTLdhJCamd950gQJA4-jHUjs4XlUmEQ8bg4k-Q',
      'Content-Type': 'application/json'
    }
  });
  if (!response.ok) {
    throw new Error('Network response was not ok');
  }
  return response.arrayBuffer();
};

chrome.runtime.onMessage.addListener(async (message, sender, sendResponse) => {
  try {
    if (message.action === 'downloadPDF') {
      const { job_description } = message;

      const resumeData = await fetchResumeData({ job_description });

      const pdfArrayBuffer = await fetchPdfArray({ resumeData });

      const pdfBlob = new Blob([pdfArrayBuffer], {
        type: 'application/pdf'
      });
      const url = URL.createObjectURL(pdfBlob);

      chrome.downloads.download({
        url: url,
        filename: 'Resume.pdf'
      });
    } else if (message.action === 'getJobDescription') {
      console.log('message', message);

      // Request job description from content script
      chrome.tabs.query({ active: true, currentWindow: true })
      .then((tabs) => {
        const activeTab = tabs[0];
        return chrome.scripting.executeScript({
          target: { tabId: activeTab.id },
          function: () => {
            const jobDescription = document.querySelector('#job-description').innerText;
            return { jobDescription };
          }
        });
      })
      .then((results) => {
        const response = results[0].result;
        console.log('response', response);
        // Send the job description to the popup
        chrome.runtime.sendMessage({
          action: 'jobDescriptionUpdated',
          job_description: response.jobDescription
        });
      })
      .catch((error) => {
        console.error('Error:', error);
      });
    }
  } catch (err) {
    console.error(err);
  }
});

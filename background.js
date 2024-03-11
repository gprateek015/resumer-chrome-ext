// const API_URL = 'https://api.resumer.cloud';
const API_URL = 'http://localhost:8000';

const fetchResumeData = async ({ job_description }) => {
  const getResumeDataApiUrl = `${API_URL}/resume/data-new?rewrite=${!!job_description?.length}`;
  const resp = await fetch(getResumeDataApiUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ job_description })
  });
  if (!resp.ok) throw new Error('Cannot fetch resume data');
  return resp.json();
};

const fetchPdfArray = async ({ resumeData }) => {
  const apiUrl = `${API_URL}/resume/engineering/0/load`;

  const data = {
    ...resumeData,
    technical_skills: resumeData.technical_skills?.map(skill => skill.name),
    core_subjects: resumeData.core_subjects?.map(skill => skill.name),
    dev_tools: resumeData.dev_tools?.map(skill => skill.name),
    languages: resumeData.languages?.map(skill => skill.name)
  };

  const response = await fetch(apiUrl, {
    method: 'POST',
    body: JSON.stringify(data),
    headers: {
      'Content-Type': 'application/json'
    }
  });
  if (!response.ok) {
    throw new Error('Network response was not ok');
  }
  return response.arrayBuffer();
};

let value = '';

chrome.runtime.onMessage.addListener(async (message, sender, sendResponse) => {
  try {
    if (message.method === 'downloadPDF') {
      const { job_description } = message;

      const resumeData = await fetchResumeData({ job_description });

      const pdfArrayBuffer = await fetchPdfArray({ resumeData });

      const blob = new Blob([pdfArrayBuffer], {
        type: 'application/pdf'
      });

      // use BlobReader object to read Blob data
      const reader = new FileReader();
      reader.onload = () => {
        const buffer = reader.result;
        const blobUrl = `data:${blob.type};base64,${btoa(
          new Uint8Array(buffer).reduce(
            (data, byte) => data + String.fromCharCode(byte),
            ''
          )
        )}`;
        chrome.downloads.download(
          {
            url: blobUrl,
            filename: 'Resume.pdf',
            // saveAs: true,
            conflictAction: 'uniquify'
          },
          () => {
            sendResponse({ success: true });
          }
        );
      };
      reader.readAsArrayBuffer(blob);
    } else {
      console.log(message);
      switch (message.method) {
        case 'set':
          value = trimJobDescription(message.value[0], message.platform);
          console.log(value);
          sendResponse({ value: null });
          break;
        case 'get':
          sendAfterSet();
          break;
        case 'clear':
          value = '';
          sendResponse({ value: null });
          break;
      }
      return true;

      async function sendAfterSet() {
        for (let i = 0; i < 10; i++) {
          if (value != '') {
            sendResponse({ value: value });
            return;
          }
          console.log('Start Sleep 1s.');
          await new Promise(s => setTimeout(s, 1000));
          console.log('End Sleep 1s.');
        }
        value = 'Error: Document information could not be obtained.';
      }

      function trimJobDescription(value, platform) {
        value = value.replace(/\n\n/g, '\n');
        if (platform === 'linkedin') {
          let resp = value.slice(value.indexOf('About the job'));
          const regexPattern = /match your profile/;
          // const regexPattern =
          //   /Qualifications\s+(\d+)\s+of\s+(\d+)\s+skills\s+match\s+your\s+profile/;
          const match = resp.match(regexPattern);
          if (match) {
            // Get the starting position of the match
            const matchIndex = match.index;

            // Slice the string until the starting position of the match
            const slicedString = resp.slice(0, matchIndex);

            return slicedString;
          } else {
            return resp;
          }
        } else {
          return value;
        }
      }
    }
  } catch (err) {
    console.error(err);
  }
});

interface JobData {
  jobTitle: string;
  hiringManager: string;
  status: 'open' | 'closed' | 'draft';
  closingDate: string;
}

export const generateInterviewPack = async (jobId: string): Promise<{ interviewPackUrl: string }> => {
  try {
    console.log('Calling interview pack webhook with jobId:', jobId);
    console.log('Webhook URL: https://wotai-client.sandintheface.com/webhook/generate-interview-pack');

    const response = await fetch('https://wotai-client.sandintheface.com/webhook/generate-interview-pack', {
      method: 'POST',
      headers: {
        'hr_api': 'thisisfun1',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ jobId }),
    });

    console.log('Interview pack webhook response status:', response.status, response.statusText);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Interview pack webhook request failed:', {
        status: response.status,
        statusText: response.statusText,
        headers: Object.fromEntries(response.headers.entries()),
        body: errorText
      });
      throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
    }

    const responseData = await response.json();
    console.log('Interview pack webhook response data:', responseData);
    return responseData;
  } catch (error: any) {
    console.error('Error generating interview pack:', error);
    if (error.name === 'TypeError' && error.message === 'Failed to fetch') {
      throw new Error('Unable to reach the server. Please check if the webhook endpoint is configured and CORS is enabled.');
    }
    throw error;
  }
};

export const sendShortlistEmail = async (jobId: string): Promise<any> => {
  try {
    console.log('Calling shortlist email webhook with jobId:', jobId);
    console.log('Webhook URL: https://wotai-client.sandintheface.com/webhook/send-shortlist-email');

    const response = await fetch('https://wotai-client.sandintheface.com/webhook/send-shortlist-email', {
      method: 'POST',
      headers: {
        'hr_api': 'thisisfun1',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ jobId }),
    });

    console.log('Shortlist email webhook response status:', response.status, response.statusText);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Shortlist email webhook request failed:', {
        status: response.status,
        statusText: response.statusText,
        headers: Object.fromEntries(response.headers.entries()),
        body: errorText
      });
      throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
    }

    // Try to parse JSON, but handle empty responses
    const responseText = await response.text();
    console.log('Shortlist email webhook response text:', responseText);

    let responseData;
    if (responseText) {
      try {
        responseData = JSON.parse(responseText);
      } catch (e) {
        console.log('Response is not JSON, treating as success');
        responseData = { message: 'Success' };
      }
    } else {
      console.log('Empty response, treating as success');
      responseData = { message: 'Success' };
    }

    console.log('Shortlist email webhook response data:', responseData);
    return responseData;
  } catch (error: any) {
    console.error('Error sending shortlist email:', error);
    if (error.name === 'TypeError' && error.message === 'Failed to fetch') {
      throw new Error('Unable to reach the server. Please check if the webhook endpoint is configured and CORS is enabled.');
    }
    throw error;
  }
};

export const sendJobToN8N = async (jobData: JobData, jobDescription: File): Promise<any> => {
  const formData = new FormData();

  // Add job details as JSON string
  formData.append('jobDetails', JSON.stringify(jobData));

  // Add job description file
  formData.append('jobDescription', jobDescription);

  try {
    const response = await fetch('https://wotai-client.sandintheface.com/webhook/job-creation', {
      method: 'POST',
      headers: {
        'hr_api': 'thisisfun1',
      },
      body: formData,
    });

    console.log('Webhook response status:', response.status, response.statusText);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Webhook request failed:', {
        status: response.status,
        statusText: response.statusText,
        headers: Object.fromEntries(response.headers.entries()),
        body: errorText
      });
      throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
    }

    const responseData = await response.json();
    console.log('Webhook response data:', responseData);
    return responseData;
  } catch (error) {
    console.error('Error sending job to n8n:', error);
    throw error;
  }
};
interface JobData {
  jobTitle: string;
  hiringManager: string;
  status: 'open' | 'closed' | 'draft';
  closingDate: string;
}

export const sendJobToN8N = async (jobData: JobData, jobDescription: File): Promise<any> => {
  const formData = new FormData();

  // Add job details as JSON string
  formData.append('jobDetails', JSON.stringify(jobData));

  // Add job description file
  formData.append('jobDescription', jobDescription);

  try {
    const response = await fetch('https://wotai-client.sandintheface.com/webhook-test/job-creation', {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error sending job to n8n:', error);
    throw error;
  }
};
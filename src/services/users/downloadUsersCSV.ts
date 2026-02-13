import { userService } from './userService';

/**
 * Utility function to export users to CSV and trigger download
 */
export const downloadUsersCSV = async (): Promise<void> => {
  try {
    // Get the CSV blob from the API
    const blob = await userService.exportCsv();
    
    // Create a temporary URL for the blob
    const url = window.URL.createObjectURL(blob);
    
    // Create a temporary anchor element to trigger download
    const link = document.createElement('a');
    link.href = url;
    link.download = `users-export-${new Date().toISOString().split('T')[0]}.csv`;
    
    // Append to body, click, and remove
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    // Clean up the URL
    window.URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Error downloading CSV:', error);
    // Error is already handled and toasted in the service
  }
};

export default downloadUsersCSV;
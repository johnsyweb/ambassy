import { handleFileUpload } from './uploadCSV';

document.getElementById('uploadButton')?.addEventListener('click', () => {
  const input = document.getElementById('csvFileInput') as HTMLInputElement;
  if (input && input.files && input.files.length > 0) {
    const file = input.files[0];
    handleFileUpload(file);
  } else {
    alert('Please select a CSV file to upload.');
  }
});
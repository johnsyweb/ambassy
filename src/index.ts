import { handleFileUpload } from './uploadCSV';

const csvFileInput = document.getElementById('csvFileInput');
const uploadButton = document.getElementById('uploadButton');

csvFileInput?.addEventListener('change', handleFileUpload);

uploadButton?.addEventListener('click', () => {
  csvFileInput?.dispatchEvent(new Event('change'));
});

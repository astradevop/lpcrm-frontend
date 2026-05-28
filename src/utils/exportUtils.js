import html2pdf from 'html2pdf.js';
import jsPDF from 'jspdf';

/**
 * Downloads data as a CSV file.
 * @param {Array<Object>} data - Array of objects representing the rows.
 * @param {string} filename - The name of the downloaded file.
 */
export const downloadCSV = (data, filename = 'export.csv') => {
  if (!data || !data.length) return;

  // Extract headers
  const headers = Object.keys(data[0]);
  
  // Format rows
  const csvRows = [];
  csvRows.push(headers.join(',')); // Add header row

  for (const row of data) {
    const values = headers.map(header => {
      const val = row[header];
      // Escape commas and quotes
      const escaped = ('' + (val ?? '')).replace(/"/g, '""');
      return `"${escaped}"`;
    });
    csvRows.push(values.join(','));
  }

  const csvString = csvRows.join('\n');
  const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
  
  const link = document.createElement('a');
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
};

/**
 * Downloads a DOM element as a PDF using html2pdf.
 * @param {HTMLElement} element - The DOM element to convert to PDF.
 * @param {string} filename - The name of the downloaded file.
 */
export const downloadPDF = (element, filename = 'export.pdf') => {
  if (!element) return;
  
  const opt = {
    margin:       0.5,
    filename:     filename,
    image:        { type: 'jpeg', quality: 0.98 },
    html2canvas:  { scale: 2, useCORS: true },
    jsPDF:        { unit: 'in', format: 'letter', orientation: 'landscape' }
  };

  html2pdf().set(opt).from(element).save();
};

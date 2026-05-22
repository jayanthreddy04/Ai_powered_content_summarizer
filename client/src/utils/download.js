import { jsPDF } from 'jspdf';

export const downloadAsTxt = (content, filename = 'summary.txt') => {
  const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
};

export const downloadAsPdf = (content, title = 'Summary', filename = 'summary.pdf') => {
  const doc = new jsPDF();
  const margin = 15;
  const pageWidth = doc.internal.pageSize.getWidth();
  const maxWidth = pageWidth - margin * 2;

  doc.setFontSize(16);
  doc.text(title, margin, 20);

  doc.setFontSize(11);
  const lines = doc.splitTextToSize(content, maxWidth);
  doc.text(lines, margin, 32);

  doc.save(filename);
};

export const copyToClipboard = async (text) => {
  await navigator.clipboard.writeText(text);
};

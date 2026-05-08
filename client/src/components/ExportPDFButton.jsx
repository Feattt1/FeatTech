import React, { useState } from 'react';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

export default function ExportPDFButton({ targetId, fileName = 'torneo_bracket.pdf', label = 'Exportar PDF' }) {
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async () => {
    const input = document.getElementById(targetId);
    if (!input) return;

    setIsExporting(true);
    try {
      // Configuramos para capturar a alta resolución (scale: 2) y con fondo oscuro para el diseño premium
      const canvas = await html2canvas(input, {
        scale: 2,
        backgroundColor: '#020617', // slate-950
        useCORS: true, // Por si hay imágenes externas
      });

      const imgData = canvas.toDataURL('image/png');
      
      // Calculamos dimensiones para PDF A4 apaisado (landscape)
      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: 'a4',
      });

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      
      // Ajustamos la imagen al ancho manteniendo el ratio
      const imgProps = pdf.getImageProperties(imgData);
      const imgWidth = pdfWidth;
      const imgHeight = (imgProps.height * pdfWidth) / imgProps.width;

      pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
      pdf.save(fileName);
    } catch (error) {
      console.error('Error al exportar a PDF:', error);
      alert('Hubo un error al exportar el PDF. Inténtalo de nuevo.');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <button
      onClick={handleExport}
      disabled={isExporting}
      className={`inline-flex items-center gap-2 px-3 py-1.5 text-xs font-semibold rounded-md border transition-all duration-300 shadow-glass
        ${isExporting 
          ? 'bg-slate-800 text-slate-400 border-slate-700 cursor-not-allowed' 
          : 'bg-padel/10 text-padel border-padel/30 hover:bg-padel hover:text-slate-950 hover:shadow-neon'
        }`}
    >
      {isExporting ? (
        <>
          <svg className="animate-spin h-3 w-3" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Exportando...
        </>
      ) : (
        <>
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          {label}
        </>
      )}
    </button>
  );
}

import React from 'react';
import * as XLSX from 'xlsx';

export default function ExportExcelButton({ data, tableId, fileName = 'datos.xlsx', sheetName = 'Datos', label = 'Exportar Excel' }) {
  const handleExport = () => {
    let wb = XLSX.utils.book_new();
    let ws;

    try {
      if (tableId) {
        // Exportar directamente desde un elemento <table> en el DOM
        const table = document.getElementById(tableId);
        if (!table) {
          alert('No se encontró la tabla para exportar.');
          return;
        }
        ws = XLSX.utils.table_to_sheet(table);
      } else if (data && data.length > 0) {
        // Exportar desde un array de objetos JSON
        ws = XLSX.utils.json_to_sheet(data);
      } else {
        alert('No hay datos para exportar.');
        return;
      }

      XLSX.utils.book_append_sheet(wb, ws, sheetName);
      XLSX.writeFile(wb, fileName);
    } catch (error) {
      console.error('Error exportando Excel:', error);
      alert('Hubo un error al generar el archivo Excel.');
    }
  };

  return (
    <button
      onClick={handleExport}
      className="inline-flex items-center gap-2 px-3 py-1.5 text-xs font-semibold rounded-md border transition-all duration-300 shadow-glass bg-emerald-500/10 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500 hover:text-white hover:shadow-[0_0_15px_rgba(16,185,129,0.5)]"
    >
      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
      {label}
    </button>
  );
}

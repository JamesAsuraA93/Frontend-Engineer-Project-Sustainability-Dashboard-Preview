import { useState, useEffect } from "react";
import FileUploader from "../components/FileUploader";
import DataTable from "../components/DataTable";
import ChartView from "../components/ChartView";
import { Parser } from "json2csv";
import * as Papa from "papaparse";

export default function Home() {
  const [csvFilePath, setCsvFilePath] = useState<string>("/2017PurchasePricesDec.csv");
  const [dark, setDark] = useState(false);
  const [csvError, setCsvError] = useState<string | null>(null);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [parseError, setParseError] = useState<string | null>(null);
  const [exportError, setExportError] = useState<string | null>(null);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
  }, [dark]);

  const handleFileSelected = (filePath: string) => {
    setCsvFilePath(filePath);
    setCsvError(null);
    setFetchError(null);
    setParseError(null);
    setExportError(null);
  };

  const handleExport = () => {
    if (!csvFilePath) {
      setCsvError("Please upload a CSV file first.");
      return;
    }

    setCsvError(null);
    setFetchError(null);
    setParseError(null);
    setExportError(null);

    fetch(csvFilePath)
      .then((response) => {
        if (!response.ok) {
          throw new Error(`Network response was not ok: ${response.status}`);
        }
        return response.text();
      })
      .then((csvText) => {
        Papa.parse<any>(csvText, {
          header: true,
          skipEmptyLines: true,
          complete: (results) => {
            if (results.errors.length) {
              console.error("CSV parse errors:", results.errors);
              setParseError("Error parsing CSV file.");
              return;
            }
            try {
              // Sanitize the data before exporting
              const sanitizedData = results.data.map((row: any) => {
                const sanitizedRow: Record<string, any> = {};
                Object.entries(row).forEach(([key, value]) => {
                  if (value && typeof value === 'object' && '$$typeof' in value) {
                    sanitizedRow[key] = '[React Element]';
                  } else if (value && typeof value === 'object') {
                    sanitizedRow[key] = JSON.stringify(value);
                  } else {
                    sanitizedRow[key] = value;
                  }
                });
                return sanitizedRow;
              });

              const parser = new Parser();
              const csv = parser.parse(sanitizedData);
              const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
              const url = URL.createObjectURL(blob);
              const link = document.createElement("a");
              link.href = url;
              link.setAttribute("download", "sustainity-data.csv");
              document.body.appendChild(link);
              link.click();
              document.body.removeChild(link);
              URL.revokeObjectURL(url);
            } catch (error) {
              console.error("Error generating CSV:", error);
              setExportError("Error generating CSV file for download.");
            }
          },
          error: (err: Error) => {
            console.error("CSV parse error:", err);
            setParseError("Error parsing CSV file.");
          },
        });
      })
      .catch((err: Error) => {
        console.error("Error fetching CSV:", err);
        setFetchError(`Error fetching CSV file: ${err.message}`);
      });
  };

  return (
    <main className="min-h-screen bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 p-6">
      <button
        onClick={() => setDark(!dark)}
        className="mb-4 px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded"
      >
        Toggle {dark ? "Light" : "Dark"} Mode
      </button>

      <FileUploader onFileSelected={handleFileSelected} />

      <div className="flex justify-between items-center mt-4 mb-2">
        <h2 className="text-xl font-bold">Data Table</h2>
        <button
          onClick={handleExport}
          className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
          disabled={!csvFilePath}
        >
          Export CSV
        </button>
      </div>

      {csvError && (
        <div className="text-red-500 mt-2">
          {csvError}
        </div>
      )}

      {fetchError && (
        <div className="text-red-500 mt-2">
          {fetchError}
        </div>
      )}

      {parseError && (
        <div className="text-red-500 mt-2">
          {parseError}
        </div>
      )}

      {exportError && (
        <div className="text-red-500 mt-2">
          {exportError}
        </div>
      )}

      <div className="space-y-6">
        <DataTable csvFilePath={csvFilePath} />
        <ChartView csvFilePath={csvFilePath} />
      </div>
    </main>
  );
}
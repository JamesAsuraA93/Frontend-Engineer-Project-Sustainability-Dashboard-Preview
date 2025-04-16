import { useState, useMemo, useEffect } from "react";
import dynamic from 'next/dynamic';

interface DataTableProps {
  csvFilePath: string;
}

const DataTable = ({ csvFilePath }: DataTableProps) => {
  const [data, setData] = useState<Record<string, any>[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState("");
  const [sortField, setSortField] = useState<string | null>(null);
  const [sortAsc, setSortAsc] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const fetchData = async () => {
      try {
        const response = await fetch(csvFilePath);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const csvText = await response.text();

        // Dynamically import papaparse only on the client side
        const Papa = (await import('papaparse')).default;
        
        Papa.parse(csvText, {
          header: true,
          skipEmptyLines: true,
          complete: (results) => {
            if (!isMounted) return;
            
            // Sanitize the data immediately after parsing
            const sanitizedData = (results.data as unknown[]).map((row) => {
              if (typeof row !== 'object' || row === null) return {};
              
              const sanitizedRow: Record<string, any> = {};
              Object.entries(row as Record<string, any>).forEach(([key, value]) => {
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
            
            setData(sanitizedData);
            setLoading(false);
          },
          error: (err: any) => {
            if (!isMounted) return;
            setError(err.message);
            setLoading(false);
          },
        });
      } catch (err: any) {
        if (!isMounted) return;
        setError(err.message);
        setLoading(false);
      }
    };

    fetchData();

    return () => {
      isMounted = false;
    };
  }, [csvFilePath]);

  const filteredData = useMemo(() => {
    if (loading || error || data.length === 0) return [];
    
    return data.filter((row: Record<string, any>) =>
      Object.values(row).some((val) =>
        String(val).toLowerCase().includes(filter.toLowerCase())
      )
    );
  }, [data, filter, loading, error]);

  const sortedData = useMemo(() => {
    if (filteredData.length === 0) return [];
    
    return [...filteredData].sort((a, b) => {
      if (!sortField) return 0;

      const aVal = a[sortField];
      const bVal = b[sortField];

      if (aVal == null || aVal === undefined) return sortAsc ? -1 : 1;
      if (bVal == null || bVal === undefined) return sortAsc ? 1 : -1;

      if (typeof aVal === "number" && typeof bVal === "number") {
        return sortAsc ? aVal - bVal : bVal - aVal;
      } else if (aVal instanceof Date && bVal instanceof Date) {
        const aTime = aVal.getTime();
        const bTime = bVal.getTime();
        if(isNaN(aTime) || isNaN(bTime)){
          return sortAsc ? String(aVal).localeCompare(String(bVal)) : String(bVal).localeCompare(String(aVal));
        }
        return sortAsc ? aTime - bTime : bTime - aTime;
      } else {
        return sortAsc
          ? String(aVal).localeCompare(String(bVal))
          : String(bVal).localeCompare(String(aVal));
      }
    });
  }, [filteredData, sortField, sortAsc]);

  const renderTableCell = (value: any) => {
    if (value === null || value === undefined) return '';
    try {
      if (typeof value === "object") {
        if (Array.isArray(value)) {
          return value.map((item: any, index: number) => (
            <div key={index}>{renderTableCell(item)}</div>
          ));
        } else if (value.$$typeof) {
          return null;
        } else {
          return JSON.stringify(value);
        }
      }
      return String(value);
    } catch (error) {
      console.error("Error rendering cell:", error, value);
      return `Error: ${String(error)}`;
    }
  };

  if (loading) return <div className="text-center py-4">Loading...</div>;
  if (error) return <div className="text-red-500 text-center py-4">Error: {error}</div>;
  if (data.length === 0) return <p className="text-center py-4">No data available</p>;

  const headers = Object.keys(data[0]);

  return (
    <div className="overflow-auto mb-6">
      <div className="mb-4">
        <input
          type="text"
          placeholder="Filter..."
          className="w-full p-2 border rounded dark:bg-gray-800 dark:border-gray-700 dark:text-white"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        />
      </div>
      <div className="overflow-x-auto">
        <table className="w-full table-auto border border-collapse">
          <thead>
            <tr>
              {headers.map((header) => (
                <th
                  key={header}
                  onClick={() => {
                    setSortField(header);
                    setSortAsc(sortField === header ? !sortAsc : true);
                  }}
                  className="border px-4 py-2 cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-700 dark:border-gray-700"
                >
                  {header}{" "}
                  {sortField === header ? (sortAsc ? "▲" : "▼") : ""}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sortedData.length > 0 ? (
              sortedData.map((row, i) => (
                <tr key={i} className="hover:bg-gray-100 dark:hover:bg-gray-800 dark:border-gray-700">
                  {headers.map((key) => (
                    <td key={key} className="border px-4 py-2">
                      {renderTableCell(row[key])}
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={headers.length} className="text-center border px-4 py-2">
                  No results found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// Export with SSR disabled
export default dynamic(() => Promise.resolve(DataTable), { ssr: false });
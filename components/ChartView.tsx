import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
} from "chart.js";
import { useMemo, useState, useEffect } from "react";
import dynamic from 'next/dynamic';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const useFetchCsvData = (csvFilePath: string) => {
  const [data, setData] = useState<Record<string, any>[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

  return { data, loading, error };
};

interface ChartViewProps {
  csvFilePath: string;
}

// Use dynamic import with ssr: false to ensure the component only renders on the client
const ChartView = dynamic(() => Promise.resolve(({ csvFilePath }: ChartViewProps) => {
  const { data, loading, error } = useFetchCsvData(csvFilePath);

  const chartData = useMemo(() => {
    if (loading || error || data.length === 0) return null;

    const labels = data.map((_, i) => "Row " + (i + 1));

    const numericKeys = Object.keys(data[0]).filter((key) => {
      const value = data[0][key];
      return (
        value !== null &&
        value !== undefined &&
        (typeof value === "number" ||
          (typeof value === "string" && !isNaN(Number(value))))
      );
    });

    if (numericKeys.length === 0) return null;

    // Ensure all data is properly sanitized
    const sanitizedData = data.map(row => {
      const sanitizedRow: Record<string, any> = {};
      Object.entries(row).forEach(([key, value]) => {
        if (value && typeof value === 'object' && '$$typeof' in value) {
          sanitizedRow[key] = null;
        } else if (value && typeof value === 'object') {
          sanitizedRow[key] = JSON.stringify(value);
        } else {
          sanitizedRow[key] = value;
        }
      });
      return sanitizedRow;
    });

    return {
      labels,
      datasets: numericKeys.map((key, i) => ({
        label: key,
        data: sanitizedData.map((row) => {
          const value = row[key];
          if (typeof value === "number") return value;
          if (typeof value === "string" && !isNaN(Number(value)))
            return Number(value);
          return null;
        }),
        backgroundColor: `hsl(${i * 60}, 70%, 50%)`,
      })),
    };
  }, [data, loading, error]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  if (data.length === 0) return <div>No data to display.</div>;
  if (!chartData) return <div>No numeric data available for chart.</div>;

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: 'Data Visualization'
      }
    },
    scales: {
      y: {
        beginAtZero: true
      }
    }
  };

  return (
    <div className="mb-6">
      <h2 className="text-xl font-bold mb-2">Chart View</h2>
      <div className="w-full h-[400px]">
        <Bar data={chartData} options={options} />
      </div>
    </div>
  );
}), { ssr: false });

export default ChartView;
// src/components/ui/ResponsiveTable.tsx
import React from 'react';

interface Column<T> {
  header: string;
  accessor: keyof T | ((row: T) => React.ReactNode);
  cellClassName?: string;
  mobileLabel?: string;
}

interface ResponsiveTableProps<T> {
  columns: Column<T>[];
  data: T[];
  keyExtractor: (item: T) => string;
  onRowClick?: (item: T) => void;
  emptyMessage?: string;
  className?: string;
}

export const ResponsiveTable = <T extends Record<string, any>>({
  columns,
  data,
  keyExtractor,
  onRowClick,
  emptyMessage = 'No data available',
  className = '',
}: ResponsiveTableProps<T>) => {
  if (data.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        {emptyMessage}
      </div>
    );
  }

  const renderCell = (item: T, column: Column<T>) => {
    if (typeof column.accessor === 'function') {
      return column.accessor(item);
    }
    return item[column.accessor as string];
  };

  return (
    <div className={`overflow-hidden ${className}`}>
      {/* Desktop view */}
      <div className="hidden md:block overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {columns.map((column, index) => (
                <th
                  key={index}
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  {column.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {data.map((item) => (
              <tr
                key={keyExtractor(item)}
                className={onRowClick ? 'cursor-pointer hover:bg-gray-50' : ''}
                onClick={onRowClick ? () => onRowClick(item) : undefined}
              >
                {columns.map((column, index) => (
                  <td
                    key={index}
                    className={`px-6 py-4 whitespace-nowrap ${column.cellClassName || ''}`}
                  >
                    {renderCell(item, column)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile view - card style */}
      <div className="md:hidden">
        <ul className="divide-y divide-gray-200">
          {data.map((item) => (
            <li
              key={keyExtractor(item)}
              className={`p-4 ${onRowClick ? 'cursor-pointer hover:bg-gray-50' : ''}`}
              onClick={onRowClick ? () => onRowClick(item) : undefined}
            >
              <div className="space-y-3">
                {columns.map((column, index) => (
                  <div key={index} className="flex flex-col">
                    <span className="text-xs font-medium text-gray-500">
                      {column.mobileLabel || column.header}
                    </span>
                    <span className={`mt-1 ${column.cellClassName || ''}`}>
                      {renderCell(item, column)}
                    </span>
                  </div>
                ))}
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

  return (
    <div className={`overflow-hidden ${className}`}>
      {/* Desktop view */}
      <div className="hidden md:block overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          {/* Table content... */}
        </table>
      </div>

      {/* Improved Mobile view - card style */}
      <div className="md:hidden">
        <ul className="divide-y divide-gray-200">
          {data.map((item) => (
            <li
              key={keyExtractor(item)}
              className={`p-4 ${onRowClick ? 'cursor-pointer hover:bg-gray-50' : ''}`}
              onClick={onRowClick ? () => onRowClick(item) : undefined}
            >
              <div className="space-y-3">
                {columns.map((column, index) => (
                  <div key={index} className="flex flex-col">
                    <span className="text-xs font-medium text-gray-500">
                      {column.mobileLabel || column.header}
                    </span>
                    <span className={`mt-1 text-sm ${column.cellClassName || ''}`}>
                      {renderCell(item, column)}
                    </span>
                  </div>
                ))}
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

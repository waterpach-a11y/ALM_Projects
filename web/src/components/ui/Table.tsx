import React from 'react';

interface TableProps {
  children: React.ReactNode;
  className?: string;
}

export const Table: React.FC<TableProps> = ({ children, className = '' }) => {
  return (
    <div className={`overflow-x-auto ${className}`}>
      <table className="w-full text-sm">{children}</table>
    </div>
  );
};

interface TableHeaderProps {
  children: React.ReactNode;
}

export const TableHeader: React.FC<TableHeaderProps> = ({ children }) => {
  return (
    <thead className="bg-gradient-to-r from-slate-50 to-slate-100/50 border-b-2 border-slate-300">
      <tr>{children}</tr>
    </thead>
  );
};

interface TableHeaderCellProps {
  children: React.ReactNode;
  align?: 'left' | 'center' | 'right';
}

export const TableHeaderCell: React.FC<TableHeaderCellProps> = ({ children, align = 'left' }) => {
  const alignStyles = {
    left: 'text-left',
    center: 'text-center',
    right: 'text-right',
  };
  return <th className={`px-4 py-3.5 font-bold text-slate-800 uppercase text-xs tracking-wider ${alignStyles[align]}`}>{children}</th>;
};

interface TableBodyProps {
  children: React.ReactNode;
}

export const TableBody: React.FC<TableBodyProps> = ({ children }) => {
  return <tbody className="divide-y divide-slate-200 border-t border-slate-200">{children}</tbody>;
};

interface TableRowProps {
  children: React.ReactNode;
  hover?: boolean;
  onClick?: () => void;
}

export const TableRow: React.FC<TableRowProps> = ({ children, hover = false, onClick }) => {
  return (
    <tr
      className={`border-b border-slate-200 ${hover || onClick ? 'hover:bg-gradient-to-r hover:from-indigo-50/50 hover:to-transparent hover:border-indigo-200 cursor-pointer transition-all duration-200' : ''}`}
      onClick={onClick}
    >
      {children}
    </tr>
  );
};

interface TableCellProps {
  children: React.ReactNode;
  align?: 'left' | 'center' | 'right';
}

export const TableCell: React.FC<TableCellProps> = ({ children, align = 'left' }) => {
  const alignStyles = {
    left: 'text-left',
    center: 'text-center',
    right: 'text-right',
  };
  return <td className={`px-4 py-4 text-slate-700 ${alignStyles[align]}`}>{children}</td>;
};


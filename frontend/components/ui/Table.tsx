import { ReactNode } from 'react';

interface TableProps {
  children: ReactNode;
  className?: string;
}

export function Table({ children, className = '' }: TableProps) {
  return (
    <div
      className={`
        bg-[#111827] border border-white/5 rounded-xl overflow-hidden
        shadow-[0_0_0_1px_rgba(255,255,255,0.02)]
      ${className}`}
    >
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">{children}</table>
      </div>
    </div>
  );
}

interface TableHeaderProps {
  children: ReactNode;
}

export function TableHeader({ children }: TableHeaderProps) {
  return (
    <thead className="bg-[#0F172A] border-b border-white/5">
      <tr>{children}</tr>
    </thead>
  );
}

interface TableHeadProps {
  children: ReactNode;
  className?: string;
  align?: 'left' | 'right' | 'center';
}

export function TableHead({
  children,
  className = '',
  align = 'left',
}: TableHeadProps) {
  const alignClass =
    align === 'right'
      ? 'text-right'
      : align === 'center'
        ? 'text-center'
        : 'text-left';
  return (
    <th
      className={`px-6 py-4 text-gray-500 text-xs uppercase tracking-wide font-medium ${alignClass} ${className}`}
    >
      {children}
    </th>
  );
}

interface TableBodyProps {
  children: ReactNode;
}

export function TableBody({ children }: TableBodyProps) {
  return <tbody className="divide-y divide-white/5">{children}</tbody>;
}

interface TableRowProps {
  children: ReactNode;
  onClick?: () => void;
  className?: string;
}

export function TableRow({
  children,
  onClick,
  className = '',
}: TableRowProps) {
  return (
    <tr
      onClick={onClick}
      className={`
        transition-colors duration-150
        hover:bg-white/5
        ${onClick ? 'cursor-pointer' : ''}
        ${className}
      `}
    >
      {children}
    </tr>
  );
}

interface TableCellProps {
  children: ReactNode;
  className?: string;
  align?: 'left' | 'right' | 'center';
}

export function TableCell({
  children,
  className = '',
  align = 'left',
}: TableCellProps) {
  const alignClass =
    align === 'right'
      ? 'text-right'
      : align === 'center'
        ? 'text-center'
        : 'text-left';
  return (
    <td className={`px-6 py-4 text-gray-300 ${alignClass} ${className}`}>
      {children}
    </td>
  );
}

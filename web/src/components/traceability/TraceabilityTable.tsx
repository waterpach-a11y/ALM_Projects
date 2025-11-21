import React from 'react';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Table, TableHeader, TableHeaderCell, TableBody, TableRow, TableCell } from '../ui/Table';
import { SectionTitle } from '../ui/SectionTitle';
import { Avatar } from '../ui/Avatar';

interface TraceabilityTableProps {
  title: string;
  data: Array<{
    id: string;
    title: string;
    status: string;
    parentTitle?: string;
    assignedTo?: string;
    [key: string]: any;
  }>;
  parentLabel: string;
  childLabel: string;
}

export const TraceabilityTable: React.FC<TraceabilityTableProps> = ({
  title,
  data,
  parentLabel,
  childLabel,
}) => {
  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { variant: 'default' | 'success' | 'warning' | 'error' | 'info'; label: string }> = {
      todo: { variant: 'default', label: 'Todo' },
      in_progress: { variant: 'info', label: 'In Progress' },
      review: { variant: 'warning', label: 'Review' },
      done: { variant: 'success', label: 'Done' },
      planned: { variant: 'default', label: 'Planned' },
      active: { variant: 'info', label: 'Active' },
      blocked: { variant: 'error', label: 'Blocked' },
      closed: { variant: 'success', label: 'Closed' },
    };
    const config = statusConfig[status] || { variant: 'default' as const, label: status };
    return <Badge variant={config.variant} size="sm">{config.label}</Badge>;
  };

  if (!data || data.length === 0) {
    return (
      <Card>
        <SectionTitle>{title}</SectionTitle>
        <div className="mt-4 text-center py-8 text-slate-500 text-sm">
          No {childLabel.toLowerCase()} found
        </div>
      </Card>
    );
  }

  return (
    <Card>
      <SectionTitle>{title}</SectionTitle>
      <div className="mt-4 overflow-x-auto">
        <Table>
          <TableHeader>
            <TableHeaderCell>{parentLabel}</TableHeaderCell>
            <TableHeaderCell>{childLabel}</TableHeaderCell>
            <TableHeaderCell>Status</TableHeaderCell>
            <TableHeaderCell>Assigned To</TableHeaderCell>
            <TableHeaderCell align="right">Actions</TableHeaderCell>
          </TableHeader>
          <TableBody>
            {data.map((item) => (
              <TableRow key={item.id} hover>
                <TableCell>
                  <div className="font-medium text-slate-900">{item.parentTitle || '-'}</div>
                </TableCell>
                <TableCell>
                  <div className="font-medium text-slate-900">{item.title}</div>
                </TableCell>
                <TableCell>{getStatusBadge(item.status)}</TableCell>
                <TableCell>
                  {item.assignedTo ? (
                    <div className="flex items-center gap-2">
                      <Avatar name={item.assignedTo} size="sm" />
                      <span className="text-sm text-slate-600">{item.assignedTo}</span>
                    </div>
                  ) : (
                    <span className="text-sm text-slate-400">Unassigned</span>
                  )}
                </TableCell>
                <TableCell align="right">
                  <button
                    className="text-indigo-600 hover:text-indigo-700 text-sm font-medium"
                    title="View details"
                  >
                    View
                  </button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </Card>
  );
};


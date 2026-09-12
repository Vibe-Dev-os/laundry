"use client"

import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { formatCurrency } from "@/lib/derived"
import { ROLE_LABELS } from "@/lib/store"
import type { StaffMember } from "@/lib/types"

interface StaffPerformanceTableProps {
  staff: StaffMember[]
}

export function StaffPerformanceTable({ staff }: StaffPerformanceTableProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Staff Performance</CardTitle>
        <CardDescription>All-time transactions and sales processed per staff member</CardDescription>
      </CardHeader>
      <CardContent>
        {staff.length === 0 ? (
          <div className="flex h-32 items-center justify-center text-sm text-muted-foreground">
            No staff for this business unit.
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Staff</TableHead>
                <TableHead>Role</TableHead>
                <TableHead className="text-right">Transactions</TableHead>
                <TableHead className="text-right">Sales Processed</TableHead>
                <TableHead className="text-right">Voided</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {staff.map((s) => (
                <TableRow key={s.id}>
                  <TableCell className="font-medium">{s.name}</TableCell>
                  <TableCell className="text-muted-foreground">{ROLE_LABELS[s.role]}</TableCell>
                  <TableCell className="text-right text-muted-foreground">{s.transactionsHandled}</TableCell>
                  <TableCell className="text-right font-medium">{formatCurrency(s.salesProcessed)}</TableCell>
                  <TableCell className="text-right">
                    {s.voidedTransactions > 0 ? (
                      <Badge variant="destructive">{s.voidedTransactions}</Badge>
                    ) : (
                      <span className="text-muted-foreground">0</span>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  )
}

"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { formatCurrency } from "@/lib/derived"

interface TopCustomersTableProps {
  customers: { name: string; total: number; orders: number }[]
}

export function TopCustomersTable({ customers }: TopCustomersTableProps) {
  const top = customers.slice(0, 8)

  return (
    <Card>
      <CardHeader>
        <CardTitle>Top Customers</CardTitle>
        <CardDescription>Ranked by total spend in this period</CardDescription>
      </CardHeader>
      <CardContent>
        {top.length === 0 ? (
          <div className="flex h-32 items-center justify-center text-sm text-muted-foreground">
            No completed sales in this period.
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Customer</TableHead>
                <TableHead className="text-right">Orders</TableHead>
                <TableHead className="text-right">Total Spend</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {top.map((c) => (
                <TableRow key={c.name}>
                  <TableCell className="font-medium">{c.name}</TableCell>
                  <TableCell className="text-right text-muted-foreground">{c.orders}</TableCell>
                  <TableCell className="text-right font-medium">{formatCurrency(c.total)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  )
}

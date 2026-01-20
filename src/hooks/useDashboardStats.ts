import { useMemo } from "react";
import { useSales } from "@/contexts/SalesContext";
import { useCustomers } from "@/contexts/CustomerContext";
import { useFinancial } from "@/contexts/FinancialContext";
import { startOfMonth, subMonths, isWithinInterval, endOfMonth } from "date-fns";

interface DashboardStats {
  totalRevenue: number;
  revenueChange: number;
  revenueChangeType: 'positive' | 'negative';
  salesCount: number;
  salesChange: number;
  salesChangeType: 'positive' | 'negative';
  activeCustomers: number;
  newCustomers: number;
  pendingReceivables: number;
  pendingReceivablesCount: number;
  loading: boolean;
}

export const useDashboardStats = (): DashboardStats => {
  const { sales, loading: loadingSales } = useSales();
  const { customers, loading: loadingCustomers } = useCustomers();
  const { accountsReceivable, loadingReceivables } = useFinancial();

  return useMemo(() => {
    const now = new Date();
    const currentMonthStart = startOfMonth(now);
    const currentMonthEnd = endOfMonth(now);
    const lastMonthStart = startOfMonth(subMonths(now, 1));
    const lastMonthEnd = endOfMonth(subMonths(now, 1));

    // Filter active sales (not cancelled, type = pedido)
    const activeSales = sales.filter(s => s.status !== 'cancelado' && s.type === 'pedido');

    // Current month sales
    const currentMonthSales = activeSales.filter(sale => 
      isWithinInterval(new Date(sale.createdAt), { start: currentMonthStart, end: currentMonthEnd })
    );
    const currentMonthRevenue = currentMonthSales.reduce((sum, sale) => sum + sale.total, 0);
    const currentMonthCount = currentMonthSales.length;

    // Last month sales
    const lastMonthSales = activeSales.filter(sale => 
      isWithinInterval(new Date(sale.createdAt), { start: lastMonthStart, end: lastMonthEnd })
    );
    const lastMonthRevenue = lastMonthSales.reduce((sum, sale) => sum + sale.total, 0);
    const lastMonthCount = lastMonthSales.length;

    // Calculate changes
    const revenueChange = lastMonthRevenue > 0 
      ? ((currentMonthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100 
      : currentMonthRevenue > 0 ? 100 : 0;
    
    const salesChange = lastMonthCount > 0 
      ? ((currentMonthCount - lastMonthCount) / lastMonthCount) * 100 
      : currentMonthCount > 0 ? 100 : 0;

    // Active customers (customers with purchases in last 30 days)
    const thirtyDaysAgo = subMonths(now, 1);
    const customerIdsWithRecentPurchases = new Set(
      activeSales
        .filter(sale => new Date(sale.createdAt) >= thirtyDaysAgo)
        .map(sale => sale.customerId)
    );
    const activeCustomersCount = customerIdsWithRecentPurchases.size;

    // New customers this month
    const newCustomersCount = customers.filter(c => 
      isWithinInterval(new Date(c.createdAt), { start: currentMonthStart, end: currentMonthEnd })
    ).length;

    // Pending receivables
    const pendingReceivables = accountsReceivable.filter(ar => ar.status === 'pendente');
    const pendingReceivablesTotal = pendingReceivables.reduce((sum, ar) => sum + ar.finalAmount, 0);

    return {
      totalRevenue: currentMonthRevenue,
      revenueChange: Math.abs(revenueChange),
      revenueChangeType: revenueChange >= 0 ? 'positive' : 'negative',
      salesCount: currentMonthCount,
      salesChange: Math.abs(salesChange),
      salesChangeType: salesChange >= 0 ? 'positive' : 'negative',
      activeCustomers: activeCustomersCount,
      newCustomers: newCustomersCount,
      pendingReceivables: pendingReceivablesTotal,
      pendingReceivablesCount: pendingReceivables.length,
      loading: loadingSales || loadingCustomers || loadingReceivables,
    };
  }, [sales, customers, accountsReceivable, loadingSales, loadingCustomers, loadingReceivables]);
};

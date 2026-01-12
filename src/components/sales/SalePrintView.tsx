import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Sale } from "@/types/sales";
import { Printer, X } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface SalePrintViewProps {
  sale: Sale | null;
  open: boolean;
  onClose: () => void;
}

const SalePrintView = ({ sale, open, onClose }: SalePrintViewProps) => {
  if (!sale) return null;

  const handlePrint = () => {
    window.print();
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatWeight = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value);
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-auto print:max-w-none print:max-h-none print:overflow-visible">
        {/* Print Content */}
        <div className="print-content p-6 bg-white text-black">
          {/* Header */}
          <div className="text-center border-b-2 border-black pb-4 mb-4">
            <h1 className="text-2xl font-bold">SUA EMPRESA</h1>
            <p className="text-sm">Endereço da empresa - Cidade/UF - CEP: 00000-000</p>
            <p className="text-sm">Tel: (00) 0000-0000 | CNPJ: 00.000.000/0001-00</p>
          </div>

          {/* Document Info */}
          <div className="flex justify-between items-start mb-6">
            <div>
              <h2 className="text-xl font-bold uppercase">
                {sale.type === 'pedido' ? 'PEDIDO' : 'ORÇAMENTO'}
              </h2>
              <p className="text-lg font-mono font-bold">Nº {sale.number}</p>
            </div>
            <div className="text-right">
              <p className="text-sm">
                Data: {format(sale.createdAt, "dd/MM/yyyy", { locale: ptBR })}
              </p>
              <p className="text-sm">
                Hora: {format(sale.createdAt, "HH:mm", { locale: ptBR })}
              </p>
            </div>
          </div>

          {/* Customer Info */}
          <div className="border border-black p-3 mb-4">
            <h3 className="font-bold text-sm mb-2 border-b border-black pb-1">DADOS DO CLIENTE</h3>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>
                <span className="font-medium">Código:</span> {sale.customerCode}
              </div>
              <div>
                <span className="font-medium">CPF/CNPJ:</span> {sale.customerCpfCnpj}
              </div>
              <div className="col-span-2">
                <span className="font-medium">Nome:</span> {sale.customerName}
              </div>
            </div>
          </div>

          {/* Items Table */}
          <div className="mb-4">
            <h3 className="font-bold text-sm mb-2 border-b border-black pb-1">ITENS</h3>
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="border-b-2 border-black">
                  <th className="text-left py-2 px-1">Código</th>
                  <th className="text-left py-2 px-1">Produto</th>
                  <th className="text-center py-2 px-1">Un.</th>
                  <th className="text-right py-2 px-1">Qtd</th>
                  <th className="text-right py-2 px-1">Preço Unit.</th>
                  <th className="text-right py-2 px-1">Desc.</th>
                  <th className="text-right py-2 px-1">Total</th>
                  <th className="text-right py-2 px-1">Peso (Kg)</th>
                </tr>
              </thead>
              <tbody>
                {sale.items.map((item, index) => (
                  <tr key={item.id} className={index % 2 === 0 ? 'bg-gray-50' : ''}>
                    <td className="py-1 px-1 font-mono">{item.productCode}</td>
                    <td className="py-1 px-1">{item.productName}</td>
                    <td className="py-1 px-1 text-center">{item.unit}</td>
                    <td className="py-1 px-1 text-right">{item.quantity}</td>
                    <td className="py-1 px-1 text-right">{formatCurrency(item.unitPrice)}</td>
                    <td className="py-1 px-1 text-right">{formatCurrency(item.discount)}</td>
                    <td className="py-1 px-1 text-right font-medium">{formatCurrency(item.total)}</td>
                    <td className="py-1 px-1 text-right">{formatWeight(item.weight || 0)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Totals */}
          <div className="flex justify-end mb-6">
            <div className="w-72 border border-black p-3">
              <div className="flex justify-between text-sm mb-1">
                <span>Subtotal:</span>
                <span>{formatCurrency(sale.subtotal)}</span>
              </div>
              <div className="flex justify-between text-sm mb-1 text-red-600">
                <span>Desconto:</span>
                <span>- {formatCurrency(sale.discount)}</span>
              </div>
              <div className="flex justify-between font-bold text-lg border-t border-black pt-2 mt-2">
                <span>TOTAL:</span>
                <span>{formatCurrency(sale.total)}</span>
              </div>
              <div className="flex justify-between font-medium text-sm border-t border-black pt-2 mt-2">
                <span>PESO TOTAL:</span>
                <span>{formatWeight(sale.totalWeight)} Kg</span>
              </div>
            </div>
          </div>

          {/* Payment and Notes */}
          <div className="grid grid-cols-2 gap-4 mb-8">
            <div className="border border-black p-3">
              <h3 className="font-bold text-sm mb-2">CONDIÇÃO DE PAGAMENTO</h3>
              <p className="text-sm">{sale.paymentMethodName}</p>
            </div>
            <div className="border border-black p-3">
              <h3 className="font-bold text-sm mb-2">OBSERVAÇÕES</h3>
              <p className="text-sm min-h-[40px]">{sale.notes || '-'}</p>
            </div>
          </div>

          {/* Signatures */}
          <div className="mt-12 pt-8">
            <h3 className="font-bold text-sm mb-8 text-center">ASSINATURAS</h3>
            <div className="grid grid-cols-3 gap-8">
              <div className="text-center">
                <div className="border-b border-black mb-2 h-12"></div>
                <p className="text-sm font-medium">Vendedor</p>
              </div>
              <div className="text-center">
                <div className="border-b border-black mb-2 h-12"></div>
                <p className="text-sm font-medium">Cliente</p>
              </div>
              <div className="text-center">
                <div className="border-b border-black mb-2 h-12"></div>
                <p className="text-sm font-medium">Motorista</p>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons - Hidden when printing */}
        <div className="flex justify-end gap-2 mt-4 print:hidden">
          <Button variant="outline" onClick={onClose}>
            <X className="h-4 w-4 mr-2" />
            Fechar
          </Button>
          <Button onClick={handlePrint}>
            <Printer className="h-4 w-4 mr-2" />
            Imprimir
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SalePrintView;

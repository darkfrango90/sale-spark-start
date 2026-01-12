import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Sale } from "@/types/sales";
import { Printer, X } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useCompany } from "@/contexts/CompanyContext";

interface SalePrintViewProps {
  sale: Sale | null;
  open: boolean;
  onClose: () => void;
}

const SalePrintView = ({ sale, open, onClose }: SalePrintViewProps) => {
  const { company } = useCompany();
  
  if (!sale) return null;

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

  const handlePrint = () => {
    const printWindow = window.open('', '_blank', 'width=800,height=600');
    if (!printWindow) {
      alert('Permita pop-ups para imprimir');
      return;
    }

    const printContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>${sale.type === 'pedido' ? 'Pedido' : 'Orçamento'} ${sale.number}</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { font-family: Arial, sans-serif; padding: 20px; color: #000; background: #fff; }
          .header { text-align: center; border-bottom: 2px solid #000; padding-bottom: 15px; margin-bottom: 15px; }
          .header h1 { font-size: 24px; margin-bottom: 5px; }
          .header p { font-size: 12px; }
          .doc-info { display: flex; justify-content: space-between; margin-bottom: 20px; }
          .doc-info h2 { font-size: 18px; }
          .doc-info .number { font-size: 16px; font-family: monospace; font-weight: bold; }
          .doc-info .date { text-align: right; font-size: 12px; }
          .customer { border: 1px solid #000; padding: 10px; margin-bottom: 15px; }
          .customer h3 { font-size: 12px; font-weight: bold; border-bottom: 1px solid #000; padding-bottom: 5px; margin-bottom: 8px; }
          .customer-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 5px; font-size: 12px; }
          .customer-grid .full { grid-column: span 2; }
          .items h3 { font-size: 12px; font-weight: bold; border-bottom: 1px solid #000; padding-bottom: 5px; margin-bottom: 8px; }
          table { width: 100%; border-collapse: collapse; font-size: 11px; margin-bottom: 15px; }
          th, td { border: 1px solid #ddd; padding: 5px; }
          th { background: #f5f5f5; text-align: left; font-weight: bold; }
          .text-right { text-align: right; }
          .text-center { text-align: center; }
          .totals { display: flex; justify-content: flex-end; margin-bottom: 20px; }
          .totals-box { width: 250px; border: 1px solid #000; padding: 10px; }
          .totals-row { display: flex; justify-content: space-between; font-size: 12px; margin-bottom: 5px; }
          .totals-row.discount { color: red; }
          .totals-row.total { font-size: 16px; font-weight: bold; border-top: 1px solid #000; padding-top: 8px; margin-top: 8px; }
          .totals-row.weight { font-size: 12px; border-top: 1px solid #000; padding-top: 8px; margin-top: 8px; }
          .payment-notes { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 30px; }
          .payment-notes > div { border: 1px solid #000; padding: 10px; }
          .payment-notes h3 { font-size: 12px; font-weight: bold; margin-bottom: 8px; }
          .payment-notes p { font-size: 12px; min-height: 30px; }
          .signatures { margin-top: 50px; }
          .signatures h3 { font-size: 12px; font-weight: bold; text-align: center; margin-bottom: 40px; }
          .signatures-grid { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 30px; }
          .signature-line { text-align: center; }
          .signature-line .line { border-bottom: 1px solid #000; height: 40px; margin-bottom: 5px; }
          .signature-line p { font-size: 12px; }
          .zebra { background: #f9f9f9; }
          @media print {
            body { padding: 10px; }
            @page { margin: 10mm; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>${company?.name || 'EMPRESA'}</h1>
          <p>${company?.address || 'Endereço não configurado'}${company?.city && company?.state ? ` - ${company.city}/${company.state}` : ''}${company?.zipCode ? ` - CEP: ${company.zipCode}` : ''}</p>
          <p>${company?.phone ? `Tel: ${company.phone}` : ''}${company?.phone && company?.cnpj ? ' | ' : ''}${company?.cnpj ? `CNPJ: ${company.cnpj}` : ''}</p>
        </div>

        <div class="doc-info">
          <div>
            <h2>${sale.type === 'pedido' ? 'PEDIDO' : 'ORÇAMENTO'}</h2>
            <p class="number">Nº ${sale.number}</p>
          </div>
          <div class="date">
            <p>Data: ${format(sale.createdAt, "dd/MM/yyyy", { locale: ptBR })}</p>
            <p>Hora: ${format(sale.createdAt, "HH:mm", { locale: ptBR })}</p>
          </div>
        </div>

        <div class="customer">
          <h3>DADOS DO CLIENTE</h3>
          <div class="customer-grid">
            <div><strong>Código:</strong> ${sale.customerCode}</div>
            <div><strong>CPF/CNPJ:</strong> ${sale.customerCpfCnpj}</div>
            <div class="full"><strong>Nome:</strong> ${sale.customerName}</div>
          </div>
        </div>

        <div class="items">
          <h3>ITENS</h3>
          <table>
            <thead>
              <tr>
                <th>Código</th>
                <th>Produto</th>
                <th class="text-center">Un.</th>
                <th class="text-right">Qtd</th>
                <th class="text-right">Preço Unit.</th>
                <th class="text-right">Desc.</th>
                <th class="text-right">Total</th>
                <th class="text-right">Peso (Kg)</th>
              </tr>
            </thead>
            <tbody>
              ${sale.items.map((item, index) => `
                <tr class="${index % 2 === 0 ? 'zebra' : ''}">
                  <td style="font-family: monospace;">${item.productCode}</td>
                  <td>${item.productName}</td>
                  <td class="text-center">${item.unit}</td>
                  <td class="text-right">${item.quantity}</td>
                  <td class="text-right">${formatCurrency(item.unitPrice)}</td>
                  <td class="text-right">${formatCurrency(item.discount)}</td>
                  <td class="text-right"><strong>${formatCurrency(item.total)}</strong></td>
                  <td class="text-right">${formatWeight(item.weight || 0)}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>

        <div class="totals">
          <div class="totals-box">
            <div class="totals-row">
              <span>Subtotal:</span>
              <span>${formatCurrency(sale.subtotal)}</span>
            </div>
            <div class="totals-row discount">
              <span>Desconto:</span>
              <span>- ${formatCurrency(sale.discount)}</span>
            </div>
            <div class="totals-row total">
              <span>TOTAL:</span>
              <span>${formatCurrency(sale.total)}</span>
            </div>
            <div class="totals-row weight">
              <span>PESO TOTAL:</span>
              <span>${formatWeight(sale.totalWeight)} Kg</span>
            </div>
          </div>
        </div>

        <div class="payment-notes">
          <div>
            <h3>CONDIÇÃO DE PAGAMENTO</h3>
            <p>${sale.paymentMethodName || '-'}</p>
          </div>
          <div>
            <h3>OBSERVAÇÕES</h3>
            <p>${sale.notes || '-'}</p>
          </div>
        </div>

        <div class="signatures">
          <h3>ASSINATURAS</h3>
          <div class="signatures-grid">
            <div class="signature-line">
              <div class="line"></div>
              <p>Vendedor</p>
            </div>
            <div class="signature-line">
              <div class="line"></div>
              <p>Cliente</p>
            </div>
            <div class="signature-line">
              <div class="line"></div>
              <p>Motorista</p>
            </div>
          </div>
        </div>
      </body>
      </html>
    `;

    printWindow.document.write(printContent);
    printWindow.document.close();
    
    printWindow.onload = () => {
      printWindow.focus();
      printWindow.print();
      printWindow.onafterprint = () => {
        printWindow.close();
      };
    };
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-auto">
        {/* Preview Content */}
        <div className="p-6 bg-white text-black">
          {/* Header */}
          <div className="text-center border-b-2 border-black pb-4 mb-4">
            <h1 className="text-2xl font-bold">{company?.name || 'EMPRESA'}</h1>
            <p className="text-sm">
              {company?.address ? `${company.address}` : 'Endereço não configurado'}
              {company?.city && company?.state ? ` - ${company.city}/${company.state}` : ''}
              {company?.zipCode ? ` - CEP: ${company.zipCode}` : ''}
            </p>
            <p className="text-sm">
              {company?.phone ? `Tel: ${company.phone}` : ''}
              {company?.phone && company?.cnpj ? ' | ' : ''}
              {company?.cnpj ? `CNPJ: ${company.cnpj}` : ''}
            </p>
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
          <div className="mt-8 pt-8">
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

        {/* Action Buttons */}
        <div className="flex justify-end gap-2 mt-4 border-t pt-4">
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

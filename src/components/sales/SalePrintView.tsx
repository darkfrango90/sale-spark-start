import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Sale } from "@/types/sales";
import { Printer, X, FileDown } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useCompany } from "@/contexts/CompanyContext";

interface SalePrintViewProps {
  sale: (Sale & { sellerName?: string }) | null;
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

  // Verifica se deve mostrar marca d'água
  const showWatermark = sale.status === 'cancelado' || sale.status === 'excluido';
  const watermarkText = sale.status === 'cancelado' ? 'CANCELADO' : 'EXCLUÍDO';

  const handlePrint = () => {
    const printWindow = window.open('', '_blank', 'width=800,height=600');
    if (!printWindow) {
      alert('Permita pop-ups para imprimir');
      return;
    }

    // CSS para marca d'água - centralizada na metade superior da página A4
    // A4 tem ~297mm de altura, metade = ~148mm, centro da metade = ~74mm (~280px)
    const watermarkStyles = showWatermark ? `
      .watermark {
        position: fixed;
        top: 180px;
        left: 0;
        right: 0;
        transform: rotate(-15deg);
        font-size: 80px;
        font-weight: bold;
        color: rgba(255, 0, 0, 0.20);
        text-transform: uppercase;
        z-index: 1000;
        pointer-events: none;
        white-space: nowrap;
        letter-spacing: 12px;
        text-align: center;
      }
    ` : '';

    const printContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>${sale.type === 'pedido' ? 'Pedido' : 'Orçamento'} ${sale.number}</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { font-family: Arial, sans-serif; padding: 15px; color: #000; background: #fff; position: relative; font-size: 14px; }
          .header { text-align: center; border-bottom: 2px solid #000; padding-bottom: 10px; margin-bottom: 10px; }
          .header h1 { font-size: 26px; margin-bottom: 4px; }
          .header p { font-size: 14px; line-height: 1.4; }
          .doc-info { display: flex; justify-content: space-between; margin-bottom: 12px; align-items: flex-start; }
          .doc-info h2 { font-size: 20px; }
          .doc-info .number { font-size: 18px; font-family: monospace; font-weight: bold; }
          .doc-info .date { text-align: right; font-size: 14px; }
          .customer { border: 1px solid #000; padding: 8px; margin-bottom: 10px; }
          .customer h3 { font-size: 14px; font-weight: bold; border-bottom: 1px solid #000; padding-bottom: 4px; margin-bottom: 6px; }
          .customer-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 4px; font-size: 14px; }
          .customer-grid .full { grid-column: span 2; }
          .items h3 { font-size: 14px; font-weight: bold; border-bottom: 1px solid #000; padding-bottom: 4px; margin-bottom: 6px; }
          table { width: 100%; border-collapse: collapse; font-size: 13px; margin-bottom: 10px; }
          th, td { border: 1px solid #ccc; padding: 4px 6px; }
          th { background: #f0f0f0; text-align: left; font-weight: bold; }
          .text-right { text-align: right; }
          .text-center { text-align: center; }
          .totals-section { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 12px; }
          .payment-info { flex: 1; padding-right: 15px; }
          .payment-info h3 { font-size: 14px; font-weight: bold; margin-bottom: 5px; }
          .payment-info p { font-size: 14px; }
          .payment-info .notes { margin-top: 10px; }
          .totals-box { width: 240px; border: 1px solid #000; padding: 8px; }
          .totals-row { display: flex; justify-content: space-between; font-size: 14px; margin-bottom: 4px; }
          .totals-row.discount { color: red; }
          .totals-row.total { font-size: 18px; font-weight: bold; border-top: 1px solid #000; padding-top: 6px; margin-top: 6px; }
          .totals-row.weight { font-size: 14px; border-top: 1px solid #000; padding-top: 6px; margin-top: 6px; }
          .signatures { margin-top: 20px; }
          .signatures h3 { font-size: 14px; font-weight: bold; text-align: center; margin-bottom: 15px; }
          .signatures-grid { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 20px; }
          .signature-line { text-align: center; }
          .signature-line .line { border-bottom: 1px solid #000; height: 25px; margin-bottom: 4px; }
          .signature-line p { font-size: 13px; }
          .zebra { background: #f9f9f9; }
          ${watermarkStyles}
          @media print {
            body { padding: 10px; }
            @page { margin: 8mm; size: A4; }
            .watermark {
              position: fixed;
              top: 20px;
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }
          }
        </style>
      </head>
      <body>
        ${showWatermark ? `<div class="watermark">${watermarkText}</div>` : ''}
        
        <div class="header">
          <h1>${company?.name || 'EMPRESA'}</h1>
          <p>${company?.address || 'Endereço não configurado'}${company?.city && company?.state ? ` - ${company.city}/${company.state}` : ''}${company?.zipCode ? ` - CEP: ${company.zipCode}` : ''}</p>
          <p>${company?.phone ? `Tel: ${company.phone}` : ''}${company?.phone && company?.cnpj ? ' | ' : ''}${company?.cnpj ? `CNPJ: ${company.cnpj}` : ''}</p>
        </div>

        <div class="doc-info">
          <div>
            <h2>${sale.type === 'pedido' ? 'PEDIDO' : 'ORÇAMENTO'}</h2>
            <p class="number">Nº ${sale.number}</p>
            ${sale.sellerName ? `<p style="font-size: 13px; margin-top: 4px;"><strong>Vendedor:</strong> ${sale.sellerName}</p>` : ''}
          </div>
          <div style="text-align: center; flex: 1; padding: 0 15px;">
            <p style="font-weight: bold; font-size: 11px; border: 1px solid #000; padding: 5px; background: #f5f5f5;">NÃO É DOCUMENTO FISCAL - NÃO COMPROVA PAGAMENTO</p>
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
            ${sale.customerPhone ? `<div class="full"><strong>Telefone:</strong> ${sale.customerPhone}</div>` : ''}
          </div>
          ${sale.customerAddress || sale.customerNeighborhood || sale.customerCity ? `
          <h3 style="margin-top: 5px;">ENDEREÇO DE ENTREGA</h3>
          <div class="customer-grid">
            ${sale.customerAddress ? `<div class="full"><strong>Endereço:</strong> ${sale.customerAddress}</div>` : ''}
            ${sale.customerNeighborhood ? `<div><strong>Bairro:</strong> ${sale.customerNeighborhood}</div>` : ''}
            ${sale.customerCity && sale.customerState ? `<div><strong>Cidade:</strong> ${sale.customerCity}/${sale.customerState}</div>` : ''}
            ${sale.customerZipCode ? `<div><strong>CEP:</strong> ${sale.customerZipCode}</div>` : ''}
          </div>
          ` : ''}
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

        <div class="totals-section">
          <div class="payment-info">
            <h3>CONDIÇÃO DE PAGAMENTO:</h3>
            <p>${sale.paymentMethodName || '-'}</p>
            ${sale.notes ? `
            <div class="notes">
              <h3>OBSERVAÇÕES:</h3>
              <p>${sale.notes.replace(/\[MOTIVO DA EXCLUSÃO\]:.*$/s, '').replace(/\[MOTIVO DO CANCELAMENTO\]:.*$/s, '').trim() || '-'}</p>
            </div>
            ` : ''}
          </div>
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
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-auto">
        {/* Preview Content - Compact */}
        <div className="p-4 bg-white text-black relative text-[11px]">
          {/* Marca d'água na preview - centralizada na metade superior */}
          {showWatermark && (
            <div className="absolute top-24 left-0 right-0 -rotate-[15deg] pointer-events-none z-10 text-center">
              <span 
                className="text-red-500/20 font-bold text-[50px] whitespace-nowrap"
                style={{ letterSpacing: '10px' }}
              >
                {watermarkText}
              </span>
            </div>
          )}

          {/* Header - Compacto */}
          <div className="text-center border-b border-black pb-2 mb-2">
            <h1 className="text-base font-bold">{company?.name || 'EMPRESA'}</h1>
            <p className="text-[10px]">
              {company?.address ? `${company.address}` : 'Endereço não configurado'}
              {company?.city && company?.state ? ` - ${company.city}/${company.state}` : ''}
              {company?.zipCode ? ` - CEP: ${company.zipCode}` : ''}
            </p>
            <p className="text-[10px]">
              {company?.phone ? `Tel: ${company.phone}` : ''}
              {company?.phone && company?.cnpj ? ' | ' : ''}
              {company?.cnpj ? `CNPJ: ${company.cnpj}` : ''}
            </p>
          </div>

          {/* Document Info - Compacto */}
          <div className="flex justify-between items-start mb-2">
            <div>
              <h2 className="text-sm font-bold uppercase">
                {sale.type === 'pedido' ? 'PEDIDO' : 'ORÇAMENTO'}
              </h2>
              <p className="text-xs font-mono font-bold">Nº {sale.number}</p>
              {sale.sellerName && (
                <p className="text-[9px] mt-0.5">
                  <span className="font-medium">Vendedor:</span> {sale.sellerName}
                </p>
              )}
            </div>
            <div className="flex-1 px-2 flex items-center justify-center">
              <p className="text-center font-bold text-[8px] border border-black px-1.5 py-0.5 bg-gray-100">
                NÃO É DOCUMENTO FISCAL - NÃO COMPROVA PAGAMENTO
              </p>
            </div>
            <div className="text-right text-[10px]">
              <p>Data: {format(sale.createdAt, "dd/MM/yyyy", { locale: ptBR })}</p>
              <p>Hora: {format(sale.createdAt, "HH:mm", { locale: ptBR })}</p>
            </div>
          </div>

          {/* Customer Info - Compacto */}
          <div className="border border-black p-2 mb-2">
            <h3 className="font-bold text-[10px] mb-1 border-b border-black pb-0.5">DADOS DO CLIENTE</h3>
            <div className="grid grid-cols-2 gap-1 text-[10px]">
              <div><span className="font-medium">Código:</span> {sale.customerCode}</div>
              <div><span className="font-medium">CPF/CNPJ:</span> {sale.customerCpfCnpj}</div>
              <div className="col-span-2"><span className="font-medium">Nome:</span> {sale.customerName}</div>
              {sale.customerPhone && (
                <div className="col-span-2"><span className="font-medium">Telefone:</span> {sale.customerPhone}</div>
              )}
            </div>
            {(sale.customerAddress || sale.customerNeighborhood || sale.customerCity) && (
              <>
                <h3 className="font-bold text-[10px] mt-1.5 mb-1 border-b border-black pb-0.5">ENDEREÇO DE ENTREGA</h3>
                <div className="grid grid-cols-2 gap-1 text-[10px]">
                  {sale.customerAddress && (
                    <div className="col-span-2"><span className="font-medium">Endereço:</span> {sale.customerAddress}</div>
                  )}
                  {sale.customerNeighborhood && (
                    <div><span className="font-medium">Bairro:</span> {sale.customerNeighborhood}</div>
                  )}
                  {sale.customerCity && sale.customerState && (
                    <div><span className="font-medium">Cidade:</span> {sale.customerCity}/{sale.customerState}</div>
                  )}
                  {sale.customerZipCode && (
                    <div><span className="font-medium">CEP:</span> {sale.customerZipCode}</div>
                  )}
                </div>
              </>
            )}
          </div>

          {/* Items Table - Compacto */}
          <div className="mb-2">
            <h3 className="font-bold text-[10px] mb-1 border-b border-black pb-0.5">ITENS</h3>
            <table className="w-full text-[9px] border-collapse">
              <thead>
                <tr className="border-b border-black">
                  <th className="text-left py-0.5 px-1">Código</th>
                  <th className="text-left py-0.5 px-1">Produto</th>
                  <th className="text-center py-0.5 px-1">Un.</th>
                  <th className="text-right py-0.5 px-1">Qtd</th>
                  <th className="text-right py-0.5 px-1">Preço Unit.</th>
                  <th className="text-right py-0.5 px-1">Desc.</th>
                  <th className="text-right py-0.5 px-1">Total</th>
                  <th className="text-right py-0.5 px-1">Peso</th>
                </tr>
              </thead>
              <tbody>
                {sale.items.map((item, index) => (
                  <tr key={item.id} className={index % 2 === 0 ? 'bg-gray-50' : ''}>
                    <td className="py-0.5 px-1 font-mono">{item.productCode}</td>
                    <td className="py-0.5 px-1">{item.productName}</td>
                    <td className="py-0.5 px-1 text-center">{item.unit}</td>
                    <td className="py-0.5 px-1 text-right">{item.quantity}</td>
                    <td className="py-0.5 px-1 text-right">{formatCurrency(item.unitPrice)}</td>
                    <td className="py-0.5 px-1 text-right">{formatCurrency(item.discount)}</td>
                    <td className="py-0.5 px-1 text-right font-medium">{formatCurrency(item.total)}</td>
                    <td className="py-0.5 px-1 text-right">{formatWeight(item.weight || 0)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Totals and Payment Info - Compacto */}
          <div className="flex justify-between items-start mb-3">
            <div className="flex-1 pr-3">
              <h3 className="font-bold text-[10px] mb-1">CONDIÇÃO DE PAGAMENTO:</h3>
              <p className="text-[10px]">{sale.paymentMethodName || '-'}</p>
              {sale.notes && (
                <div className="mt-2">
                  <h3 className="font-bold text-[10px] mb-1">OBSERVAÇÕES:</h3>
                  <p className="text-[10px]">
                    {sale.notes
                      .replace(/\[MOTIVO DA EXCLUSÃO\]:.*$/s, '')
                      .replace(/\[MOTIVO DO CANCELAMENTO\]:.*$/s, '')
                      .trim() || '-'}
                  </p>
                </div>
              )}
            </div>
            <div className="w-48 border border-black p-2">
              <div className="flex justify-between text-[10px] mb-0.5">
                <span>Subtotal:</span>
                <span>{formatCurrency(sale.subtotal)}</span>
              </div>
              <div className="flex justify-between text-[10px] mb-0.5 text-red-600">
                <span>Desconto:</span>
                <span>- {formatCurrency(sale.discount)}</span>
              </div>
              <div className="flex justify-between font-bold text-sm border-t border-black pt-1 mt-1">
                <span>TOTAL:</span>
                <span>{formatCurrency(sale.total)}</span>
              </div>
              <div className="flex justify-between font-medium text-[10px] border-t border-black pt-1 mt-1">
                <span>PESO TOTAL:</span>
                <span>{formatWeight(sale.totalWeight)} Kg</span>
              </div>
            </div>
          </div>

          {/* Signatures - Compacto */}
          <div className="mt-3">
            <h3 className="font-bold text-[10px] mb-3 text-center">ASSINATURAS</h3>
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center">
                <div className="border-b border-black mb-1 h-5"></div>
                <p className="text-[9px] font-medium">Vendedor</p>
              </div>
              <div className="text-center">
                <div className="border-b border-black mb-1 h-5"></div>
                <p className="text-[9px] font-medium">Cliente</p>
              </div>
              <div className="text-center">
                <div className="border-b border-black mb-1 h-5"></div>
                <p className="text-[9px] font-medium">Motorista</p>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-2 mt-3 border-t pt-3">
          <Button variant="outline" size="sm" onClick={onClose}>
            <X className="h-4 w-4 mr-2" />
            Fechar
          </Button>
          <Button variant="secondary" size="sm" onClick={() => {
            const printWindow = window.open('', '_blank');
            if (!printWindow) {
              alert('Permita pop-ups para salvar PDF');
              return;
            }
            // Reutiliza a mesma lógica de impressão mas com instrução de salvar como PDF
            handlePrint();
          }}>
            <FileDown className="h-4 w-4 mr-2" />
            Salvar PDF
          </Button>
          <Button size="sm" onClick={handlePrint}>
            <Printer className="h-4 w-4 mr-2" />
            Imprimir
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SalePrintView;

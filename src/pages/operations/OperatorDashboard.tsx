import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useSales } from "@/contexts/SalesContext";
import { useProducts } from "@/contexts/ProductContext";
import { supabase } from "@/integrations/supabase/client";
import { LogOut, Truck, Camera, RefreshCw, CheckCircle2, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import CameraCapture from "@/components/operations/CameraCapture";
import TicketResult from "@/components/operations/TicketResult";

interface TicketData {
  peso_bruto_kg?: number | null;
  peso_liquido_kg?: number | null;
  tara_kg?: number | null;
  data_hora?: string | null;
  confianca: number;
}

type Step = "list" | "confirm" | "camera" | "analyzing" | "result";

const OperatorDashboard = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { sales, refreshSales, updateSaleStatus } = useSales();
  const { products } = useProducts();

  const [selectedSaleId, setSelectedSaleId] = useState<string | null>(null);
  const [step, setStep] = useState<Step>("list");
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [ticketData, setTicketData] = useState<TicketData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [searchNumber, setSearchNumber] = useState("");

  // Filter pending orders (pedidos with status pendente)
  const pendingOrders = useMemo(() => {
    return sales.filter(sale => 
      sale.type === 'pedido' && 
      sale.status === 'pendente'
    ).map(sale => {
      // Calculate total M³ and expected weight from items
      let totalM3 = 0;
      let expectedWeightKg = 0;

      sale.items.forEach(item => {
        if (item.unit === 'M3' || item.unit === 'm³' || item.unit === 'M³') {
          totalM3 += item.quantity;
          // Find product to get density
          const product = products.find(p => p.id === item.productId);
          if (product?.density) {
            expectedWeightKg += item.quantity * product.density * 1000; // M³ * density(ton/m³) * 1000 = kg
          }
        }
      });

      // Get product names
      const productNames = sale.items.map(item => item.productName).join(', ');

      return {
        id: sale.id,
        number: sale.number,
        customerName: sale.customerName,
        products: productNames,
        totalM3,
        expectedWeightKg
      };
    }).filter(order => 
      searchNumber === "" || order.number.toLowerCase().includes(searchNumber.toLowerCase())
    );
  }, [sales, products, searchNumber]);

  const selectedOrder = pendingOrders.find(o => o.id === selectedSaleId);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleOrderClick = (saleId: string) => {
    setSelectedSaleId(saleId);
    setStep("confirm");
  };

  const handleStartCamera = () => {
    setStep("camera");
  };

  const handleCaptureImage = async (imageBase64: string) => {
    setCapturedImage(imageBase64);
    setStep("analyzing");
    
    // Analyze ticket with AI
    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/analyze-ticket`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({ imageBase64 }),
        }
      );

      if (!response.ok) {
        if (response.status === 429) {
          toast.error("Limite de requisições. Aguarde um momento.");
        } else if (response.status === 402) {
          toast.error("Créditos de IA insuficientes.");
        }
        setTicketData({ confianca: 0 });
        setStep("result");
        return;
      }

      const data = await response.json();
      setTicketData(data);
      setStep("result");
    } catch (error) {
      console.error("Error analyzing ticket:", error);
      toast.error("Erro ao analisar ticket");
      setTicketData({ confianca: 0 });
      setStep("result");
    }
  };

  const handleCancelCamera = () => {
    setStep("confirm");
  };

  const handleRetakePhoto = () => {
    setCapturedImage(null);
    setTicketData(null);
    setStep("camera");
  };

  const handleConfirmLoading = async () => {
    if (!selectedSaleId || !user || !capturedImage) return;

    setIsLoading(true);
    try {
      const sale = sales.find(s => s.id === selectedSaleId);
      if (!sale) {
        toast.error("Pedido não encontrado");
        return;
      }

      // Upload image to storage
      const fileName = `${selectedSaleId}/${Date.now()}.jpg`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('ticket-images')
        .upload(fileName, decode(capturedImage), {
          contentType: 'image/jpeg'
        });

      if (uploadError) {
        console.error("Error uploading image:", uploadError);
        // Continue even if upload fails
      }

      const ticketImageUrl = uploadData 
        ? supabase.storage.from('ticket-images').getPublicUrl(fileName).data.publicUrl
        : null;

      const expectedWeightKg = selectedOrder?.expectedWeightKg || 0;
      const ticketWeightKg = ticketData?.peso_liquido_kg || 0;
      const differencePercent = expectedWeightKg > 0 
        ? ((ticketWeightKg - expectedWeightKg) / expectedWeightKg) * 100 
        : 0;

      // Register loading in database
      // Note: Using any cast temporarily until types are regenerated with new columns
      const insertData = {
        sale_id: selectedSaleId,
        sale_number: sale.number,
        customer_name: sale.customerName,
        operator_id: user.id,
        operator_name: user.name,
        loaded_at: new Date().toISOString(),
        ticket_image_url: ticketImageUrl,
        ticket_weight_kg: ticketWeightKg,
        expected_weight_kg: expectedWeightKg,
        weight_difference_percent: differencePercent,
        weight_verified: Math.abs(differencePercent) <= 5,
        ai_response: ticketData
      };
      
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error } = await (supabase.from('order_loadings') as any).insert(insertData);

      if (error) {
        console.error("Error registering loading:", error);
        toast.error("Erro ao registrar carregamento");
        return;
      }

      // Update sale status to 'finalizado'
      await updateSaleStatus(selectedSaleId, 'finalizado');
      
      toast.success(`Pedido ${sale.number} carregado!`);
      resetState();
      await refreshSales();
    } catch (error) {
      console.error("Error confirming loading:", error);
      toast.error("Erro ao confirmar carregamento");
    } finally {
      setIsLoading(false);
    }
  };

  const resetState = () => {
    setSelectedSaleId(null);
    setCapturedImage(null);
    setTicketData(null);
    setStep("list");
  };

  const handleCancel = () => {
    resetState();
  };

  // Decode base64 to Uint8Array for upload
  const decode = (base64: string): Uint8Array => {
    const binaryString = atob(base64);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes;
  };

  // Camera screen
  if (step === "camera") {
    return (
      <CameraCapture
        onCapture={handleCaptureImage}
        onCancel={handleCancelCamera}
      />
    );
  }

  // Result screen (analyzing or showing result)
  if ((step === "analyzing" || step === "result") && capturedImage && selectedOrder) {
    return (
      <TicketResult
        ticketData={ticketData || { confianca: 0 }}
        expectedWeightKg={selectedOrder.expectedWeightKg}
        capturedImage={capturedImage}
        isLoading={step === "analyzing" || isLoading}
        onConfirm={handleConfirmLoading}
        onRetake={handleRetakePhoto}
        onCancel={handleCancel}
      />
    );
  }

  // Confirm screen (before camera)
  if (step === "confirm" && selectedOrder) {
    return (
      <div className="fixed inset-0 z-50 bg-background flex flex-col">
        {/* Header */}
        <div className="bg-slate-800 text-white p-4 flex items-center gap-3">
          <Truck className="h-7 w-7" />
          <span className="text-lg font-bold">CONFIRMAR CARREGAMENTO</span>
        </div>

        {/* Order Details */}
        <div className="flex-1 flex flex-col items-center justify-center p-6">
          <div className="text-center mb-8">
            <p className="text-4xl font-bold text-primary mb-4">{selectedOrder.number}</p>
            <p className="text-2xl font-semibold text-foreground uppercase mb-4">
              {selectedOrder.customerName}
            </p>
            <div className="inline-block bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 px-6 py-3 rounded-full mb-4">
              <span className="text-2xl font-bold">{selectedOrder.products}</span>
            </div>
            <div className="block">
              <div className="inline-flex items-center gap-2 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 px-6 py-3 rounded-full">
                <span className="text-3xl font-bold">{selectedOrder.totalM3.toFixed(2)}</span>
                <span className="text-xl font-semibold">M³</span>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="p-6 space-y-4 pb-safe">
          <Button
            onClick={handleStartCamera}
            size="lg"
            className="w-full h-20 text-xl font-bold bg-primary hover:bg-primary/90"
          >
            <Camera className="h-8 w-8 mr-4" />
            TIRAR FOTO DO TICKET
          </Button>
          
          <Button
            onClick={handleCancel}
            variant="outline"
            size="lg"
            className="w-full h-14 text-lg"
          >
            CANCELAR
          </Button>
        </div>
      </div>
    );
  }

  // Main list screen
  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Compact Header for Mobile */}
      <div className="bg-slate-800 text-white">
        <div className="flex items-center justify-between h-16 px-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary rounded-lg">
              <Truck className="h-6 w-6 text-primary-foreground" />
            </div>
            <div>
              <span className="font-bold text-lg">OPERADOR</span>
              {user && <span className="ml-2 text-slate-300">{user.name.split(' ')[0]}</span>}
            </div>
          </div>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={handleLogout} 
            className="text-white hover:bg-slate-700 h-12 w-12"
          >
            <LogOut className="h-6 w-6" />
          </Button>
        </div>
      </div>

      {/* Search and count */}
      <div className="flex items-center gap-3 px-4 py-3 border-b bg-muted/50">
        <div className="flex items-center gap-2">
          <span className="text-lg font-semibold text-foreground">Pendentes</span>
          <span className="bg-primary text-primary-foreground px-3 py-1 rounded-full text-lg font-bold">
            {pendingOrders.length}
          </span>
        </div>
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Nº pedido"
            value={searchNumber}
            onChange={(e) => setSearchNumber(e.target.value)}
            className="pl-10 h-12 text-lg"
          />
        </div>
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => refreshSales()}
          className="h-12 w-12"
        >
          <RefreshCw className="h-6 w-6" />
        </Button>
      </div>

      {/* Orders List */}
      <div className="flex-1 overflow-auto">
        {pendingOrders.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full p-8">
            <CheckCircle2 className="h-24 w-24 text-green-500 mb-6" />
            <p className="text-3xl font-bold text-foreground mb-2">TUDO CARREGADO!</p>
            <p className="text-lg text-muted-foreground">Nenhum pedido pendente</p>
          </div>
        ) : (
          <div className="p-4 space-y-3">
            {pendingOrders.map(order => (
              <button
                key={order.id}
                onClick={() => handleOrderClick(order.id)}
                className="w-full bg-card border border-border rounded-xl p-4 text-left transition-all active:scale-[0.98] hover:border-primary/50 hover:shadow-md"
              >
                <div className="flex items-start justify-between mb-3">
                  <span className="text-xl font-bold text-primary">{order.number}</span>
                  <span className="bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 px-3 py-1 rounded-full text-lg font-bold">
                    {order.totalM3.toFixed(2)} M³
                  </span>
                </div>
                <p className="text-lg font-semibold text-foreground uppercase truncate mb-2">
                  {order.customerName}
                </p>
                <span className="inline-block bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 px-3 py-1 rounded-full text-base font-semibold">
                  {order.products}
                </span>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default OperatorDashboard;

import { useState, useRef, useEffect } from "react";
import DOMPurify from "dompurify";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import TopMenu from "@/components/dashboard/TopMenu";
import { Send, Bot, User, Loader2, Sparkles, Copy, Check } from "lucide-react";
import { toast } from "sonner";

interface Message {
  role: "user" | "assistant";
  content: string;
}

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/business-chat`;

const quickSuggestions = [
  "Vendas do mês",
  "Estoque crítico",
  "Contas vencidas",
  "Clientes com permuta",
  "Top 5 produtos vendidos",
];

const AIAssistant = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [copiedMessageIndex, setCopiedMessageIndex] = useState<number | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleCopy = async (content: string, index: number) => {
    const plainText = content
      .replace(/<strong>(.*?)<\/strong>/g, '$1')
      .replace(/<br \/>/g, '\n')
      .replace(/\*\*(.*?)\*\*/g, '$1')
      .replace(/<[^>]*>/g, '');

    try {
      await navigator.clipboard.writeText(plainText);
      setCopiedMessageIndex(index);
      toast.success("Texto copiado!");
      
      setTimeout(() => {
        setCopiedMessageIndex(null);
      }, 2000);
    } catch (error) {
      toast.error("Erro ao copiar texto");
    }
  };

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const streamChat = async (userMessage: string) => {
    const newMessages: Message[] = [...messages, { role: "user", content: userMessage }];
    setMessages(newMessages);
    setIsLoading(true);
    setInput("");

    let assistantContent = "";

    // Get auth token from localStorage (custom auth system)
    const authToken = localStorage.getItem('cezar_auth_token');
    
    if (!authToken) {
      toast.error("Você precisa estar logado para usar o assistente");
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch(CHAT_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({ messages: newMessages }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        if (response.status === 429) {
          throw new Error(errorData.error || "Limite de requisições excedido. Tente novamente.");
        }
        if (response.status === 402) {
          throw new Error(errorData.error || "Créditos insuficientes.");
        }
        throw new Error(errorData.error || "Erro ao processar sua pergunta");
      }

      if (!response.body) throw new Error("Sem resposta do servidor");

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      // Add initial assistant message
      setMessages(prev => [...prev, { role: "assistant", content: "" }]);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });

        let newlineIndex: number;
        while ((newlineIndex = buffer.indexOf("\n")) !== -1) {
          let line = buffer.slice(0, newlineIndex);
          buffer = buffer.slice(newlineIndex + 1);

          if (line.endsWith("\r")) line = line.slice(0, -1);
          if (line.startsWith(":") || line.trim() === "") continue;
          if (!line.startsWith("data: ")) continue;

          const jsonStr = line.slice(6).trim();
          if (jsonStr === "[DONE]") break;

          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content;
            if (content) {
              assistantContent += content;
              setMessages(prev => {
                const updated = [...prev];
                updated[updated.length - 1] = { role: "assistant", content: assistantContent };
                return updated;
              });
            }
          } catch {
            // Incomplete JSON, put back in buffer
            buffer = line + "\n" + buffer;
            break;
          }
        }
      }

      // Final flush
      if (buffer.trim()) {
        for (let raw of buffer.split("\n")) {
          if (!raw) continue;
          if (raw.endsWith("\r")) raw = raw.slice(0, -1);
          if (raw.startsWith(":") || raw.trim() === "") continue;
          if (!raw.startsWith("data: ")) continue;
          const jsonStr = raw.slice(6).trim();
          if (jsonStr === "[DONE]") continue;
          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content;
            if (content) {
              assistantContent += content;
            }
          } catch { /* ignore */ }
        }
        if (assistantContent) {
          setMessages(prev => {
            const updated = [...prev];
            updated[updated.length - 1] = { role: "assistant", content: assistantContent };
            return updated;
          });
        }
      }

    } catch (error) {
      console.error("Chat error:", error);
      toast.error(error instanceof Error ? error.message : "Erro ao processar pergunta");
      // Remove empty assistant message if error
      setMessages(prev => prev.filter(m => m.content !== ""));
    } finally {
      setIsLoading(false);
      inputRef.current?.focus();
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;
    streamChat(input.trim());
  };

  const handleSuggestion = (suggestion: string) => {
    if (isLoading) return;
    streamChat(suggestion);
  };

  const formatMessage = (content: string) => {
    // Simple markdown-like formatting with XSS protection
    const formatted = content
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\n/g, '<br />');
    // Sanitize to prevent XSS attacks from AI responses
    return DOMPurify.sanitize(formatted, {
      ALLOWED_TAGS: ['strong', 'br', 'b', 'i', 'em', 'p', 'span'],
      ALLOWED_ATTR: []
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <TopMenu />
      <div className="pt-16 px-4 pb-4 h-screen flex flex-col">
        <div className="max-w-4xl mx-auto w-full flex-1 flex flex-col">
          {/* Header */}
          <div className="py-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-violet-100 rounded-lg">
                <Bot className="h-6 w-6 text-violet-600" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-foreground">Assistente Inteligente</h1>
                <p className="text-sm text-muted-foreground">
                  Pergunte sobre dados do sistema
                </p>
              </div>
            </div>
          </div>

          {/* Chat Area */}
          <Card className="flex-1 flex flex-col overflow-hidden">
            <ScrollArea className="flex-1 p-4" ref={scrollRef}>
              {messages.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center py-8">
                  <Sparkles className="h-12 w-12 text-violet-400 mb-4" />
                  <h2 className="text-lg font-semibold text-foreground mb-2">
                    Como posso ajudar?
                  </h2>
                  <p className="text-muted-foreground mb-6 max-w-md">
                    Pergunte sobre vendas, estoque, clientes, permuta, financeiro e mais.
                    Eu informo onde encontrar e mostro os dados.
                  </p>
                  <div className="flex flex-wrap gap-2 justify-center">
                    {quickSuggestions.map((suggestion) => (
                      <Button
                        key={suggestion}
                        variant="outline"
                        size="sm"
                        onClick={() => handleSuggestion(suggestion)}
                        className="text-sm"
                      >
                        {suggestion}
                      </Button>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {messages.map((message, index) => (
                    <div
                      key={index}
                      className={`flex gap-3 ${
                        message.role === "user" ? "justify-end" : "justify-start"
                      }`}
                    >
                      {message.role === "assistant" && (
                        <div className="p-2 bg-violet-100 rounded-full h-fit">
                          <Bot className="h-4 w-4 text-violet-600" />
                        </div>
                      )}
                      <div className="flex flex-col gap-1">
                        <div
                          className={`max-w-[80%] rounded-lg p-3 ${
                            message.role === "user"
                              ? "bg-primary text-primary-foreground"
                              : "bg-muted"
                          }`}
                        >
                          {message.role === "assistant" && message.content === "" && isLoading ? (
                            <div className="flex items-center gap-2">
                              <Loader2 className="h-4 w-4 animate-spin" />
                              <span className="text-sm">Buscando informações...</span>
                            </div>
                          ) : (
                            <div
                              className="text-sm whitespace-pre-wrap"
                              dangerouslySetInnerHTML={{ __html: formatMessage(message.content) }}
                            />
                          )}
                        </div>
                        {message.role === "assistant" && message.content && !isLoading && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="self-start h-7 text-xs text-muted-foreground hover:text-foreground gap-1"
                            onClick={() => handleCopy(message.content, index)}
                          >
                            {copiedMessageIndex === index ? (
                              <>
                                <Check className="h-3 w-3 text-green-500" />
                                Copiado!
                              </>
                            ) : (
                              <>
                                <Copy className="h-3 w-3" />
                                Copiar
                              </>
                            )}
                          </Button>
                        )}
                      </div>
                      {message.role === "user" && (
                        <div className="p-2 bg-primary rounded-full h-fit">
                          <User className="h-4 w-4 text-primary-foreground" />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>

            {/* Quick Suggestions when chatting */}
            {messages.length > 0 && !isLoading && (
              <div className="px-4 pb-2">
                <div className="flex gap-2 overflow-x-auto pb-2">
                  {quickSuggestions.slice(0, 3).map((suggestion) => (
                    <Button
                      key={suggestion}
                      variant="ghost"
                      size="sm"
                      onClick={() => handleSuggestion(suggestion)}
                      className="text-xs whitespace-nowrap"
                    >
                      {suggestion}
                    </Button>
                  ))}
                </div>
              </div>
            )}

            {/* Input */}
            <CardContent className="p-4 border-t">
              <form onSubmit={handleSubmit} className="flex gap-2">
                <Input
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Digite sua pergunta..."
                  disabled={isLoading}
                  className="flex-1"
                />
                <Button type="submit" disabled={isLoading || !input.trim()}>
                  {isLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AIAssistant;

import React, { useEffect, useMemo, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface SvgEditorDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  downloadUrl: string | null;
}

export const SvgEditorDialog: React.FC<SvgEditorDialogProps> = ({
  open,
  onOpenChange,
  title,
  downloadUrl,
}) => {
  const [code, setCode] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    if (!downloadUrl) {
      setError("URL do SVG não encontrada.");
      return;
    }
    let cancelled = false;
    setLoading(true);
    setError(null);
    fetch(downloadUrl)
      .then(async (res) => {
        if (!res.ok) throw new Error(`Erro ao carregar SVG: ${res.status}`);
        const text = await res.text();
        if (!cancelled) setCode(text);
      })
      .catch((e) => {
        if (!cancelled) setError(e.message || "Falha ao carregar SVG");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [open, downloadUrl]);

  const previewMarkup = useMemo(() => ({ __html: code.replace(/<\?xml[^>]*\?>/i, "") }), [code]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={cn("max-w-[95vw] md:max-w-[90vw] lg:max-w-[80vw] p-0")}> 
        <DialogHeader className="p-6 pb-0">
          <DialogTitle className="text-xl">{title}</DialogTitle>
          <DialogDescription>
            Edite o SVG à esquerda e visualize as alterações em tempo real.
          </DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-0 md:gap-6 p-6 pt-4 h-[75vh]">
          <section aria-label="Editor de código SVG" className="h-full">
            <ScrollArea className="h-full rounded-md border">
              <div className="p-3">
                {loading ? (
                  <div className="text-sm text-muted-foreground">Carregando código…</div>
                ) : error ? (
                  <div className="space-y-3">
                    <p className="text-sm text-destructive">{error}</p>
                    <Button size="sm" variant="secondary" onClick={() => onOpenChange(true)}>
                      Tentar novamente
                    </Button>
                  </div>
                ) : (
                  <Textarea
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    className="h-[62vh] md:h-[66vh] font-mono text-sm whitespace-pre overflow-x-auto"
                    wrap="off"
                    aria-label="Código SVG"
                  />
                )}
              </div>
            </ScrollArea>
          </section>

          <section aria-label="Pré-visualização do SVG" className="h-full">
            <div className="h-full rounded-md border bg-background overflow-auto p-4">
              {loading ? (
                <div className="text-sm text-muted-foreground">Preparando pré-visualização…</div>
              ) : error ? (
                <div className="text-sm text-muted-foreground">Sem pré-visualização.</div>
              ) : (
                <article
                  className="w-full h-full flex items-center justify-center"
                  // eslint-disable-next-line react/no-danger
                  dangerouslySetInnerHTML={previewMarkup}
                />
              )}
            </div>
          </section>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SvgEditorDialog;

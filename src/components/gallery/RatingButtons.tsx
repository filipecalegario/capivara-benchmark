import { useMemo } from "react";
import { Button } from "@/components/ui/button";
import { ThumbsUp, ThumbsDown } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

interface RatingButtonsProps {
  title: string;
}

interface Counts {
  up_count: number;
  down_count: number;
}

const fetchCounts = async (title: string): Promise<Counts> => {
  const res = await supabase
    .from("capivara" as any)
    .select("up_count, down_count")
    .eq("title", title)
    .maybeSingle();

  if (res.error) throw res.error;
  const row = (res.data as any) as { up_count?: number; down_count?: number } | null;
  return { up_count: row?.up_count ?? 0, down_count: row?.down_count ?? 0 };
};

const RatingButtons = ({ title }: RatingButtonsProps) => {
  const qc = useQueryClient();
  const qk = useMemo(() => ["capivara", title], [title]);

  const { data } = useQuery({
    queryKey: qk,
    queryFn: () => fetchCounts(title),
    staleTime: 1000 * 60,
  });

  const optimisticUpdate = (delta: Partial<Counts>) => {
    const prev = qc.getQueryData<Counts>(qk) ?? { up_count: 0, down_count: 0 };
    qc.setQueryData<Counts>(qk, {
      up_count: prev.up_count + (delta.up_count ?? 0),
      down_count: prev.down_count + (delta.down_count ?? 0),
    });
    return prev;
  };

  const upMutation = useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase.rpc(
        "capivara_increment_up" as any,
        { p_title: title }
      );
      if (error) throw error;
      return data as Counts | null;
    },
    onMutate: async () => {
      await qc.cancelQueries({ queryKey: qk });
      const prev = optimisticUpdate({ up_count: 1 });
      return { prev };
    },
    onError: (err, _vars, ctx) => {
      if (ctx?.prev) qc.setQueryData(qk, ctx.prev as Counts);
      toast({ title: "Erro ao enviar 👍", description: (err as any)?.message ?? "Tente novamente." });
    },
    onSuccess: (server) => {
      if (server) qc.setQueryData(qk, server);
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: qk });
    },
  });

  const downMutation = useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase.rpc(
        "capivara_increment_down" as any,
        { p_title: title }
      );
      if (error) throw error;
      return data as Counts | null;
    },
    onMutate: async () => {
      await qc.cancelQueries({ queryKey: qk });
      const prev = optimisticUpdate({ down_count: 1 });
      return { prev };
    },
    onError: (err, _vars, ctx) => {
      if (ctx?.prev) qc.setQueryData(qk, ctx.prev as Counts);
      toast({ title: "Erro ao enviar 👎", description: (err as any)?.message ?? "Tente novamente." });
    },
    onSuccess: (server) => {
      if (server) qc.setQueryData(qk, server);
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: qk });
    },
  });

  const up = data?.up_count ?? 0;
  const down = data?.down_count ?? 0;
  const disabled = upMutation.isPending || downMutation.isPending;

  return (
    <div className="flex items-center gap-2" aria-label={`Avaliar ${title}`}>
      <Button
        variant="ghost"
        size="sm"
        aria-label="Curtir"
        onClick={() => upMutation.mutate()}
        disabled={disabled}
        title="Curtir"
      >
        <ThumbsUp className="size-4" />
        <span className="text-xs tabular-nums">{up}</span>
      </Button>
      <Button
        variant="ghost"
        size="sm"
        aria-label="Não curtir"
        onClick={() => downMutation.mutate()}
        disabled={disabled}
        title="Não curtir"
      >
        <ThumbsDown className="size-4" />
        <span className="text-xs tabular-nums">{down}</span>
      </Button>
    </div>
  );
};

export default RatingButtons;

import { useQuery } from "@tanstack/react-query";
import { useMemo, useState, useEffect } from "react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import RatingButtons from "./RatingButtons";
import { supabase } from "@/integrations/supabase/client";

interface GithubSvgGalleryProps {
  ownerRepo: string; // format: "owner/repo"
  folderPath: string; // e.g., "svgs"
  branch?: string; // default: "main"
}

interface GitHubContentItem {
  name: string;
  path: string;
  type: "file" | "dir";
  download_url: string | null;
  size: number;
}

interface RetryImageProps {
  src: string;
  alt: string;
  className?: string;
  owner: string;
  repo: string;
  branch: string;
  path: string;
}

const RetryImage = ({ src, alt, className, owner, repo, branch, path }: RetryImageProps) => {
  const [currentSrc, setCurrentSrc] = useState(src);
  const [retryCount, setRetryCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [hasError, setHasError] = useState(false);

  // URLs alternativas para tentar
  const getAlternativeUrls = () => [
    src, // URL original (download_url ou raw.githubusercontent.com)
    `https://raw.githubusercontent.com/${owner}/${repo}/${branch}/${path}`,
    `https://github.com/${owner}/${repo}/raw/${branch}/${path}`,
  ];

  const handleError = () => {
    const urls = getAlternativeUrls();
    if (retryCount < urls.length - 1) {
      const nextRetry = retryCount + 1;
      setRetryCount(nextRetry);
      setCurrentSrc(urls[nextRetry]);
      // Não precisa definir isLoading aqui, pois a imagem vai tentar carregar automaticamente
    } else {
      setHasError(true);
      setIsLoading(false);
    }
  };

  const handleLoad = () => {
    setIsLoading(false);
    setHasError(false);
  };

  if (hasError) {
    return (
      <div className={`${className} flex items-center justify-center bg-muted text-muted-foreground`}>
        <div className="text-center p-4">
          <p className="text-sm mb-2">❌ Falha ao carregar</p>
          <button
            onClick={() => {
              setRetryCount(0);
              setHasError(false);
              setIsLoading(true);
              setCurrentSrc(getAlternativeUrls()[0]);
            }}
            className="text-xs text-primary hover:underline"
          >
            Tentar novamente
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      {isLoading && (
        <div className={`${className} flex items-center justify-center bg-muted absolute inset-0 z-10`}>
          <div className="text-center">
            <Skeleton className="h-8 w-8 rounded-full mx-auto mb-2" />
            <p className="text-xs text-muted-foreground">
              Tentativa {retryCount + 1} de {getAlternativeUrls().length}
            </p>
          </div>
        </div>
      )}
      <img
        src={currentSrc}
        alt={alt}
        className={className}
        loading="lazy"
        onLoad={handleLoad}
        onError={handleError}
      />
    </>
  );
};


export const GithubSvgGallery = ({ ownerRepo, folderPath, branch = "main" }: GithubSvgGalleryProps) => {
  const [owner, repo] = ownerRepo.split("/");

  const { data, isLoading, isError } = useQuery<{ items: GitHubContentItem[] } | GitHubContentItem[], Error>({
    queryKey: ["github-folder", ownerRepo, folderPath, branch],
    queryFn: async () => {
      const url = `https://api.github.com/repos/${owner}/${repo}/contents/${folderPath}?ref=${branch}`;
      const res = await fetch(url, {
        headers: {
          // Unauthenticated requests are fine for public repos (rate-limited)
          "Accept": "application/vnd.github+json",
        },
      });
      if (!res.ok) {
        throw new Error(`GitHub API error ${res.status}: ${res.statusText}`);
      }
      return res.json();
    },
    staleTime: 1000 * 60, // 1 min
  });

  const svgs = useMemo(() => {
    const arr = Array.isArray(data) ? data : (data as { items: GitHubContentItem[] })?.items || [];
    const files = (arr as GitHubContentItem[]).filter(
      (it) => it.type === "file" && /\.svg$/i.test(it.name)
    );
    // Sort by name for stable order (fallback)
    return files.sort((a, b) => a.name.localeCompare(b.name));
  }, [data]);

  // Extract titles (filename without .svg)
  const titles = useMemo(() => svgs.map((it) => it.name.replace(/\.svg$/i, "")), [svgs]);

  // Fetch up_count for all titles at once
  const { data: capCounts } = useQuery<{ title: string; up_count: number }[], Error>({
    queryKey: ["capivara-counts", titles],
    queryFn: async () => {
      if (!titles.length) return [];
      const { data, error } = await supabase
        .from("capivara" as any)
        .select("title, up_count")
        .in("title", titles);
      if (error) throw error;
      return (data as any) as { title: string; up_count: number }[];
    },
    enabled: titles.length > 0,
    staleTime: 1000 * 60,
  });

  const countsMap = useMemo(() => {
    const map: Record<string, number> = {};
    (capCounts ?? []).forEach((r) => {
      map[r.title] = r.up_count ?? 0;
    });
    return map;
  }, [capCounts]);

  const sortedSvgs = useMemo(() => {
    // Sort by up_count desc, then by name asc
    return [...svgs].sort((a, b) => {
      const ta = a.name.replace(/\.svg$/i, "");
      const tb = b.name.replace(/\.svg$/i, "");
      const ca = countsMap[ta] ?? 0;
      const cb = countsMap[tb] ?? 0;
      if (cb !== ca) return cb - ca;
      return a.name.localeCompare(b.name);
    });
  }, [svgs, countsMap]);

  const [initialSortedSvgs, setInitialSortedSvgs] = useState<GitHubContentItem[] | null>(null);

  useEffect(() => {
    if (initialSortedSvgs === null && svgs.length) {
      // Aguarda a primeira resolução de capCounts (definida ou array vazio)
      if (capCounts !== undefined) {
        setInitialSortedSvgs(sortedSvgs);
      }
    }
  }, [capCounts, sortedSvgs, svgs, initialSortedSvgs]);

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {Array.from({ length: 8 }).map((_, i) => (
          <Card key={i} className="overflow-hidden">
            <CardContent className="p-0">
              <Skeleton className="h-56 w-full" />
            </CardContent>
            <CardFooter className="p-4">
              <Skeleton className="h-4 w-2/3" />
            </CardFooter>
          </Card>
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <div className="rounded-lg border border-border p-6 text-center">
        <p className="text-muted-foreground">Não foi possível carregar as imagens do GitHub. Verifique se o repositório e a pasta existem e se são públicos.</p>
      </div>
    );
  }

  if (!svgs.length) {
    return (
      <div className="rounded-lg border border-border p-6 text-center">
        <p className="text-muted-foreground">Nenhum SVG encontrado na pasta especificada.</p>
      </div>
    );
  }

  return (
    <section aria-label="Galeria de SVGs de capivaras dançando frevo">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {(initialSortedSvgs ?? sortedSvgs).map((item) => {
          const modelTitle = item.name.replace(/\.svg$/i, "");
          const src = `/assets/${item.name}`;
          return (
            <Card key={item.path} className="group overflow-hidden transition-transform duration-300 ease-out hover:-translate-y-1">
              <CardContent className="p-0 bg-gradient-to-b from-[hsl(var(--accent))]/10 to-transparent relative">
                <RetryImage
                  src={src}
                  alt={`SVG da capivara dançando frevo - ${modelTitle}`}
                  className="w-full h-56 object-contain bg-background"
                  owner={owner}
                  repo={repo}
                  branch={branch}
                  path={item.path}
                />
              </CardContent>
              <CardFooter className="flex items-center justify-between p-4 border-t">
                <span className="text-sm font-medium text-foreground">{modelTitle}</span>
                <RatingButtons title={modelTitle} />
              </CardFooter>
            </Card>
          );
        })}
      </div>
    </section>
  );
};

export default GithubSvgGallery;

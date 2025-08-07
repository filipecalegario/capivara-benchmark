import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

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

function parseModelFromFilename(filename: string) {
  const base = filename.replace(/\.svg$/i, "");
  // Heuristics: prefer part after last "__" or last "-" or last "_"
  const separators = ["__", "-", "_"]; 
  let part = base;
  for (const sep of separators) {
    if (base.includes(sep)) {
      const pieces = base.split(sep);
      part = pieces[pieces.length - 1];
    }
  }
  // Normalize spacing & casing
  const normalized = part.replace(/[_-]+/g, " ").trim();
  return normalized
    .split(" ")
    .map(w => (w.length <= 3 ? w.toUpperCase() : w[0].toUpperCase() + w.slice(1)))
    .join(" ");
}

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
    const arr = Array.isArray(data) ? data : (data as any)?.items || [];
    const files = (arr as GitHubContentItem[]).filter(
      (it) => it.type === "file" && /\.svg$/i.test(it.name)
    );
    // Sort by name for stable order
    return files.sort((a, b) => a.name.localeCompare(b.name));
  }, [data]);

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
        {svgs.map((item) => {
          const modelTitle = parseModelFromFilename(item.name);
          const src = item.download_url ?? `https://raw.githubusercontent.com/${owner}/${repo}/${branch}/${item.path}`;
          return (
            <Card key={item.path} className="group overflow-hidden transition-transform duration-300 ease-out hover:-translate-y-1">
              <CardContent className="p-0 bg-gradient-to-b from-[hsl(var(--accent))]/10 to-transparent">
                <img
                  src={src}
                  alt={`SVG da capivara dançando frevo - ${modelTitle}`}
                  loading="lazy"
                  className="w-full h-56 object-contain bg-background"
                />
              </CardContent>
              <CardFooter className="flex items-center justify-between p-4 border-t">
                <span className="text-sm font-medium text-foreground">{modelTitle}</span>
                <span className="text-xs text-muted-foreground">SVG</span>
              </CardFooter>
            </Card>
          );
        })}
      </div>
    </section>
  );
};

export default GithubSvgGallery;

import { Helmet } from "react-helmet-async";
import { useSearchParams } from "react-router-dom";
import GithubSvgGallery from "@/components/gallery/GithubSvgGallery";

const Index = () => {
  const [params] = useSearchParams();
  const repo = params.get("repo") || ""; // expected format: owner/repo
  const folder = params.get("path") || ""; // e.g., assets/capivara-frevo
  const branch = params.get("branch") || "main";

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-[hsl(var(--accent))]/10">
      <Helmet>
        <title>Galeria de SVGs | Capivara dançando frevo</title>
        <meta name="description" content="Galeria automática de SVGs gerados por modelos de linguagem: capivara dançando frevo." />
        <link rel="canonical" href={window.location.href} />
      </Helmet>
      <main className="container mx-auto px-4 py-12">
        <header className="mb-10 text-center">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-3">Galeria de SVGs: Capivara dançando frevo</h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">Coloque seus SVGs públicos em uma pasta do GitHub e use os parâmetros repo, path e branch na URL para carregá-los automaticamente. Ex.: ?repo=owner/repo&path=svgs&branch=main</p>
        </header>

        {repo && folder ? (
          <GithubSvgGallery ownerRepo={repo} folderPath={folder} branch={branch} />
        ) : (
          <div className="rounded-lg border border-dashed p-8 text-center">
            <p className="text-muted-foreground">Para começar, adicione parâmetros à URL: repo=owner/repo e path=caminho/da/pasta. Opcional: branch.</p>
          </div>
        )}
      </main>
    </div>
  );
};

export default Index;

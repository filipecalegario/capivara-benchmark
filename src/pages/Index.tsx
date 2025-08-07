import { Helmet } from "react-helmet-async";
import { useSearchParams } from "react-router-dom";
import GithubSvgGallery from "@/components/gallery/GithubSvgGallery";

const Index = () => {
  const [params] = useSearchParams();
  const DEFAULT_REPO = "filipecalegario/capivara-benchmark";
  const DEFAULT_PATH = "public/assets";
  const DEFAULT_BRANCH = "main";
  const repo = params.get("repo") || DEFAULT_REPO; // expected format: owner/repo
  const folder = params.get("path") || DEFAULT_PATH; // e.g., assets/capivara-frevo
  const branch = params.get("branch") || DEFAULT_BRANCH;

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-[hsl(var(--accent))]/10">
      <Helmet>
        <title>Galeria de SVGs | Capivara dançando frevo</title>
        <meta name="description" content="Galeria automática de SVGs gerados por modelos de linguagem: capivara dançando frevo." />
        <link rel="canonical" href={window.location.href} />
      </Helmet>
      <main className="container mx-auto px-4 py-12">
        <header className="mb-10 text-center">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-3">Crie um SVG de uma capivara dançando frevo</h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">Este é um sério (ahuahauhaahuahu) benchmark de avaliação de grandes modelos de linguagem. Para todas as imagens geradas foi usado o mesmo prompt: "Crie um SVG de uma capivara dançando frevo".</p>
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

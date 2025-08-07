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

        <section className="mt-10">
          <p className="text-sm text-muted-foreground text-center">
            Quem quiser contribuir com exemplos de SVG usando outros modelos, pode adicionar o SVG na pasta public/assets do repositório{" "}
            <a
              href="https://github.com/filipecalegario/capivara-benchmark"
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-primary underline-offset-4 hover:underline"
            >
              https://github.com/filipecalegario/capivara-benchmark
            </a>{" "}
            e enviar um PR. As imagens são carregadas dinamicamente.
          </p>
        </section>

        <footer className="mt-12 border-t pt-6 text-center">
          <p className="text-sm text-muted-foreground">
            Inspirado no trabalho de Simon Willison, pelican riding a bike: <a
              href="https://simonwillison.net/2025/Jun/6/six-months-in-llms/"
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-primary underline-offset-4 hover:underline"
            >
              https://simonwillison.net/2025/Jun/6/six-months-in-llms/
            </a>
          </p>
        </footer>
      </main>
    </div>
  );
};

export default Index;

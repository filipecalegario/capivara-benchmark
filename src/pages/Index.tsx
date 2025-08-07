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
        <title>Capivara no Frevo</title>
        <meta name="description" content="Galeria automática de SVGs gerados por modelos de linguagem: capivara dançando frevo." />
        <link rel="canonical" href={window.location.href} />
      </Helmet>
      <main className="container mx-auto px-4 py-12">
        <header className="mb-10 text-center">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-3">A capivara no frevo</h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">Este é um rigoroso benchmark (😂) para avaliação de grandes modelos de linguagem.<br/>
Todas as imagens foram geradas a partir do mesmo prompt:<br/>
<code>"Crie um SVG de uma capivara dançando frevo."</code></p>

        </header>

        {repo && folder ? (
          <GithubSvgGallery ownerRepo={repo} folderPath={folder} branch={branch} />
        ) : (
          <div className="rounded-lg border border-dashed p-8 text-center">
            <p className="text-muted-foreground">Para começar, adicione parâmetros à URL: repo=owner/repo e path=caminho/da/pasta. Opcional: branch.</p>
          </div>
        )}

        <section className="mt-12 mb-8">
          <div className="bg-accent/20 rounded-lg p-6 border border-accent/30">
            <h2 className="text-xl font-semibold mb-4 text-center">🤝 Contribua com o benchmark</h2>
            <p className="text-base text-foreground text-center leading-relaxed">
              Quer adicionar exemplos de outros modelos? <br/>Adicione seu SVG na pasta{" "}
              <code className="bg-muted px-2 py-1 rounded text-sm font-mono">public/assets</code>{" "}
              do repositório{" "}
              <a
                href="https://github.com/filipecalegario/capivara-benchmark"
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-primary underline-offset-4 hover:underline"
              >
                capivara-benchmark
              </a>{" "}
              e envie um Pull Request. <br/>As imagens são carregadas automaticamente!
            </p>
          </div>
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

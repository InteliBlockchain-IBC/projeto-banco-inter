# Frontend Banco Inter

Estrutura inicial do projeto de frontend, organizada para separar código-fonte,
arquivos públicos, documentação e testes.

## Estrutura

```text
.
├── docs/                  # Documentação técnica e decisões do projeto
├── public/                # Arquivos servidos diretamente pelo navegador
│   └── assets/            # Imagens, ícones e fontes públicas
├── src/                   # Código-fonte da aplicação
│   ├── assets/            # Recursos importados pelo código
│   ├── components/        # Componentes reutilizáveis
│   ├── pages/             # Páginas ou telas
│   ├── services/          # Integrações com APIs e serviços externos
│   ├── styles/            # Estilos globais, tokens e temas
│   └── utils/             # Funções utilitárias
└── tests/                 # Testes automatizados
```

## Primeiros passos

1. Defina a stack do projeto (por exemplo, React, Vue ou JavaScript puro).
2. Configure o gerenciador de pacotes e os scripts de desenvolvimento.
3. Registre decisões arquiteturais relevantes em `docs/`.
4. Mantenha segredos e configurações locais em `.env`, nunca no Git.

## Convenções

- Use nomes de arquivos e pastas em `kebab-case`.
- Mantenha componentes pequenos e com responsabilidade única.
- Coloque arquivos estáticos públicos em `public/assets`.
- Coloque recursos processados pelo bundler em `src/assets`.
- Documente variáveis de ambiente em `.env.example`.

Consulte [docs/architecture.md](docs/architecture.md) e
[docs/contributing.md](docs/contributing.md) para mais detalhes.

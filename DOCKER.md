# Guia Rápido - Docker

### 1. Com Docker Compose

```bash
# Na raiz do projeto
docker-compose build
```

```bash
# Na raiz do projeto
docker-compose up -d
```

### 2. Com pnpm scripts

```bash
# Na raiz do projeto
pnpm run docker:build
```

```bash
# Na raiz do projeto
pnpm run docker:up
```

### 3. Acessar a aplicação

- API: http://localhost:8080
- Swagger: http://localhost:8080/docs

## Comandos Disponíveis

### Via npm scripts (raiz do projeto)

```bash
# Build da imagem
pnpm run docker:build

# Iniciar container
pnpm run docker:up

# Ver logs
pnpm run docker:logs

# Parar container
pnpm run docker:down

# Rebuild completo (sem cache)
pnpm run docker:rebuild
```

### Via Docker Compose

```bash
# Iniciar
docker-compose up -d

# Ver logs
docker-compose logs -f api

# Parar
docker-compose down

# Rebuild
docker-compose build --no-cache
```

### Rebuild necessário após mudanças

```bash
# Rebuild completo
pnpm run docker:rebuild

# Ou manualmente
docker-compose down
docker-compose build --no-cache
docker-compose up -d
```

## Estrutura dos Arquivos Docker

```
delivery/
├── docker-compose.yml          # Orquestração de containers
└── apps/
    └── api/
        ├── Dockerfile          # Build multi-stage
        └── .dockerignore       # Arquivos excluídos do build
```

## Notas Importantes

1. **Workspaces**: O Dockerfile copia todos os workspaces necessários (`packages/helpers`, `packages/shared`)
2. **Produção**: Apenas dependências de produção são instaladas no stage final com `--ignore-scripts` para evitar execução de hooks de desenvolvimento (como Husky)
3. **Segurança**: Arquivos de desenvolvimento não são incluídos na imagem final
4. **Scripts de Lifecycle**: A flag `--ignore-scripts` previne a execução de scripts como `prepare` que tentam instalar ferramentas de desenvolvimento (Husky) desnecessárias em produção

## Características de Segurança

A imagem Docker foi construída seguindo as melhores práticas de segurança:

### Base Image Atualizada

- **Node.js 20 Alpine**: Versão LTS mais recente com patches de segurança aplicados
- Imagem Alpine Linux reduz a superfície de ataque (menor que 5MB)

### Atualizações de Sistema

- `apk update && apk upgrade --no-cache`: Atualização de todos os pacotes do sistema
- Limpeza de cache APK: `rm -rf /var/cache/apk/*` reduz a superfície de ataque

### Execução como Usuário Não-Root

```dockerfile
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001
USER nodejs
```

- Aplicação roda com UID 1001 (usuário `nodejs`)
- Previne escalada de privilégios em caso de comprometimento
- Princípio do menor privilégio aplicado

### Health Checks Integrados

```dockerfile
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
    CMD curl -f http://localhost:8080 || exit 1
```

- Monitoramento automático do estado do container
- Reinício automático em caso de falha
- Intervalo de verificação: 30 segundos

### Build Multi-Stage

- Stage 1 (Builder): Build da aplicação com todas as dependências
- Stage 2 (Production): Apenas artefatos necessários para execução
- Redução significativa do tamanho final da imagem
- Dependências de desenvolvimento não incluídas na imagem final

### Flags de Segurança

- `--ignore-scripts`: Previne execução de scripts maliciosos durante instalação de pacotes
- `--frozen-lockfile`: Garante instalação determinística das dependências
- `--prod`: Instala apenas dependências de produção

### Gestão de Permissões

```dockerfile
RUN chown -R nodejs:nodejs /app
```

- Todos os arquivos da aplicação pertencem ao usuário `nodejs`
- Permissões mínimas necessárias para operação

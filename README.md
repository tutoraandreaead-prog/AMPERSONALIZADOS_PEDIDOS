# Ateliê AM — sistema online para Netlify

Pedidos e produtos salvos online, com senha de administrador, até cinco produtos por pedido, catálogo editável em ordem alfabética, visualização, edição, exclusão recuperável, impressão, CSV e backup JSON.

## 1. Proteja os dados que você já cadastrou

Na versão antiga, abra **Salvar backup (JSON)** no computador e no celular. Os aparelhos podem ter registros diferentes. Guarde os dois arquivos. Não envie esses backups para um repositório público.

## 2. Envie o projeto completo para o GitHub

Extraia o ZIP e envie **todo o conteúdo desta pasta** para a raiz de um repositório. A estrutura deve incluir `netlify.toml`, `package.json`, `package-lock.json`, `public/`, `netlify/` e `scripts/`.

Não envie somente `index.html`. O HTML principal desta versão fica em `public/index.html`. Não envie `node_modules`, `.env` nem os valores secretos.

Você pode usar um repositório separado para não misturar esta versão com a anterior. Se reutilizar o anterior, o Netlify publicará somente `public/`, conforme `netlify.toml`. Arquivos antigos na raiz do repositório continuam visíveis no GitHub; retire de um repositório público os arquivos que contêm nomes e valores de clientes.

## 3. Atualize seu projeto existente no Netlify

Endereço atual: https://sistemapedidosampersonalizados.netlify.app/

1. Entre na sua conta em https://app.netlify.com/ e abra o projeto **sistemapedidosampersonalizados**.
2. Depois de enviar todos os arquivos deste pacote ao GitHub, conecte esse repositório ao projeto existente. Procure **Project configuration → Developer settings → Continuous deployment → Repository → Link repository**.
3. Se o projeto já estiver conectado a um repositório, atualize os arquivos nesse repositório e confira a branch de produção.
4. Confirme as definições de compilação: comando **npm run build**, diretório publicado **public**, Functions **netlify/functions**, Node **22**. O arquivo `netlify.toml` contém essas definições.
5. Antes da nova publicação, configure as duas variáveis da próxima etapa. Se a publicação já aconteceu, adicione-as e publique novamente.

Use a conexão com Git para instalar as dependências e empacotar as Functions. Enviar somente o HTML por arrastar e soltar mantém a versão sem armazenamento online.

Se preferir criar outro projeto, use **Add new project → Import an existing project**, selecione o repositório completo e siga as mesmas configurações. Ele terá outro endereço e outra base de dados.

## 4. Configure sua senha

Abra **configurar-acesso.html** no seu computador, crie uma senha com pelo menos 12 caracteres e clique em **Gerar configuração**. A senha é processada apenas no navegador.

No Netlify, em **Project configuration → Environment variables**, adicione:

- `APP_PASSWORD_HASH`: copie o valor completo gerado, incluindo os caracteres `$`.
- `SESSION_SECRET`: copie o segundo valor gerado.

Habilite o uso em **Functions**; se houver seleção de contexto, configure o contexto de produção. Marque como segredo quando essa opção estiver disponível. Não coloque esses valores em arquivos do GitHub. A função de login falha de forma segura enquanto a configuração estiver ausente.

Publique novamente em **Deploys**. Aguarde o status de publicação concluída. Abra o endereço `https://...netlify.app` e use a senha que você criou. Esta senha dá acesso à base inteira do ateliê; compartilhe somente com quem pode administrar os pedidos.

## 5. Importe os dados e confira nos dois aparelhos

1. Entre no endereço Netlify pelo computador.
2. Use **Importar backup** e selecione o JSON salvo anteriormente. A importação reúne os dados, preservando os pedidos que já estiverem online.
3. Se houver pedidos diferentes com o mesmo número, a cópia importada recebe outro número e uma anotação. Produtos de mesmo nome mantêm o preço já salvo online. Confira o resumo antes de confirmar.
4. Repita com o backup do celular, se ele tiver dados diferentes.
5. Abra o mesmo endereço no celular e entre com a mesma senha. Os dados serão os mesmos. A lista consulta atualizações a cada 20 segundos, enquanto nenhum formulário está aberto, e quando a janela volta ao foco.
6. Cadastre um pedido e aguarde **Salvo online**. Confira no segundo aparelho usando **Atualizar**.

O sistema inicia com **34 produtos e nenhum pedido**, para não expor os clientes nos arquivos públicos. O backup dos 16 pedidos originais é fornecido separadamente, para importação depois de entrar.

## Como o armazenamento funciona

As Netlify Functions verificam a sessão antes de ler ou salvar. O armazenamento é o **Netlify Blobs**, em stores vinculados ao projeto, com leitura consistente e gravação condicional. Republicar no mesmo projeto não recria a base. Criar outro projeto cria outro armazenamento. Não apague os stores no painel.

O site requer internet para salvar. Em caso de falha ou conflito entre aparelhos, ele não confirma o salvamento. Mantenha a tela aberta ou clique em **Baixar rascunho** para guardar a tentativa em JSON. Confira os dados online antes de tentar novamente. Faça backups regulares mesmo com armazenamento online.

Limite desta versão: 1,5 MB por conjunto de dados enviado, incluindo pedidos excluídos; cinco produtos por pedido. Uso, limites e eventual cobrança seguem o plano da sua conta Netlify. O projeto não cria conta, não aceita termos, não contrata plano e não publica sozinho.

O login expira em oito horas. **Sair** revoga a sessão daquele navegador. Para trocar a senha, gere novos valores de configuração e publique novamente; isso invalida as sessões anteriores. Não há recuperação por e-mail: a troca é feita pelo administrador do Netlify.

## Validação técnica

```sh
npm ci
npm test
npm run build
```

Os testes usam stores simulados para verificar autenticação, expiração, revogação, validação, persistência e concorrência. A integração real com Netlify Blobs deve ser conferida após a publicação na sua conta. Para desenvolvimento local conectado ao ambiente de simulação do Netlify, use `netlify dev` e configure as variáveis localmente sem enviá-las ao GitHub.

Referências oficiais: [Netlify Blobs](https://docs.netlify.com/build/data-and-storage/netlify-blobs/), [Functions](https://docs.netlify.com/build/functions/get-started/), [publicação com Git](https://docs.netlify.com/deploy/create-deploys/).

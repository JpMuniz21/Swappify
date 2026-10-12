import { useState, useRef, useEffect } from "react";
import Navbar from "../../components/Navbar/Navbar";
import {
  listarConversas,
  listarMensagens,
  enviarMensagem,
} from "../../services/chatService";
import "./chat.css";

const INTERVALO_ATUALIZACAO = 4000; // busca mensagens novas a cada 4 segundos

function Avatar({ nome = "?", url, tamanho = 32 }) {
  if (url) {
    return (
      <img
        className="avatar"
        src={url}
        alt={nome}
        style={{ width: tamanho, height: tamanho, objectFit: "cover" }}
      />
    );
  }
  return (
    <div
      className="avatar"
      style={{ width: tamanho, height: tamanho, fontSize: tamanho * 0.45 }}
    >
      {nome[0]}
    </div>
  );
}

export default function Chat() {
  const [conversas, setConversas] = useState([]); // [{ id_match, outro: {...} }]
  const [conversaAtivaId, setConversaAtivaId] = useState(null);
  const [mensagens, setMensagens] = useState([]);
  const [busca, setBusca] = useState("");
  const [texto, setTexto] = useState("");
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");

  const fimDasMensagens = useRef(null);

  // 1) Ao abrir a tela: carrega as conversas de quem está logado
  useEffect(() => {
    async function carregarTudo() {
      try {
        const lista = await listarConversas();
        setConversas(lista);
        if (lista.length > 0) setConversaAtivaId(lista[0].id_match);
      } catch (e) {
        console.error(e);
        setErro(e.message);
      } finally {
        setCarregando(false);
      }
    }
    carregarTudo();
  }, []);

  // 2) Ao trocar de conversa: carrega as mensagens e atualiza a cada 4 segundos
  useEffect(() => {
    if (!conversaAtivaId) return;
    let ativo = true; // evita atualizar a tela depois de trocar de conversa

    async function buscar() {
      try {
        const nova = await listarMensagens(conversaAtivaId);
        if (!ativo) return;
        // só atualiza se mudou (evita rolar a tela sem necessidade)
        setMensagens((atual) =>
          atual.length === nova.length &&
          atual.at(-1)?.id_mensagem === nova.at(-1)?.id_mensagem
            ? atual
            : nova
        );
      } catch (e) {
        console.error("Erro ao buscar mensagens:", e.message);
      }
    }

    setMensagens([]);
    buscar();
    const timer = setInterval(buscar, INTERVALO_ATUALIZACAO);

    return () => {
      ativo = false;
      clearInterval(timer);
    };
  }, [conversaAtivaId]);

  // 3) Rola até a última mensagem
  useEffect(() => {
    fimDasMensagens.current?.scrollIntoView({ behavior: "smooth" });
  }, [mensagens]);

  async function enviar() {
    const limpo = texto.trim();
    if (!limpo || !conversaAtivaId) return;

    setTexto("");
    try {
      const nova = await enviarMensagem(conversaAtivaId, limpo);
      setMensagens((atual) =>
        atual.some((m) => m.id_mensagem === nova.id_mensagem)
          ? atual
          : [...atual, nova]
      );
    } catch (e) {
      console.error("Erro ao enviar:", e.message);
      setTexto(limpo); // devolve o texto para tentar de novo
    }
  }

  const conversaAtiva = conversas.find((c) => c.id_match === conversaAtivaId);
  const conversasFiltradas = conversas.filter((c) =>
    (c.outro?.nome ?? "").toLowerCase().includes(busca.toLowerCase())
  );

  return (
    <div className="pagina">
      <Navbar />

      <div className="chat">
        <aside className="lateral">
          <h2 className="lateral__titulo">Conversas</h2>
          <input
            className="lateral__busca"
            type="text"
            placeholder="Buscar por nome"
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
          />

          <ul className="lateral__lista">
            {conversasFiltradas.map((c) => (
              <li key={c.id_match}>
                <button
                  className={
                    "contato" +
                    (c.id_match === conversaAtivaId ? " contato--ativo" : "")
                  }
                  onClick={() => setConversaAtivaId(c.id_match)}
                >
                  <Avatar nome={c.outro?.nome} url={c.outro?.avatar_url} tamanho={30} />
                  <span>{c.outro?.nome}</span>
                </button>
              </li>
            ))}
          </ul>
        </aside>

        <section className="janela">
          {carregando && <p style={{ padding: 24 }}>Carregando...</p>}
          {erro && <p style={{ padding: 24, color: "crimson" }}>{erro}</p>}
          {!carregando && !erro && !conversaAtiva && (
            <p style={{ padding: 24 }}>Você ainda não tem conversas.</p>
          )}

          {conversaAtiva && (
            <>
              <div className="janela__topo">
                <Avatar nome={conversaAtiva.outro?.nome} url={conversaAtiva.outro?.avatar_url} />
                <span>{conversaAtiva.outro?.nome}</span>
              </div>

              <div className="janela__mensagens">
                {mensagens.map((m) => (
                  <div
                    key={m.id_mensagem}
                    className={
                      "balao " +
                      (m.minha ? "balao--minha" : "balao--outro")
                    }
                  >
                    {m.conteudo}
                  </div>
                ))}
                <div ref={fimDasMensagens} />
              </div>

              <div className="janela__entrada">
                <button className="entrada__mais" aria-label="Anexar">+</button>
                <input
                  type="text"
                  placeholder="Digite aqui sua mensagem..."
                  value={texto}
                  onChange={(e) => setTexto(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && enviar()}
                />
                <button className="entrada__enviar" onClick={enviar} aria-label="Enviar mensagem">
                  ➤
                </button>
              </div>
            </>
          )}
        </section>
      </div>
    </div>
  );
}

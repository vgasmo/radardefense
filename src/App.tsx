import React, { useMemo, useState } from "react";
import { Radar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend,
  type ChartData,
  type ChartOptions,
} from "chart.js";

ChartJS.register(
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend
);

type DimensionKey =
  | "produto"
  | "mercado"
  | "documentacao"
  | "seguranca"
  | "certificacoes";

type Question = {
  id: string;
  label: string;
  dimension: DimensionKey;
};

const questions: Question[] = [
  // PRODUTO
  {
    id: "P1",
    dimension: "produto",
    label:
      "O produto/serviço tem, pelo menos, um protótipo funcional testado em ambiente relevante (piloto, laboratório, utilizadores)?",
  },
  {
    id: "P2",
    dimension: "produto",
    label:
      "O produto responde claramente a necessidades da área de Defesa (vigilância, logística, ciber, comando e controlo, etc.)?",
  },
  {
    id: "P3",
    dimension: "produto",
    label:
      "Já identificámos requisitos técnicos específicos de Defesa (normas, standards, interoperabilidade) e começámos a adequar o produto?",
  },
  {
    id: "P4",
    dimension: "produto",
    label:
      "Temos capacidade de produção/entrega (interna ou em parceria) para pilotos ou pequenos contratos em Defesa?",
  },

  // MERCADO
  {
    id: "M1",
    dimension: "mercado",
    label:
      "Conhecemos bem os principais clientes e decisores na área de Defesa (Ministério, Forças Armadas, NATO, UE, integradores)?",
  },
  {
    id: "M2",
    dimension: "mercado",
    label:
      "Já tivemos reuniões ou contactos ativos com potenciais clientes ou parceiros na área de Defesa?",
  },
  {
    id: "M3",
    dimension: "mercado",
    label:
      "Temos parcerias estratégicas com empresas/entidades já estabelecidas no setor de Defesa?",
  },
  {
    id: "M4",
    dimension: "mercado",
    label:
      "Temos uma proposta de valor específica para Defesa, distinta da oferta 'civil' que já fazemos?",
  },

  // DOCUMENTAÇÃO
  {
    id: "D1",
    dimension: "documentacao",
    label:
      "A propriedade intelectual relevante (patentes, software, marcas) está identificada e protegida quando necessário?",
  },
  {
    id: "D2",
    dimension: "documentacao",
    label:
      "A documentação técnica (arquiteturas, especificações, manuais, fichas técnicas) está organizada e atualizada?",
  },
  {
    id: "D3",
    dimension: "documentacao",
    label:
      "Temos minutas de NDA e contratos-tipo adequadas para pilotos e parcerias em contexto de Defesa?",
  },
  {
    id: "D4",
    dimension: "documentacao",
    label:
      "Já identificámos e iniciámos processos de credenciação/licenciamento relevantes para atuar em Defesa?",
  },

  // SEGURANÇA
  {
    id: "S1",
    dimension: "seguranca",
    label:
      "Temos políticas mínimas de segurança da informação (controlo de acessos, passwords, backups, gestão de dispositivos)?",
  },
  {
    id: "S2",
    dimension: "seguranca",
    label:
      "A informação sensível (código, dados, documentação crítica) está protegida (encriptação, acessos restritos, separação de ambientes)?",
  },
  {
    id: "S3",
    dimension: "seguranca",
    label:
      "A equipa-chave recebeu alguma formação/sensibilização em cibersegurança e proteção de informação?",
  },
  {
    id: "S4",
    dimension: "seguranca",
    label:
      "As instalações/processos têm medidas de segurança física e organizacional adequadas (acesso controlado, registo de visitas, zonas restritas)?",
  },

  // CERTIFICAÇÕES
  {
    id: "C1",
    dimension: "certificacoes",
    label:
      "Temos certificações de qualidade relevantes (ex.: ISO 9001) ou processos internos já próximos desse nível?",
  },
  {
    id: "C2",
    dimension: "certificacoes",
    label:
      "Temos ou estamos a implementar práticas/certificações de segurança da informação (ex.: ISO 27001)?",
  },
  {
    id: "C3",
    dimension: "certificacoes",
    label:
      "Já identificámos normas/certificações específicas para a Defesa ou setores afins (aeronáutica, espacial, ciber) que possam ser exigidas?",
  },
  {
    id: "C4",
    dimension: "certificacoes",
    label:
      "Existe um roadmap de certificações com prioridades, prazos e recursos estimados?",
  },
];

const dimensionLabels: Record<DimensionKey, string> = {
  produto: "Produto",
  mercado: "Mercado",
  documentacao: "Documentação",
  seguranca: "Segurança",
  certificacoes: "Certificações",
};

const dimensionOrder: DimensionKey[] = [
  "produto",
  "mercado",
  "documentacao",
  "seguranca",
  "certificacoes",
];

const App: React.FC = () => {
  const [answers, setAnswers] = useState<Record<string, number>>(() => {
    const initial: Record<string, number> = {};
    questions.forEach((q) => {
      initial[q.id] = 3; // valor inicial “razoável”
    });
    return initial;
  });

  const groupedByDimension = useMemo(() => {
    const grouped: Record<DimensionKey, Question[]> = {
      produto: [],
      mercado: [],
      documentacao: [],
      seguranca: [],
      certificacoes: [],
    };
    questions.forEach((q) => {
      grouped[q.dimension].push(q);
    });
    return grouped;
  }, []);

  const dimensionScores = useMemo(() => {
    const acc: Record<DimensionKey, { sum: number; count: number }> = {
      produto: { sum: 0, count: 0 },
      mercado: { sum: 0, count: 0 },
      documentacao: { sum: 0, count: 0 },
      seguranca: { sum: 0, count: 0 },
      certificacoes: { sum: 0, count: 0 },
    };

    questions.forEach((q) => {
      const value = answers[q.id] ?? 0;
      acc[q.dimension].sum += value;
      acc[q.dimension].count += 1;
    });

    const result: Record<DimensionKey, number> = {
      produto: 0,
      mercado: 0,
      documentacao: 0,
      seguranca: 0,
      certificacoes: 0,
    };

    (Object.keys(acc) as DimensionKey[]).forEach((dim) => {
      if (acc[dim].count > 0) {
        result[dim] = parseFloat(
          (acc[dim].sum / acc[dim].count).toFixed(2)
        );
      }
    });

    return result;
  }, [answers]);

  const radarData: ChartData<"radar"> = {
    labels: dimensionOrder.map((dim) => dimensionLabels[dim]),
    datasets: [
      {
        label: "Prontidão",
        data: dimensionOrder.map((dim) => dimensionScores[dim] ?? 0),
        backgroundColor: "rgba(34,197,94,0.2)",
        borderColor: "rgba(34,197,94,1)",
        borderWidth: 2,
        pointBackgroundColor: "rgba(34,197,94,1)",
      },
    ],
  };

  const radarOptions: ChartOptions<"radar"> = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      r: {
        min: 0,
        max: 5,
        ticks: {
          stepSize: 1,
        },
        beginAtZero: true,
      },
    },
    plugins: {
      legend: {
        display: false,
      },
    },
  };

  const getLevelLabel = (score: number): string => {
    if (score === 0) return "Por avaliar";
    if (score <= 1.5) return "Crítico";
    if (score <= 2.5) return "Fraco";
    if (score <= 3.5) return "Moderado";
    if (score <= 4.5) return "Bom";
    return "Muito bom";
  };

  return (
    <div className="app-root">
      <div className="container">
        <header className="header">
          <h1>Readiness Radar – Prontidão para a Defesa</h1>
          <p>
            Avalie a sua empresa em cinco dimensões chave e visualize o nível de
            prontidão num gráfico em forma de radar.
          </p>
        </header>

        <div className="layout">
          {/* FORMULÁRIO */}
          <section className="form-section">
            {dimensionOrder.map((dim) => (
              <div key={dim} className="card">
                <div className="card-header">
                  <h2>{dimensionLabels[dim]}</h2>
                  <div className="score-info">
                    <span>
                      Score médio:{" "}
                      <strong>
                        {dimensionScores[dim]?.toFixed(2) ?? "0.00"}
                      </strong>
                    </span>
                    <span className="badge">
                      {getLevelLabel(dimensionScores[dim] ?? 0)}
                    </span>
                  </div>
                </div>

                <div className="questions">
                  {groupedByDimension[dim].map((q) => (
                    <div key={q.id} className="question">
                      <div className="question-label">
                        <span>{q.label}</span>
                        <span className="question-value">
                          {answers[q.id]}
                        </span>
                      </div>
                      <input
                        type="range"
                        min={1}
                        max={5}
                        step={1}
                        value={answers[q.id]}
                        onChange={(e) =>
                          setAnswers((prev) => ({
                            ...prev,
                            [q.id]: Number(e.target.value),
                          }))
                        }
                      />
                      <div className="question-scale">
                        <span>1 — Muito fraco</span>
                        <span>5 — Muito desenvolvido</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </section>

          {/* RADAR + LEGENDA */}
          <aside className="sidebar">
            <div className="card radar-card">
              <h2>Radar de Prontidão</h2>
              <div className="radar-wrapper">
                <Radar data={radarData} options={radarOptions} />
              </div>
            </div>

            <div className="card">
              <h3>Interpretação rápida</h3>
              <ul className="legend-list">
                <li>
                  <strong>0–1,5</strong> — Crítico: barreiras sérias para entrar
                  na Defesa.
                </li>
                <li>
                  <strong>1,6–2,5</strong> — Fraco: precisa de reforço urgente.
                </li>
                <li>
                  <strong>2,6–3,5</strong> — Moderado: base existente, mas
                  frágil.
                </li>
                <li>
                  <strong>3,6–4,5</strong> — Bom: condições para
                  pilotos/primeiros contratos.
                </li>
                <li>
                  <strong>4,6–5</strong> — Muito bom: pronto para oportunidades
                  mais exigentes.
                </li>
              </ul>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
};

export default App;

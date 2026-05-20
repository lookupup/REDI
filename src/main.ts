import React from "react";
import { createRoot } from "react-dom/client";
import "./styles.css";
import { actionKitById } from "./data/actionKits";
import { badgeById } from "./data/badges";
import { dimensions } from "./data/dimensions";
import { mainResultById } from "./data/mainResults";
import { formalQuestions, hiddenQuestions, q0, type Question, type QuestionOption } from "./data/questions";
import { calculateResult, type Answers, type CalculatedResult } from "./lib/scoring";
import { track } from "./analytics";

type Page = "cover" | "quiz" | "result";
type PopupType = "persona" | "action" | "hidden" | "save" | "share";

type AppState = {
  page: Page;
  questionIndex: number;
  answers: Answers;
  activePopup: PopupType | null;
};

type ResultParts = {
  persona: (typeof mainResultById)[keyof typeof mainResultById];
  actionKit: (typeof actionKitById)[keyof typeof actionKitById];
  badges: Array<(typeof badgeById)[keyof typeof badgeById]>;
};

const h = React.createElement;
const allQuestions: Question[] = [q0, ...formalQuestions, ...hiddenQuestions];

const initialState: AppState = {
  page: "cover",
  questionIndex: 0,
  answers: {},
  activePopup: null
};

const personaImages: Record<string, string> = {
  STAR: new URL("../assets/personas/cutouts/star.png", import.meta.url).toString(),
  WILD: new URL("../assets/personas/cutouts/wild.png", import.meta.url).toString(),
  COACH: new URL("../assets/personas/cutouts/coach.png", import.meta.url).toString(),
  NEWS: new URL("../assets/personas/cutouts/news.png", import.meta.url).toString(),
  INVISIBLE: new URL("../assets/personas/cutouts/invisible.png", import.meta.url).toString(),
  SURPRISE: new URL("../assets/personas/cutouts/surprise.png", import.meta.url).toString(),
  ASSASSIN: new URL("../assets/personas/cutouts/assassin.png", import.meta.url).toString(),
  OWL: new URL("../assets/personas/cutouts/owl.png", import.meta.url).toString()
};

const dimensionSymbols: Record<string, string> = {
  P: "drop",
  E: "radio",
  R: "calendar",
  I: "bell",
  O: "quote",
  D: "notebook"
};

const hiddenSymbols: Record<string, string> = {
  H1: "stone",
  H2: "submarine",
  H3: "cup",
  H4: "megaphone"
};

function App() {
  const [state, setState] = React.useState<AppState>(initialState);

  React.useEffect(() => {
    track("page_view", { page: state.page });
  }, [state.page]);

  const calculatedResult = React.useMemo(
    () => calculateResult(state.answers),
    [state.answers]
  );

  const answerQuestion = (question: Question, option: QuestionOption) => {
    setState((current) => {
      const nextAnswers = { ...current.answers, [question.id]: option.id };
      const isLastQuestion = current.questionIndex >= allQuestions.length - 1;

      track("question_answered", {
        question_id: question.id,
        option_id: option.id,
        question_index: current.questionIndex + 1
      });

      if (isLastQuestion) {
        const result = calculateResult(nextAnswers);
        track("test_completed", {
          main_persona: result.mainPersona.id,
          persona_image_key: result.personaImageKey,
          action_kit: result.actionKit.id,
          badges: result.badges
        });
        return { ...current, answers: nextAnswers, page: "result", activePopup: null };
      }

      return {
        ...current,
        answers: nextAnswers,
        questionIndex: current.questionIndex + 1
      };
    });
  };

  return h(PhoneShell, null,
    state.page === "cover" && h(CoverPage, {
      onStart: () => {
        track("test_start");
        setState((current) => ({ ...current, page: "quiz" }));
      }
    }),
    state.page === "quiz" && h(QuestionPage, {
      question: allQuestions[state.questionIndex],
      index: state.questionIndex,
      total: allQuestions.length,
      onAnswer: answerQuestion
    }),
    state.page === "result" && h(FinalResultPage, {
      calculatedResult,
      activePopup: state.activePopup,
      onOpenPopup: (activePopup: PopupType) => {
        if (activePopup === "save") track("image_generated", { source: "result_page" });
        if (activePopup === "share") track("share_clicked", { source: "result_page" });
        setState((current) => ({ ...current, activePopup }));
      },
      onClosePopup: () => setState((current) => ({ ...current, activePopup: null })),
      onRestart: () => setState(initialState)
    })
  );
}

function PhoneShell({ children }: { children: React.ReactNode }) {
  return h("div", { className: "min-h-screen w-full bg-[#d4d4d4] px-4 py-5 sm:py-8" },
    h("div", { className: "mx-auto min-h-[calc(100vh-2.5rem)] w-full max-w-[430px] overflow-hidden bg-white shadow-soft sm:min-h-[820px]" }, children)
  );
}

function CoverPage({ onStart }: { onStart: () => void }) {
  return h("main", {
    className: "cover-kv relative flex min-h-[calc(100vh-2.5rem)] flex-col justify-end overflow-hidden px-7 pb-8 pt-5 sm:min-h-[820px]",
  },
    h("footer", { className: "relative z-10" },
      h("button", {
        type: "button",
        onClick: onStart,
        className: "font-chill w-full rounded-xl bg-white/95 px-5 py-4 text-[1.1rem] font-semibold text-black shadow-[0_10px_30px_rgba(189,112,173,0.28)] outline-none transition hover:text-redi focus-visible:ring-4 focus-visible:ring-white/70"
      }, "开始测试-START")
    )
  );
}

function PhoneStatus() {
  return h("div", { className: "phone-status", "aria-hidden": "true" },
    h("span", { className: "pl-5 text-[1.3rem]" }, "9:41"),
    h("span", { className: "dynamic-island" }),
    h("span", { className: "status-icons pr-2" },
      h("span", null, "▮▮▮"),
      h("span", null, "∞"),
      h("span", { className: "battery-pill" }, "32")
    )
  );
}

function QuestionPage({
  question,
  index,
  total,
  onAnswer
}: {
  question: Question;
  index: number;
  total: number;
  onAnswer: (question: Question, option: QuestionOption) => void;
}) {
  const progress = Math.round(((index + 1) / total) * 100);
  const dimensionLabel = question.dimension
    ? `${dimensions[question.dimension].name} ${dimensions[question.dimension].chineseName}`
    : question.type === "hidden" ? "隐藏题" : "暖场题｜不计分";
  const symbol = question.type === "hidden"
    ? hiddenSymbols[question.id] || "spark"
    : dimensionSymbols[question.dimension || ""] || "spark";

  return h("main", { className: "flex min-h-[calc(100vh-2.5rem)] flex-col bg-white px-7 pb-8 pt-5 sm:min-h-[820px]" },
    h(PhoneStatus),
    h("header", { className: "mt-7", "aria-label": "答题进度" },
      h("div", { className: "flex items-center justify-between text-xs font-medium text-moss" },
        h("span", null, dimensionLabel),
        h("span", null, `${index + 1}/${total}`)
      ),
      h("div", { className: "mt-3 h-1.5 rounded-full bg-[#e6e6e6]", "aria-hidden": "true" },
        h("div", {
          className: "h-full rounded-full bg-[#76d5de] transition-[width] motion-reduce:transition-none",
          style: { width: `${progress}%` }
        })
      )
    ),
    h("section", { className: "flex flex-1 flex-col justify-center pb-10" },
      h("div", { className: "mb-7 flex items-start gap-4" },
        h(Symbol, { type: symbol, className: "question-icon" }),
        h("p", { className: "font-cn text-left text-[1.08rem] leading-7 text-black" }, `${question.id}. ${question.title}`)
      ),
      h("div", { className: "grid gap-5", role: "list", "aria-label": `${question.id} 选项` },
        question.options.map((option) => h("button", {
          key: option.id,
          type: "button",
          className: "question-option px-5 py-4 text-center text-[0.92rem] leading-relaxed text-black outline-none transition focus-visible:ring-4 focus-visible:ring-[#e9acd3]/50",
          onClick: () => onAnswer(question, option)
        },
          h("span", { className: "font-bold" }, `${option.id}. `),
          option.text,
          h("span", { className: "mt-1 block text-xs text-black/65" }, `预览触发：${badgeLabel(option)}`)
        ))
      )
    ),
    h("p", { className: "font-chill rounded-xl bg-[#76d5de] px-5 py-4 text-center text-[1rem] text-black shadow-[0_12px_30px_rgba(118,213,222,0.3)]" }, "点击任意选项-NEXT PAGE")
  );
}

function badgeLabel(option: QuestionOption) {
  const id = option.triggeredBadges[0];
  return id ? `${badgeById[id].name} · ${id}` : "无触发";
}

function FinalResultPage({
  calculatedResult,
  activePopup,
  onOpenPopup,
  onClosePopup,
  onRestart
}: {
  calculatedResult: CalculatedResult;
  activePopup: PopupType | null;
  onOpenPopup: (type: PopupType) => void;
  onClosePopup: () => void;
  onRestart: () => void;
}) {
  const parts = getResultParts(calculatedResult);
  const personaImage = personaImages[parts.persona.id] || personaImages.STAR;
  const hiddenTitle = parts.badges.length > 1 ? "隐藏标签解读" : parts.badges[0]?.name || "隐藏标签解读";

  return h("main", { className: "result-page relative min-h-[calc(100vh-2.5rem)] overflow-hidden bg-white px-4 pb-7 pt-4 sm:min-h-[820px]" },
    h(PhoneStatus),
    h("section", { className: "relative px-2 pt-6 text-center" },
      h("h1", { className: "font-cn text-[1.65rem] font-semibold text-black" }, "测试结果"),
      h("div", { className: "result-key-elements", "aria-hidden": "true" },
        h("span", { className: "result-pill result-pill-left" }, "✦"),
        h("span", { className: "result-squiggle result-squiggle-left" }, "}"),
        h("span", { className: "result-squiggle result-squiggle-right" }, "{"),
        h("span", { className: "result-bubble" })
      ),
      h("figure", { className: "mx-auto mt-6 flex h-[210px] w-[210px] items-end justify-center rounded-full bg-[#fbf0ed]" },
        h("img", {
          src: personaImage,
          alt: `${parts.persona.name}人格形象`,
          className: "h-[190px] w-[190px] object-contain object-bottom"
        })
      ),
      h("div", { className: "mt-5 flex flex-wrap justify-center gap-2" },
        parts.persona.tags.map((tag) => h("span", { key: tag, className: "result-chip" }, `≋ ${tag}`)),
        calculatedResult.badges.includes("HARD") && h("span", { className: "result-chip" }, "♿ DISABILITY")
      ),
      h("blockquote", { className: "mx-auto mt-5 max-w-[385px] rounded-2xl bg-gradient-to-r from-[#fde3f4] to-[#cdf4f7] px-7 py-5 text-left" },
        h("p", { className: "border-l-4 border-white/80 pl-5 font-cn text-[1.5rem] font-semibold leading-snug text-black" }, `“${parts.persona.declaration}”`)
      )
    ),
    h("section", { className: "relative mt-7 h-[315px]", "aria-label": "结果详情入口" },
      h(TiltCard, { className: "result-stack-card result-card-persona", label: "人格档案", onClick: () => onOpenPopup("persona") }),
      h(TiltCard, { className: "result-stack-card result-card-action", label: "经期行动小锦囊", onClick: () => onOpenPopup("action") }),
      h(TiltCard, { className: "result-stack-card result-card-hidden", label: hiddenTitle, onClick: () => onOpenPopup("hidden") })
    ),
    h("footer", { className: "mt-2 grid grid-cols-2 gap-8 px-2" },
      h("button", {
        type: "button",
        onClick: () => onOpenPopup("save"),
        className: "rounded-lg bg-[#77d8df] px-4 py-4 text-sm text-black outline-none transition hover:-translate-y-0.5 focus-visible:ring-4 focus-visible:ring-[#77d8df]/45"
      }, "button1：一键长图保存"),
      h("button", {
        type: "button",
        onClick: () => onOpenPopup("share"),
        className: "rounded-lg bg-[#77d8df] px-4 py-4 text-sm text-black outline-none transition hover:-translate-y-0.5 focus-visible:ring-4 focus-visible:ring-[#77d8df]/45"
      }, "button2：复制链接分享")
    ),
    h("button", {
      type: "button",
      onClick: onRestart,
      className: "mx-auto mt-4 block text-xs text-black/45 underline underline-offset-4"
    }, "重新测试"),
    activePopup && h(ResultPopup, { type: activePopup, parts, calculatedResult, onClose: onClosePopup })
  );
}

function TiltCard({ className, label, onClick }: { className: string; label: string; onClick: () => void }) {
  return h("button", { type: "button", className, onClick }, h("span", null, label));
}

function getResultParts(calculatedResult: CalculatedResult): ResultParts {
  return {
    persona: mainResultById[calculatedResult.mainPersona.id as keyof typeof mainResultById],
    actionKit: actionKitById[calculatedResult.actionKit.id as keyof typeof actionKitById],
    badges: calculatedResult.badges.map((id) => badgeById[id]).filter(Boolean)
  };
}

function ResultPopup({
  type,
  parts,
  calculatedResult,
  onClose
}: {
  type: PopupType;
  parts: ResultParts;
  calculatedResult: CalculatedResult;
  onClose: () => void;
}) {
  const content = popupContentFor(type, parts, calculatedResult);

  return h("div", { className: "result-modal", role: "dialog", "aria-modal": "true", "aria-labelledby": "result-popup-title" },
    h("button", { type: "button", className: "result-modal-backdrop", "aria-label": "关闭弹窗", onClick: onClose }),
    h("div", { className: "result-popup-elements", "aria-hidden": "true" },
      h("span", { className: "popup-face" }),
      h("span", { className: "popup-bubble" }),
      h("span", { className: "popup-curl popup-curl-left" }, "{"),
      h("span", { className: "popup-curl popup-curl-right" }, "}"),
      h("span", { className: "popup-spark" }, "✦")
    ),
    h("article", { className: "result-popup-card" },
      h("button", { type: "button", className: "result-popup-close", "aria-label": "关闭弹窗", onClick: onClose }, "×"),
      h("p", { className: "text-xs font-bold tracking-[0.16em] text-black/50" }, content.kicker),
      h("h2", { id: "result-popup-title", className: "font-cn mt-2 text-[1.35rem] font-semibold text-black" }, content.title),
      h("div", { className: "mt-5 space-y-3 text-left text-[0.94rem] leading-7 text-black/78" },
        content.body.map((paragraph) => h("p", { key: paragraph }, paragraph))
      ),
      content.tips.length > 0 && h("ul", { className: "mt-5 space-y-2 text-left", "aria-label": "行动建议" },
        content.tips.map((tip) => h("li", { key: tip, className: "rounded-xl bg-white/58 px-4 py-3 text-sm leading-6 text-black/78" }, tip))
      ),
      type === "save" && h("button", {
        type: "button",
        onClick: () => track("image_saved", { persona: calculatedResult.mainPersona.id }),
        className: "mt-5 w-full rounded-xl bg-[#77d8df] px-4 py-3 text-sm font-semibold text-black"
      }, "确认保存")
    )
  );
}

function popupContentFor(type: PopupType, parts: ResultParts, calculatedResult: CalculatedResult) {
  if (type === "persona") {
    return {
      kicker: calculatedResult.personaImageKey,
      title: parts.persona.name,
      body: parts.persona.body,
      tips: [] as string[]
    };
  }

  if (type === "action") {
    return {
      kicker: parts.actionKit.id,
      title: parts.actionKit.name,
      body: parts.actionKit.body,
      tips: [...parts.actionKit.tips]
    };
  }

  if (type === "hidden") {
    const badges = parts.badges.length
      ? parts.badges
      : [{ id: "NONE", name: "暂未触发隐藏标签", body: ["你这次没有触发额外隐藏标签，结果会以主人格和行动锦囊为主。"] }];

    return {
      kicker: badges.map((badge) => badge.id).join(" / "),
      title: "隐藏标签解读",
      body: badges.flatMap((badge) => [badge.name, ...badge.body.slice(0, 2)]),
      tips: [] as string[]
    };
  }

  if (type === "save") {
    return {
      kicker: "LONG IMAGE",
      title: "长图保存",
      body: ["这里会生成你的完整结果长图：包含主人格、隐藏标签、行动锦囊和分享文案。", "当前先预留保存接口，后续可接入 html2canvas 或服务端出图。"],
      tips: [] as string[]
    };
  }

  return {
    kicker: "SHARE",
    title: "复制链接分享",
    body: ["分享接口已预留，正式发布时可以接入真实分享 URL、渠道参数和复制成功提示。"],
    tips: [] as string[]
  };
}

const symbolLabels: Record<string, string> = {
  spark: "星光符号",
  drop: "水滴符号",
  radio: "信号符号",
  calendar: "日历符号",
  bell: "预警符号",
  quote: "引号符号",
  notebook: "笔记本符号",
  stone: "石缝符号",
  submarine: "潜行符号",
  cup: "杯子符号",
  megaphone: "发声符号"
};

const symbolPaths: Record<string, string> = {
  spark: "M48 18 L54 39 L75 45 L55 53 L48 76 L40 54 L20 48 L41 40 Z",
  drop: "M48 17 C61 33 70 47 70 60 C70 73 60 82 48 82 C36 82 26 73 26 60 C26 47 35 33 48 17 Z",
  radio: "M25 44 H71 V72 H25 Z M34 55 H45 M58 58 A7 7 0 1 0 58 57 M35 24 L61 39",
  calendar: "M25 27 H71 V74 H25 Z M25 41 H71 M36 21 V32 M60 21 V32 M38 53 H39 M55 53 H56 M38 64 H39 M55 64 H56",
  bell: "M31 63 H65 L60 55 V42 C60 33 55 27 48 27 C41 27 36 33 36 42 V55 Z M43 70 C45 74 51 74 53 70",
  quote: "M35 34 C29 39 27 46 29 57 H40 C41 47 39 40 35 34 Z M58 34 C52 39 50 46 52 57 H63 C64 47 62 40 58 34 Z",
  notebook: "M31 21 H67 V75 H31 Z M25 31 H37 M25 43 H37 M25 55 H37 M25 67 H37 M43 34 H59 M43 47 H59",
  stone: "M28 61 L35 34 L53 23 L71 40 L65 65 L45 76 Z",
  submarine: "M23 55 C31 40 65 40 73 55 C65 69 31 69 23 55 Z M38 43 V31 H52 M45 31 V22 M37 56 H38 M48 56 H49 M59 56 H60",
  cup: "M30 27 H61 L57 70 H34 Z M61 38 H72 C72 52 65 58 58 58",
  megaphone: "M22 53 H36 L66 36 V70 L36 57 H22 Z M36 57 L41 73 M72 45 L80 38 M74 55 H84 M72 65 L80 72"
};

function Symbol({ type = "spark", className = "" }: { type?: string; className?: string }) {
  return h("svg", {
    className,
    role: "img",
    "aria-label": symbolLabels[type] || "装饰符号",
    viewBox: "0 0 96 96",
    fill: "none",
    xmlns: "http://www.w3.org/2000/svg"
  },
    h("circle", { cx: "48", cy: "48", r: "44", fill: "currentColor", opacity: "0.12" }),
    h("path", {
      d: symbolPaths[type] || symbolPaths.spark,
      stroke: "currentColor",
      strokeWidth: "5",
      strokeLinecap: "round",
      strokeLinejoin: "round"
    })
  );
}

createRoot(document.getElementById("root") as HTMLElement).render(h(App));

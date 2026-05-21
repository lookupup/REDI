import React from "react";
import { createRoot } from "react-dom/client";
import html2canvas from "html2canvas";
import "./styles.css";
import { actionKitById } from "./data/actionKits";
import { badgeById } from "./data/badges";
import { cover } from "./data/cover";
import { dimensions } from "./data/dimensions";
import { mainResultById } from "./data/mainResults";
import { formalQuestions, hiddenQuestions, q0, type Question, type QuestionOption } from "./data/questions";
import { calculateResult, type Answers, type CalculatedResult } from "./lib/scoring";
import { track } from "./analytics";

type Page = "cover" | "quiz" | "result";
type PopupType = "persona" | "action" | "hidden" | "save";
type SpecialResultId = "BLANK" | "ALLY" | "FREE";

type AppState = {
  page: Page;
  questionIndex: number;
  answers: Answers;
  activePopup: PopupType | null;
  specialResultId: SpecialResultId | null;
};

type ResultParts = {
  persona: (typeof mainResultById)[keyof typeof mainResultById];
  actionKit: (typeof actionKitById)[keyof typeof actionKitById];
  badges: Array<(typeof badgeById)[keyof typeof badgeById]>;
};

const h = React.createElement;
const chipIcons = ["✷", "✦", "✧", "✹"];
const allQuestions: Question[] = [q0, ...formalQuestions, ...hiddenQuestions];
const homePadImage = new URL("../assets/reference/home-pad-labeled.png", import.meta.url).toString();
const q0DropImage = new URL("../assets/reference/q0-drop.png", import.meta.url).toString();
const publicAsset = (path: string) => `${import.meta.env.BASE_URL}${path}`;
const specialResultImage = publicAsset("images/personas/common.png");
const coverStartButtonImage = new URL("../assets/reference/cover-start-button.png", import.meta.url).toString();

const initialState: AppState = {
  page: "cover",
  questionIndex: 0,
  answers: {},
  activePopup: null,
  specialResultId: null
};

const q0SpecialResults: Record<string, SpecialResultId> = {
  A: "BLANK",
  E: "ALLY",
  F: "FREE"
};

const specialResults: Record<SpecialResultId, { name: string; englishName: string; body: string }> = {
  BLANK: {
    name: "潜力新星",
    englishName: "BLANK",
    body: "你正站在名为“成长”的后台，听着序曲，带着对未知的一丝好奇。属于你的剧本还是一片干净的留白，别着急，你的精彩开场，永远值得期待。"
  },
  ALLY: {
    name: "月经同盟",
    englishName: "ALLY",
    body: "你虽不登台，但你能成为最坚实的后援，你用理解与行动，为身边人的每一种状态撑腰。"
  },
  FREE: {
    name: "狂野艺术家",
    englishName: "FREE",
    body: "有些身体不以周期为线索。有些经历本就不同于主流叙事。\n你的身体不需要符合任何模板，它自有风景。"
  }
};

const personaImages: Record<string, string> = {
  STAR: publicAsset("images/personas/STAR.png"),
  STAR_HARD: publicAsset("images/personas/STAR_HARD.png"),
  WILD: publicAsset("images/personas/WILD.png"),
  WILD_HARD: publicAsset("images/personas/WILD_HARD.png"),
  COACH: publicAsset("images/personas/COACH.png"),
  COACH_HARD: publicAsset("images/personas/COACH_HARD.png"),
  NEWS: publicAsset("images/personas/NEWS.png"),
  NEWS_HARD: publicAsset("images/personas/NEWS_HARD.png"),
  INVISIBLE: publicAsset("images/personas/INVISIBLE.png"),
  INVISIBLE_HARD: publicAsset("images/personas/INVISIBLE_HARD.png"),
  // TODO: Confirm whether the project persona id SURPRISE should permanently use the RANGER image assets.
  SURPRISE: publicAsset("images/personas/RANGER.png"),
  SURPRISE_HARD: publicAsset("images/personas/RANGER_HARD.png"),
  ASSASSIN: publicAsset("images/personas/ASSASSIN.png"),
  ASSASSIN_HARD: publicAsset("images/personas/ASSASSIN_HARD.png"),
  OWL: publicAsset("images/personas/OWL.png"),
  OWL_HARD: publicAsset("images/personas/OWL_HARD.png")
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
      const specialResultId = question.id === q0.id ? q0SpecialResults[option.id] : null;
      const isLastQuestion = current.questionIndex >= allQuestions.length - 1;

      track("question_answered", {
        question_id: question.id,
        option_id: option.id,
        question_index: current.questionIndex + 1
      });

      if (specialResultId) {
        track("test_completed", {
          special_result: specialResultId,
          q0_option_id: option.id
        });
        return {
          ...current,
          answers: nextAnswers,
          page: "result",
          activePopup: null,
          specialResultId
        };
      }

      if (isLastQuestion) {
        const result = calculateResult(nextAnswers);
        track("test_completed", {
          main_persona: result.mainPersona.id,
          persona_image_key: result.personaImageKey,
          action_kit: result.actionKit.id,
          badges: result.badges
        });
        return { ...current, answers: nextAnswers, page: "result", activePopup: null, specialResultId: null };
      }

      return {
        ...current,
        answers: nextAnswers,
        questionIndex: current.questionIndex + 1,
        specialResultId: null
      };
    });
  };

  const goToPreviousQuestion = () => {
    setState((current) => ({
      ...current,
      questionIndex: Math.max(current.questionIndex - 1, 0)
    }));
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
      selectedAnswer: state.answers[allQuestions[state.questionIndex].id],
      onAnswer: answerQuestion,
      onBack: goToPreviousQuestion
    }),
    state.page === "result" && state.specialResultId && h(SpecialResultPage, {
      result: specialResults[state.specialResultId],
      onRestart: () => setState(initialState)
    }),
    state.page === "result" && !state.specialResultId && h(FinalResultPage, {
      calculatedResult,
      activePopup: state.activePopup,
      onOpenPopup: (activePopup: PopupType) => {
        if (activePopup === "save") track("image_generated", { source: "result_page" });
        setState((current) => ({ ...current, activePopup }));
      },
      onClosePopup: () => setState((current) => ({ ...current, activePopup: null })),
      onRestart: () => setState(initialState)
    })
  );
}

function PhoneShell({ children }: { children: React.ReactNode }) {
  return h("div", { className: "app-shell w-full bg-white" },
    h("div", { className: "app-shell w-full overflow-hidden bg-white" }, children)
  );
}

function CoverPage({ onStart }: { onStart: () => void }) {
  return h("main", {
    className: "new-cover relative flex flex-col items-center overflow-hidden px-9 text-center",
  },
    h("section", { className: "relative z-10" },
      h("h1", { className: "text-[1.82rem] font-bold leading-tight text-black" },
        h("span", { className: "font-en" }, "REDI："),
        h("span", { className: "font-cn" }, "测测你的月经人格")
      ),
      h("p", { className: "mt-3 text-[1.32rem] leading-tight text-black/82" },
        h("span", { className: "font-cn" }, "你的月经，比"),
        h("span", { className: "font-en" }, "MBTI"),
        h("span", { className: "font-cn" }, "更懂你")
      )
    ),
    h("section", { className: "cover-hero-mark", "aria-hidden": "true" },
      h("img", { src: homePadImage, alt: "", className: "cover-hero-image" })
    ),
    h("button", {
      type: "button",
      onClick: onStart,
      className: "cover-start-button",
      "aria-label": cover.cta
    },
      h("img", { src: coverStartButtonImage, alt: "", className: "cover-start-image" })
    ),
    h("section", { className: "cover-copy relative z-10 text-black/82" },
      h("p", null, "你有没有想过，月经其实是一位我们的老朋友？", h("br"), "TA有时准时，有时随性；", h("br"), "有时声势浩大，有时安静路过；", h("br"), "有时给你带来能量，有时让你只想躺平。"),
      h("p", null, "你的身体，一直有话说。"),
      h("p", null, "这是一个关于你的“月经人格”的小测试。", h("br"), "里面有一点自我觉察，一点冷知识，", h("br"), "还有一点\"原来不只我这样\"。")
    )
  );
}

function PhoneStatus() {
  return h("div", { className: "phone-status-spacer", "aria-hidden": "true" });
}

function QuestionPage({
  question,
  index,
  total,
  selectedAnswer,
  onAnswer,
  onBack
}: {
  question: Question;
  index: number;
  total: number;
  selectedAnswer?: string;
  onAnswer: (question: Question, option: QuestionOption) => void;
  onBack: () => void;
}) {
  const progress = Math.round(((index + 1) / total) * 100);
  const dimensionLabel = question.dimension
    ? dimensions[question.dimension].chineseName
    : question.type === "hidden" ? "隐藏题" : "暖场题｜不计分";
  const symbol = question.type === "hidden"
    ? hiddenSymbols[question.id] || "spark"
    : dimensionSymbols[question.dimension || ""] || "spark";
  const isWarmup = question.id === q0.id;

  return h("main", { className: `question-page ${isWarmup ? "question-page-warmup" : ""} flex flex-col bg-white px-7 pb-8 pt-5` },
    index > 0 && h("button", {
      type: "button",
      onClick: onBack,
      className: "question-back",
      "aria-label": "返回上一题"
    }, "←"),
    h(PhoneStatus),
    h("header", { className: "question-header mt-7", "aria-label": "答题进度" },
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
    h("section", { className: "question-body flex flex-1 flex-col justify-center pb-10" },
      h("div", { className: "question-title-row mb-7 flex items-center gap-4" },
        h(Symbol, { type: symbol, className: "question-icon" }),
        h("p", { className: "font-cn text-left text-[1.08rem] leading-7 text-black" }, `${question.id}. ${question.title}`)
      ),
      h("div", { className: "grid gap-5", role: "list", "aria-label": `${question.id} 选项` },
        question.options.map((option) => h("button", {
          key: option.id,
          type: "button",
          className: `question-option px-5 py-4 text-center leading-relaxed text-black outline-none transition focus-visible:ring-4 focus-visible:ring-[#9CA8B5]/35 ${selectedAnswer === option.id ? "question-option-selected" : ""}`,
          onClick: () => onAnswer(question, option),
          "aria-pressed": selectedAnswer === option.id
        },
          option.text
        ))
      ),
      isWarmup && h("div", { className: "q0-illustration", "aria-hidden": "true" },
        h("img", { src: q0DropImage, alt: "", className: "q0-drop-image" })
      )
    )
  );
}

function badgeLabel(option: QuestionOption) {
  const id = option.triggeredBadges[0];
  return id ? `${badgeById[id].name} · ${id}` : "无触发";
}

function useShareFeedback() {
  const [showCopiedFeedback, setShowCopiedFeedback] = React.useState(false);
  const copiedTimerRef = React.useRef<number | null>(null);

  React.useEffect(() => () => {
    if (copiedTimerRef.current) window.clearTimeout(copiedTimerRef.current);
  }, []);

  const shareResult = async () => {
    track("share_clicked", { source: "result_page" });

    try {
      await navigator.clipboard?.writeText(window.location.href);
    } catch {
      // Some in-app browsers block clipboard access; the button still confirms the attempted share action.
    }

    setShowCopiedFeedback(true);
    if (copiedTimerRef.current) window.clearTimeout(copiedTimerRef.current);
    copiedTimerRef.current = window.setTimeout(() => setShowCopiedFeedback(false), 3000);
  };

  return { showCopiedFeedback, shareResult };
}

function SpecialResultPage({
  result,
  onRestart
}: {
  result: { name: string; englishName: string; body: string };
  onRestart: () => void;
}) {
  const { showCopiedFeedback, shareResult } = useShareFeedback();

  return h("main", { className: "special-result-page result-page relative overflow-y-auto bg-white px-4 pb-7 pt-4" },
    h(PhoneStatus),
    h("section", { className: "relative mx-auto max-w-[430px] px-2 pt-6 text-center" },
      h("h1", { className: "result-title font-cn font-semibold text-black" }, `${result.name} ${result.englishName}`),
      h("div", { className: "result-key-elements special-key-elements", "aria-hidden": "true" },
        h("span", { className: "result-pill result-pill-left" }, "✦"),
        h("span", { className: "result-squiggle result-squiggle-left" }, "}"),
        h("span", { className: "result-squiggle result-squiggle-right" }, "{"),
        h("span", { className: "result-bubble" })
      ),
      h("figure", { className: "special-avatar-wrap mx-auto mt-5 flex items-center justify-center rounded-full bg-[#fbf0ed]" },
        h("img", {
          src: specialResultImage,
          alt: `${result.name} ${result.englishName}人格形象`,
          className: "special-avatar object-contain"
        })
      )
    ),
    h("section", { className: "special-result-card mx-auto" },
      h("h2", { className: "font-cn" }, "人格档案"),
      h("p", null, result.body)
    ),
    h("footer", { className: "mx-auto mt-6 max-w-[210px]" },
      h("button", {
        type: "button",
        onClick: shareResult,
        className: `result-footer-button result-footer-share w-full rounded-lg px-4 py-4 text-sm font-medium text-black outline-none transition hover:-translate-y-0.5 focus-visible:ring-4 focus-visible:ring-[#f264c5]/45 ${showCopiedFeedback ? "result-footer-button-copied" : ""}`
      }, showCopiedFeedback ? "✅已复制" : "复制链接分享")
    ),
    h("button", {
      type: "button",
      onClick: onRestart,
      className: "mx-auto mt-4 block text-xs text-black/45 underline underline-offset-4"
    }, "重新测试")
  );
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
  const personaImage = personaImages[calculatedResult.personaImageKey] || personaImages[parts.persona.id] || personaImages.STAR;
  const hiddenTitle = parts.badges.length > 1 ? "特别勋章解读" : parts.badges[0]?.name || "特别勋章解读";
  const { showCopiedFeedback, shareResult } = useShareFeedback();

  return h("main", { className: "result-page relative min-h-screen overflow-y-auto bg-white px-4 pb-7 pt-4" },
    h(PhoneStatus),
    h("section", { className: "relative mx-auto max-w-[430px] px-2 pt-6 text-center" },
      h("h1", { className: "result-title font-cn font-semibold text-black" }, `${parts.persona.name} ${parts.persona.englishName}`),
      h("div", { className: "result-key-elements", "aria-hidden": "true" },
        h("span", { className: "result-pill result-pill-left" }, "✦"),
        h("span", { className: "result-squiggle result-squiggle-left" }, "}"),
        h("span", { className: "result-squiggle result-squiggle-right" }, "{"),
        h("span", { className: "result-bubble" })
      ),
      h("figure", { className: "result-avatar-wrap mx-auto mt-5 flex h-[184px] w-[184px] items-center justify-center rounded-full bg-[#fbf0ed]" },
        h("img", {
          src: personaImage,
          alt: `${parts.persona.name}人格形象`,
          className: "result-avatar"
        })
      ),
      h("div", { className: "result-chip-row mt-5 flex flex-wrap justify-center" },
        parts.persona.tags.map((tag, index) => h("span", { key: tag, className: "result-chip" },
          h("span", { className: "result-chip-icon", "aria-hidden": "true" }, chipIcons[index % chipIcons.length]),
          tag
        )),
        calculatedResult.badges.includes("HARD") && h("span", { className: "result-chip" },
          h("span", { className: "result-chip-icon", "aria-hidden": "true" }, chipIcons[3]),
          "DISABILITY"
        )
      ),
      h("blockquote", { className: "mx-auto mt-5 max-w-[372px] rounded-2xl bg-gradient-to-r from-[#fde3f4] to-[#cdf4f7] px-7 py-5 text-left" },
        h("p", { className: "border-l-4 border-white/80 pl-5 font-cn text-[1.5rem] font-semibold leading-snug text-black" }, `“${parts.persona.declaration}”`)
      )
    ),
    h("section", { className: "result-card-stack relative mx-auto mt-5", "aria-label": "结果详情入口" },
      h(TiltCard, { className: "result-stack-card result-card-persona", label: "人格档案", onClick: () => onOpenPopup("persona") }),
      h(TiltCard, { className: "result-stack-card result-card-action", label: "经期行动小锦囊", onClick: () => onOpenPopup("action") }),
      h(TiltCard, { className: "result-stack-card result-card-hidden", label: hiddenTitle, onClick: () => onOpenPopup("hidden") })
    ),
    h("footer", { className: "mx-auto mt-2 grid max-w-[410px] grid-cols-2 gap-6 px-3" },
      h("button", {
        type: "button",
        onClick: () => onOpenPopup("save"),
        className: "result-footer-button rounded-lg px-4 py-4 text-sm font-medium text-black outline-none transition hover:-translate-y-0.5 focus-visible:ring-4 focus-visible:ring-[#77d8df]/45"
      }, "一键长图保存"),
      h("button", {
        type: "button",
        onClick: shareResult,
        className: `result-footer-button result-footer-share rounded-lg px-4 py-4 text-sm font-medium text-black outline-none transition hover:-translate-y-0.5 focus-visible:ring-4 focus-visible:ring-[#f264c5]/45 ${showCopiedFeedback ? "result-footer-button-copied" : ""}`
      }, showCopiedFeedback ? "✅已复制" : "复制链接分享")
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
  if (type === "save") {
    return h(SaveImagePopup, { parts, calculatedResult, onClose });
  }

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
        content.body.map((paragraph) => {
          const isBadgeTitle = type === "hidden" && parts.badges.some((badge) => badge.name === paragraph);
          return h("p", { key: paragraph, className: isBadgeTitle ? "result-popup-badge-title" : undefined }, paragraph);
        })
      ),
      content.tips.length > 0 && h("ul", { className: "mt-5 space-y-2 text-left", "aria-label": "行动建议" },
        content.tips.map((tip) => h("li", { key: tip, className: "rounded-xl bg-white/58 px-4 py-3 text-sm leading-6 text-black/78" }, tip))
      ),
    )
  );
}

function SaveImagePopup({
  parts,
  calculatedResult,
  onClose
}: {
  parts: ResultParts;
  calculatedResult: CalculatedResult;
  onClose: () => void;
}) {
  const captureRef = React.useRef<HTMLElement | null>(null);
  const personaImage = personaImages[calculatedResult.personaImageKey] || personaImages[parts.persona.id] || personaImages.STAR;
  const badges = parts.badges.length
    ? parts.badges
    : [{ id: "NONE", name: "暂未触发特别勋章", declaration: "这次没有触发额外特别勋章。", body: ["你这次没有触发额外特别勋章，结果会以主人格和行动锦囊为主。"] }];

  const saveImage = async () => {
    if (!captureRef.current) return;

    const canvas = await html2canvas(captureRef.current, {
      backgroundColor: "#ffffff",
      scale: Math.min(window.devicePixelRatio || 2, 3),
      useCORS: true
    });
    const url = canvas.toDataURL("image/png");
    const link = document.createElement("a");
    link.href = url;
    link.download = `REDI-${calculatedResult.personaImageKey}.png`;
    link.click();
    track("image_saved", { persona: calculatedResult.mainPersona.id });
  };

  return h("div", { className: "result-modal save-modal", role: "dialog", "aria-modal": "true", "aria-labelledby": "save-popup-title" },
    h("button", { type: "button", className: "result-modal-backdrop", "aria-label": "关闭弹窗", onClick: onClose }),
    h("div", { className: "save-popup-elements", "aria-hidden": "true" },
      h("span", { className: "popup-curl popup-curl-left" }, "{"),
      h("span", { className: "popup-curl popup-curl-right" }, "}")
    ),
    h("section", { className: "save-popup-shell" },
      h("button", { type: "button", className: "result-popup-close save-popup-close", "aria-label": "关闭弹窗", onClick: onClose }, "×"),
      h("div", { className: "save-popup-scroll" },
        h("article", { ref: captureRef, className: "save-long-card" },
          h("figure", { className: "save-avatar-wrap" },
            h("img", {
              src: personaImage,
              alt: `${parts.persona.name}人格形象`,
              className: "save-avatar"
            })
          ),
          h("div", { className: "save-chip-row" },
            parts.persona.tags.map((tag) => h("span", { key: tag, className: "result-chip" }, `≋ ${tag}`)),
            calculatedResult.badges.includes("HARD") && h("span", { className: "result-chip" }, "♿ DISABILITY")
          ),
          h("h1", { id: "save-popup-title", className: "save-quote" }, `“${parts.persona.declaration}”`),
          h("section", { className: "save-section" },
            h("h2", null, "人格档案"),
            parts.persona.body.map((paragraph) => h("p", { key: paragraph }, paragraph))
          ),
          h("section", { className: "save-section" },
            h("h2", null, "经期行动小锦囊"),
            h("p", null, parts.actionKit.declaration),
            parts.actionKit.body.map((paragraph) => h("p", { key: paragraph }, paragraph)),
            h("ul", null, parts.actionKit.tips.map((tip) => h("li", { key: tip }, tip)))
          ),
          h("section", { className: "save-section" },
            h("h2", null, "特别勋章解读"),
          ),
          badges.map((badge) => h("section", { key: badge.id, className: "save-section save-badge-card" },
              h("h3", null, badge.name),
              h("p", null, badge.declaration),
              badge.body.map((paragraph) => h("p", { key: paragraph }, paragraph))
          )),
          h("footer", { className: "save-card-footer" }, "REDI 月经人格测试 · 你的完整结果长图")
        )
      ),
      h("button", { type: "button", className: "save-download-button", onClick: saveImage },
        h("span", { className: "download-icon", "aria-hidden": "true" },
          h("svg", { viewBox: "0 0 24 24", fill: "none" },
            h("path", { d: "M12 3v11m0 0 4-4m-4 4-4-4M5 17v3h14v-3", stroke: "currentColor", strokeWidth: "2.2", strokeLinecap: "round", strokeLinejoin: "round" })
          )
        ),
        "保存到本地"
      )
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
      : [{ id: "NONE", name: "暂未触发特别勋章", body: ["你这次没有触发额外特别勋章，结果会以主人格和行动锦囊为主。"] }];

    return {
      kicker: badges.map((badge) => badge.id).join(" / "),
      title: "特别勋章解读",
      body: badges.flatMap((badge) => [badge.name, ...badge.body.slice(0, 2)]),
      tips: [] as string[]
    };
  }

  return {
    kicker: "LONG IMAGE",
    title: "长图保存",
    body: ["这里会生成你的完整结果长图：包含主人格、特别勋章、行动锦囊和分享文案。"],
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

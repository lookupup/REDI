import { actionKitById } from "../data/actionKits";
import type { BadgeId } from "../data/badges";
import { dimensionMaxScores, DIMENSION_IDS, type DimensionId } from "../data/dimensions";
import { mainResultById, perPersonaMap } from "../data/mainResults";
import { questionById } from "../data/questions";

export type Answers = Record<string, string>;

export type CalculatedResult = {
  dimensionScores: Record<DimensionId, number>;
  dimensionPercentages: Record<DimensionId, number>;
  mainPersona: {
    id: string;
    name: string;
    englishName: string;
  };
  personaImageKey: string;
  actionKit: {
    id: string;
    name: string;
  };
  badges: BadgeId[];
};

const zeroScores = (): Record<DimensionId, number> =>
  Object.fromEntries(DIMENSION_IDS.map((id) => [id, 0])) as Record<DimensionId, number>;

const getSelectedOption = (questionId: string, optionId: string) => {
  const question = questionById[questionId];
  return question?.options.find((option) => option.id === optionId);
};

const toArrow = (score: number, threshold: number) => (score >= threshold ? "↑" : "↓");

export function calculateResult(answers: Answers): CalculatedResult {
  const dimensionScores = zeroScores();
  const badgeSet = new Set<BadgeId>();

  for (const [questionId, optionId] of Object.entries(answers)) {
    const selectedOption = getSelectedOption(questionId, optionId);
    if (!selectedOption) continue;

    if (selectedOption.dimension && typeof selectedOption.score === "number") {
      dimensionScores[selectedOption.dimension] += selectedOption.score;
    }

    for (const badgeId of selectedOption.triggeredBadges) {
      badgeSet.add(badgeId);
    }
  }

  const perKey = [
    toArrow(dimensionScores.P, 6),
    toArrow(dimensionScores.E, 5),
    toArrow(dimensionScores.R, 5)
  ].join("") as keyof typeof perPersonaMap;
  const mainPersonaId = perPersonaMap[perKey];
  const mainPersonaSource = mainResultById[mainPersonaId];
  const mainPersona = {
    id: mainPersonaSource.id,
    name: mainPersonaSource.name,
    englishName: mainPersonaSource.englishName
  };

  const actionScores = [
    { id: "I" as const, score: dimensionScores.I },
    { id: "O" as const, score: dimensionScores.O },
    { id: "D" as const, score: dimensionScores.D }
  ];
  const sortedActionScores = [...actionScores].sort((a, b) => b.score - a.score);
  const highest = sortedActionScores[0].score;
  const secondHighest = sortedActionScores[1].score;
  const isFreeFlow = highest <= 3 || highest - secondHighest <= 1;

  const actionKitId = isFreeFlow
    ? "FREE_FLOW"
    : actionScores.reduce((winner, current) =>
        current.score > winner.score ? current : winner
      ).id;
  const actionKitSource = actionKitById[actionKitId];
  const actionKit = {
    id: actionKitSource.id,
    name: actionKitSource.name
  };

  const badges = [...badgeSet];
  const personaImageKey = badgeSet.has("HARD")
    ? `${mainPersona.id}_HARD`
    : mainPersona.id;

  const dimensionPercentages = Object.fromEntries(
    DIMENSION_IDS.map((id) => [
      id,
      Math.round((dimensionScores[id] / dimensionMaxScores[id]) * 100)
    ])
  ) as Record<DimensionId, number>;

  return {
    dimensionScores,
    dimensionPercentages,
    mainPersona,
    personaImageKey,
    actionKit,
    badges
  };
}

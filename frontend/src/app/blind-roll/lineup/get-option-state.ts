import type { Phase } from "../types";

type OptionStateInput = {
  phase: Phase;
  selected: boolean;
  isAnswer: boolean;
};

type OptionState = {
  label: string;
  labelClass: string;
  markerClass: string;
  optionClass: string;
};

export function getOptionState({ phase, selected, isAnswer }: OptionStateInput): OptionState {
  const revealedCorrect = phase === "revealed" && isAnswer;
  const revealedWrong = phase === "revealed" && selected && !isAnswer;

  if (revealedCorrect) return getCorrectOptionState();
  if (revealedWrong) return getWrongOptionState();
  if (selected) return getSelectedOptionState();
  return getCandidateOptionState();
}

function getCorrectOptionState(): OptionState {
  return {
    label: "Correct",
    labelClass: "text-[#D4AF37]",
    markerClass: "border-[#4ade80] bg-[#4ade80] text-[#07110b]",
    optionClass: "border-[#4ade80] bg-[#4ade80]/12 shadow-[0_0_34px_rgba(74,222,128,0.18)]",
  };
}

function getWrongOptionState(): OptionState {
  return {
    label: "Your pick",
    labelClass: "text-[#D4AF37]",
    markerClass: "border-[#e8453c] bg-[#e8453c] text-[#F5F5F0]",
    optionClass: "border-[#e8453c] bg-[#e8453c]/10 shadow-[0_0_34px_rgba(232,69,60,0.12)]",
  };
}

function getSelectedOptionState(): OptionState {
  return {
    label: "Selected suspect",
    labelClass: "border border-[#D4AF37]/40 bg-[#D4AF37]/12 px-2 py-0.5 text-[#f3d76a]",
    markerClass: "border-[#D4AF37] bg-[#D4AF37] text-[#09090f]",
    optionClass:
      "border-[#D4AF37] bg-[linear-gradient(135deg,rgba(212,175,55,0.18),rgba(232,69,60,0.08))] shadow-[0_0_42px_rgba(212,175,55,0.22)]",
  };
}

function getCandidateOptionState(): OptionState {
  return {
    label: "Candidate",
    labelClass: "text-[#a0a0b5]",
    markerClass: "border-[#3a3a53] bg-[#10101b] text-[#D4AF37] group-hover:border-[#D4AF37]/60",
    optionClass: "border-[#2a2a3e] bg-[#09090f] hover:border-[#e8453c]/60 hover:bg-[#141421]",
  };
}

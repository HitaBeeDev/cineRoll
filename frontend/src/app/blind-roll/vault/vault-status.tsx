type VaultStatusProps = {
  selected: boolean;
};

export function VaultStatus({ selected }: VaultStatusProps) {
  return (
    <div className="mt-3 min-h-5 text-center">
      <p className="text-xs text-[#c4c4d2]">
        {selected ? "Ready to reveal the hidden film." : "Select a suspect to reveal the answer."}
      </p>
    </div>
  );
}

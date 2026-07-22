export async function readNdjson(
  stream: ReadableStream<Uint8Array>,
  onValue: (value: unknown) => void,
): Promise<void> {
  const reader = stream.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    buffer = emitCompleteLines(buffer, onValue);
  }

  buffer += decoder.decode();
  emitTrailingLine(buffer, onValue);
}

function emitCompleteLines(
  buffer: string,
  onValue: (value: unknown) => void,
): string {
  let remaining = buffer;
  let newlineIndex = remaining.indexOf("\n");

  while (newlineIndex !== -1) {
    emitLine(remaining.slice(0, newlineIndex), onValue);
    remaining = remaining.slice(newlineIndex + 1);
    newlineIndex = remaining.indexOf("\n");
  }
  return remaining;
}

function emitTrailingLine(
  buffer: string,
  onValue: (value: unknown) => void,
): void {
  if (buffer.trim()) emitLine(buffer, onValue);
}

function emitLine(line: string, onValue: (value: unknown) => void): void {
  const trimmedLine = line.trim();
  if (trimmedLine) onValue(JSON.parse(trimmedLine));
}

// Web Worker for processing chatbot logs to OpenAI Fine-Tuning JSONL dataset format

self.onmessage = (e: MessageEvent) => {
  const { rawText } = e.data;
  if (typeof rawText !== 'string') {
    self.postMessage({ error: 'Invalid input payload' });
    return;
  }

  const resultLines: string[] = [];
  let successfulRows = 0;
  let skippedRows = 0;

  // Attempt to parse the entire text block as a single JSON document (Array or Object)
  let parsedJson: any = null;
  let parseSuccess = false;
  try {
    const trimmed = rawText.trim();
    if (trimmed.startsWith('[') || trimmed.startsWith('{')) {
      parsedJson = JSON.parse(trimmed);
      parseSuccess = true;
    }
  } catch (err) {
    // Fail silent and fallback to line-by-line JSONL processing
  }

  if (parseSuccess && parsedJson) {
    if (Array.isArray(parsedJson)) {
      // Check if elements are prompts/episodes or individual messages
      const looksLikeEpisodes = parsedJson.some((item: any) => 
        item && typeof item === 'object' && 
        (item.prompt || item.completion || item.input || item.output || (item.messages && Array.isArray(item.messages)))
      );

      if (looksLikeEpisodes) {
        parsedJson.forEach((item: any) => {
          if (!item || typeof item !== 'object') {
            skippedRows++;
            return;
          }
          if (item.messages && Array.isArray(item.messages)) {
            resultLines.push(JSON.stringify(item));
            successfulRows++;
          } else if (item.prompt && item.completion) {
            resultLines.push(JSON.stringify({
              messages: [
                { role: 'user', content: String(item.prompt) },
                { role: 'assistant', content: String(item.completion) }
              ]
            }));
            successfulRows++;
          } else if (item.input && item.output) {
            resultLines.push(JSON.stringify({
              messages: [
                { role: 'user', content: String(item.input) },
                { role: 'assistant', content: String(item.output) }
              ]
            }));
            successfulRows++;
          } else {
            skippedRows++;
          }
        });
      } else {
        // Treat array as a single chat session consisting of message objects
        const messages: any[] = [];
        parsedJson.forEach((item: any) => {
          if (!item || typeof item !== 'object') return;
          const role = item.role || item.sender || '';
          const content = item.content || item.msg || item.text || '';
          if (role && content) {
            let normRole = 'user';
            if (['assistant', 'bot', 'model', 'system', 'agent'].includes(String(role).toLowerCase())) {
              normRole = 'assistant';
            }
            messages.push({ role: normRole, content: String(content) });
          }
        });

        if (messages.length > 0) {
          resultLines.push(JSON.stringify({ messages }));
          successfulRows = 1;
          skippedRows = parsedJson.length - messages.length;
        } else {
          skippedRows = parsedJson.length;
        }
      }
    } else if (typeof parsedJson === 'object') {
      // Single object conversion
      if (parsedJson.messages && Array.isArray(parsedJson.messages)) {
        resultLines.push(JSON.stringify(parsedJson));
        successfulRows = 1;
      } else if (parsedJson.prompt && parsedJson.completion) {
        resultLines.push(JSON.stringify({
          messages: [
            { role: 'user', content: String(parsedJson.prompt) },
            { role: 'assistant', content: String(parsedJson.completion) }
          ]
        }));
        successfulRows = 1;
      } else if (parsedJson.input && parsedJson.output) {
        resultLines.push(JSON.stringify({
          messages: [
            { role: 'user', content: String(parsedJson.input) },
            { role: 'assistant', content: String(parsedJson.output) }
          ]
        }));
        successfulRows = 1;
      } else {
        skippedRows = 1;
      }
    }
  } else {
    // Fallback: standard line-by-line JSONL parser
    const lines = rawText.split(/\r?\n/);
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;

      try {
        const parsed = JSON.parse(line);
        if (parsed.messages && Array.isArray(parsed.messages)) {
          resultLines.push(JSON.stringify(parsed));
          successfulRows++;
        } else if (parsed.prompt && parsed.completion) {
          resultLines.push(JSON.stringify({
            messages: [
              { role: 'user', content: String(parsed.prompt) },
              { role: 'assistant', content: String(parsed.completion) }
            ]
          }));
          successfulRows++;
        } else if (parsed.input && parsed.output) {
          resultLines.push(JSON.stringify({
            messages: [
              { role: 'user', content: String(parsed.input) },
              { role: 'assistant', content: String(parsed.output) }
            ]
          }));
          successfulRows++;
        } else {
          skippedRows++;
        }
      } catch (err) {
        skippedRows++;
      }
    }
  }

  const outputJsonl = resultLines.join('\n');
  self.postMessage({
    outputJsonl,
    successfulRows,
    skippedRows
  });
};

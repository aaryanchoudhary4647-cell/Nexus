const LANGUAGE_IDS = {
  javascript: 63, // Node.js
  python: 71,
  java: 62,
  c: 50,
  cpp: 54,
  csharp: 51,
  go: 60,
  rust: 73,
  php: 68,
  ruby: 72,
};


export const executeCode = async (language, sourceCode) => {
    const response = await fetch(
        "https://ce.judge0.com/submissions?wait=true",
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                source_code: sourceCode,
                language_id: LANGUAGE_IDS[language],
            }),
        }
    );

    const result = await response.json();
    return result
}
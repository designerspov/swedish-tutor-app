// Session-level scoring. First-try correct = the word was right on its initial
// presentation this session (re-queued retries don't count toward first-try).

export function scoreSession(results) {
  const total = results.length;
  const firstTry = results.filter((r) => r.firstTryCorrect).length;
  return {
    total,
    firstTry,
    accuracy: total ? Math.round((firstTry / total) * 100) : 0,
    wrong: results.filter((r) => !r.firstTryCorrect),
  };
}

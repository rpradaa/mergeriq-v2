export default async function handler(req, res) {
  // Only allow POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  const { dealName, industry, revenueMultiple, ebitdaMultiple, ebitdaMargin, completionProbability, recommendation } = req.body;

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1000,
        messages: [{
          role: 'user',
          content: `You are a senior M&A analyst at Goldman Sachs. Generate a professional deal analysis memo for:

DEAL: ${dealName}
INDUSTRY: ${industry}
REVENUE MULTIPLE: ${revenueMultiple}×
EBITDA MULTIPLE: ${ebitdaMultiple}×
EBITDA MARGIN: ${ebitdaMargin}%
COMPLETION PROBABILITY: ${completionProbability}%
RECOMMENDATION: ${recommendation}

Write a concise 3-paragraph memo covering:
1. INVESTMENT THESIS: Why this deal makes strategic sense
2. KEY RISKS: Primary concerns that could impact value creation  
3. VALUATION ASSESSMENT: Whether the multiples are reasonable

Keep it professional, data-driven, under 250 words. Use specific numbers. Write in plain prose only — no markdown, no asterisks, no headers.`
        }]
      })
    });

    const data = await response.json();
    const memoText = data.content?.[0]?.text;

    if (!memoText) {
      return res.status(500).json({ error: 'No memo generated' });
    }

    return res.status(200).json({ success: true, memo: memoText });

  } catch (error) {
    console.error('Memo error:', error);
    return res.status(500).json({ error: error.message });
  }
}

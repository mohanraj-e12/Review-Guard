const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { url } = await req.json();

    if (!url) {
      return new Response(
        JSON.stringify({ success: false, error: 'URL is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      return new Response(
        JSON.stringify({ success: false, error: 'AI service not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const FIRECRAWL_API_KEY = Deno.env.get('FIRECRAWL_API_KEY');
    if (!FIRECRAWL_API_KEY) {
      return new Response(
        JSON.stringify({ success: false, error: 'Web scraping service not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Step 1: Use Firecrawl to scrape the product page (handles JS rendering, anti-bot)
    // Extract actual URL from text (users may paste share messages with surrounding text)
    let formattedUrl = url.trim();
    const urlMatch = formattedUrl.match(/https?:\/\/[^\s]+/);
    if (urlMatch) {
      formattedUrl = urlMatch[0];
    } else if (!formattedUrl.startsWith('http://') && !formattedUrl.startsWith('https://')) {
      formattedUrl = `https://${formattedUrl}`;
    }

    console.log('Scraping URL with Firecrawl:', formattedUrl);

    const scrapeResponse = await fetch('https://api.firecrawl.dev/v1/scrape', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${FIRECRAWL_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        url: formattedUrl,
        formats: ['markdown'],
        onlyMainContent: false,
        waitFor: 3000,
      }),
    });

    const scrapeData = await scrapeResponse.json();

    if (!scrapeResponse.ok || !scrapeData.success) {
      console.error('Firecrawl error:', scrapeData);
      
      if (scrapeResponse.status === 402) {
        return new Response(
          JSON.stringify({ success: false, error: 'Web scraping credits exhausted. Please top up your Firecrawl plan.' }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      return new Response(
        JSON.stringify({ success: false, error: 'Could not scrape the product page. Please check the URL and try again.' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const pageContent = scrapeData.data?.markdown || scrapeData.markdown || '';
    const pageMetadata = scrapeData.data?.metadata || scrapeData.metadata || {};

    if (!pageContent || pageContent.length < 50) {
      return new Response(
        JSON.stringify({ success: false, error: 'Could not extract content from this page. The page may be empty or blocked.' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Scraped ${pageContent.length} chars from page: ${pageMetadata.title || 'Unknown'}`);

    // Limit content for AI processing
    const truncatedContent = pageContent.length > 80000 ? pageContent.substring(0, 80000) : pageContent;

    // Step 2: Use AI to extract product info and analyze reviews
    console.log('Analyzing with AI...');
    const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          {
            role: 'system',
            content: `You are an expert product review analyst. You will receive scraped markdown content from a product page.

Your job is to:
1. Extract the PRODUCT INFORMATION (name, price, rating, category, seller)
2. Extract ALL individual REVIEWS visible on the page (reviewer name, rating, date, review text)
3. Analyze the reviews for authenticity and detect fake/manipulated reviews

You MUST respond with ONLY a valid JSON object (no markdown, no code blocks) with this exact structure:
{
  "product": {
    "name": "<product name>",
    "price": "<price as shown>",
    "overallRating": "<overall rating e.g. 4.2/5>",
    "totalRatings": "<total number of ratings/reviews if shown>",
    "category": "<product category>",
    "seller": "<seller/brand name>",
    "platform": "<amazon/flipkart/meesho/myntra/google-play/app-store/other>"
  },
  "reviews": [
    {
      "reviewer": "<reviewer name or anonymous>",
      "rating": <number 1-5 or null>,
      "date": "<review date if available>",
      "title": "<review title if available>",
      "text": "<review text>",
      "verified": <true/false/null>,
      "helpful_votes": <number or null>
    }
  ],
  "verdict": "genuine" | "fake" | "suspicious",
  "confidence": <number 0-100>,
  "totalReviewsFound": <number>,
  "reviewsSummary": "<2-3 sentence summary of what reviews say about the product>",
  "riskFactors": [
    {
      "label": "<short label>",
      "description": "<detailed explanation>",
      "severity": "low" | "medium" | "high",
      "score": <number 0-1>
    }
  ],
  "details": {
    "averageSentiment": "positive" | "negative" | "mixed",
    "ratingDistribution": "<description of rating spread>",
    "reviewPatterns": "<description of patterns found>",
    "suspiciousIndicators": "<what looks suspicious if anything>",
    "genuineIndicators": "<what looks authentic>",
    "timePatterns": "<review date clustering or distribution>",
    "languageQuality": "<assessment of review language quality and diversity>"
  }
}

Analysis criteria for fake review detection:
- Overly generic/vague praise without specific product details
- Templated or repetitive language across reviews
- Unnatural rating distribution (all 5-star or suspicious patterns)
- Reviews that don't mention specific product features
- Signs of incentivized, paid, or bot-generated reviews
- Suspicious clustering of review dates
- Lack of reviewer diversity (similar writing styles)
- Extreme sentiment that doesn't match the rating
- Very short reviews with only superlatives
- Reviews that seem to be about a different product

If you cannot find any reviews, set totalReviewsFound to 0 and explain in reviewsSummary.`
          },
          {
            role: 'user',
            content: `Analyze this product page (URL: ${formattedUrl}, Title: ${pageMetadata.title || 'Unknown'}):\n\n${truncatedContent}`
          }
        ],
        temperature: 0.2,
        max_tokens: 4000,
      }),
    });

    if (!aiResponse.ok) {
      const errText = await aiResponse.text();
      console.error('AI API error:', aiResponse.status, errText);
      
      if (aiResponse.status === 429) {
        return new Response(
          JSON.stringify({ success: false, error: 'AI rate limit reached. Please try again in a moment.' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      if (aiResponse.status === 402) {
        return new Response(
          JSON.stringify({ success: false, error: 'AI credits exhausted. Please add credits in Settings.' }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      return new Response(
        JSON.stringify({ success: false, error: 'AI analysis failed. Please try again.' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const aiData = await aiResponse.json();
    const aiContent = aiData.choices?.[0]?.message?.content;

    if (!aiContent) {
      return new Response(
        JSON.stringify({ success: false, error: 'No analysis result from AI' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Parse AI response
    let analysisResult;
    try {
      let cleanContent = aiContent.trim();
      if (cleanContent.startsWith('```')) {
        cleanContent = cleanContent.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '');
      }
      analysisResult = JSON.parse(cleanContent);
    } catch (parseError) {
      console.error('Failed to parse AI response:', aiContent.substring(0, 500));
      return new Response(
        JSON.stringify({ success: false, error: 'Failed to parse analysis results' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Analysis complete:', analysisResult.verdict, '| Reviews found:', analysisResult.totalReviewsFound);
    return new Response(
      JSON.stringify({ success: true, data: analysisResult }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error analyzing URL:', error);
    return new Response(
      JSON.stringify({ success: false, error: error instanceof Error ? error.message : 'Analysis failed' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

import { useState } from "react";
import { TopNav } from "@/components/TopNav";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import LiquidEther from "@/components/LiquidEther";
import { Loader2, RefreshCw } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import axios from 'axios';

interface CompetitorData {
  company: string;
  employeeSatisfaction?: number;
  culture?: number;
  compensation?: number;
  workLifeBalance?: number;
  ceoRating?: number;
  careerGrowth?: number;
  diversity?: number;
  innovation?: number;
}

interface ParallelResponse {
  url: string;
  title: string;
  content: string;
  metadata?: Record<string, unknown>;
}

interface GeminiAnalysis {
  summary: string;
  competitorComparison: CompetitorData[];
  trends: Array<{
    category: string;
    tmobile: number;
    att: number;
    verizon: number;
    spectrum: number;
  }>;
  insights: string[];
  recommendations: string[];
}

const Admin = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [scrapedData, setScrapedData] = useState<ParallelResponse[]>([]);
  const [analysis, setAnalysis] = useState<GeminiAnalysis | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchCompetitorData = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Step 1: Scrape data using Parallel AI
      console.log("=== STARTING PARALLEL AI DATA EXTRACTION ===");
      console.log("API Endpoint:", 'https://api.parallel.ai/v1beta/extract');
      console.log("Request Headers:", {
        'Content-Type': 'application/json',
        'x-api-key': 't5yTGrOLvVTh22GCh8PPmwY0PUSOrt8wjPnzq3V9',
        'parallel-beta': 'search-extract-2025-10-10'
      });
      console.log("Request Body:", {
        urls: [
          "https://www.comparably.com/companies/spectrum",
          "https://www.comparably.com/companies/att",
          "https://www.comparably.com/companies/verizon",
          "https://www.comparably.com/companies/sprint"
        ],
        excerpts: true,
        full_content: false,
        objective: "Develop a comprehensive report on T-Mobile's market position by scraping data and gathering contextual news coverage about key competitors—including AT&T, Verizon, and Spectrum—to enable accurate benchmarking and strategic insights."
      });

      const backendUrl = (import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001').replace(/\/$/, '');
      console.log("Backend URL:", backendUrl);

      const parallelResponse = await axios.post(
        `${backendUrl}/api/admin/parallel-extract`,
        {
          urls: [
            "https://www.comparably.com/companies/spectrum",
            "https://www.comparably.com/companies/att",
            "https://www.comparably.com/companies/verizon",
            "https://www.comparably.com/companies/sprint"
          ],
          excerpts: true,
          full_content: false,
          objective: "Develop a comprehensive report on T-Mobile's market position by scraping data and gathering contextual news coverage about key competitors—including AT&T, Verizon, and Spectrum—to enable accurate benchmarking and strategic insights."
        }
      );

      console.log("✅ PARALLEL AI RESPONSE RECEIVED");
      console.log("Response Status:", parallelResponse.status);
      console.log("Response Headers:", parallelResponse.headers);
      console.log("Response Data:", JSON.stringify(parallelResponse.data, null, 2));
      setScrapedData(parallelResponse.data);

      // Step 2: Analyze with Gemini AI
      console.log("\n=== STARTING GEMINI AI ANALYSIS ===");

      const geminiApiKey = import.meta.env.VITE_GEMINI_API_KEY || 'AIzaSyDWRwcEGBdynL2bt3VxUCLXcddQi8nH2kM';
      console.log("Gemini API Key loaded:", geminiApiKey ? "✅ Yes (length: " + geminiApiKey.length + ")" : "❌ No");
      console.log("API Key from env:", import.meta.env.VITE_GEMINI_API_KEY ? "✅ Found" : "⚠️ Using fallback");

      const prompt = `You are a strategic business analyst with access to real-time competitive intelligence data. Analyze the following competitor data scraped from Comparably and provide a comprehensive competitive analysis report for T-Mobile.

IMPORTANT INSTRUCTIONS:
1. Extract actual ratings and scores from the scraped data (look for star ratings, percentages, scores out of 100, letter grades)
2. For each company, research their known reputation in each category based on the scraped content and general industry knowledge
3. Generate realistic, varied scores (0-100) for each metric - DO NOT use the same number for all metrics
4. Add natural variation: if a company is strong in one area, they might be weaker in another
5. Use the scraped content to inform your scores (e.g., if it mentions "CEO rating Bottom 10%" or "Culture rated D", adjust scores down; if it mentions awards for diversity or compensation, adjust those scores up)
6. If you find specific ratings in the data (like "3.8/5" or "67/100"), convert and use those
7. DO NOT hallucinate - base all scores on actual data from the scrape or reasonable industry-standard estimates
8. Ensure T-Mobile's scores are competitive but realistic (don't artificially inflate them)

Scraped Data:
${JSON.stringify(parallelResponse.data, null, 2)}

Please provide your analysis in the following JSON format (respond ONLY with valid JSON, no markdown):
{
  "summary": "A 2-3 sentence executive summary of T-Mobile's competitive position based on the scraped data",
  "competitorComparison": [
    {
      "company": "T-Mobile",
      "employeeSatisfaction": <realistic score 0-100 based on data>,
      "culture": <realistic score 0-100 based on data>,
      "compensation": <realistic score 0-100 based on data>,
      "workLifeBalance": <realistic score 0-100 based on data>,
      "ceoRating": <realistic score 0-100 based on data>,
      "careerGrowth": <realistic score 0-100 based on data>,
      "diversity": <realistic score 0-100 based on data>,
      "innovation": <realistic score 0-100 based on data>
    },
    {
      "company": "AT&T",
      "employeeSatisfaction": <realistic varied score>,
      "culture": <realistic varied score>,
      "compensation": <realistic varied score>,
      "workLifeBalance": <realistic varied score>,
      "ceoRating": <realistic varied score>,
      "careerGrowth": <realistic varied score>,
      "diversity": <realistic varied score>,
      "innovation": <realistic varied score>
    },
    {
      "company": "Verizon",
      "employeeSatisfaction": <realistic varied score>,
      "culture": <realistic varied score>,
      "compensation": <realistic varied score>,
      "workLifeBalance": <realistic varied score>,
      "ceoRating": <realistic varied score>,
      "careerGrowth": <realistic varied score>,
      "diversity": <realistic varied score>,
      "innovation": <realistic varied score>
    },
    {
      "company": "Spectrum",
      "employeeSatisfaction": <realistic varied score>,
      "culture": <realistic varied score>,
      "compensation": <realistic varied score>,
      "workLifeBalance": <realistic varied score>,
      "ceoRating": <realistic varied score>,
      "careerGrowth": <realistic varied score>,
      "diversity": <realistic varied score>,
      "innovation": <realistic varied score>
    }
  ],
  "trends": [
    {
      "category": "Customer Satisfaction",
      "tmobile": <score matching competitorComparison>,
      "att": <score matching competitorComparison>,
      "verizon": <score matching competitorComparison>,
      "spectrum": <score matching competitorComparison>
    },
    {
      "category": "Culture",
      "tmobile": <score>,
      "att": <score>,
      "verizon": <score>,
      "spectrum": <score>
    },
    {
      "category": "Compensation",
      "tmobile": <score>,
      "att": <score>,
      "verizon": <score>,
      "spectrum": <score>
    },
    {
      "category": "Work-Life Balance",
      "tmobile": <score>,
      "att": <score>,
      "verizon": <score>,
      "spectrum": <score>
    },
    {
      "category": "CEO Rating",
      "tmobile": <score>,
      "att": <score>,
      "verizon": <score>,
      "spectrum": <score>
    },
    {
      "category": "Career Growth",
      "tmobile": <score>,
      "att": <score>,
      "verizon": <score>,
      "spectrum": <score>
    },
    {
      "category": "Diversity",
      "tmobile": <score>,
      "att": <score>,
      "verizon": <score>,
      "spectrum": <score>
    },
    {
      "category": "Innovation",
      "tmobile": <score>,
      "att": <score>,
      "verizon": <score>,
      "spectrum": <score>
    }
  ],
  "insights": [
    "Data-driven insight about competitive positioning",
    "Insight about specific strengths or weaknesses found in data",
    "Industry trend observation from the scraped data"
  ],
  "recommendations": [
    "Actionable strategic recommendation based on data gaps",
    "Recommendation to leverage competitive advantages found",
    "Suggestion for areas needing improvement based on competitor performance"
  ]
}

CRITICAL: Ensure all scores are varied and realistic. For example, if Spectrum's CEO is rated "Bottom 10%" with "54/100", their ceoRating should be around 54. If Verizon's culture is "3.8/5" (B-), that's approximately 76/100. Extract and convert all available ratings from the scraped data.`;

      console.log("Gemini Prompt:", prompt.substring(0, 500) + "...");
      console.log("Gemini API Endpoint:", `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${geminiApiKey.substring(0, 10)}...`);

      const geminiRequestBody = {
        contents: [{
          parts: [{
            text: prompt
          }]
        }],
        generationConfig: {
          temperature: 0.4,
          topK: 32,
          topP: 1,
          maxOutputTokens: 4096,
        }
      };
      console.log("Gemini Request Config:", JSON.stringify(geminiRequestBody.generationConfig, null, 2));

      const geminiResponse = await axios.post(
        `${backendUrl}/api/admin/gemini-analyze`,
        geminiRequestBody
      );

      console.log("✅ GEMINI AI RESPONSE RECEIVED");
      console.log("Response Status:", geminiResponse.status);
      console.log("Full Gemini Response:", JSON.stringify(geminiResponse.data, null, 2));

      // Extract the text from Gemini response
      console.log("Extracting text from Gemini response...");
      const generatedText = geminiResponse.data.candidates[0].content.parts[0].text;
      console.log("Generated Text (raw):", generatedText);

      // Clean up the response - remove markdown code blocks if present
      console.log("Cleaning up JSON response...");
      const jsonText = generatedText
        .replace(/```json\n?/g, '')
        .replace(/```\n?/g, '')
        .trim();
      console.log("Cleaned JSON Text:", jsonText);

      console.log("Parsing JSON...");
      const analysisData: GeminiAnalysis = JSON.parse(jsonText);
      console.log("✅ JSON PARSED SUCCESSFULLY");
      console.log("Analysis Data:", JSON.stringify(analysisData, null, 2));

      setAnalysis(analysisData);
      console.log("✅ ANALYSIS COMPLETE AND STATE UPDATED");

    } catch (err: unknown) {
      const error = err as Error;
      console.error("❌ ERROR OCCURRED:", error);
      console.error("Error Type:", error.constructor.name);
      console.error("Error Message:", error.message);
      console.error("Error Stack:", error.stack);

      if (err.response) {
        console.error("HTTP Error Response:");
        console.error("  Status:", err.response.status);
        console.error("  Status Text:", err.response.statusText);
        console.error("  Headers:", err.response.headers);
        console.error("  Data:", JSON.stringify(err.response.data, null, 2));
      } else if (err.request) {
        console.error("No Response Received:");
        console.error("  Request:", err.request);
      } else {
        console.error("Request Setup Error:", err.message);
      }

      console.error("Axios Config:", err.config);

      const errorMessage = err.response?.data?.message
        || err.response?.data?.error
        || err.message
        || "An error occurred while fetching data";

      console.error("Final Error Message:", errorMessage);
      setError(errorMessage);
    } finally {
      console.log("=== FETCH COMPLETE (Loading set to false) ===");
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden">
      {/* Full Page Three.js Background */}
      <div className="fixed inset-0 z-0 bg-black">
        <LiquidEther
          colors={['#000000', '#5A0040', '#E20074']}
          mouseForce={20}
          cursorSize={100}
          isViscous={false}
          viscous={30}
          iterationsViscous={32}
          iterationsPoisson={32}
          resolution={0.5}
          isBounce={false}
          autoDemo={true}
          autoSpeed={0.5}
          autoIntensity={2.2}
          takeoverDuration={0.25}
          autoResumeDelay={3000}
          autoRampDuration={0.6}
        />
      </div>

      {/* Gradient Overlay for Depth */}
      <div className="fixed inset-0 z-[1] bg-gradient-to-b from-[#5A0040]/20 via-transparent to-[#E20074]/30 pointer-events-none" />

      <div className="relative z-10 flex flex-col">
        <TopNav />

        <main className="flex-1 relative">
          {/* Hero Section */}
          <section className="py-12">
            <div className="container mx-auto px-4 max-w-7xl">
              <Card className="rounded-2xl border-white/20 shadow-2xl backdrop-blur-xl bg-white/10 hover:bg-white/15 transition-all duration-300">
                <CardHeader>
                  <div className="flex items-center justify-between flex-wrap gap-4">
                    <div>
                      <CardTitle className="text-white text-3xl font-bold">
                        Admin Dashboard - Competitive Intelligence
                      </CardTitle>
                      <CardDescription className="text-white/70 mt-2">
                        AI-powered deep research on T-Mobile's market position against competitors
                      </CardDescription>
                    </div>
                    <Button
                      onClick={fetchCompetitorData}
                      disabled={isLoading}
                      className="px-8 py-6 text-lg bg-gradient-to-r from-[#C5007E] to-[#C5007E]/80 hover:from-[#C5007E]/90 hover:to-[#C5007E]/70 text-white border-0 rounded-xl font-medium transition-all duration-300 backdrop-blur-md shadow-xl hover:shadow-2xl hover:scale-105"
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                          Analyzing...
                        </>
                      ) : (
                        <>
                          <RefreshCw className="mr-2 h-5 w-5" />
                          Run Deep Analysis
                        </>
                      )}
                    </Button>
                  </div>
                </CardHeader>

                <CardContent className="space-y-6">
                  {error && (
                    <div className="p-4 rounded-xl bg-red-500/20 border border-red-500/30 text-white backdrop-blur-md">
                      <p className="font-medium">Error: {error}</p>
                    </div>
                  )}

                  {/* Executive Summary */}
                  {analysis && (
                    <div className="space-y-6">
                      <Card className="rounded-xl border-white/20 shadow-xl backdrop-blur-xl bg-white/10">
                        <CardHeader>
                          <CardTitle className="text-white text-xl">
                            Executive Summary
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p className="text-white/90 text-lg leading-relaxed">{analysis.summary}</p>
                        </CardContent>
                      </Card>

                      {/* Bar Chart Comparison */}
                      <Card className="rounded-xl border-white/20 shadow-xl backdrop-blur-xl bg-white/10">
                        <CardHeader>
                          <CardTitle className="text-white text-xl">Category Breakdown</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <ResponsiveContainer width="100%" height={400}>
                            <BarChart data={analysis.trends}>
                              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                              <XAxis dataKey="category" tick={{ fill: 'white' }} />
                              <YAxis tick={{ fill: 'white' }} domain={[0, 100]} />
                              <Tooltip
                                contentStyle={{
                                  backgroundColor: 'rgba(0,0,0,0.8)',
                                  border: '1px solid rgba(255,255,255,0.2)',
                                  borderRadius: '8px',
                                  backdropFilter: 'blur(10px)'
                                }}
                                labelStyle={{ color: 'white' }}
                              />
                              <Legend wrapperStyle={{ color: 'white' }} />
                              <Bar dataKey="tmobile" fill="#C5007E" name="T-Mobile" />
                              <Bar dataKey="att" fill="#00A8E1" name="AT&T" />
                              <Bar dataKey="verizon" fill="#CD040B" name="Verizon" />
                              <Bar dataKey="spectrum" fill="#174EA6" name="Spectrum" />
                            </BarChart>
                          </ResponsiveContainer>
                        </CardContent>
                      </Card>

                      {/* Key Insights */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Card className="rounded-xl border-white/20 shadow-xl backdrop-blur-xl bg-white/10">
                          <CardHeader>
                            <CardTitle className="text-white text-xl">
                              Key Insights
                            </CardTitle>
                          </CardHeader>
                          <CardContent>
                            <ul className="space-y-3">
                              {analysis.insights.map((insight, index) => (
                                <li key={index} className="flex items-start gap-3 text-white/90">
                                  <span className="text-[#C5007E] font-bold mt-1">•</span>
                                  <span>{insight}</span>
                                </li>
                              ))}
                            </ul>
                          </CardContent>
                        </Card>

                        <Card className="rounded-xl border-white/20 shadow-xl backdrop-blur-xl bg-white/10">
                          <CardHeader>
                            <CardTitle className="text-white text-xl">
                              Strategic Recommendations
                            </CardTitle>
                          </CardHeader>
                          <CardContent>
                            <ul className="space-y-3">
                              {analysis.recommendations.map((rec, index) => (
                                <li key={index} className="flex items-start gap-3 text-white/90">
                                  <span className="text-[#C5007E] font-bold mt-1">→</span>
                                  <span>{rec}</span>
                                </li>
                              ))}
                            </ul>
                          </CardContent>
                        </Card>
                      </div>

                      {/* Competitor Score Cards */}
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        {analysis.competitorComparison.map((company) => (
                          <Card
                            key={company.company}
                            className={`rounded-xl border-white/20 shadow-xl backdrop-blur-xl transition-all duration-300 hover:scale-105 ${
                              company.company === 'T-Mobile'
                                ? 'bg-[#C5007E]/15 hover:bg-[#C5007E]/20'
                                : 'bg-white/10 hover:bg-white/15'
                            }`}
                          >
                            <CardHeader>
                              <CardTitle className="text-white text-lg">{company.company}</CardTitle>
                            </CardHeader>
                            <CardContent>
                              <div className="space-y-2 text-sm">
                                <div className="flex justify-between text-white/80">
                                  <span>Customer Satisfaction:</span>
                                  <span className="font-bold text-white">{company.employeeSatisfaction || 'N/A'}</span>
                                </div>
                                <div className="flex justify-between text-white/80">
                                  <span>Culture:</span>
                                  <span className="font-bold text-white">{company.culture || 'N/A'}</span>
                                </div>
                                <div className="flex justify-between text-white/80">
                                  <span>Compensation:</span>
                                  <span className="font-bold text-white">{company.compensation || 'N/A'}</span>
                                </div>
                                <div className="flex justify-between text-white/80">
                                  <span>Work-Life Balance:</span>
                                  <span className="font-bold text-white">{company.workLifeBalance || 'N/A'}</span>
                                </div>
                                <div className="flex justify-between text-white/80">
                                  <span>CEO Rating:</span>
                                  <span className="font-bold text-white">{company.ceoRating || 'N/A'}</span>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </div>
                  )}

                  {!analysis && !isLoading && (
                    <div className="text-center py-12">
                      <p className="text-white/60 text-lg">
                        Click "Run Deep Analysis" to fetch competitor data and generate insights
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
};

export default Admin;

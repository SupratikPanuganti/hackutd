# Admin Dashboard - Competitive Intelligence Guide

## Overview
The Admin Dashboard is an AI-powered competitive intelligence tool that uses Parallel AI for deep web scraping and Google Gemini for data analysis to provide comprehensive insights on T-Mobile's market position against key competitors (AT&T, Verizon, Spectrum).

## Access
- **URL**: `http://localhost:8084/admin`
- **Route**: `/admin`

## Features

### 1. **Parallel AI Deep Research**
   - Automatically scrapes competitor data from Comparably.com
   - Extracts employee satisfaction metrics, company culture data, and market insights
   - Targets: AT&T, Verizon, Spectrum, Sprint

### 2. **Gemini AI Analysis**
   - Processes scraped data through Google Gemini Pro
   - Generates comprehensive competitive analysis reports
   - Provides strategic recommendations and actionable insights

### 3. **Interactive Data Visualizations**
   - **Radar Chart**: Multi-metric competitive comparison across all categories
   - **Bar Chart**: Category-by-category breakdown
   - **Line Chart**: Performance trends visualization
   - **Score Cards**: Individual competitor metrics display

### 4. **Liquid Glass UI**
   - Maintains the same beautiful liquid glass aesthetic as the rest of the app
   - Three.js interactive fluid background
   - Glassmorphism cards with backdrop blur effects
   - T-Mobile brand colors (#E20074)

## How to Use

### Step 1: Navigate to Admin Page
Visit `http://localhost:8084/admin` or navigate to `/admin` in your application.

### Step 2: Run Analysis
Click the **"Run Deep Analysis"** button to trigger:
1. Parallel AI web scraping of competitor data
2. Gemini AI processing and analysis
3. Automatic graph generation

### Step 3: Review Results
The dashboard will display:
- **Executive Summary**: High-level overview of T-Mobile's competitive position
- **Competitive Analysis Chart**: Radar chart comparing all metrics
- **Category Breakdown**: Bar chart showing detailed comparisons
- **Performance Trends**: Line chart visualizing trends
- **Key Insights**: Bullet points of important findings
- **Strategic Recommendations**: Actionable next steps
- **Competitor Score Cards**: Individual company metrics

## Technical Details

### API Integrations

#### Parallel AI Configuration
```javascript
API Endpoint: https://api.parallel.ai/v1beta/extract
API Key: t5yTGrOLvVTh22GCh8PPmwY0PUSOrt8wjPnzq3V9
Beta Header: search-extract-2025-10-10

Scraped URLs:
- https://www.comparably.com/companies/spectrum
- https://www.comparably.com/companies/att
- https://www.comparably.com/companies/verizon
- https://www.comparably.com/companies/sprint
```

#### Gemini AI Configuration
```javascript
API Endpoint: https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent
API Key: Loaded from VITE_GEMINI_API_KEY in .env
Temperature: 0.4
Max Tokens: 4096
```

### Data Metrics Analyzed
- Employee Satisfaction
- Company Culture
- Compensation
- Work-Life Balance
- CEO Rating
- Career Growth Opportunities
- Diversity & Inclusion
- Innovation

### Technology Stack
- **Frontend**: React + TypeScript + Vite
- **UI Framework**: Tailwind CSS + Shadcn/UI
- **Visualizations**: Recharts (Radar, Bar, Line charts)
- **3D Background**: Three.js (LiquidEther component)
- **API Calls**: Axios
- **AI Services**:
  - Parallel AI (Web Scraping)
  - Google Gemini Pro (Data Analysis)

## Environment Variables Required

Add these to your `.env` file:
```bash
VITE_GEMINI_API_KEY=AIzaSyDWRwcEGBdynL2bt3VxUCLXcddQi8nH2kM
```

Note: Parallel API key is hardcoded in the component as per your specifications.

## Graph Types Included

### 1. Radar Chart
- **Purpose**: Multi-dimensional competitive comparison
- **Metrics**: All 8 categories simultaneously
- **Companies**: T-Mobile (highlighted in brand pink), AT&T, Verizon, Spectrum

### 2. Bar Chart
- **Purpose**: Side-by-side category comparison
- **Format**: Grouped bars for easy visual comparison
- **Use Case**: Identifying specific category strengths/weaknesses

### 3. Line Chart
- **Purpose**: Trend visualization
- **Format**: Multi-line plot
- **Use Case**: Understanding performance patterns across categories

### 4. Score Cards
- **Purpose**: Detailed individual metrics
- **Format**: Card grid layout
- **Special**: T-Mobile card highlighted with gradient background

## UI Components

All components use the liquid glass styling pattern:

```css
Glass Card Properties:
- Background: rgba(255,255,255,0.1) with backdrop blur
- Border: white/20 opacity
- Shadow: 2xl with blur effects
- Hover: Scale and brightness increase
- Text: White with varying opacity for hierarchy
```

## Best Practices for Gemini API

The Gemini integration is designed to:
1. Parse and clean scraped data
2. Extract meaningful metrics
3. Generate comparative insights
4. Provide strategic recommendations
5. Format data for visualization

The prompt includes specific JSON schema requirements to ensure consistent, parseable responses.

## Error Handling

The admin page includes:
- Loading states with animated spinners
- Error messages with red glass cards
- Console logging for debugging
- Fallback values for missing data

## Performance Considerations

- API calls run sequentially (Parallel first, then Gemini)
- Loading indicator shows progress
- Responses are cached in component state
- Charts render only after data is available

## Future Enhancements

Potential improvements:
1. Add date range selection for historical data
2. Export reports as PDF
3. Schedule automated reports
4. Add more competitors
5. Include market share data
6. Sentiment analysis from social media
7. Real-time news feed integration

## Troubleshooting

### Issue: API Key Error
**Solution**: Verify VITE_GEMINI_API_KEY is set in .env and restart dev server

### Issue: CORS Error
**Solution**: Parallel and Gemini APIs support CORS. Check network tab for specific errors.

### Issue: Empty Data
**Solution**: Check console logs. Parallel AI may be rate limited or URLs may have changed.

### Issue: Gemini Response Parse Error
**Solution**: Gemini sometimes adds markdown formatting. The code strips ```json blocks automatically.

### Issue: Graphs Not Rendering
**Solution**: Ensure recharts is installed and data structure matches expected format.

## File Locations

- **Admin Page**: `src/pages/Admin.tsx`
- **Route Config**: `src/App.tsx` (line 36)
- **Environment**: `.env`
- **Liquid Glass Styles**: `src/styles/branding.css`
- **Background Component**: `src/components/LiquidEther.tsx`

## Navigation

Access the admin page by:
1. Direct URL: `http://localhost:8084/admin`
2. Add link to TopNav component for easy access
3. Bookmark for quick access during demos

## Demo Tips for Gemini Best Use

To win the "Gemini Best Use" category, highlight:
1. **Intelligent Data Processing**: Gemini transforms raw scraped data into actionable insights
2. **Multi-Source Analysis**: Combines data from multiple competitor sources
3. **Strategic Recommendations**: Goes beyond simple data display to provide strategy
4. **Natural Language Understanding**: Gemini interprets unstructured web data
5. **JSON Schema Compliance**: Demonstrates advanced prompt engineering
6. **Real-time Analysis**: On-demand competitive intelligence generation

## Success Metrics

The admin dashboard demonstrates:
- ✅ AI-powered web scraping (Parallel AI)
- ✅ Advanced AI analysis (Gemini Pro)
- ✅ Beautiful data visualization (Recharts)
- ✅ Modern UI/UX (Liquid Glass design)
- ✅ Employee-friendly interface
- ✅ Actionable business insights
- ✅ Real competitive intelligence value

---

**Built with**: React, TypeScript, Vite, Tailwind CSS, Shadcn/UI, Recharts, Three.js, Parallel AI, Google Gemini Pro

**For**: HackUTD - T-Mobile Admin Dashboard
**Goal**: Win Gemini Best Use Category

# LA28 Flame Quest

A gamified fan engagement platform for the LA28 Olympics and Paralympics. Predict outcomes, earn "Flames," and analyze Team USA's momentum with AI-driven performance velocity insights.

## Core Features

### 1. Predictive Performance Analysis
- **Performance Velocity (Trend Analysis)**: Every prediction card features a "Performance Velocity" section that replaces static briefs with dynamic momentum analysis.
- **Sparkline Visuals**: Miniature line graphs visualize Team USA's performance across the last 5 Olympic cycles (e.g., 2024, 2021, 2016, 2012, 2008).
- **Performance Delta**: Real-time metrics showing the gap between current projected performance and historical Olympic Gold benchmarks (e.g., "Pacing 0.15s faster than 2024 Gold benchmark").
- **Analyst Model v2.1**: Powered by Gemini AI to ensure historical accuracy and trend detection.

### 2. Gamified Engagement (Picks)
- **Stake & Earn**: Predict "Over" or "Under" on performance lines for local and international athletes (focused on Team USA).
- **Prop-style Gameplay**: Engage with specific metrics like score, distance, time, or judged points.

### 3. Daily Trivia & Quizzes
- **Earn Flames**: Test your knowledge on USA Olympic and Paralympic history.
- **Compliance First**: All trivia is generated using AI to ensure no athlete names or likenesses are used, focusing purely on team stats and historical event milestones.

## Reproducible Testing Instructions

Follow these steps to verify the core functionality of the application.

### 1. Prerequisites
- **Node.js**: Ensure Node.js (v18+) is installed.
- **Packages**: Run `npm install` to install dependencies.
- **Environment**: Ensure the required Firebase configuration is set up in `firebase-applet-config.json`.

### 2. Running the Application
- Execute `npm run dev` to start the development server.
- The app will be accessible at `http://localhost:3000`.

### 3. Authentication
- Click the **"Sign In with Google"** button on the landing overlay.
- Authenticate with a Google account. The app uses Firebase Auth for secure session management.

### 4. Gameplay: Predictions (Picks)
- Navigate to the **"Picks"** tab (default).
- Select a sport (e.g., Gymnastics, Swimming).
- **Observe Performance Velocity**: Review the sparkline and pacing data (Trend Analysis v2.1) to see Team USA's momentum vs historical benchmarks.
- Choose **"Over"** or **"Under"** on a prediction card.
- Enter a stake in **Flames** (minimum 10).
- Click **"Lock Heat"** to place your prediction.
- Verify the balance updates and the pick appears in the **"My Lineups"** tab.

### 5. Quiz Feature: Get More Flames
- Locate the Flame balance in the top navigation.
- Click the **"Get more flames"** link directly below the balance.
- This will open the **Daily Quiz** view.
- **Testing Requirements**:
    - Observe that questions are either USA Olympic or USA Paralympic focused (even distribution).
    - Ensure no athlete names or likenesses are used (team stats and historical event milestones only).
- Select a multiple-choice answer.
- Correct answers reward **5 Flames**.

### 6. Fan Shop (Badges)
- Navigate to the **"Shop"** tab.
- Browse available achievement badges.
- Attempt to purchase a badge with earned Flames.
- Verify the badge is added to your collection in the Profile section.

### 7. Data Policy & Compliance
- All trivia questions are generated using Gemini AI, strictly adhering to the "No Athlete Likeness" policy.
- Statistics are sourced from verified historical team achievements for Team USA.
- Features balanced representation across Olympic and Paralympic disciplines.

---
*Created for the Google AI Studio Hackathon.*

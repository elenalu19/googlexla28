# LA28 Flame Quest

A gamified fan engagement platform for the LA28 Olympics and Paralympics. Predict outcomes, earn "Flames," and test your knowledge with AI-driven trivia.

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

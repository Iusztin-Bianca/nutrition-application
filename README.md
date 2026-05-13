# Calories & Nutrition Manager

NutritionPlan is a comprehensive full-stack application designed to help users achieve their fitness goals—weight loss, maintenance, or muscle gain—through precise calorie and macronutrient tracking. The application is specifically localized for the Romanian market.

## 🚀 Features[cite: 1]

### 1. User Authentication & Profile[cite: 1]
* **Secure Access:** JWT-based signup and login system.[cite: 1]
* **Personalized Onboarding:** A custom form collecting age, gender, weight, height, activity level, and fitness goal.[cite: 1]
* **Automatic Calculation:** Dynamically calculates Daily Energy Expenditure (TDEE) and target macros based on the user's profile.[cite: 1]

### 2. Food & Recipe Management[cite: 1]
* **Database Operations:** Full CRUD (Create, Read, Update, Delete) functionality for food items.[cite: 1]
* **Nutritional Transparency:** Track Calories, Proteins, Carbs, and Fats per 100g.[cite: 1]
* **Recipe Creator:** Ability to compose recipes from multiple food items. The system calculates the total nutritional value per serving or total weight.[cite: 1]

### 3. Meal Planning & Menus[cite: 1]
* **Custom Menus:** Group foods and recipes into structured daily or weekly plans.[cite: 1]
* **Interactive Visualization:** View and edit your food diary and menu lists easily.[cite: 1]

---

## 🏗 System Architecture[cite: 1]

The application is fully containerized using Docker, ensuring consistency across development and production environments.[cite: 1]

## 📊 Database Schema (ERD)[cite: 1]

The PostgreSQL database is structured to handle relational data efficiently:[cite: 1]

## 🧮 Calculation Engine[cite: 1]

The application uses the **Mifflin-St Jeor** formula to establish the baseline.[cite: 1]

**Formulas:**[cite: 1]
- **Men:** $10 \times weight + 6.25 \times height - 5 \times age + 5$[cite: 1]
- **Women:** $10 \times weight + 6.25 \times height - 5 \times age - 161$[cite: 1]

The result is multiplied by an **Activity Factor** (1.2 to 1.9) and then adjusted by the **Goal Offset**:[cite: 1]
- **Loss:** -500 kcal[cite: 1]
- **Maintenance:** +0 kcal[cite: 1]
- **Gain:** +300-500 kcal[cite: 1]

---

## 🛠 Tech Stack & Setup[cite: 1]

* **Backend:** Python (FastAPI)[cite: 1]
* **Frontend:** React.js [cite: 1]
* **Database:** PostgreSQL[cite: 1]
* **DevOps:** Docker, Docker Compose[cite: 1]

### Running the Project[cite: 1]

1.  **Clone the repo:**[cite: 1]
    ```bash
    git clone [https://github.com/username/nutriplan-ro.git](https://github.com/username/nutriplan-ro.git)

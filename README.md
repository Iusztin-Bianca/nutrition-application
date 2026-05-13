# Calories & Nutrition Manager

NutritionPlan is a comprehensive full-stack application designed to help users achieve their fitness goals—weight loss, maintenance, or muscle gain—through precise calorie and macronutrient tracking. The application is specifically localized for the Romanian market.

## 🚀 Features

### 1. User Authentication & Profile
* **Secure Access:** JWT-based signup and login system.
* **Personalized Onboarding:** A custom form collecting age, gender, weight, height, activity level, and fitness goal.
* **Automatic Calculation:** Dynamically calculates Daily Energy Expenditure (TDEE) and target macros based on the user's profile.

### 2. Food & Recipe Management
* **Database Operations:** Full CRUD (Create, Read, Update, Delete) functionality for food items.
* **Nutritional Transparency:** Track Calories, Proteins, Carbs, and Fats per 100g.
* **Recipe Creator:** Ability to compose recipes from multiple food items. The system calculates the total nutritional value per serving or total weight.

### 3. Meal Planning & Menus
* **Custom Menus:** Group foods and recipes into structured daily or weekly plans.
* **Interactive Visualization:** View and edit your food diary and menu lists easily.

---

## 🏗 System Architecture

The application is fully containerized using Docker, ensuring consistency across development and production environments.[cite: 1]

## 📊 Database Schema

The PostgreSQL database is structured to handle relational data efficiently

## 🧮 Calculation Engine[cite: 1]

The application uses the **Mifflin-St Jeor** formula to establish the baseline

**Formulas:**
- **Men:** $10 \times weight + 6.25 \times height - 5 \times age + 5$
- **Women:** $10 \times weight + 6.25 \times height - 5 \times age - 161$

The result is multiplied by an **Activity Factor** (1.2 to 1.9) and then adjusted by the **Goal Offset**:
- **Loss:** -500 kcal
- **Maintenance:** +0 kcal
- **Gain:** +300-500 kcal

---

## 🛠 Tech Stack & Setup

* **Backend:** Python (FastAPI)
* **Frontend:** React.js
* **Database:** PostgreSQL
* **DevOps:** Docker, Docker Compose

### Running the Project

1.  **Clone the repo:**
    ```bash
    git clone [https://github.com/username/nutriplan-ro.git](https://github.com/username/nutriplan-ro.git)

# 🚀 BFHL Full Stack Engineering Challenge

A full-stack web application that processes hierarchical node relationships, detects cycles, validates inputs, and visualizes structured trees.

---

## 🌐 Live Links

* 🔗 **Backend API**: https://your-api-url/bfhl
* 🎨 **Frontend App**: https://your-frontend-url

---

## 🛠️ Tech Stack

### 🔹 Frontend

* React / Next.js
* Tailwind CSS
* Axios (API calls)

### 🔹 Backend

* Node.js
* Express.js

### 🔹 Deployment

* Backend: Render / Railway
* Frontend: Vercel / Netlify

---

## 📌 Features

✅ Accepts node relationships in `X->Y` format
✅ Validates input data and filters invalid entries
✅ Detects and removes duplicate edges
✅ Constructs hierarchical tree structures
✅ Detects cycles in graph data
✅ Calculates depth of each tree
✅ Generates summary insights
✅ Clean and user-friendly UI

---

## 📥 API Endpoint

### 🔹 POST `/bfhl`

### Request:

```json
{
  "data": ["A->B", "A->C", "B->D"]
}
```

---

### Response:

```json
{
  "user_id": "yourname_ddmmyyyy",
  "email_id": "your_email@college.edu",
  "college_roll_number": "your_roll_number",
  "hierarchies": [],
  "invalid_entries": [],
  "duplicate_edges": [],
  "summary": {}
}
```

---

## 🧠 Core Logic

* Graph construction using adjacency list
* DFS-based cycle detection
* Root node identification
* Recursive tree generation
* Depth calculation (longest root-to-leaf path)

---

## ⚙️ Run Locally

### 1️⃣ Clone Repository

```bash
git clone https://github.com/YOUR_USERNAME/bfhl-fullstack.git
cd bfhl-fullstack
```

---

### 2️⃣ Install Dependencies

```bash
npm install
```

---

### 3️⃣ Run Backend

```bash
npm start
```

---

### 4️⃣ Run Frontend

```bash
npm run dev
```

---

## 📊 Example Input

```
A->B
A->C
B->D
C->E
E->F
```

---

## 🧪 Edge Cases Handled

* ❌ Invalid formats (`hello`, `A->`, `1->2`)
* 🔁 Duplicate edges
* 🔄 Cycles (`A->B->C->A`)
* 🔀 Multi-parent conflicts
* ⚠️ Self loops (`A->A`)

---

## 🎯 Performance

* ⚡ Handles up to 50 nodes efficiently
* ⏱️ API response time under 3 seconds

---

## 📁 Project Structure

```
.
├── src/
├── public/
├── components/
├── api/
├── utils/
├── .gitignore
├── package.json
└── README.md
```

---

## 🏆 Highlights

* Clean and modular backend architecture
* Responsive and intuitive frontend
* Real-time API interaction
* Robust error handling

---

## 📌 Submission Details

* Backend API URL: ✔️
* Frontend URL: ✔️
* GitHub Repository: ✔️

---

## 👨‍💻 Author

**Ayush Ranjan**

---

## ⭐ Show Your Support

If you like this project, give it a ⭐ on GitHub!

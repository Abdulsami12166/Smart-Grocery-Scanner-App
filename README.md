# Smart Grocery Scanner App

Scan grocery items with your phone camera, store products in MongoDB, track expiry reminders, get low-stock alerts, and receive recipe suggestions from current inventory.

## Project Structure

- `backend/` → Node.js + Express API + MongoDB
- `mobile/` → React Native (Expo) mobile app

## 1) Backend setup

```bash
cd backend
cp .env.example .env
npm install
npm run dev
```

Update `.env` with your MongoDB connection string:

```env
MONGODB_URI=mongodb+srv://chatapp_user:<db_password>@cluster0.tmzlh9d.mongodb.net/smart-grocery?retryWrites=true&w=majority
```

### API Endpoints

- `POST /api/products/scan` → scan barcode + add/increment product
- `GET /api/products` → full inventory
- `GET /api/products/alerts` → expiry reminders + low-stock items
- `GET /api/products/recipes/suggestions` → recipes from available items
- `PATCH /api/products/:id/quantity` → update stock quantity
- `DELETE /api/products/:id` → remove item

## 2) Mobile setup

```bash
cd mobile
npm install
npm start
```

> In `mobile/src/api/client.js`, replace `http://localhost:5000` with your computer LAN IP when testing from a physical phone.

## Feature coverage

- ✅ Scan barcode using camera (`expo-barcode-scanner`)
- ✅ Store product data in MongoDB (Mongoose model)
- ✅ Show expiry reminders
- ✅ Suggest recipes based on available items
- ✅ Show low stock notifications

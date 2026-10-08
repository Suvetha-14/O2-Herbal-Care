# O2 Herbal Products - Backend API

Production-ready Node.js/Express backend for the O2 Herbal e-commerce application with MongoDB integration.

---

## 📋 Features

- ✅ **User Authentication**: JWT-based authentication with bcrypt password hashing
- ✅ **Product Management**: Full CRUD operations for products with category filtering
- ✅ **Shopping Cart & Orders**: Order creation with automatic stock management
- ✅ **Review System**: User reviews with automatic rating calculation
- ✅ **Admin Panel**: Admin-only routes for product and order management
- ✅ **Stock Management**: Automatic stock reduction on order, product disabled at 0 stock
- ✅ **Input Validation**: Express-validator for all endpoints
- ✅ **Error Handling**: Comprehensive error handling middleware
- ✅ **CORS**: Enabled for cross-origin requests

---

## 🏗️ Project Structure

```
backend/
├── server.js                 # Entry point
├── package.json              # Dependencies
├── .env                      # Environment variables
├── config/
│   └── db.js                 # MongoDB connection
├── models/
│   ├── Product.js            # Product schema
│   ├── User.js               # User schema
│   └── Order.js              # Order schema
├── routes/
│   ├── userRoutes.js         # Authentication endpoints
│   ├── productRoutes.js      # Product endpoints
│   ├── orderRoutes.js        # Order endpoints
│   └── adminRoutes.js        # Admin-only endpoints
└── middleware/
    ├── authMiddleware.js     # JWT authentication
    └── adminMiddleware.js    # Admin role verification
```

---

## 🚀 Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Setup MongoDB

Create a free MongoDB Atlas account and get your connection string:
- Visit [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
- Create a cluster
- Get your connection string

### 3. Configure Environment Variables

Edit `.env` file:

```env
PORT=5000
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/o2herbal?retryWrites=true&w=majority
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
JWT_EXPIRE=7d
NODE_ENV=development
```

### 4. Start the Server

```bash
npm start
```

Or for development with auto-reload:

```bash
npm run dev
```

Server will run on `http://localhost:5000`

---

## 📚 API Endpoints

### Authentication

#### Register User
```http
POST /api/users/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "User registered successfully",
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "user"
  }
}
```

#### Login User
```http
POST /api/users/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "password123"
}
```

#### Get Profile
```http
GET /api/users/me
Authorization: Bearer {token}
```

---

### Products (Customer)

#### Get All Products
```http
GET /api/products
GET /api/products?category=Soap
GET /api/products?minPrice=100&maxPrice=500
GET /api/products?search=aloe
```

**Response:**
```json
{
  "success": true,
  "count": 24,
  "products": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "name": "Aloe Vera Soap",
      "category": "Soap",
      "price": 120,
      "discountPrice": 0,
      "stock": 50,
      "rating": 4.5,
      "numReviews": 23,
      "isActive": true
    }
  ]
}
```

#### Get Single Product
```http
GET /api/products/507f1f77bcf86cd799439011
```

#### Add Review
```http
POST /api/products/507f1f77bcf86cd799439011/review
Authorization: Bearer {token}
Content-Type: application/json

{
  "rating": 5,
  "comment": "Excellent product!",
  "userName": "John Doe"
}
```

---

### Orders

#### Create Order
```http
POST /api/orders
Authorization: Bearer {token}
Content-Type: application/json

{
  "orderItems": [
    {
      "product": "507f1f77bcf86cd799439011",
      "quantity": 2,
      "price": 120,
      "totalPrice": 240
    }
  ],
  "totalAmount": 240,
  "shippingAddress": {
    "street": "123 Main St",
    "city": "New York",
    "state": "NY",
    "country": "USA",
    "postalCode": "10001",
    "phone": "1234567890"
  },
  "notes": "Special delivery instructions"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Order created successfully",
  "order": {
    "_id": "507f1f77bcf86cd799439012",
    "user": "507f1f77bcf86cd799439011",
    "orderItems": [...],
    "totalAmount": 240,
    "paymentStatus": "Pending",
    "orderStatus": "Processing",
    "createdAt": "2024-01-28T10:30:00Z"
  }
}
```

#### Get User Orders
```http
GET /api/orders/user
Authorization: Bearer {token}
```

#### Get Order Details
```http
GET /api/orders/507f1f77bcf86cd799439012
Authorization: Bearer {token}
```

---

### Admin Routes

#### Get Admin Stats
```http
GET /api/admin/stats
Authorization: Bearer {admin_token}
```

**Response:**
```json
{
  "success": true,
  "stats": {
    "totalProducts": 50,
    "activeProducts": 48,
    "lowStockProducts": 5
  }
}
```

#### Get All Products (Admin)
```http
GET /api/admin/products
Authorization: Bearer {admin_token}
```

#### Create Product
```http
POST /api/admin/products
Authorization: Bearer {admin_token}
Content-Type: application/json

{
  "name": "Lavender Soap",
  "category": "Soap",
  "price": 150,
  "discountPrice": 0,
  "stock": 100,
  "description": "Premium lavender soap",
  "ingredients": ["Lavender Oil", "Coconut Oil"],
  "skinType": ["Sensitive", "Dry"],
  "images": ["url1", "url2"]
}
```

#### Update Product
```http
PUT /api/admin/products/507f1f77bcf86cd799439011
Authorization: Bearer {admin_token}
Content-Type: application/json

{
  "price": 160,
  "stock": 80,
  "isActive": true
}
```

#### Delete Product
```http
DELETE /api/admin/products/507f1f77bcf86cd799439011
Authorization: Bearer {admin_token}
```

#### Get All Orders (Admin)
```http
GET /api/admin/orders
Authorization: Bearer {admin_token}
```

#### Update Order Status
```http
PUT /api/admin/orders/507f1f77bcf86cd799439012
Authorization: Bearer {admin_token}
Content-Type: application/json

{
  "orderStatus": "Shipped",
  "paymentStatus": "Completed"
}
```

---

## 🔐 Authentication

### JWT Token Format

Include token in request headers:
```
Authorization: Bearer {token}
```

### Token Claims
```json
{
  "id": "user_id",
  "iat": 1234567890,
  "exp": 1234654290
}
```

---

## 📦 Database Models

### Product Schema
```javascript
{
  name: String,
  category: 'Soap' | 'Shampoo' | 'Oil' | 'Cream' | 'Gel',
  description: String,
  price: Number,
  discountPrice: Number,
  stock: Number,
  ingredients: [String],
  skinType: ['Dry', 'Oily', 'Normal', 'Sensitive', 'Combination'],
  hairType: ['Dry', 'Oily', 'Normal', 'Curly', 'Straight', 'Wavy'],
  images: [String],
  reviews: [{
    user: ObjectId,
    userName: String,
    rating: 1-5,
    comment: String,
    createdAt: Date
  }],
  rating: Number (auto-calculated),
  numReviews: Number (auto-calculated),
  isActive: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

### User Schema
```javascript
{
  name: String,
  email: String (unique),
  password: String (hashed),
  role: 'user' | 'admin',
  createdAt: Date
}
```

### Order Schema
```javascript
{
  user: ObjectId (User),
  orderItems: [{
    product: ObjectId (Product),
    productName: String,
    quantity: Number,
    price: Number,
    totalPrice: Number
  }],
  totalAmount: Number,
  paymentStatus: 'Pending' | 'Completed' | 'Failed' | 'Refunded',
  orderStatus: 'Processing' | 'Shipped' | 'Delivered' | 'Cancelled',
  shippingAddress: {
    street: String,
    city: String,
    state: String,
    country: String,
    postalCode: String,
    phone: String
  },
  notes: String,
  createdAt: Date,
  updatedAt: Date
}
```

---

## 🔒 Security Features

- ✅ Password hashing with bcrypt (10 salt rounds)
- ✅ JWT token-based authentication
- ✅ Role-based access control (RBAC)
- ✅ Input validation using express-validator
- ✅ CORS protection
- ✅ Error handling with no sensitive data exposure

---

## ⚠️ Important Notes

1. **Change JWT Secret**: Update `JWT_SECRET` in `.env` for production
2. **MongoDB URI**: Use your actual MongoDB Atlas connection string
3. **Stock Management**: Stock is automatically reduced when orders are created
4. **Product Activation**: Products are automatically disabled when stock reaches 0
5. **Rating Calculation**: Average rating is calculated automatically from reviews

---

## 📝 Testing API Endpoints

### Using cURL

```bash
# Register
curl -X POST http://localhost:5000/api/users/register \
  -H "Content-Type: application/json" \
  -d '{"name":"John","email":"john@example.com","password":"pass123"}'

# Login
curl -X POST http://localhost:5000/api/users/login \
  -H "Content-Type: application/json" \
  -d '{"email":"john@example.com","password":"pass123"}'

# Get Products
curl http://localhost:5000/api/products

# Get Products by Category
curl "http://localhost:5000/api/products?category=Soap"
```

### Using Postman

1. Import collection from API documentation
2. Set `base_url` to `http://localhost:5000`
3. Add token to Authorization header after login

---

## 🐛 Troubleshooting

**MongoDB Connection Error:**
- Check MONGO_URI in .env
- Verify MongoDB Atlas IP whitelist
- Ensure database name is correct

**JWT Errors:**
- Verify token format: `Bearer {token}`
- Check JWT_SECRET matches
- Token may have expired

**Stock Issues:**
- Stock is reduced only on successful order creation
- Check order response for error messages
- Verify product stock before ordering

---

## 📞 Support

For issues or questions, check:
- MongoDB documentation: https://docs.mongodb.com
- Express.js guide: https://expressjs.com
- Mongoose docs: https://mongoosejs.com

---

**Version**: 1.0.0  
**Created**: 2024  
**License**: ISC

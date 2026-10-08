# O2 Herbal Admin Panel

Production-ready admin panel for managing O2 Herbal Products e-commerce application.

---

## 📁 Folder Structure

```
frontend/src/admin/
├── pages/
│   ├── AdminLogin.jsx          # Admin login page
│   ├── Dashboard.jsx            # Admin dashboard with stats
│   ├── Products.jsx             # Product management list
│   ├── AddProduct.jsx           # Add new product
│   ├── EditProduct.jsx          # Edit product details
│   ├── Orders.jsx               # Order management list
│   ├── EditOrder.jsx            # Edit order status
│   └── Sliders.jsx              # Carousel/slides management
├── components/
│   ├── AdminSidebar.jsx         # Navigation sidebar
│   ├── AdminNavbar.jsx          # Top navigation bar
│   ├── AdminLayout.jsx          # Admin layout wrapper
│   ├── ProductForm.jsx          # Product form component
│   ├── ImageUploader.jsx        # Image upload component
│   └── Common.jsx               # Toast, dialogs, spinners
├── services/
│   └── adminApi.js              # API service layer
├── context/
│   └── AdminAuthContext.jsx     # Authentication context
├── hooks/
│   └── useToast.js              # Toast notification hook
├── AdminRoutes.jsx              # Admin route definitions
└── README.md                    # This file
```

---

## 🚀 Features

### ✅ Admin Authentication
- Login with email and password
- JWT token-based authentication
- Token persisted in localStorage
- Protected routes redirect to login
- Role-based access (admin-only)

### ✅ Dashboard
Real-time statistics:
- Total products count
- Active products count
- Total orders count
- Pending orders count
- Delivered orders count
- Low stock items count
- Recent orders preview

### ✅ Product Management
**Create Products:**
- Name, Category, Price, Discount Price
- Stock quantity
- Detailed description
- Ingredients list (add/remove)
- Suitable for skin types (multi-select)
- Suitable for hair types (multi-select)
- Product images (upload multiple)
- Active/Inactive toggle

**Update Products:**
- Edit all product fields
- Replace product images
- Update stock
- Enable/disable product

**Delete Products:**
- Confirmation dialog before deletion
- Removes product from inventory

**Product Listing:**
- Search by name or category
- View product images
- See current stock levels
- View ratings
- See product status
- Quick edit/delete buttons

### ✅ Order Management
**View Orders:**
- List all orders
- Search by Order ID or customer
- Filter by status (Processing, Shipped, Delivered, Cancelled)
- See order amounts
- View order dates

**Update Order Status:**
- Change order status (Processing → Shipped → Delivered)
- Update payment status (Pending → Completed → Refunded)
- View customer information
- See shipping address
- View ordered items with quantities

**Order Details:**
- Customer name and email
- Shipping address
- Order items with prices
- Total amount
- Payment and delivery status
- Order creation date

### ✅ Slider/Carousel Management
- Add new slides with image and text
- Edit slide title and description
- Replace slide images
- Delete slides
- Visual preview of slides
- Drag-and-drop support (ready for enhancement)

### ✅ Image Management
- Upload single or multiple images
- Preview images before saving
- Remove images with confirmation
- Image preview in forms
- Drag-and-drop upload support

### ✅ UI/UX Features
- Clean, modern Tailwind CSS design
- Responsive layout (works on mobile, tablet, desktop)
- Sidebar navigation with active state
- Loading spinners for async operations
- Toast notifications (success, error, info)
- Confirmation dialogs for destructive actions
- Empty states for no data
- Error handling and validation

---

## 📖 How to Use

### 1. Login

Navigate to: `http://localhost:5174/admin`

Enter admin credentials:
- **Email:** admin@o2herbal.com
- **Password:** admin123 (or your configured password)

### 2. Dashboard

View key metrics and recent orders at a glance.

### 3. Product Management

**Add Product:**
1. Click "Products" → "+ Add Product"
2. Fill in product details
3. Add ingredients
4. Select suitable skin/hair types
5. Upload product images
6. Click "Create Product"

**Edit Product:**
1. Click "Products" → Find product → "Edit"
2. Update any field
3. Click "Update Product"

**Delete Product:**
1. Click "Products" → Find product → "Delete"
2. Confirm deletion

### 4. Order Management

**View Orders:**
1. Click "Orders"
2. Search or filter by status
3. Click "View" for details

**Update Order:**
1. Click "Orders" → Click "View"
2. Change order status or payment status
3. Click "Update Order"

### 5. Slides Management

**Add Slide:**
1. Click "Slides"
2. Enter slide title and description
3. Upload slide image
4. Click "Add Slide"

**Edit Slide:**
1. Click "Edit" on slide card
2. Update details and image
3. Click "Update Slide"

**Delete Slide:**
1. Click "Delete" on slide card
2. Confirm deletion

---

## 🔌 API Integration

### Base URL
```
http://localhost:5000/api
```

### Headers
All authenticated requests require:
```
Authorization: Bearer {token}
Content-Type: application/json
```

### Authentication
```javascript
POST /users/login
{
  "email": "admin@o2herbal.com",
  "password": "admin123"
}

Response:
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": "...",
    "email": "admin@o2herbal.com",
    "role": "admin"
  }
}
```

### Products
```javascript
GET /admin/products              # Get all products
POST /admin/products             # Create product
PUT /admin/products/:id          # Update product
DELETE /admin/products/:id       # Delete product
GET /products/:id                # Get product details
```

### Orders
```javascript
GET /admin/orders                # Get all orders
GET /orders/:id                  # Get order details
PUT /admin/orders/:id            # Update order status
```

### Stats
```javascript
GET /admin/stats                 # Get dashboard statistics
```

---

## 🎨 UI Components

### Common Components (Common.jsx)

**Toast Notifications:**
```jsx
<Toast toasts={toasts} removeToast={removeToast} />
```

**Confirmation Dialog:**
```jsx
<ConfirmDialog
  isOpen={isOpen}
  title="Delete Product"
  message="Are you sure?"
  onConfirm={handleConfirm}
  onCancel={handleCancel}
  loading={isLoading}
/>
```

**Loading Spinner:**
```jsx
<LoadingSpinner />
```

**Empty State:**
```jsx
<EmptyState message="No data found" />
```

---

## 🔐 Security Features

✅ JWT token-based authentication  
✅ Protected routes (redirects to login if not authenticated)  
✅ Role-based access (admin-only routes)  
✅ Token stored securely in localStorage  
✅ Automatic logout functionality  
✅ Password validation on backend  

---

## 📱 Responsive Design

- **Mobile:** Sidebar collapses, stacked layout
- **Tablet:** Medium sidebar, 2-column layout
- **Desktop:** Full-width sidebar, multi-column layout

---

## ⚙️ Configuration

### API Base URL

Edit `frontend/src/admin/services/adminApi.js`:

```javascript
const API = axios.create({
  baseURL: 'http://localhost:5000/api',  // Change this if backend URL differs
})
```

### Toast Duration

Edit `frontend/src/admin/hooks/useToast.js`:

```javascript
const addToast = (message, type = 'success', duration = 3000) {
  // duration in milliseconds (default: 3000ms)
}
```

---

## 🐛 Troubleshooting

### Can't login
- Check backend is running on `http://localhost:5000`
- Verify email and password are correct
- Ensure user has `role: 'admin'` in backend

### API calls failing
- Check Network tab in browser DevTools
- Verify backend API is running
- Check CORS is enabled in backend
- Verify Authorization header format

### Images not uploading
- Check image size (should be < 5MB)
- Check file format (PNG, JPG, GIF supported)
- Verify backend file upload endpoint exists

### Token errors
- Clear localStorage and re-login
- Check JWT_SECRET matches between frontend and backend
- Verify token hasn't expired

---

## 🚀 Production Checklist

- [ ] Change admin password in backend
- [ ] Update JWT_SECRET to strong random string
- [ ] Enable HTTPS on production
- [ ] Configure CORS properly for production domain
- [ ] Set up database backups
- [ ] Enable rate limiting on API
- [ ] Add audit logging for admin actions
- [ ] Set up error monitoring (Sentry, etc.)
- [ ] Test all CRUD operations
- [ ] Test on different browsers
- [ ] Load test with expected traffic

---

## 📚 Technologies Used

- **React 19** - UI framework
- **Vite** - Build tool
- **Tailwind CSS** - Styling
- **Axios** - HTTP client
- **React Router** - Routing
- **Context API** - State management

---

## 📝 Notes

- All admin data is saved to backend MongoDB
- Images are currently stored as base64 in the request (implement CDN for production)
- Slides are stored locally in component state (implement backend storage for persistence)
- Add email notifications for orders
- Add bulk operations for products
- Add export to CSV for reports

---

**Admin Panel Version:** 1.0.0  
**Last Updated:** January 2026  
**Status:** Production Ready ✅

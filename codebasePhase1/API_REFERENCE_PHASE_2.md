# Phase 2 API Quick Reference

## Base URL
```
http://localhost:3000/api/v1
```

## Categories Endpoints

### GET /categories
List all categories with optional filtering

**Query Parameters:**
- `search` (string) - Search in name/slug/description
- `isActive` (boolean) - Filter by status
- `page` (number) - Page number (default: 1)
- `limit` (number) - Results per page (default: 10, max: 100)

**Response:**
```json
{
  "data": [
    {
      "id": "uuid",
      "name": "Electronics",
      "slug": "electronics",
      "description": "Electronic devices",
      "imageUrl": "https://...",
      "isActive": true,
      "sortOrder": 0,
      "createdAt": "2025-01-01T00:00:00Z",
      "updatedAt": "2025-01-01T00:00:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 25,
    "pages": 3
  }
}
```

### POST /categories
Create a new category

**Request Body:**
```json
{
  "name": "Electronics",
  "slug": "electronics",
  "description": "Electronic devices",
  "imageUrl": "https://...",
  "sortOrder": 0
}
```

**Validations:**
- `name` - Required, 2-100 characters
- `slug` - Required, 2-100 chars, lowercase letters/numbers/hyphens only, must be unique
- `description` - Optional, max 1000 characters
- `imageUrl` - Optional, must be valid URL
- `sortOrder` - Optional, non-negative integer

### GET /categories/:id
Get a specific category

**Response:**
```json
{
  "data": { /* category object */ }
}
```

### GET /categories/slug/:slug
Get category by slug (SEO-friendly)

### PUT /categories/:id
Update a category

**Request Body:** (all fields optional)
```json
{
  "name": "Updated Name",
  "slug": "updated-slug",
  "description": "Updated description",
  "imageUrl": "https://...",
  "sortOrder": 1,
  "isActive": true
}
```

### PATCH /categories/:id/status
Toggle category activation status

**Request Body:**
```json
{
  "isActive": false
}
```

### DELETE /categories/:id
Delete a category (permanent)

**Response:**
```json
{
  "data": { "message": "Category deleted successfully" }
}
```

---

## Products Endpoints

### GET /products
List all products with advanced filtering

**Query Parameters:**
- `search` (string) - Search in name/slug/description
- `categoryId` (string) - Filter by category UUID
- `isActive` (boolean) - Filter by status
- `page` (number) - Page number (default: 1)
- `limit` (number) - Results per page (default: 10, max: 100)

**Examples:**
```
/products?search=laptop&categoryId=uuid&isActive=true&page=1&limit=20
/products?categoryId=electronics-id
/products?search=gaming&isActive=true
```

**Response:**
```json
{
  "data": [
    {
      "id": "uuid",
      "categoryId": "uuid",
      "name": "Gaming Laptop",
      "slug": "gaming-laptop",
      "shortDescription": "High-performance gaming laptop",
      "description": "Detailed description...",
      "basePrice": 1299.99,
      "isActive": true,
      "createdAt": "2025-01-01T00:00:00Z",
      "updatedAt": "2025-01-01T00:00:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 150,
    "pages": 15
  }
}
```

### POST /products
Create a new product

**Request Body:**
```json
{
  "categoryId": "uuid",
  "name": "Gaming Laptop",
  "slug": "gaming-laptop",
  "shortDescription": "High-performance gaming laptop",
  "description": "Detailed description...",
  "basePrice": 1299.99
}
```

**Validations:**
- `categoryId` - Required, valid UUID
- `name` - Required, 2-255 characters
- `slug` - Required, 2-255 chars, lowercase/numbers/hyphens, must be unique
- `shortDescription` - Optional, max 500 chars
- `description` - Optional, max 5000 chars
- `basePrice` - Required, non-negative number

### GET /products/:id
Get a specific product

**Response:**
```json
{
  "data": { /* product object */ }
}
```

### GET /products/slug/:slug
Get product by slug (SEO-friendly)

### PUT /products/:id
Update a product

**Request Body:** (all fields optional)
```json
{
  "categoryId": "uuid",
  "name": "Updated Name",
  "slug": "updated-slug",
  "shortDescription": "New short description",
  "description": "New description",
  "basePrice": 1399.99,
  "isActive": true
}
```

### PATCH /products/:id/status
Toggle product activation status

**Request Body:**
```json
{
  "isActive": false
}
```

### DELETE /products/:id
Soft delete a product (marks as deleted, preserves data)

**Response:**
```json
{
  "data": { "message": "Product deleted successfully" }
}
```

### DELETE /products/:id/permanent
Hard delete a product (permanent, irreversible)

**Response:**
```json
{
  "data": { "message": "Product permanently deleted" }
}
```

---

## Error Responses

### 400 Bad Request (Validation Error)
```json
{
  "success": false,
  "message": "Validation error",
  "errors": [
    {
      "field": "slug",
      "message": "Slug must contain only lowercase letters, numbers, and hyphens"
    }
  ]
}
```

### 404 Not Found
```json
{
  "success": false,
  "message": "Product not found"
}
```

### 409 Conflict (Duplicate)
```json
{
  "success": false,
  "message": "Product with slug \"gaming-laptop\" already exists"
}
```

### 500 Internal Server Error
```json
{
  "success": false,
  "message": "Internal server error"
}
```

---

## Success Response Format

All successful responses follow this format:

```json
{
  "success": true,
  "data": { /* requested data */ },
  "message": "Optional success message",
  "pagination": { /* pagination info if applicable */ }
}
```

---

## Testing with cURL

### Create a category
```bash
curl -X POST http://localhost:3000/api/v1/categories \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Electronics",
    "slug": "electronics",
    "description": "Electronic devices"
  }'
```

### Get all products with filters
```bash
curl "http://localhost:3000/api/v1/products?search=laptop&isActive=true&page=1&limit=20"
```

### Create a product
```bash
curl -X POST http://localhost:3000/api/v1/products \
  -H "Content-Type: application/json" \
  -d '{
    "categoryId": "category-uuid",
    "name": "Gaming Laptop",
    "slug": "gaming-laptop",
    "basePrice": 1299.99
  }'
```

### Update product status
```bash
curl -X PATCH http://localhost:3000/api/v1/products/product-uuid/status \
  -H "Content-Type: application/json" \
  -d '{ "isActive": false }'
```

---

## Important Notes

### Pagination
- All list endpoints support pagination
- Default: page=1, limit=10
- Maximum limit: 100 results per page
- Responses include pagination metadata with total count and page count

### Filtering
- `search` - Full-text search in name, slug, and description fields
- `categoryId` - Exact match UUID filter
- `isActive` - Boolean filter (send as true/false string in query)

### Soft vs Hard Delete
- **Soft Delete** (`DELETE /products/:id`) - Marks product as deleted, preserves data
- **Hard Delete** (`DELETE /products/:id/permanent`) - Permanently removes from database
- List operations exclude soft-deleted products by default
- Use for secure data retention and audit trails

### Slug Validation
- Must be lowercase
- Can contain numbers and hyphens
- Must be unique per resource type
- Recommended format: kebab-case (e.g., "gaming-laptop")

### Error Handling
- All errors include `success: false` flag
- Validation errors include `field` and `message` for each issue
- Business logic errors include descriptive messages with HTTP status codes
- Check `message` field for debugging

---

## Database Schema Notes

### Categories
- Supports 100-character names and slugs
- Optional image URLs for visual representation
- Sort order for display ranking
- Activation status for selective hiding

### Products
- Supports 255-character names and slugs
- Soft delete via `deletedAt` timestamp (not visible in normal queries)
- Foreign key to Category (RESTRICT on delete - can't delete category with products)
- Price stored as Decimal(10,2) for accuracy

### Indexes for Performance
- Category: isActive, slug
- Product: categoryId, isActive, slug, deletedAt (important for soft delete filtering)
- ProductVariant: productId, sku, isActive
- ProductImage: productId, sortOrder

---

## Coming Soon (Phase 2 Frontend)

- `/products` - Browsable product listing
- `/products/[id]` - Product detail page
- `/management/categories` - Admin category management
- `/management/products` - Admin product management
- `/management/dashboard` - Admin dashboard with analytics

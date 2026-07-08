# REST API Endpoint Specification

This document details the public and administrative REST API surfaces of the MERKO platform.

All request and response bodies utilize standard application JSON payloads. The base endpoint path prefix is `/api/v1`.

---

## 1. Authentication Services (`/auth`)

### 1.1 User Registration
* **Route:** `/auth/register`
* **Method:** `POST`
* **Description:** Creates a new customer account and triggers the phone OTP flow.
* **Authentication:** None (Public)
* **Request Payload:**
  ```json
  {
    "email": "customer@example.com",
    "phone": "+919876543210",
    "password": "SecurePassword123",
    "name": "Jane Doe"
  }
  ```
* **Response Output:**
  ```json
  {
    "success": true,
    "data": {
      "userId": "uuid-v4-user-id",
      "email": "customer@example.com",
      "phone": "+919876543210",
      "isVerified": false
    },
    "error": null
  }
  ```

### 1.2 User Login
* **Route:** `/auth/login`
* **Method:** `POST`
* **Description:** Validates password hash and sets authentication tokens inside httpOnly cookies.
* **Authentication:** None (Public)
* **Request Payload:**
  ```json
  {
    "email": "customer@example.com",
    "password": "SecurePassword123"
  }
  ```
* **Response Output:**
  ```json
  {
    "success": true,
    "data": {
      "userId": "uuid-v4-user-id",
      "name": "Jane Doe",
      "role": "CUSTOMER"
    },
    "error": null
  }
  ```

---

## 2. Product Catalog Services (`/products`)

### 2.1 Fetch Catalog
* **Route:** `/products`
* **Method:** `GET`
* **Description:** Retrieves products filtered by category, price, and pagination queries.
* **Authentication:** None (Public)
* **Request Parameters (Query):**
  * `page` (Integer, default: `1`): Pagination offset page.
  * `limit` (Integer, default: `20`): Page scale count.
  * `category` (String, optional): Category slug filter.
  * `search` (String, optional): GIN-indexed full-text query string.
* **Response Output:**
  ```json
  {
    "success": true,
    "data": [
      {
        "id": "uuid-v4-product-id",
        "name": "Corporate ID Card",
        "slug": "corporate-id-card",
        "basePriceInPaise": 15000,
        "isCustomizable": true,
        "images": ["https://cloudinary.com/id-card-front.png"]
      }
    ],
    "meta": {
      "totalPages": 5,
      "currentPage": 1,
      "totalRecords": 95
    }
  }
  ```

### 2.2 Get Customization Schema
* **Route:** `/products/:id/schema`
* **Method:** `GET`
* **Description:** Loads the admin-configured schema mapping target inputs for customizable items.
* **Authentication:** None (Public)
* **Response Output:**
  ```json
  {
    "success": true,
    "data": {
      "fields": [
        {
          "id": "field-uuid-1",
          "type": "text",
          "label": "Employee Name",
          "required": true,
          "validation": {
            "maxLength": 50
          },
          "previewConfig": {
            "canvasX": 150,
            "canvasY": 300,
            "fontSize": 14,
            "color": "#000000"
          }
        }
      ]
    }
  }
  ```

---

## 3. Persistent Cart Services (`/cart`)

### 3.1 Fetch Cart Items
* **Route:** `/cart`
* **Method:** `GET`
* **Description:** Retrieves all active products selected inside the user's cart.
* **Authentication:** Required (`CUSTOMER`)
* **Response Output:**
  ```json
  {
    "success": true,
    "data": {
      "cartId": "uuid-v4-cart-id",
      "items": [
        {
          "itemId": "uuid-v4-item-id",
          "variantId": "uuid-v4-variant-id",
          "productName": "Corporate ID Card",
          "quantity": 2,
          "unitPriceInPaise": 15000,
          "customizationData": {
            "Employee Name": "Jane Doe"
          }
        }
      ]
    }
  }
  ```

### 3.2 Add Item to Cart
* **Route:** `/cart/items`
* **Method:** `POST`
* **Description:** Adds a product variant and custom selections to the database.
* **Authentication:** Required (`CUSTOMER`)
* **Request Payload:**
  ```json
  {
    "variantId": "uuid-v4-variant-id",
    "quantity": 1,
    "customizationData": {
      "Employee Name": "Jane Doe"
    }
  }
  ```
* **Response Output:**
  ```json
  {
    "success": true,
    "data": {
      "itemId": "uuid-v4-item-id",
      "quantity": 1
    }
  }
  ```

---

## 4. Checkout & Order Services (`/orders` & `/payments`)

### 4.1 Order Creation
* **Route:** `/orders`
* **Method:** `POST`
* **Description:** Compiles selected cart items, checks stock levels, validates coupons, and locks the order state as `PENDING`.
* **Authentication:** Required (`CUSTOMER`)
* **Request Payload:**
  ```json
  {
    "addressId": "uuid-v4-address-id",
    "couponCode": "WELCOME10",
    "customerNotes": "Deliver during business hours"
  }
  ```
* **Response Output:**
  ```json
  {
    "success": true,
    "data": {
      "orderId": "uuid-v4-order-id",
      "orderNumber": "MRK-698421-3424",
      "totalAmountPaise": 27000,
      "status": "PENDING"
    }
  }
  ```

### 4.2 Razorpay Order Creation
* **Route:** `/payments/create-order`
* **Method:** `POST`
* **Description:** Queries the `PENDING` order and fetches verification parameters from Razorpay API.
* **Authentication:** Required (`CUSTOMER`)
* **Request Payload:**
  ```json
  {
    "orderId": "uuid-v4-order-id"
  }
  ```
* **Response Output:**
  ```json
  {
    "success": true,
    "data": {
      "razorpayOrderId": "order_Hj39asF09jas",
      "amount": 27000,
      "currency": "INR"
    }
  }
  ```

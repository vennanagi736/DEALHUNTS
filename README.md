# DEALHUNTS

## Full-Stack Product Discovery, Comparison & Local Inventory Platform

**DEALHUNTS** is a full-stack e-commerce and product comparison platform designed to help users discover products, compare available options, and purchase products from vendors.

The platform combines **standard online product listings with local shop inventory**, allowing vendors to manage their products and stock while users can browse products, compare variants, add items to a wishlist or cart, and place orders.

---

## Key Features

### User

* User registration and login
* Secure JWT-based authentication
* Browse products and categories
* Search and filter products
* View detailed product information
* Compare products
* View product variants and colors
* View vendor-specific pricing and availability
* Add products to wishlist
* Add products to cart
* Manage cart quantities
* Checkout and provide delivery details
* Cash on Delivery order placement
* View order confirmation
* View previous orders and order details
* Manage user settings

### Vendor

* Vendor registration and authentication
* Admin-controlled vendor approval
* Vendor dashboard
* Select products from the master catalog
* Manage product variants
* Manage colors
* Manage stock
* Manage selling prices
* Apply discounts and offers
* Add product images
* Manage warranty information
* Monitor inventory
* View product performance

### Admin

* Admin authentication
* Admin dashboard
* Manage users
* Manage vendors
* Approve vendor registrations
* Manage master products
* Import products using CSV
* Manage categories
* Manage brands
* Manage product attributes
* Manage variants
* Manage colors
* Manage product images
* Manage trending products
* Manage trending categories
* Manage trending deals
* Manage promotions
* Manage carousel content
* Manage orders
* View sales and payment-related information

---

## Core Product Architecture

DEALHUNTS separates **master product information** from **vendor-specific inventory**.

```text
                    MASTER CATALOG
                         │
             ┌───────────┴───────────┐
             │                       │
        Product Data            Specifications
             │
             ▼
       Vendor Selection
             │
             ▼
     Vendor-Specific Data
     ├── Variants
     ├── Colors
     ├── Stock
     ├── Selling Price
     ├── Discount
     ├── Warranty
     └── Images
             │
             ▼
          USERS
             │
     ┌───────┼────────┐
     │       │        │
   Browse  Compare   Search
     │
     ├── Wishlist
     ├── Cart
     └── Checkout
             │
             ▼
           Orders
```

This approach allows a single product to be maintained in the master catalog while multiple vendors can independently manage their own inventory, pricing, variants, and availability.

---

## Main Modules

### 1. Product Management

The product management system provides a centralized catalog containing:

* Products
* Categories
* Brands
* Product attributes
* Specifications
* Variants
* Colors
* Product images

Administrators maintain the master product information, while vendors manage their own sellable product data.

---

### 2. Inventory Management

Vendors can maintain their individual inventory for products selected from the master catalog.

Inventory management includes:

* Stock quantity
* Product variants
* Colors
* Selling price
* Discount
* Availability
* Warranty information

Stock information is associated with the vendor's product offering rather than modifying the global master catalog.

---

### 3. Product Comparison

Users can compare products based on their available information and specifications.

The comparison system helps users evaluate products before purchasing instead of viewing each product independently.

---

### 4. Wishlist

Users can save products to their wishlist and manage saved products separately from the shopping cart.

---

### 5. Shopping Cart & Checkout

The shopping workflow includes:

```text
Product
   ↓
Add to Cart
   ↓
Cart
   ↓
Checkout
   ↓
Delivery Information
   ↓
Order Placement
   ↓
Order Confirmation
```

The cart supports product quantities and calculates the order information required during checkout.

---

### 6. Order Management

Users can:

* Place orders
* View order confirmation
* View previous orders
* View order details

The backend maintains order and order-item information for the purchasing workflow.

---

### 7. Authentication & Authorization

DEALHUNTS uses **JWT-based authentication** with role-based access control.

Supported roles include:

```text
ADMIN
VENDOR
USER
```

Different roles receive access to their respective application modules.

```text
                 Authentication
                       │
          ┌────────────┼────────────┐
          │            │            │
        ADMIN        VENDOR        USER
          │            │            │
      Admin Panel   Vendor Panel   User Panel
```

---

## Technology Stack

### Frontend

* React.js
* JavaScript
* HTML5
* CSS3
* Axios
* Vite

### Backend

* Java
* Spring Boot
* Spring Security
* JWT
* REST APIs
* Spring Data JPA
* Hibernate

### Database

* MySQL

### Cloud & Media

* Cloudinary for product image storage and media management

### Development Tools

* Git
* GitHub
* Maven
* Postman
* VS Code / IntelliJ IDEA

---

## System Architecture

```text
┌───────────────────────────────┐
│          React.js             │
│          Frontend             │
└───────────────┬───────────────┘
                │
                │ REST API
                ▼
┌───────────────────────────────┐
│        Spring Boot            │
│           Backend             │
├───────────────────────────────┤
│ Controllers                   │
│ Services                      │
│ Repositories                  │
│ Security / JWT                │
└───────────────┬───────────────┘
                │
                │ JPA / Hibernate
                ▼
┌───────────────────────────────┐
│            MySQL              │
│           Database            │
└───────────────────────────────┘

                │
                │ Product Images
                ▼
┌───────────────────────────────┐
│          Cloudinary            │
│       Media Storage            │
└───────────────────────────────┘
```

---

## Backend Architecture

The backend follows a layered architecture:

```text
Controller
    ↓
Service
    ↓
Repository
    ↓
Database
```

### Controller Layer

Handles:

* HTTP requests
* API endpoints
* Request validation
* Response handling

### Service Layer

Contains:

* Business logic
* Validation
* Product operations
* Inventory operations
* Order processing
* Wishlist operations
* Vendor operations

### Repository Layer

Handles database operations using Spring Data JPA.

### Entity Layer

Represents the application's database entities and relationships.

---

## Database Domain

The application manages several interconnected domains:

```text
Users
 │
 ├── Authentication
 ├── Wishlist
 ├── Cart
 └── Orders
          │
          └── Order Items

Products
 │
 ├── Categories
 ├── Brands
 ├── Attributes
 ├── Variants
 └── Colors
          │
          ▼
      Inventory
          │
          ▼
        Vendors
```

---

## Project Structure

```text
DEALHUNTS
│
├── Backend
│   ├── src
│   │   └── main
│   │       ├── java
│   │       │   └── org.example
│   │       │       ├── config
│   │       │       ├── controller
│   │       │       ├── dto
│   │       │       ├── entity
│   │       │       ├── repository
│   │       │       ├── security
│   │       │       └── service
│   │       │
│   │       └── resources
│   │
│   └── pom.xml
│
├── DEAL_HUNTS
│   ├── public
│   ├── src
│   │   ├── api
│   │   ├── components
│   │   ├── pages
│   │   │   ├── admin
│   │   │   ├── user
│   │   │   └── vendor
│   │   └── styles
│   ├── package.json
│   └── vite.config.js
│
└── README.md
```

---

## Application Workflow

### Admin

```text
Admin Login
     ↓
Admin Dashboard
     ↓
Manage Master Catalog
     ↓
Manage Vendors
     ↓
Approve Vendors
     ↓
Manage Products / Categories / Brands
     ↓
Manage Platform Content
```

### Vendor

```text
Vendor Registration
        ↓
Admin Approval
        ↓
Vendor Login
        ↓
Select Product
        ↓
Configure Variant / Color
        ↓
Set Price & Stock
        ↓
Manage Inventory
```

### User

```text
User Registration / Login
          ↓
      Browse Products
          ↓
    Search / Filter
          ↓
     Product Details
          ↓
       Compare
       /     \
 Wishlist    Cart
               ↓
            Checkout
               ↓
          Place Order
               ↓
        Order Confirmation
```

---

## Security

The backend implements:

* JWT authentication
* Password encryption using BCrypt
* Role-based authorization
* Protected REST endpoints
* Separate access for Admin, Vendor, and User modules
* CORS configuration for frontend-backend communication

---

## Media Management

Product images are stored and managed using **Cloudinary**.

The application integrates Cloudinary with the backend to handle product media without storing large image files directly inside the application database.

---

## API Communication

The React frontend communicates with the Spring Boot backend through REST APIs.

Example API domains include:

```text
Authentication
Products
Inventory
Vendors
Orders
Wishlist
Categories
Variants
Colors
Admin Management
```

---

## Running the Project

### Backend

Navigate to the backend:

```bash
cd Backend
```

Run the Spring Boot application using Maven:

```bash
mvn spring-boot:run
```

The backend runs on:

```text
http://localhost:8080
```

### Frontend

Navigate to the frontend:

```bash
cd DEAL_HUNTS
```

Install dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

The frontend runs on:

```text
http://localhost:5173
```

---

## Configuration

Before running the application, configure the required values in the backend configuration, including:

* MySQL database connection
* JWT configuration
* Cloudinary credentials
* Application-specific settings

Sensitive credentials should **not** be committed to GitHub.

---

## Development Approach

DEALHUNTS was developed as a complete full-stack application with separate responsibilities for:

* Platform administration
* Vendor inventory management
* Customer product discovery
* Product comparison
* Shopping and ordering

The architecture was designed to keep **master product information**, **vendor inventory**, and **user purchasing workflows** logically separated while allowing them to work together as one platform.

---

## Project Status

**Status: Completed**

DEALHUNTS currently provides the core functionality required for:

* Product catalog management
* Vendor management
* Inventory management
* Product comparison
* Wishlist management
* Shopping cart
* Checkout
* Order placement
* User order history
* Role-based authentication
* Admin management
* Cloud-based product media storage

---

## Developer

**Venna Venkata Nagireddy**

**Java Full Stack Developer**

GitHub:
https://github.com/vennanagi736

LinkedIn:
https://www.linkedin.com/in/venna-nagi-270b74368

---

## Project Information

**Project:** DEALHUNTS
**Type:** Full-Stack Web Application
**Architecture:** React + Spring Boot + MySQL
**Development:** Full-Stack Application Development
**Status:** Completed

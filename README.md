# DEALHUNTS

## A Full-Stack Software Application for Product Discovery, Local Shops, Inventory and Shopping

DEALHUNTS is a full-stack web application designed to help customers discover products, explore product details, compare available options, and find nearby shops. It also provides vendors with inventory and product management features and administrators with tools to manage the platform.

The application combines online product discovery with local shop inventory information, helping customers explore products and identify nearby vendors.

The project is built using **React.js, Java, Spring Boot, Spring Security, JWT, Hibernate, MySQL, Cloudinary, Google Maps, and Leaflet**.


**Project Status:** The core development of DEALHUNTS is complete. The application continues to receive feature enhancements, UI improvements, bug fixes, and refinements.
---

## Table of Contents

- [1. Project Overview](#1-project-overview)
- [2. Objectives](#2-objectives)
- [3. Key Features](#3-key-features)
- [4. User Roles](#4-user-roles)
- [5. Technology Stack](#5-technology-stack)
- [6. System Architecture](#6-system-architecture)
- [7. Application Workflows](#7-application-workflows)
- [8. Product and Inventory Management](#8-product-and-inventory-management)
- [9. Local Shop Discovery and Maps](#9-local-shop-discovery-and-maps)
- [10. Database Design](#10-database-design)
- [11. Authentication and Security](#11-authentication-and-security)
- [12. API Overview](#12-api-overview)
- [13. Project Structure](#13-project-structure)
- [14. Installation and Setup](#14-installation-and-setup)
- [15. Running the Application](#15-running-the-application)
- [16. CSV Product Import](#16-csv-product-import)
- [17. Testing and Verification](#17-testing-and-verification)
- [18. Current Limitations](#18-current-limitations)
- [19. Future Enhancements](#19-future-enhancements)
- [20. Learning Outcomes](#20-learning-outcomes)
- [21. Author](#21-author)
- [22. License](#22-license)

---

## 1. Project Overview

DEALHUNTS connects product discovery with local retail inventory management.

Customers can browse products, explore specifications, compare available options, manage their shopping activities, and discover nearby shops. Vendors can manage their product offerings, prices, stock, and related inventory information. Administrators can manage product catalog data, users, vendors, and other platform features.

The application separates the central product catalog from vendor-specific offerings. This makes it possible to maintain common product information while managing availability and pricing for individual vendors.

### Problems Addressed

- Customers may need to visit multiple websites or shops to explore product options and prices.
- Information about products and their specifications may be scattered across different sources.
- Customers may find it difficult to discover local shops that offer products they want.
- Local vendors need a convenient way to maintain product listings, prices, and stock.
- Administrators need a centralized way to manage catalog information and platform operations.

### Proposed Solution

DEALHUNTS brings these activities together in a single web application, combining online product discovery, vendor inventory management, local shop discovery, and shopping workflows.

---

## 2. Objectives

The primary objectives of DEALHUNTS are:

1. Build a full-stack application using React.js and Spring Boot.
2. Provide customers with a convenient product discovery experience.
3. Organize product information, specifications, categories, brands, and variants.
4. Support vendor-specific product offerings, pricing, and stock management.
5. Help customers discover nearby shops through map-based features.
6. Implement authentication and role-based access control.
7. Provide administrators with tools to manage users, vendors, and catalog information.
8. Integrate product image hosting and location-related functionality.
9. Maintain a modular application structure that supports future enhancements.

---

## 3. Key Features

### 3.1 Customer Features

- User registration and login.
- Browse and search products.
- Explore product categories and brands.
- View product details and specifications.
- Explore product variants and available options.
- Compare product information and vendor-specific offerings.
- View available prices and stock information where provided.
- Add products to a wishlist.
- Manage a shopping cart.
- Enter delivery details and place supported orders.
- Use Cash on Delivery (COD) for supported checkout workflows.
- View order history and order details.
- Manage account settings.
- Discover nearby shops and explore map-based locations.
- Access available shop visit and location features.

### 3.2 Vendor Features

- Vendor registration and login.
- Vendor approval workflow managed by administrators.
- Access vendor-specific dashboard functionality.
- Select products from the central product catalog.
- Manage vendor product offerings.
- Maintain product prices and stock quantities.
- Manage supported discounts, product variants, colors, and related product information.
- Upload product images through the configured image-hosting integration.
- Review available inventory and performance information.

### 3.3 Administrator Features

- Administrator login and protected dashboard.
- Manage users and vendors.
- Review and approve vendor registrations.
- Manage master product catalog information.
- Manage product categories, brands, attributes, and supported variants.
- Add and update product information.
- Import supported product data using CSV files.
- Manage product images and related catalog information.
- Manage available promotional and merchandising sections.
- Maintain sections such as Coming Soon, New Arrivals, Today's Best Deals, and Why DealHunts.
- Access available order and platform management functionality.

The exact actions available to each role depend on the implemented frontend screens, backend endpoints, and authorization rules.

---

## 4. User Roles

DEALHUNTS uses role-based access control to separate customer, vendor, and administrator functionality.

| Role | Responsibility |
|---|---|
| USER | Discover products, manage shopping activities, and access customer features. |
| VENDOR | Manage vendor-specific products, pricing, stock, and related inventory information. |
| ADMIN | Manage platform users, vendors, catalog information, and administrative features. |

The backend uses the following role authorities:

- `ROLE_USER`
- `ROLE_VENDOR`
- `ROLE_ADMIN`

### Role-Based Workflow

1. Users register or log in through the appropriate interface.
2. The backend authenticates the request.
3. Successful authentication provides the applicable authentication token.
4. Protected frontend routes and backend endpoints enforce the required access.
5. Vendors may need administrator approval before accessing approved vendor functionality.

---

## 5. Technology Stack

### Frontend

| Technology | Purpose |
|---|---|
| React.js | Component-based user interface |
| JavaScript | Frontend application logic |
| HTML5 | Page structure |
| CSS3 | Styling and responsive layouts |
| Vite | Frontend development server and build tooling |
| Axios | HTTP requests to backend APIs |

### Backend

| Technology | Purpose |
|---|---|
| Java | Backend programming language |
| Spring Boot | Backend application framework |
| Spring Web | REST API development |
| Spring Security | Authentication and authorization |
| JWT | Token-based authentication |
| Spring Data JPA | Database access |
| Hibernate | ORM and entity persistence |
| Maven | Dependency management and build automation |

### Database and Integrations

| Technology | Purpose |
|---|---|
| MySQL | Relational database |
| Cloudinary | Product image hosting and media management |
| Google Maps | Map and location-related functionality |
| Leaflet | Interactive map presentation |
| Geocoding services | Convert supported addresses into geographic coordinates |

---

## 6. System Architecture

DEALHUNTS follows a frontend-backend-database architecture.

```text
                         CUSTOMER / VENDOR / ADMIN
                                     |
                                     v
                         REACT.JS FRONTEND
                           Vite Development
                                     |
                                     | HTTP / REST
                                     | JWT Authorization
                                     v
                         SPRING BOOT BACKEND
                                     |
                  +------------------+------------------+
                  |                  |                  |
                  v                  v                  v
          REST Controllers     Spring Security    Business Services
                  |                  |                  |
                  +------------------+------------------+
                                     |
                                     v
                            SPRING DATA JPA
                               / HIBERNATE
                                     |
                                     v
                                MYSQL
                                     |
                  +------------------+------------------+
                  |                                     |
                  v                                     v
           CLOUDINARY                           MAP INTEGRATIONS
          Product Images                     Google Maps / Leaflet
```

### Frontend Responsibilities

- Render customer, vendor, and administrator interfaces.
- Handle user interactions and form validation.
- Send requests to the backend using Axios.
- Store and send authentication tokens according to the application's authentication flow.
- Display product data, inventory information, and supported map features.

### Backend Responsibilities

- Expose REST endpoints.
- Authenticate users and enforce authorization rules.
- Process business logic.
- Validate and persist application data.
- Coordinate catalog, vendor inventory, and shopping operations.
- Integrate with configured external services.

### Database Responsibilities

- Persist application information.
- Maintain product catalog and related information.
- Store user and vendor information.
- Support inventory and shopping workflows.

---

## 7. Application Workflows

### 7.1 Customer Workflow

```text
Register / Login
       |
       v
Browse or Search Products
       |
       v
Explore Product Details
       |
       v
Compare Available Options
       |
       v
Explore Nearby Shops
       |
       v
Wishlist / Cart
       |
       v
Enter Delivery Details
       |
       v
Place Supported Order
       |
       v
View Order Information
```

### 7.2 Vendor Workflow

```text
Vendor Registration
        |
        v
Administrator Review
        |
        v
Vendor Approval
        |
        v
Vendor Login
        |
        v
Vendor Dashboard
        |
        v
Select Catalog Products
        |
        v
Manage Price and Stock
        |
        v
Maintain Product Offerings
```

### 7.3 Administrator Workflow

```text
Administrator Login
         |
         v
Protected Admin Dashboard
         |
         v
Manage Users and Vendors
         |
         v
Review Vendor Registrations
         |
         v
Manage Master Product Catalog
         |
         v
Maintain Categories and Brands
         |
         v
Manage Promotions and Other Sections
```

These diagrams describe the main application workflows. Individual screens and operations depend on the implemented functionality.

---

## 8. Product and Inventory Management

One of the central design principles of DEALHUNTS is the separation between the master product catalog and vendor-specific inventory.

### 8.1 Master Product Catalog

The master catalog maintains common information about products, including supported fields such as:

- Product name.
- Brand.
- Category.
- Description.
- Base price.
- Product images.
- Specifications.
- Supported variants and attributes.

The catalog helps maintain consistent product information across the application.

### 8.2 Vendor-Specific Offerings

Vendors manage their own offerings associated with catalog products. Depending on the supported product and vendor configuration, these offerings can include:

- Vendor-specific selling price.
- Available stock quantity.
- Discounts.
- Product variant or color information.
- Images and other supported offering details.

This separation allows multiple vendors to offer the same catalog product while maintaining their own pricing and inventory information.

### 8.3 Product Details

Product details can include the product description, brand, category, thumbnail image, specifications, and variant information.

The backend's product service maps entity data into DTOs used by the frontend. This separates the API response structure from the internal database entity structure.

### 8.4 Inventory Management

Vendor inventory management supports the maintenance of stock quantities and product offerings. Inventory changes can be reflected in the relevant shopping workflows where the corresponding functionality is implemented.

### 8.5 Product Merchandising

The application includes merchandising sections such as:

- New Arrivals.
- Coming Soon.
- Today's Best Deals.
- Why DealHunts.
- Other supported promotional and discovery sections.

These sections help organize product discovery and highlight selected content.

---

## 9. Local Shop Discovery and Maps

DEALHUNTS combines online product discovery with local shop discovery.

### Main Capabilities

- Display supported shop location information.
- Present map-based location information.
- Use Google Maps and Leaflet for relevant map features.
- Support configured address-to-coordinate conversion through geocoding.
- Help customers explore nearby shop information.
- Provide available shop visit and map-opening actions.

### Why Local Discovery Matters

Customers may prefer to purchase a product from a nearby shop rather than relying exclusively on online listings. Local discovery can help them identify relevant shops and decide which locations to explore.

### Important Consideration

Map markers and shop locations depend on the quality of the stored address, coordinates, and geocoding results. Accurate vendor location data is important for reliable map presentation.

---

## 10. Database Design

DEALHUNTS uses MySQL as its relational database and Hibernate/JPA for object-relational mapping.

The logical database design separates common product information from vendor-specific offerings and other application responsibilities.

### 10.1 Main Logical Data Areas

| Data Area | Purpose |
|---|---|
| Users and Authentication | User accounts, credentials, and role-related information |
| Vendors | Vendor profiles and approval-related information |
| Product Catalog | Common product information |
| Categories and Brands | Product classification and brand information |
| Product Specifications | Attributes and values associated with products |
| Product Variants | Supported product options, such as colors or configurations |
| Vendor Inventory | Vendor-specific offerings, prices, and stock |
| Shopping | Wishlist, cart, and order-related information |
| Product Media | Product image references and media-related information |
| Location Information | Shop addresses and location-related information |
| Merchandising | Supported promotional and product discovery content |

These are **logical data areas**, not a claim that every item corresponds to one identically named database table.

### 10.2 Catalog and Inventory Separation

The product catalog describes what a product is. Vendor inventory describes how a vendor offers that product.

For example:

```text
Master Product
      |
      +---------------------+
      |                     |
      v                     v
Vendor A Offering      Vendor B Offering
      |                     |
      v                     v
Vendor A Price         Vendor B Price
Vendor A Stock         Vendor B Stock
```

This design supports product discovery across multiple vendors without requiring each vendor to maintain a completely separate copy of the common product definition.

### 10.3 ORM and DTOs

Spring Data JPA and Hibernate provide persistence and entity mapping. The backend also uses Data Transfer Objects (DTOs) to shape product information for API responses.

DTOs help keep frontend-facing response data separate from internal entity structures.

### 10.4 Database Configuration

Database credentials and connection settings must be configured for the local MySQL environment. Actual entity relationships, table names, and constraints should be verified against the current backend entity classes and database schema.

---

## 11. Authentication and Security

DEALHUNTS uses Spring Security and JWT-based authentication.

### 11.1 Authentication

The backend supports authentication flows for users, vendors, and administrators through their respective login endpoints.

On successful authentication, the application returns the relevant authentication response and token information.

### 11.2 JWT Authorization

JWTs allow the frontend to authenticate subsequent requests to protected backend endpoints.

The backend validates the authentication information and applies the authorization rules associated with the requested operation.

### 11.3 Password Security

Passwords are handled using BCrypt password hashing rather than storing plain-text passwords.

### 11.4 Role-Based Authorization

The application distinguishes among customer, vendor, and administrator roles. Protected operations should only be accessible to the appropriate authenticated role.

### 11.5 Vendor Approval

Vendor registration and administrator approval are separate parts of the vendor workflow. Approval status is used to support the platform's vendor access process.

### 11.6 CORS

The backend has cross-origin configuration for the frontend development environment. When running the application from a different origin, the allowed-origin configuration must match the frontend environment.

### Security Notes

- Do not commit passwords, JWT secrets, API keys, or production database credentials.
- Configure sensitive values for the local or deployment environment.
- Keep protected backend endpoints secured independently of frontend route protection.
- Validate and authorize sensitive operations on the server.

---

## 12. API Overview

The backend exposes REST APIs for authentication, product catalog operations, and other application features.

The following product endpoints are documented in the project.

### 12.1 Authentication Endpoints

| Method | Endpoint | Purpose |
|---|---|---|
| POST | `/user/login` | User login |
| POST | `/user/register` | User registration |
| POST | `/vendor/login` | Vendor login |
| POST | `/vendor/register` | Vendor registration |
| POST | `/admin/login` | Administrator login |

The exact request bodies and response structures should be checked in the corresponding controller classes.

### 12.2 Product Endpoints

Base URL for local development:

`http://localhost:8080`

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/admin/products/all` | Retrieve the product list |
| POST | `/admin/products/add` | Add a product |
| GET | `/admin/products/active` | Retrieve active products |
| GET | `/admin/products/search?name={name}` | Search products by name |
| GET | `/admin/products/cards` | Retrieve product card data |
| GET | `/admin/products/{id}` | Retrieve a product by ID |
| GET | `/admin/products/{id}/details` | Retrieve detailed product information |

Actual access permissions depend on the backend security configuration.

### 12.3 Product CSV Import

| Method | Endpoint | Purpose |
|---|---|---|
| POST | `/admin/import/products` | Import supported product data from CSV |

### 12.4 Other API Areas

The application also contains functionality related to vendor inventory, shopping, administration, and location-based features. Refer to the current controller classes for their exact endpoint paths, HTTP methods, request formats, and authorization requirements.

**Note:** The API tables above list known project endpoints. They should not be interpreted as an exhaustive list of every endpoint in the application.

---

## 13. Project Structure

The repository contains separate frontend and backend applications.

A simplified view of the project structure is shown below:

```text
DEALHUNTS/
|
+-- README.md
|
+-- DEAL_HUNTS/
|   |
|   +-- src/
|   |   +-- components/
|   |   +-- pages/
|   |   +-- styles/
|   |   +-- services/
|   |   +-- assets/
|   |
|   +-- package.json
|   +-- vite.config.js
|   |
|   +-- ... other frontend files
|
+-- Backend/
    |
    +-- src/
    |   +-- main/
    |   |   +-- java/
    |   |   |   +-- org/
    |   |   |       +-- example/
    |   |   |           +-- controller/
    |   |   |           +-- service/
    |   |   |           +-- repository/
    |   |   |           +-- entity/
    |   |   |           +-- dto/
    |   |   |           +-- config/
    |   |   |           +-- BackendApplication.java
    |   |   |
    |   |   +-- resources/
    |   |       +-- application.properties
    |   |
    |   +-- test/
    |
    +-- pom.xml
```

This is a simplified structural overview. Refer to the repository for the complete list of files and any additional packages.

### Frontend Organization

The frontend contains React components, application pages, stylesheets, API integration logic, and supporting assets.

### Backend Organization

The backend is organized around Spring Boot application components, including controllers, services, repositories, entities, DTOs, and configuration classes.

---

## 14. Installation and Setup

### 14.1 Prerequisites

Install the following software before starting the project:

- Node.js and npm.
- Java Development Kit compatible with the backend configuration.
- Maven, or the project's configured Maven wrapper if available.
- MySQL Server.
- Git.

You should also have access to any required external-service configuration used by the application, such as Cloudinary or map-related services.

### 14.2 Clone the Repository

```bash
git clone https://github.com/vennanagi736/DEALHUNTS.git
cd DEALHUNTS
```

### 14.3 Configure MySQL

Start MySQL and create the project database if it does not already exist.

```sql
CREATE DATABASE dealhunts;
```

Configure the backend database connection in the appropriate Spring Boot configuration file.

For example, the relevant configuration properties may follow this pattern:

```properties
spring.datasource.url=jdbc:mysql://localhost:3306/dealhunts
spring.datasource.username=${DB_USERNAME}
spring.datasource.password=${DB_PASSWORD}
```

The placeholders above are examples. Set them using your local configuration or environment variables, and ensure that the actual backend configuration uses the correct property names.

The Hibernate schema-generation settings must match the project's existing database and entity configuration.

### 14.4 Configure External Services

Configure any required credentials and settings for:

- Cloudinary image hosting.
- Google Maps functionality.
- Geocoding services, where applicable.

Do not commit private credentials to the repository.

### 14.5 Install Frontend Dependencies

Open a terminal in the frontend directory:

```bash
cd DEAL_HUNTS
npm install
```

Check the available scripts in `package.json` before running the frontend.

### 14.6 Prepare the Backend

Open another terminal in the backend directory:

```bash
cd Backend
```

Build the backend with Maven:

```bash
mvn clean install
```

If the repository contains a Maven wrapper, you can use the wrapper command appropriate for your operating system instead.

Before starting the application, verify that the database and required configuration values are available.

---

## 15. Running the Application

Run the frontend and backend in separate terminals.

### 15.1 Start the Backend

From the `Backend` directory:

```bash
mvn spring-boot:run
```

The configured local backend address is:

`http://localhost:8080`

### 15.2 Start the Frontend

From the `DEAL_HUNTS` directory:

```bash
npm run dev
```

The Vite development server is configured to run at:

`http://localhost:5173`

If Vite selects a different port because the default port is unavailable, use the URL printed in the terminal.

### 15.3 Verify the Application

1. Confirm that MySQL is running.
2. Confirm that the Spring Boot backend starts without configuration or database errors.
3. Confirm that the frontend development server starts successfully.
4. Open the frontend in a browser.
5. Test the appropriate registration and login flows.
6. Verify that product data loads from the backend.
7. Test role-specific pages and features.
8. Verify any external-service functionality using valid local configuration.

---

## 16. CSV Product Import

DEALHUNTS supports CSV-based product import through the documented administrator import endpoint.

### 16.1 Endpoint

```http
POST http://localhost:8080/admin/import/products
```

The request format and any required authentication headers should match the backend controller implementation.

### 16.2 CSV Header

The documented CSV header is:

```csv
category,brand,name,description,basePrice,ram,storage,processor,displaySize,battery,color,hexCode
```

### 16.3 Example CSV Data

```csv
category,brand,name,description,basePrice,ram,storage,processor,displaySize,battery,color,hexCode
Mobile Phones,Samsung,Example Phone,Example product description,25000,8GB,128GB,Example Processor,6.5 inch,5000mAh,Black,#000000
```

The example row is illustrative. Replace the sample values with valid categories, brands, and product data supported by the current application.

### 16.4 Import Considerations

- Use the expected CSV header.
- Ensure category and brand values match the data expected by the backend.
- Provide valid values for numeric and product-specific fields.
- Check the backend response for validation or import errors.
- Verify imported products through the supported product listing endpoints or administrator interface.

---

## 17. Testing and Verification

Testing should cover the major application workflows and the interaction between the frontend, backend, and database.

### 17.1 Authentication Testing

- Verify user registration and login.
- Verify vendor registration and login.
- Verify administrator login.
- Verify access to protected pages.
- Verify that unauthorized users cannot perform restricted operations.

### 17.2 Product Testing

- Verify that products can be listed and searched.
- Verify that product details and specifications load correctly.
- Verify supported product variants.
- Verify that catalog data is displayed correctly in the frontend.
- Verify CSV import using valid and invalid test data.

### 17.3 Vendor Testing

- Verify the vendor registration and approval workflow.
- Verify vendor product selection.
- Verify that supported price and stock updates are persisted.
- Verify that vendor-specific data is displayed correctly.

### 17.4 Shopping Testing

- Verify wishlist and cart interactions.
- Verify supported checkout and delivery-detail workflows.
- Verify COD order placement where configured.
- Verify order history and order details.

### 17.5 Maps Testing

- Verify that the expected map component loads.
- Verify that displayed shop locations correspond to the available location data.
- Verify address and geocoding behavior.
- Verify the supported shop visit and map-opening actions.

The tests above are recommended verification cases, not a claim that every case is already covered by automated tests.

---

## 18. Current Limitations

The following areas depend on the application's current implementation and configuration:

- Product and inventory information depends on the data entered and maintained by vendors.
- Nearby shop accuracy depends on valid address and coordinate information.
- Map and geocoding features depend on the configured services and their availability.
- Product CSV imports depend on the expected header and valid input data.
- Some features may require external-service credentials.
- Frontend and backend configurations must be aligned for authentication, CORS, and API requests.
- Feature availability can vary according to user roles and vendor approval status.
- The availability of a product at a physical shop should be confirmed against the latest inventory information.

The application is actively being improved, and additional enhancements may be introduced as development continues.

---

## 19. Future Enhancements

Potential improvements for future versions include:

- More advanced product search and filtering.
- Improved product comparison and recommendation features.
- More reliable nearby shop discovery.
- Better inventory availability updates.
- Enhanced low-stock alerts for vendors.
- Inventory history and reporting.
- Sales and demand analysis.
- Improved administrative analytics.
- More comprehensive order management.
- Further UI and responsive design improvements.
- Expanded automated testing.
- Deployment and production-readiness improvements.
- Additional integrations for local retail workflows.

These items describe potential development directions and should not be interpreted as features that are already complete.

---

## 20. Learning Outcomes

This project provides practical experience with:

- Full-stack application development.
- React component-based UI development.
- REST API design and integration.
- Java and Spring Boot application development.
- Spring Security and JWT authentication.
- Role-based authorization.
- Relational database design using MySQL.
- Hibernate and Spring Data JPA.
- DTO-based API response design.
- Product catalog and vendor inventory separation.
- File-based product data import.
- Image-hosting integrations.
- Interactive maps and geocoding.
- Git and GitHub-based project management.
- Debugging, testing, and iterative UI improvements.

---

## 21. Author

**Venna Venkata Nagireddy**

Java Full Stack Developer

- GitHub: [vennanagi736](https://github.com/vennanagi736)
- LinkedIn: [Venna Nagi](https://www.linkedin.com/in/venna-nagi-270b74368)

### Project Repository

[DEALHUNTS on GitHub](https://github.com/vennanagi736/DEALHUNTS)

---

## 22. License

No specific open-source license is documented here. Review the repository's license file, if present, before redistributing or reusing the project.

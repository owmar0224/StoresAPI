# StoresAPI - Node.js RESTful API

StoresAPI is a RESTful API developed using Node.js, Express, and Sequelize. It allows for managing stores, categories, products, and sales, with functionalities for both **Admin** and **Owner** users.

## Table of Contents
- [Installation](#installation)
- [Environment Variables](#environment-variables)
- [Authentication](#authentication)
- [Endpoints](#endpoints)
  - [Admin Endpoints](#admin-endpoints)
  - [Owner Endpoints](#owner-endpoints)
  - [Store Endpoints](#store-endpoints)
  - [Category Endpoints](#category-endpoints)
  - [Product Endpoints](#product-endpoints)
  - [Sales Endpoints](#sales-endpoints)
- [Contributing](#contributing)
- [License](#license)

## Installation

1. Clone the repository:

   ```bash
   git clone <repository-url>
   cd StoresAPI
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Set up your environment variables in a `.env` file (see [Environment Variables](#environment-variables)).

4. Run the application:

   ```bash
   npm start
   ```

## Environment Variables

The following environment variables need to be set for the API to function properly. Add them to a `.env` file in the root directory:

### Server Configuration
- `PORT`: The port on which the server will run.

### Database Configuration
- `DB_HOST`: The database host (e.g., `localhost`).
- `DB_USER`: The database username.
- `DB_PASS`: The database password.
- `DB_NAME`: The name of the database.

### JWT Secret
- `JWT_SECRET`: The secret key for signing JWT tokens.

### Email Configuration
- `EMAIL_HOST`: The host for the email server (e.g., `smtp.mailtrap.io`).
- `EMAIL_PORT`: The port for the email server (e.g., `587` for unencrypted or TLS, `465` for SSL).
- `EMAIL_USER`: The username for the email account.
- `EMAIL_PASS`: The password for the email account.

### Optional Email Configuration
- `EMAIL_SECURE`: Set to `true` if using SSL/TLS, otherwise `false` (optional).
- `EMAIL_FROM`: The email address that emails will be sent from (optional).

## Authentication

- **Admin Authentication**: Admins use the `admin_token` for access to protected routes.
- **Owner Authentication**: Owners use the `owner_token` to authenticate themselves for their specific routes.
  
Make sure to include the token in the `Authorization` header for the protected routes:
  
```
Authorization: Bearer <TOKEN>
```

## Endpoints

### Admin Endpoints

#### For Admin Accounts

##### Register Admin
- **POST** `/api/v1/admin/register`
- **Description**: Registers a new Admin.
- **Bearer Token**: No
- **Request Body**:
  ```json
  {
    "first_name": "John",
    "last_name": "Doe",
    "email": "admin@example.com",
    "password": "yourPassword"
  }
  ```

##### Resend Verification Email
- **POST** `/api/v1/admin/resend-verification`
- **Description**: Resends the email verification link.
- **Bearer Token**: No
- **Request Body**:
  ```json
  {
    "email": "admin@example.com"
  }
  ```

##### Verify Admin Email
- **POST** `/api/v1/admin/verify`
- **Description**: Verifies an Admin's email using a verification code.
- **Bearer Token**: No
- **Request Body**:
  ```json
  {
    "email": "admin@example.com",
    "verification_code": "verification-code"
  }
  ```

##### Admin Login
- **POST** `/api/v1/admin/login`
- **Description**: Logs in an Admin.
- **Bearer Token**: No
- **Request Body**:
  ```json
  {
    "email": "admin@example.com",
    "password": "yourPassword"
  }
  ```

##### Forgot Password
- **POST** `/api/v1/admin/forgot-password`
- **Description**: Initiates a password reset for an Admin.
- **Bearer Token**: No
- **Request Body**:
  ```json
  {
    "email": "admin@example.com"
  }
  ```

##### Reset Admin Password
- **POST** `/api/v1/admin/reset-password`
- **Description**: Resets the Admin's password using a token.
- **Bearer Token**: No
- **Request Body**:
  ```json
  {
    "token": "reset-token",
    "newPassword": "newPassword"
  }
  ```

##### Change Admin Password
- **POST** `/api/v1/admin/change-password`
- **Description**: Changes the Admin's password.
- **Bearer Token**: **admin_token**
- **Request Body**:
  ```json
  {
    "currentPassword": "currentPassword",
    "newPassword": "newPassword"
  }
  ```

##### Get All Admins
- **GET** `/api/v1/admin/all`
- **Description**: Fetches all registered Admins.
- **Bearer Token**: **admin_token**

##### Get Admin by ID
- **GET** `/api/v1/admin/:id`
- **Description**: Fetches details of an Admin by their ID.
- **Bearer Token**: **admin_token**

##### Update Admin
- **PUT** `/api/v1/admin/update/:id`
- **Description**: Updates an Admin's details by their ID.
- **Bearer Token**: **admin_token**
- **Request Body**:
  ```json
  {
    "first_name": "UpdatedFirstName",
    "last_name": "UpdatedLastName"
  }
  ```

##### Delete Admin
- **DELETE** `/api/v1/admin/delete/:id`
- **Description**: Deletes an Admin account by ID.
- **Bearer Token**: **admin_token**

#### For Owner Accounts

##### Create Owner
- **POST** `/api/v1/admin/owners/register`
- **Description**: Registers a new store owner.
- **Bearer Token**: **admin_token**
- **Request Body**:
  ```json
  {
    "first_name": "Alice",
    "last_name": "Smith",
    "email": "owner@example.com"
  }
  ```

##### Reset Owner Password
- **PUT** `/api/v1/admin/owners/reset-password`
- **Description**: Resets an Owner's password.
- **Bearer Token**: **admin_token**
- **Request Body**:
  ```json
  {
    "email": "owner@example.com"
  }
  ```

##### Get All Owners
- **GET** `/api/v1/admin/owners/all`
- **Description**: Fetches all store owners.
- **Bearer Token**: **admin_token**

##### Get Owner by ID
- **GET** `/api/v1/admin/owners/:id`
- **Description**: Fetches details of an Owner by their ID.
- **Bearer Token**: **admin_token**

##### Delete Owner
- **DELETE** `/api/v1/admin/owners/delete/:id`
- **Description**: Deletes an Owner account by ID.
- **Bearer Token**: **admin_token**

---

### Owner Endpoints

##### Login Owner
- **POST** `/api/v1/owners/login`
- **Description**: Logs in a store owner.
- **Bearer Token**: No
- **Request Body**:
  ```json
  {
    "email": "owner@example.com",
    "password": "yourPassword"
  }
  ```

##### Get Owner Details
- **GET** `/api/v1/owners/details`
- **Description**: Fetches the logged-in owner's details.
- **Bearer Token**: **owner_token**

##### Change Password
- **PUT** `/api/v1/owners/change-password`
- **Description**: Changes the owner's password.
- **Bearer Token**: **owner_token**
- **Request Body**:
  ```json
  {
    "currentPassword": "oldPassword",
    "newPassword": "newPassword"
  }
  ```

##### Update Owner
- **PUT** `/api/v1/owners/update`
- **Description**: Updates an Owner's details.
- **Bearer Token**: **owner_token**
- **Request Body (form-data)**:
  - `first_name`: Owner's first name.
  - `last_name`: Owner's last name.
  - `image`: Updated image.

##### Deactivate Owner
- **PUT** `/api/v1/owners/deactivate`
- **Description**: Deactivates an Owner account.
- **Bearer Token**: **owner_token**

---

### Store Endpoints

##### Create Store
- **POST** `/api/v1/stores/create`
- **Description**: Creates a new store.
- **Bearer Token**: **owner_token**
- **Request Body (form-data)**:
  - `store_name`: Name of the store.
  - `location`: Store location.
  - `status`: Store status (true/false).
  - `image`: Store image.

##### Get All Stores
- **GET** `/api/v1/stores/all`
- **Description**: Fetches all stores.
- **Bearer Token**: **owner_token**

##### Get Store by ID
- **GET** `/api/v1/stores/:id`
- **Description**: Fetches a specific store by ID.
- **Bearer Token**: **owner_token**

##### Update Store
- **PUT** `/api/v1/stores/update/:id`
- **Description**: Updates a store's details.
- **Bearer Token**: **owner_token**
- **Request Body**:
  ```json
  {
    "store_name": "Updated Store",
    "location": "New Location",
    "status": false
  }
  ```

##### Delete Store
- **DELETE** `/api/v1/stores/delete/:id`
- **Description**: Deletes a store by ID.
- **Bearer Token**: **owner_token**

---

### Category Endpoints

##### Create Category
- **POST** `/api/v1/categories/create`
- **Description**: Creates a new category.
- **Bearer Token**: **owner_token**
- **Request Body (form-data)**:
  - `store_id`: ID of the store.
  - `category_name`: Name of the category.
  - `status`: Category status (true/false).
  - `image`: Category image.

##### Get All Categories
- **GET** `/api/v1/categories/all`
- **Description**: Fetches all categories.
- **Bearer Token**: **owner_token**

##### Get Category by ID
- **GET** `/api/v1/categories/:id`
- **Description**: Fetches a specific category by ID.
- **Bearer Token**: **owner_token**

##### Get Categories by Store ID
- **GET** `/api/v1/categories/store/:store_id`
- **Description**: Fetches all categories for a given store.
- **Bearer Token**: **owner_token**

##### Update Category
- **PUT** `/api/v1/categories/update/:id`
- **Description**: Updates a category.
- **Bearer Token**: **owner_token**
- **Request Body (form-data)**:
  - `category_name`: Updated name of the category.
  - `status`: Updated status of the category.
  - `image`: Updated category image.

##### Delete Category
- **DELETE** `/api/v1/categories/delete/:id`
- **Description**: Deletes a category by ID.
- **Bearer Token**: **owner_token**

---

### Product Endpoints

##### Create Product
- **POST** `/api/v1/products/create`
- **Description**: Creates a new product.
- **Bearer Token**: **owner_token**
- **Request Body (form-data)**:
  - `category_id`: ID of the category.
  - `product_name`: Name of the product.
  - `stock_level`: Stock level.
  - `price`: Price of the product.
  - `status`: Product status (true/false).
  - `image`: Product image.

##### Get All Products
- **GET** `/api/v1/products/all`
- **Description**: Fetches all products.
- **Bearer Token**: **owner_token**

##### Get Product by ID
- **GET** `/api/v1/products/:id`
- **Description**: Fetches a specific product by ID.
- **Bearer Token**: **owner_token**

##### Update Product
- **PUT** `/api/v1/products/update/:id`
- **Description**: Updates a product.
- **Bearer Token**: **owner_token**
- **Request Body (form-data)**:
  - `category_id`: Updated category ID.
  - `product_name`: Updated product name.
  - `stock_level`: Updated stock level.
  - `price`: Updated price.
  - `status`: Updated status.
  - `image`: Updated product image.

##### Delete Product
- **DELETE** `/api/v1/products/delete/:id`
- **Description**: Deletes a product by ID.
- **Bearer Token**: **owner_token**

---

### Sales Endpoints

##### Create Sale
- **POST** `/api/v1/sales/create`
- **Description**: Creates a new sale.
- **Bearer Token**: **owner_token**
- **Request Body**:
  ```json
  {
    "sales": [
      {
        "product_id": "product-id",
        "quantity": 2
      },
      {
        "product_id": "product-id",
        "quantity": 2
      }
    ]
  }
  ```

##### Get All Sales
- **GET** `/api/v1/sales/all`
- **Description**: Fetches all sales.
- **Bearer Token**: **owner_token**

##### Get Sale by ID
- **GET** `/api/v1/sales/:id`
- **Description**: Fetches a specific sale by ID.
- **Bearer Token**: **owner_token**

##### Update Sale
- **PUT** `/api/v1/sales/update/:id`
- **Description**: Updates a sale by ID.
- **Bearer Token**: **owner_token**

##### Delete Sale
- **DELETE** `/api/v1/sales/delete/:id`
- **Description**: Deletes a sale by ID.
- **Bearer Token**: **owner_token**

##### Get Sales by Store ID
- **GET** `/api/v1/sales/stores/:store_id`
- **Description**: Fetches all sales for a specific store.
- **Bearer Token**: **owner_token**

##### Get Sales by Product ID
- **GET** `/api/v1/sales/products/:product_id`
- **Description**: Fetches all sales for a specific product.
- **Bearer Token**: **owner_token**

---

## Contributing

Feel free to submit pull requests or raise issues for any bugs or feature requests.

## License

This project is licensed under the MIT License.
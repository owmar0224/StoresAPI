# StoresAPI

### Endpoints Overview

#### 1. **Register Owner**
- **Method:** `POST`
- **Endpoint:** `/api/v1/owners/register`
- **Description:** Registers a new owner.
- **Request Body:**
    ```json
    {
        "first_name": "John",
        "last_name": "Doe",
        "email": "john.doe@example.com",
        "password": "securepassword"
    }
    ```

#### 2. **Login Owner**
- **Method:** `POST`
- **Endpoint:** `/api/v1/owners/login`
- **Description:** Authenticates an owner and returns a JWT token.
- **Request Body:**
    ```json
    {
        "email": "john.doe@example.com",
        "password": "securepassword"
    }
    ```

#### 3. **Get All Owners**
- **Method:** `GET`
- **Endpoint:** `/api/v1/owners`
- **Description:** Retrieves all registered owners (protected route).
- **Headers:**
    - **Authorization:** `Bearer <your_token_here>`

#### 4. **Get Owner by ID**
- **Method:** `GET`
- **Endpoint:** `/api/v1/owners/:id`
- **Description:** Retrieves a specific owner by ID (protected route).
- **Parameters:**
    - **id:** The UUID of the owner.
- **Headers:**
    - **Authorization:** `Bearer <your_token_here>`

#### 5. **Update Owner**
- **Request:**
  - **Method:** `PUT`
  - **URL:** `/api/v1/owners/update`
  - **Body:** (Select `raw` and set type to `JSON`)
    ```json
    {
        "first_name": "Johnathan",
        "last_name": "Doe",
        "email": "johnathan.doe@example.com"
    }
    ```
  - **Headers:**
    - **Authorization:** `Bearer <your_token_here>`

#### 6. **Delete Owner**
- **Request:**
  - **Method:** `DELETE`
  - **URL:** `/api/v1/owners/delete`
  - **Headers:**
    - **Authorization:** `Bearer <your_token_here>`

### Example Requests in Postman

1. **Register Owner**
   - **Request:**
     - **Method:** `POST`
     - **URL:** `http://localhost:3000/api/v1/owners/register`
     - **Body:** (Select `raw` and set type to `JSON`)
     ```json
     {
         "first_name": "John",
         "last_name": "Doe",
         "email": "john.doe@example.com",
         "password": "securepassword"
     }
     ```

2. **Login Owner**
   - **Request:**
     - **Method:** `POST`
     - **URL:** `http://localhost:3000/api/v1/owners/login`
     - **Body:** 
     ```json
     {
         "email": "john.doe@example.com",
         "password": "securepassword"
     }
     ```

3. **Get All Owners**
   - **Request:**
     - **Method:** `GET`
     - **URL:** `http://localhost:3000/api/v1/owners`
     - **Headers:**
       - **Authorization:** `Bearer <your_token_here>`

4. **Get Owner by ID**
   - **Request:**
     - **Method:** `GET`
     - **URL:** `http://localhost:3000/api/v1/owners/<owner_id>`
     - **Headers:**
       - **Authorization:** `Bearer <your_token_here>`

5. **Update Owner**
   - **Request:**
     - **Method:** `PUT`
     - **URL:** `http://localhost:3000/api/v1/owners/update`
     - **Body:**
     ```json
     {
         "first_name": "Johnathan",
         "last_name": "Doe",
         "email": "johnathan.doe@example.com"
     }
     ```
     - **Headers:**
       - **Authorization:** `Bearer <your_token_here>`

6. **Delete Owner**
   - **Request:**
     - **Method:** `DELETE`
     - **URL:** `http://localhost:3000/api/v1/owners/delete`
     - **Headers:**
       - **Authorization:** `Bearer <your_token_here>`
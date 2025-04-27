# Backend API Documentation

This documentation provides an overview of the backend API for user authentication and document management. The API includes routes for user registration, login, logout, password reset, and document management.

## Table of Contents

- [User Authentication](#user-authentication)
    - [Register User](#register-user)
    - [Login User](#login-user)
    - [Logout User](#logout-user)
    - [Forgot Password](#forgot-password)
    - [Reset Password](#reset-password)
- [Document Management](#document-management)
    - [Upload Document](#upload-document)
    - [Get All Documents](#get-all-documents)
    - [Get Pending Documents](#get-pending-documents)
    - [Delete Document](#delete-document)

## User Authentication

### Register User

**Endpoint:** `POST /api/v1/register`

**Request:**
```json
{
    "name": "John Doe",
    "email": "john.doe@example.com",
    "password": "password123"
}
```

**Response:**
```json
{
    "success": true,
    "token": "jwt_token"
}
```

### Login User

**Endpoint:** `POST /api/v1/login`

**Request:**
```json
{
    "email": "john.doe@example.com",
    "password": "password123"
}
```

**Response:**
```json
{
    "success": true,
    "token": "jwt_token"
}
```

### Logout User

**Endpoint:** `GET /api/v1/logout`

**Response:**
```json
{
    "success": true,
    "message": "Logged out successfully"
}
```

### Forgot Password

**Endpoint:** `POST /api/v1/password/forgot`

**Request:**
```json
{
    "email": "john.doe@example.com"
}
```

**Response:**
```json
{
    "success": true,
    "message": "Email sent to: john.doe@example.com"
}
```

### Reset Password

**Endpoint:** `PUT /api/v1/password/reset/:token`

**Request:**
```json
{
    "password": "newpassword123",
    "confirmPassword": "newpassword123"
}
```

**Response:**
```json
{
    "success": true,
    "message": "Password has been reset successfully"
}
```

## Document Management

### Upload Document

**Endpoint:** `POST /api/v1/doc`

**Request:**
- Form Data:
    - `document`: File
    - `phone`: String
    - `category`: String
    - `name`: String

**Response:**
```json
{
    "success": true,
    "message": "Document uploaded successfully",
    "document": {
        "fileName": "document.pdf",
        "fileType": "application/pdf",
        "filePath": "uploads/documents/document.pdf",
        "phone": "1234567890",
        "category": "ID Proof",
        "name": "John Doe"
    }
}
```

### Get All Documents

**Endpoint:** `GET /api/v1/doc`

**Response:**
```json
{
    "success": true,
    "documents": [
        {
            "userId": "user_id",
            "userName": "John Doe",
            "userEmail": "john.doe@example.com",
            "fileName": "document.pdf",
            "fileType": "application/pdf",
            "filePath": "uploads/documents/document.pdf",
            "phone": "1234567890",
            "category": "ID Proof",
            "name": "John Doe",
            "status": "pending",
            "uploadedAt": "2023-10-01T00:00:00.000Z"
        }
    ]
}
```

### Get Pending Documents

**Endpoint:** `GET /api/v1/pending-doc`

**Response:**
```json
{
    "success": true,
    "documents": [
        {
            "userId": "user_id",
            "userName": "John Doe",
            "userEmail": "john.doe@example.com",
            "fileName": "document.pdf",
            "fileType": "application/pdf",
            "filePath": "uploads/documents/document.pdf",
            "phone": "1234567890",
            "category": "ID Proof",
            "name": "John Doe",
            "status": "pending",
            "uploadedAt": "2023-10-01T00:00:00.000Z"
        }
    ]
}
```

### Delete Document

**Endpoint:** `DELETE /api/v1/doc/:id`

**Response:**
```json
{
    "success": true,
    "message": "Document deleted successfully"
}
```


## User Management

### User Profile

**Endpoint:** `GET /api/v1/profile`

**Description:** Fetches the authenticated user's profile.

**Authorization:** User must be authenticated.

**Response:**
```json
{
    "success": true,
    "message": "Profile fetched successfully",
    "user": {
        "id": "user_id",
        "name": "User Name",
        "email": "user@example.com",
        "mobile": "1234567890",
        "avatar": {
            "public_id": "avatar_public_id",
            "url": "avatar_url"
        }
    }
}
```

### Update User Profile

**Endpoint:** `PUT /api/v1/update-profile`

**Description:** Updates the authenticated user's profile.

**Authorization:** User must be authenticated.

**Request:**
```json
{
    "name": "New Name",
    "email": "new_email@example.com",
    "mobile": "9876543210",
    "photo": "file" // Optional file upload
}
```

**Response:**
```json
{
    "message": "Profile updated successfully",
    "user": {
        "id": "user_id",
        "name": "Updated Name",
        "email": "updated_email@example.com",
        "mobile": "9876543210",
        "avatar": {
            "public_id": "new_avatar_public_id",
            "url": "new_avatar_url"
        }
    }
}
```

### Get All Users

**Endpoint:** `GET /api/v1/admin/users`

**Description:** Retrieves all users (accessible to admin).

**Authorization:** Admin only.

**Response:**
```json
{
    "users": [
        {
            "id": "user_id",
            "name": "User Name",
            "email": "user@example.com",
            "role": "user"
        }
    ],
    "page": 1,
    "totalPages": 1,
    "totalUsers": 1
}
```

### Update User Role

**Endpoint:** `PUT /api/v1/admin/users/:userId/:role`

**Description:** Updates a user's role (admin, superadmin, or user).

**Authorization:** Admin only.

**Parameters:**
- `userId`: ID of the user to update.
- `role`: New role (must be one of `user`, `admin`, `superadmin`).

**Response:**
```json
{
    "success": true,
    "message": "User role updated to admin",
    "user": {
        "id": "user_id",
        "role": "admin"
    }
}
```

### Delete User

**Endpoint:** `DELETE /api/v1/admin/users/:userId`

**Description:** Deletes a user (accessible to superadmin).

**Authorization:** Admin only.

**Parameters:**
- `userId`: ID of the user to delete.

**Response:**
```json
{
    "message": "User deleted successfully"
}
```

### Payment Approval

**Endpoint:** `POST /api/v1/payment-approve/:storeId`

**Description:** Approves a payment for a specific store.

**Authorization:** Admin only.

**Parameters:**
- `storeId`: ID of the store for which payment is being approved.

**Request:**
```json
{
    "amount": 100
}
```

**Response:**
```json
{
    "message": "Payment approved successfully"
}
```

### Store Products Blacklist

**Endpoint:** `POST /api/v1/store-products-blacklist/:storeId`

**Description:** Adds products to the blacklist for a specific store.

**Authorization:** Admin only.

**Parameters:**
- `storeId`: ID of the store.

**Request:**
```json
{
    "productId": "product_id"
}
```

**Response:**
```json
{
    "message": "Product blacklisted successfully"
}
```


### Remove Product From Blacklist

**Endpoint:** `POST /api/v1/remove-product-from-blacklist/:storeId`

**Description:** Removes a product from the blacklist for a specific store.

**Authorization:** Admin only.

**Parameters:**
- `storeId`: ID of the store from which the product will be removed.

**Request:**
```json
{
    "productId": "product_id"
}
```

**Response:**
```json
{
    "message": "Product removed from blacklist successfully"
}
```

### Get All Products From Blacklist

**Endpoint:** `GET /api/v1/store-products-blacklist/:storeId`

**Description:** Retrieves all products from the blacklist for a specific store.

**Authorization:** Admin only.

**Parameters:**
- `storeId`: ID of the store.

**Response:**
```json
{
    "success": true,
    "products": [
        {
            "id": "product_id",
            "name": "Product Name",
            "reason": "Reason for blacklisting"
        }
    ]
}
```

### Store Suspension

**Endpoint:** `POST /api/v1/store-suspension/:storeId`

**Description:** Suspends a specific store.

**Authorization:** Admin only.

**Parameters:**
- `storeId`: ID of the store to suspend.

**Request:**
```json
{
    "suspensionReason": "Reason for suspension"
}
```

**Response:**
```json
{
    "success": true,
    "message": "Store suspended successfully"
}
```

### Get All Suspended Stores

**Endpoint:** `GET /api/v1/all-suspension-stores`

**Description:** Retrieves all suspended stores.

**Authorization:** Admin only.

**Response:**
```json
{
    "success": true,
    "stores": [
        {
            "id": "store_id",
            "name": "Store Name",
            "status": "suspended"
        }
    ]
}
```

### Recover Store

**Endpoint:** `POST /api/v1/recover-store/:storeId`

**Description:** Recovers a suspended store.

**Authorization:** Admin only.

**Parameters:**
- `storeId`: ID of the store to recover.

**Response:**
```json
{
    "success": true,
    "message": "Store recovered successfully"
}
```

## Store Management

### Register Store

**Endpoint:** `POST /api/v1/store/register`

**Request:**
```json
{
    "name": "Store Name",
    "description": "Store Description",
    "address": "Store Address",
    "location": {
        "type": "Point",
        "coordinates": [longitude, latitude] // Valid coordinates (longitude, latitude) 
    },
    "phone": "1234567890",
    "email": "store@example.com",
    "password": "password",
    "photo": {
        "public_id": "photo_public_id",
        "url": "photo_url"
    }
}
```

**Response:**
```json
{
    "success": true,
    "message": "Store created successfully",
    "store": {
        "id": "store_id",
        "name": "Store Name",
        "description": "Store Description",
        "address": "Store Address",
        "location": {
            "type": "Point",
            "coordinates": [longitude, latitude]
        },
        "phone": "1234567890",
        "email": "store@example.com",
        "photo": {
            "public_id": "photo_public_id",
            "url": "photo_url"
        },
        "emailVerified": false,
        "verificationToken": "verification_token"
    }
}
```

### Get All Blacklist Products

**Endpoint:** `GET /api/v1/get-all-blacklist-products`

**Description:** Retrieves all products from the blacklist for the authenticated store.

**Authorization:** Store owner only.

**Response:**
```json
{
    "success": true,
    "products": [
        {
            "id": "product_id",
            "name": "Product Name",
            "description": "Product Description",
            "price": 100,
            "category": "category_id",
            "status": "blacklisted"
        }
    ]
}
```

### Login Store

**Endpoint:** `POST /api/v1/store/login`

**Request:**
```json
{
    "email": "store@example.com",
    "password": "password123"
}
```

**Response:**
```json
{
    "success": true,
    "token": "jwt_token"
}
```

### Get Store Profile

**Endpoint:** `GET /api/v1/store/profile`

**Response:**
```json
{
    "success": true,
    "store": {
        "id": "store_id",
        "name": "Store Name",
        "description": "Store Description",
        "address": "Store Address",
        "location": {
            "type": "Point",
            "coordinates": [longitude, latitude]
        },
        "phone": "1234567890",
        "email": "store@example.com",
        "photo": {
            "public_id": "photo_public_id",
            "url": "photo_url"
        },
        "emailVerified": true
    }
}
```

### Update Store Profile

**Endpoint:** `PUT /api/v1/store/update-profile`

**Request:**
```json
{
    "name": "Updated Store Name",
    "description": "Updated Store Description",
    "address": "Updated Store Address",
    "location": {
        "type": "Point",
        "coordinates": [new_longitude, new_latitude]
    },
    "phone": "0987654321",
    "email": "new_store@example.com",
    "photo": {
        "public_id": "new_photo_public_id",
        "url": "new_photo_url"
    }
}
```

**Response:**
```json
{
    "success": true,
    "message": "Store updated successfully",
    "store": {
        "id": "store_id",
        "name": "Updated Store Name",
        "description": "Updated Store Description",
        "address": "Updated Store Address",
        "location": {
            "type": "Point",
            "coordinates": [new_longitude, new_latitude]
        },
        "phone": "0987654321",
        "email": "new_store@example.com",
        "photo": {
            "public_id": "new_photo_public_id",
            "url": "new_photo_url"
        }
    }
}
```

### Logout Store

**Endpoint:** `GET /api/v1/store/logout`

**Response:**
```json
{
    "success": true,
    "message": "Logged out successfully"
}
```

### Get All Stores

**Endpoint:** `GET /api/v1/store/all`

**Response:**
```json
{
    "success": true,
    "stores": [
        {
            "id": "store_id",
            "name": "Store Name",
            "description": "Store Description",
            "address": "Store Address",
            "location": {
                "type": "Point",
                "coordinates": [longitude, latitude]
            },
            "phone": "1234567890",
            "email": "store@example.com",
            "photo": {
                "public_id": "photo_public_id",
                "url": "photo_url"
            },
            "emailVerified": true
        }
    ],
    "page": 1,
    "totalPages": 1,
    "totalStores": 1
}
```


### Forgot Password

**Endpoint:** `POST /api/v1/store/password/forgot`

**Request:**
```json
{
    "email": "john.doe@example.com"
}
```

**Response:**
```json
{
    "success": true,
    "message": "Email sent to: john.doe@example.com"
}
```

### Reset Password

**Endpoint:** `PUT /api/v1/store/password/reset/:token`

**Request:**
```json
{
    "password": "newpassword123",
    "confirmPassword": "newpassword123"
}
```

**Response:**
```json
{
    "success": true,
    "message": "Password has been reset successfully"
}
```


# Category Routes Documentation

## Create Category
- **URL:** `/api/v1/category`
- **Method:** `POST`
- **Middleware:** `isAuthenticatedStore`
- **Description:** Creates a new category for the authenticated store.
- **Request Body:**
    - `name` (string): The name of the category.
- **Response:**
    - `201 Created`: Category created successfully.
    - `400 Bad Request`: If the seller already has a category.

## Get Categories by Seller
- **URL:** `/api/v1/category`
- **Method:** `GET`
- **Middleware:** `isAuthenticatedStore`
- **Description:** Retrieves all categories for the authenticated store.
- **Response:**
    - `200 OK`: An array of categories.

## Update Category
- **URL:** `/api/v1/category/:categoryId`
- **Method:** `PUT`
- **Middleware:** `isAuthenticatedStore`
- **Description:** Updates a category for the authenticated store.
- **Request Params:**
    - `categoryId` (string): The ID of the category to update.
- **Request Body:**
    - `name` (string): The new name of the category.
- **Response:**
    - `200 OK`: Category updated successfully.
    - `404 Not Found`: If the category is not found.

## Delete Category
- **URL:** `/api/v1/category/:categoryId`
- **Method:** `DELETE`
- **Middleware:** `isAuthenticatedStore`
- **Description:** Deletes a category for the authenticated store.
- **Request Params:**
    - `categoryId` (string): The ID of the category to delete.
- **Response:**
    - `200 OK`: Category deleted successfully.
    - `404 Not Found`: If the category is not found.

## Add Subcategory
- **URL:** `/api/v1/category/:categoryId/subcategories`
- **Method:** `PUT`
- **Middleware:** `isAuthenticatedStore`
- **Description:** Adds a subcategory to a category for the authenticated store.
- **Request Params:**
    - `categoryId` (string): The ID of the category.
- **Request Body:**
    - `name` (string): The name of the subcategory.
    - `description` (string): The description of the subcategory.
- **Response:**
    - `200 OK`: Subcategory added successfully.
    - `404 Not Found`: If the category is not found or the seller does not have permission.

## Update Subcategory
- **URL:** `/api/v1/category/:categoryId/subcategory/:subcategoryId`
- **Method:** `PUT`
- **Middleware:** `isAuthenticatedStore`
- **Description:** Updates a subcategory within a category for the authenticated store.
- **Request Params:**
    - `categoryId` (string): The ID of the category.
    - `subcategoryId` (string): The ID of the subcategory to update.
- **Request Body:**
    - `name` (string): The new name of the subcategory.
    - `description` (string): The new description of the subcategory.
- **Response:**
    - `200 OK`: Subcategory updated successfully.
    - `404 Not Found`: If the category or subcategory is not found.

## Delete Subcategory
- **URL:** `/api/v1/category/:categoryId/subcategory/:subcategoryId`
- **Method:** `DELETE`
- **Middleware:** `isAuthenticatedStore`
- **Description:** Deletes a subcategory from a category for the authenticated store.
- **Request Params:**
    - `categoryId` (string): The ID of the category.
    - `subcategoryId` (string): The ID of the subcategory to delete.
- **Response:**
    - `200 OK`: Subcategory deleted successfully.
    - `404 Not Found`: If the category or subcategory is not found.


    # Product Routes Documentation

    ## Create New Product

    **Endpoint:** `POST /api/v1/product/new`

    **Method:** `POST`

    **Middleware:** `isAuthenticatedUser`, `authorizeRoles('admin')`, `imageUpload.array('images', 5)`

    **Description:** Creates a new product.

    **Request:**
    ```json
    {
        "name": "Product Name",
        "description": "Product Description",
        "price": 100,
        "category": "category_id",
        "subcategory": "subcategory_id",
        "stock": 50,
         "images": [
                {
                    "url": "image_url",
                    "filename": "image_filename"
                }
            ],
        "discountPercentage": 10,
        "discountStartDate": "2023-10-01T00:00:00.000Z",
        "discountEndDate": "2023-10-31T23:59:59.999Z"
    }
    ```

    **Response:**
    ```json
    {
        "success": true,
        "message": "Product created successfully",
        "product": {
            "id": "product_id",
            "name": "Product Name",
            "description": "Product Description",
            "price": 100,
            "discountedPrice": 90,
            "category": "category_id",
            "subcategory": "subcategory_id",
            "stock": 50,
            "images": [
                {
                    "url": "image_url",
                    "filename": "image_filename"
                }
            ],
            "seller": "user_id",
            "discountPercentage": 10,
            "discountStartDate": "2023-10-01T00:00:00.000Z",
            "discountEndDate": "2023-10-31T23:59:59.999Z"
        }
    }
    ```

    ## Get All Products

    **Endpoint:** `GET /api/v1/products`

    **Method:** `GET`

    **Middleware:** `isAuthenticatedStore`

    **Description:** Retrieves all products with optional search and filter queries.

    **Response:**
    ```json
    {
        "success": true,
        "productsCount": 100,
        "resPerPage": 4,
        "filteredProductsCount": 50,
        "products": [
            {
                "id": "product_id",
                "name": "Product Name",
                "description": "Product Description",
                "price": 100,
                "discountedPrice": 90,
                "category": "category_id",
                "subcategory": "subcategory_id",
                "stock": 50,
                "images": [
                    {
                        "url": "image_url",
                        "filename": "image_filename"
                    }
                ],
                "seller": "user_id",
                "discountPercentage": 10,
                "discountStartDate": "2023-10-01T00:00:00.000Z",
                "discountEndDate": "2023-10-31T23:59:59.999Z"
            }
        ]
    }
    ```
    ## Get Store Products

    **Endpoint:** `GET /api/v1/store/products`

    **Method:** `GET`

    **Middleware:** `isAuthenticatedStore`

    **Description:** Retrieves all products for the authenticated store with optional search and filter queries.

    **Response:**
    ```json
    {
        "success": true,
        "productsCount": 100,
        "resPerPage": 4,
        "filteredProductsCount": 50,
        "products": [
            {
                "id": "product_id",
                "name": "Product Name",
                "description": "Product Description",
                "price": 100,
                "discountedPrice": 90,
                "category": "category_id",
                "subcategory": "subcategory_id",
                "stock": 50,
                "images": [
                    {
                        "url": "image_url",
                        "filename": "image_filename"
                    }
                ],
                "seller": "store_id",
                "discountPercentage": 10,
                "discountStartDate": "2023-10-01T00:00:00.000Z",
                "discountEndDate": "2023-10-31T23:59:59.999Z"
            }
        ]
    }
    ```
    ## Get Single Product

    **Endpoint:** `GET /api/v1/product/:id`

    **Method:** `GET`

    **Middleware:** `isAuthenticatedUser`

    **Description:** Retrieves a single product by its ID.

    **Response:**
    ```json
    {
        "success": true,
        "product": {
            "id": "product_id",
            "name": "Product Name",
            "description": "Product Description",
            "price": 100,
            "discountedPrice": 90,
            "category": "category_id",
            "subcategory": "subcategory_id",
            "stock": 50,
            "images": [
                {
                    "url": "image_url",
                    "filename": "image_filename"
                }
            ],
            "seller": "user_id",
            "discountPercentage": 10,
            "discountStartDate": "2023-10-01T00:00:00.000Z",
            "discountEndDate": "2023-10-31T23:59:59.999Z"
        }
    }
    ```

    ## Update Product

    **Endpoint:** `PUT /api/v1/admin/product/:id`

    **Method:** `PUT`

    **Middleware:** `isAuthenticatedUser`, `authorizeRoles('admin')`

    **Description:** Updates a product by its ID.

    **Request:**
    ```json
    {
        "name": "Updated Product Name",
        "description": "Updated Product Description",
        "price": 120,
        "stock": 60
    }
    ```

    **Response:**
    ```json
    {
        "success": true,
        "product": {
            "id": "product_id",
            "name": "Updated Product Name",
            "description": "Updated Product Description",
            "price": 120,
            "discountedPrice": 108,
            "category": "category_id",
            "subcategory": "subcategory_id",
            "stock": 60,
            "images": [
                {
                    "url": "image_url",
                    "filename": "image_filename"
                }
            ],
            "seller": "user_id",
            "discountPercentage": 10,
            "discountStartDate": "2023-10-01T00:00:00.000Z",
            "discountEndDate": "2023-10-31T23:59:59.999Z"
        }
    }
    ```

    ## Delete Product

    **Endpoint:** `DELETE /api/v1/admin/product/:id`

    **Method:** `DELETE`

    **Middleware:** `isAuthenticatedUser`, `authorizeRoles('admin')`

    **Description:** Deletes a product by its ID.

    **Response:**
    ```json
    {
        "success": true,
        "message": "Product deleted successfully"
    }
    ```

    ## Bulk Upload Products

    **Endpoint:** `POST /api/v1/product/bulk-upload`

    **Method:** `POST`

    **Middleware:** `isAuthenticatedUser`, `authorizeRoles('admin')`, `csvUpload.single('file')`

    **Description:** Bulk uploads products from a CSV file.

    **Request:**
    - Form Data:
        - `file`: CSV file containing product data

    **Response:**
    ```json
    {
        "success": true,
        "message": "Products created successfully",
        "count": 10
    }
    ```

    ## Discount Management

    ### Update Product Discount

    **Endpoint:** `PUT /api/v1/discount/:productId`

    **Method:** `PUT`

    **Middleware:** `isAuthenticatedStore`

    **Description:** Updates the discount of a product.

    **Request:**
    ```json
    {
        "discountPercentage": 20,
        "discountStartDate": "2023-10-01T00:00:00.000Z",
        "discountEndDate": "2023-10-31T23:59:59.999Z"
    }
    ```

    **Response:**
    ```json
    {
        "success": true,
        "message": "Product discount updated successfully",
        "product": {
            "id": "product_id",
            "name": "Product Name",
            "discountPercentage": 20,
            "discountStartDate": "2023-10-01T00:00:00.000Z",
            "discountEndDate": "2023-10-31T23:59:59.999Z"
        }
    }
    ```

        ## Example: Sending Discount Data

    To send discount data to the backend, you can use the following JavaScript code to convert local dates to UTC format before sending the request:

    ```javascript
    function convertLocalToUTC(dateString) {
        return new Date(dateString).toISOString(); // Converts local time to UTC
    }

    const dataToSend = {
        discountPercentage: 50,
        discountStartDate: convertLocalToUTC("2025-01-06T00:00:00"), // Local midnight
        discountEndDate: convertLocalToUTC("2025-01-08T23:59:59"),  // Local end of day
    };

    console.log(dataToSend);
    ```

    This will produce the following JSON object to be sent in the request body:

    ```json
    {
        "discountPercentage": 50,
        "discountStartDate": "2025-01-06T00:00:00.000Z",
        "discountEndDate": "2025-01-08T23:59:59.000Z"
    }
    ```


    ### Remove Product Discount

    **Endpoint:** `DELETE /api/v1/:productId`

    **Method:** `DELETE`

    **Middleware:** `isAuthenticatedStore`

    **Description:** Removes the discount from a product.

    **Response:**
    ```json
    {
        "success": true,
        "message": "Product discount removed successfully",
        "product": {
            "id": "product_id",
            "name": "Product Name",
            "discountPercentage": 0,
            "discountedPrice": 100
        }
    }
    ```


    ## Order Management

    ### Create Order

    **Endpoint:** `POST /api/v1/order`

    **Method:** `POST`

    **Middleware:** `isAuthenticatedUser`

    **Description:** Creates a new order.

    **Request:**
    ```json
    {
        "shippingInfo": {
            "address": "123 Main St",
            "city": "New York",
            "phoneNo": "1234567890",
            "postalCode": "10001",
            "country": "USA"
        },
        "orderItems": [
            {
                "name": "Product Name",
                "quantity": 2,
                "image": "image_url",
                "price": 50,
                "product": "product_id"
            }
        ],
        "paymentInfo": {
            "method": "COD"
        },
        "itemsPrice": 100,
        "shippingPrice": 10,
        "taxPrice": 5,
        "totalPrice": 115,
        "storeId": "store_id"
    }
    ```

    **Response:**
    ```json
    {
        "success": true,
        "order": {
            "id": "order_id",
            "user": "user_id",
            "store": "store_id",
            "shippingInfo": {
                "address": "123 Main St",
                "city": "New York",
                "phoneNo": "1234567890",
                "postalCode": "10001",
                "country": "USA"
            },
            "orderItems": [
                {
                    "name": "Product Name",
                    "quantity": 2,
                    "image": "image_url",
                    "price": 50,
                    "product": "product_id"
                }
            ],
            "paymentInfo": {
                "method": "COD",
                "status": "pending"
            },
            "itemsPrice": 100,
            "shippingPrice": 10,
            "taxPrice": 5,
            "totalPrice": 115,
            "orderStatus": "pending",
            "createdAt": "2023-10-01T00:00:00.000Z"
        }
    }
    ```

    ### Get Order by ID

    **Endpoint:** `GET /api/v1/order/:id`

    **Method:** `GET`

    **Middleware:** `isAuthenticatedUser`

    **Description:** Retrieves an order by its ID.

    **Response:**
    ```json
    {
        "success": true,
        "order": {
            "id": "order_id",
            "user": "user_id",
            "store": "store_id",
            "shippingInfo": {
                "address": "123 Main St",
                "city": "New York",
                "phoneNo": "1234567890",
                "postalCode": "10001",
                "country": "USA"
            },
            "orderItems": [
                {
                    "name": "Product Name",
                    "quantity": 2,
                    "image": "image_url",
                    "price": 50,
                    "product": "product_id"
                }
            ],
            "paymentInfo": {
                "method": "COD",
                "status": "pending"
            },
            "itemsPrice": 100,
            "shippingPrice": 10,
            "taxPrice": 5,
            "totalPrice": 115,
            "orderStatus": "pending",
            "createdAt": "2023-10-01T00:00:00.000Z"
        }
    }
    ```

    ### Update Order Status

    **Endpoint:** `PUT /api/v1/order/:id/status`

    **Method:** `PUT`

    **Middleware:** `isAuthenticatedStore`

    **Description:** Updates the status of an order.

    **Request:**
    ```json
    {
        "status": "shipped"
    }
    ```

    **Response:**
    ```json
    {
        "success": true,
        "message": "Order status updated to shipped",
        "order": {
            "id": "order_id",
            "orderStatus": "shipped",
            "trackingDetails": {
                "status": "shipped",
                "updatedAt": "2023-10-01T00:00:00.000Z"
            }
        }
    }
    ```

    ### Update Payment Status

    **Endpoint:** `PUT /api/v1/order/payment-status/:id`

    **Method:** `PUT`

    **Middleware:** `isAuthenticatedStore`

    **Description:** Updates the payment status of an order.

    **Request:**
    ```json
    {
        "paymentStatus": "paid"
    }
    ```

    **Response:**
    ```json
    {
        "success": true,
        "message": "Payment status for Order ID: order_id updated to paid",
        "order": {
            "id": "order_id",
            "paymentInfo": {
                "status": "paid"
            },
            "paidAt": "2023-10-01T00:00:00.000Z"
        }
    }
    ```

    ### Get All Store Orders

    **Endpoint:** `GET /api/v1/order/store/orders`

    **Method:** `GET`

    **Middleware:** `isAuthenticatedStore`

    **Description:** Retrieves all orders for the authenticated store.

    **Response:**
    ```json
    {
        "success": true,
        "orders": [
            {
                "id": "order_id",
                "user": "user_id",
                "store": "store_id",
                "shippingInfo": {
                    "address": "123 Main St",
                    "city": "New York",
                    "phoneNo": "1234567890",
                    "postalCode": "10001",
                    "country": "USA"
                },
                "orderItems": [
                    {
                        "name": "Product Name",
                        "quantity": 2,
                        "image": "image_url",
                        "price": 50,
                        "product": "product_id"
                    }
                ],
                "paymentInfo": {
                    "method": "COD",
                    "status": "pending"
                },
                "itemsPrice": 100,
                "shippingPrice": 10,
                "taxPrice": 5,
                "totalPrice": 115,
                "orderStatus": "pending",
                "createdAt": "2023-10-01T00:00:00.000Z"
            }
        ]
    }
    ```

      ### Get All  Orders For Admin

    **Endpoint:** `GET /api/v1/order/all`

    **Method:** `GET`

    **Description:** Retrieves all orders for the Admin.

    **Response:**
    ```json
    {
        "success": true,
        "orders": [
            {
                "id": "order_id",
                "user": "user_id",
                "store": "store_id",
                "shippingInfo": {
                    "address": "123 Main St",
                    "city": "New York",
                    "phoneNo": "1234567890",
                    "postalCode": "10001",
                    "country": "USA"
                },
                "orderItems": [
                    {
                        "name": "Product Name",
                        "quantity": 2,
                        "image": "image_url",
                        "price": 50,
                        "product": "product_id"
                    }
                ],
                "paymentInfo": {
                    "method": "COD",
                    "status": "pending"
                },
                "itemsPrice": 100,
                "shippingPrice": 10,
                "taxPrice": 5,
                "totalPrice": 115,
                "orderStatus": "pending",
                "createdAt": "2023-10-01T00:00:00.000Z"
            }
        ]
    }
    ```


    ### Track Order

    **Endpoint:** `GET /api/v1/order/:id/track`

    **Method:** `GET`

    **Middleware:** `isAuthenticatedStoreOrUser`, `authorizeRolesAndStoreAccess('admin', 'storeowner')`

    **Description:** Retrieves the tracking details of an order.

    **Response:**
    ```json
    {
        "success": true,
        "trackingDetails": {
            "status": "shipped",
            "updatedAt": "2023-10-01T00:00:00.000Z",
            "courier": "DHL",
            "trackingNumber": "1234567890",
            "estimatedDelivery": "2023-10-05T00:00:00.000Z"
        }
    }
    ```

    ### Update Tracking Details

    **Endpoint:** `PUT /api/v1/order/update-tracking/:id`

    **Method:** `PUT`

    **Middleware:** `isAuthenticatedStore`

    **Description:** Updates the tracking details of an order.

    **Request:**
    ```json
    {
        "trackingDetails": {
            "courier": "DHL",
            "trackingNumber": "1234567890",
            "estimatedDelivery": "2023-10-05T00:00:00.000Z"
        }
    }
    ```

    **Response:**
    ```json
    {
        "success": true,
        "message": "Tracking details updated successfully.",
        "order": {
            "id": "order_id",
            "trackingDetails": {
                "courier": "DHL",
                "trackingNumber": "1234567890",
                "estimatedDelivery": "2023-10-05T00:00:00.000Z"
            }
        }
    }
    ```


    ## Package Management

    ### Create Package and Process Payment

    **Endpoint:** `POST /api/v1/package`

    **Method:** `POST`

    **Middleware:** `isAuthenticatedStore`

    **Description:** Creates a new package and processes the payment for the authenticated store.

    **Request:**
    ```json
    {
        "packageType": "Medium",
        "paymentMethod": "pm_card_visa"
    }
    ```

    **Response:**
    ```json
    {
        "success": true,
        "message": "Payment successful. Package subscribed.",
        "data": {
            "userPackage": {
                "id": "package_id",
                "name": "Medium",
                "expiresAt": "2023-11-01T00:00:00.000Z"
            },
            "newPackage": {
                "id": "package_id",
                "name": "Medium",
                "price": 1000,
                "features": {
                    "productLimit": 50,
                    "support": "Priority Email Support",
                    "analytics": "Advanced Analytics",
                    "paymentGateways": "Standard + Premium Gateways",
                    "marketingTools": true,
                    "globalReach": true,
                    "referralProgram": true,
                    "transactionLimits": "Up to $2000/month"
                },
                "isActive": true,
                "createdAt": "2023-10-01T00:00:00.000Z",
                "updatedAt": "2023-10-01T00:00:00.000Z"
            }
        }
    }
    ```

    ### Get All Packages

    **Endpoint:** `GET /api/v1/package`

    **Method:** `GET`

    **Middleware:** `isAuthenticatedUser`, `authorizeRoles('admin')`

    **Description:** Retrieves all packages.

    **Response:**
    ```json
    {
        "success": true,
        "data": [
            {
                "id": "package_id",
                "name": "Medium",
                "price": 1000,
                "features": {
                    "productLimit": 50,
                    "support": "Priority Email Support",
                    "analytics": "Advanced Analytics",
                    "paymentGateways": "Standard + Premium Gateways",
                    "marketingTools": true,
                    "globalReach": true,
                    "referralProgram": true,
                    "transactionLimits": "Up to $2000/month"
                },
                "isActive": true,
                "createdAt": "2023-10-01T00:00:00.000Z",
                "updatedAt": "2023-10-01T00:00:00.000Z"
            }
        ]
    }
    ```

    ### Get Package by ID

    **Endpoint:** `GET /api/v1/package/:id`

    **Method:** `GET`

    **Middleware:** `isAuthenticatedStoreOrUser`, `authorizeRolesAndStoreAccess('admin', 'storeowner')`

    **Description:** Retrieves a package by its ID.

    **Response:**
    ```json
    {
        "success": true,
        "data": {
            "id": "package_id",
            "name": "Medium",
            "price": 1000,
            "features": {
                "productLimit": 50,
                "support": "Priority Email Support",
                "analytics": "Advanced Analytics",
                "paymentGateways": "Standard + Premium Gateways",
                "marketingTools": true,
                "globalReach": true,
                "referralProgram": true,
                "transactionLimits": "Up to $2000/month"
            },
            "isActive": true,
            "createdAt": "2023-10-01T00:00:00.000Z",
            "updatedAt": "2023-10-01T00:00:00.000Z"
        }
    }
    ```

    ### Update Package

    **Endpoint:** `PUT /api/v1/package/:id`

    **Method:** `PUT`

    **Middleware:** `isAuthenticatedUser`, `authorizeRoles('admin')`

    **Description:** Updates a package by its ID.

    **Request:**
    ```json
    {
        "name": "Updated Package Name",
        "price": 1200,
        "features": {
            "productLimit": 60,
            "support": "24/7 Support",
            "analytics": "Full Analytics Suite",
            "paymentGateways": "All Gateways + Custom Integrations",
            "marketingTools": true,
            "globalReach": true,
            "referralProgram": true,
            "transactionLimits": "Up to $5000/month"
        }
    }
    ```

    **Response:**
    ```json
    {
        "success": true,
        "data": {
            "id": "package_id",
            "name": "Updated Package Name",
            "price": 1200,
            "features": {
                "productLimit": 60,
                "support": "24/7 Support",
                "analytics": "Full Analytics Suite",
                "paymentGateways": "All Gateways + Custom Integrations",
                "marketingTools": true,
                "globalReach": true,
                "referralProgram": true,
                "transactionLimits": "Up to $5000/month"
            },
            "isActive": true,
            "createdAt": "2023-10-01T00:00:00.000Z",
            "updatedAt": "2023-10-01T00:00:00.000Z"
        }
    }
    ```

    ### Delete Package

    **Endpoint:** `DELETE /api/v1/package/:id`

    **Method:** `DELETE`

    **Middleware:** `isAuthenticatedUser`, `authorizeRoles('admin')`

    **Description:** Deletes a package by its ID.

    **Response:**
    ```json
    {
        "success": true,
        "message": "Package deleted successfully"
    }
    ```

    ### Process Payment

    **Endpoint:** `POST /api/v1/package/process`

    **Method:** `POST`

    **Middleware:** `isAuthenticatedUser`

    **Description:** Processes the payment for a package.

    **Request:**
    ```json
    {
        "packageId": "package_id",
        "paymentMethod": "pm_card_visa"
    }
    ```

    **Response:**
    ```json
    {
        "success": true,
        "message": "Payment successful. Package subscribed.",
        "data": {
            "id": "package_id",
            "name": "Medium",
            "expiresAt": "2023-11-01T00:00:00.000Z"
        }
    }
    ```

    ## Advertisement Management

    ### Create Advertisement

    **Endpoint:** `POST /api/v1/ads`

    **Method:** `POST`

    **Middleware:** `isAuthenticatedUser`, `authorizeRoles('admin')`, `imageUpload.single('image')`

    **Description:** Creates a new advertisement.

    **Request:**
    ```json
    {
        "title": "Ad Title",
        "description": "Ad Description",
        "product": "product_id",
        "startDate": "2023-10-01T00:00:00.000Z",
        "endDate": "2023-10-31T23:59:59.999Z"
    }
    ```
    - Form Data:
        - `image`: File

    **Response:**
    ```json
    {
        "success": true,
        "message": "Advertisement created successfully",
        "ad": {
            "id": "ad_id",
            "title": "Ad Title",
            "description": "Ad Description",
            "image": "image_path",
            "product": "product_id",
            "startDate": "2023-10-01T00:00:00.000Z",
            "endDate": "2023-10-31T23:59:59.999Z",
            "status": "active"
        }
    }
    ```

    ### Update Advertisement

    **Endpoint:** `PUT /api/v1/ads/:id`

    **Method:** `PUT`

    **Middleware:** `isAuthenticatedUser`, `authorizeRoles('admin')`, `imageUpload.single('image')`

    **Description:** Updates an existing advertisement.

    **Request:**
    ```json
    {
        "title": "Updated Ad Title",
        "description": "Updated Ad Description",
        "product": "new_product_id",
        "startDate": "2023-11-01T00:00:00.000Z",
        "endDate": "2023-11-30T23:59:59.999Z",
        "status": "inactive"
    }
    ```
    - Form Data:
        - `image`: File (optional)

    **Response:**
    ```json
    {
        "success": true,
        "message": "Advertisement updated successfully",
        "ad": {
            "id": "ad_id",
            "title": "Updated Ad Title",
            "description": "Updated Ad Description",
            "image": "new_image_path",
            "product": "new_product_id",
            "startDate": "2023-11-01T00:00:00.000Z",
            "endDate": "2023-11-30T23:59:59.999Z",
            "status": "inactive"
        }
    }
    ```

    ### Delete Advertisement

    **Endpoint:** `DELETE /api/v1/ads/:id`

    **Method:** `DELETE`

    **Middleware:** `isAuthenticatedUser`, `authorizeRoles('admin')`

    **Description:** Deletes an advertisement by its ID.

    **Response:**
    ```json
    {
        "success": true,
        "message": "Advertisement deleted successfully"
    }
    ```

    ### Get Active Advertisements

    **Endpoint:** `GET /api/v1/ads/active`

    **Method:** `GET`

    **Description:** Retrieves all active advertisements.

    **Response:**
    ```json
    {
        "success": true,
        "ads": [
            {
                "id": "ad_id",
                "title": "Ad Title",
                "description": "Ad Description",
                "image": "image_path",
                "product": {
                    "id": "product_id",
                    "name": "Product Name"
                },
                "startDate": "2023-10-01T00:00:00.000Z",
                "endDate": "2023-10-31T23:59:59.999Z",
                "status": "active"
            }
        ]
    }
    ```


## Authentication Middleware

- `isAuthenticatedUser`: Middleware to check if the user is authenticated.
- `authorizeRoles`: Middleware to authorize user roles (e.g., `superadmin`).

## Error Handling

All errors are handled using a custom `ApiError` class and the `catchAsyncErrors` middleware.

## Environment Variables

- `JWT_SECRET`: Secret key for JWT.
- `JWT_EXPIRES_TIME`: JWT expiration time.
- `FRONTEND_URL`: URL of the frontend application.

## Dependencies

- `express`: Web framework for Node.js.
- `mongoose`: MongoDB object modeling tool.
- `bcryptjs`: Library to hash passwords.
- `jsonwebtoken`: Library to work with JSON Web Tokens.
- `multer`: Middleware for handling `multipart/form-data`.
- `dotenv`: Module to load environment variables.
- `validator`: Library for string validation and sanitization.

## Setup

1. Clone the repository.
2. Install dependencies: `npm install`.
3. Create a `.env` file and add the required environment variables.
4. Start the server: `npm start`.

## License

This project is licensed under the MIT License.



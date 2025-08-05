# Stellar Wallet API

This project is a back-end API built with Node.js, Express, and Stellar SDK. It provides a simple way to interact with the Stellar blockchain by abstracting the low-level blockchain operations from the user. The application uses **Docker** and **Docker Compose** to containerize the API and a **MySQL** database for persistent storage of user wallets.

The primary goal of this API is to offer a seamless user experience where developers can programmatically create wallets and manage transactions without the end-user having to handle secret keys or understand blockchain specifics.

---

## Features

- **Programmatically created wallets**: Generate Stellar keypairs for new users with a simple API call.
- **Automated Testnet funding**: New wallets on the Testnet are automatically funded via Friendbot for easy development and testing.
- **Abstracted transactions**: Send payments by simply providing a source and destination public key and an amount; the server handles the rest.
- **Secure wallet storage**: Wallets are stored in a MySQL database, with a note on the importance of key encryption.
- **Dockerized environment**: The entire application stack (API and database) runs in isolated containers, ensuring a consistent and portable development environment.

---

## Prerequisites

Before you begin, ensure you have the following installed:

- **Git**
- **Docker**
- **Docker Compose**

---

## Getting Started

Follow these steps to get a copy of the project up and running on your local machine.

### 1. Clone the repository

```bash
git clone [https://github.com/kipngeno-isaac/stellar-api.git](https://github.com/kipngeno-isaac/stellar-api.git)
cd stellar-api
```

### 2. Configure Environment Variables

Create a .env file in the root directory and populate it with the necessary configuration. This file contains settings for the Stellar network and your MySQL database.

```bash
# Stellar API Configuration
HORIZON_URL=[https://horizon-testnet.stellar.org](https://horizon-testnet.stellar.org)
STELLAR_NETWORK_PASSPHRASE="Test SDF Network ; September 2015"

# MySQL Database Configuration
DB_ROOT_PASSWORD=your_mysql_root_password
DB_USER=stellar_user
DB_PASSWORD=stellar_user_password
DB_NAME=stellar_wallets
```
Note: Replace the placeholder values with your desired passwords. In a production environment, you should use a more robust secrets management solution.

### 3. Run the application with Docker Compose

This single command will build the Docker images and start both the API and the MySQL database containers. The database migration script will automatically create the stellar_wallets database and wallets table.

```bash 
docker-compose up --build
```
The API will be accessible at http://localhost:3000 and the MySQL database will be available at localhost:3306.

---

## API Endpoints

You can interact with the API using a tool like curl or Postman.

POST /api/wallet/create
Creates a new Stellar wallet (keypair), funds it on the Testnet, and saves it to the database.

Request:

```Bash

curl -X POST http://localhost:3000/api/wallet/create
Response:

JSON

{
  "message": "Wallet created and funded successfully",
  "publicKey": "GA...<new public key>..."
}
GET /api/wallet/:publicKey/balance
Retrieves the current native (XLM) balance for a given public key.

Request:

Bash

curl http://localhost:3000/api/wallet/GA.../balance
Response:

JSON

{
  "publicKey": "GA...",
  "balance": "10000.0000000"
}
POST /api/transaction/send-payment
Sends a payment from a source wallet (managed by the API) to a destination wallet.

Request:

Bash

curl -X POST \
  -H "Content-Type: application/json" \
  -d '{
    "sourcePublicKey": "GA...",
    "destinationPublicKey": "GC...",
    "amount": "100"
  }' \
  http://localhost:3000/api/transaction/send-payment
Response:

JSON

{
  "message": "Payment sent successfully.",
  "transactionHash": "..."
}
```
## Security
IMPORTANT: This repository is a proof-of-concept for educational purposes. In a real-world application, the secretKey stored in the database must be encrypted using strong encryption algorithms (e.g., AES-256) and a secure key management system. The plain-text storage of secret keys in this example is not secure and is only used to demonstrate the functionality.

## License
This project is licensed under the MIT License. See the LICENSE file for details.
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

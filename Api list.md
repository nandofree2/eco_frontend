# EcoLocal API Documentation

This document lists all API endpoints used by the EcoLocal Frontend application.

## Authentication

### Login
- **Endpoint**: `POST {{API_BASE_URL}}/login`
- **Description**: Authenticates a user and returns a Bearer token.
- **Request Body**: `{ "user": { "email": "...", "password": "..." } }`

---

## Unit of Measurement (UOM)

### List Units
- **Endpoint**: `GET {{API_BASE_URL}}/unit_of_measurements`
- **Method**: `GET`
- **Query Params (Ransack)**:
    - `q[name_or_code_or_abbreviation_cont]`: Search by name, code, or abbreviation
    - `q[s]`: Sort (e.g., `name+asc` or `created_at+desc`)
- **Headers**: `Authorization: Bearer <token>`, `ngrok-skip-browser-warning: 69420`

### Create Unit
- **Endpoint**: `POST {{API_BASE_URL}}/unit_of_measurements`
- **Request Body**:
  ```json
  {
    "unit_of_measurement": {
      "name": "Kilogram",
      "code": "KG",
      "quantity": 1000,
      "abbreviation": "kg",
      "description": "Standard unit of mass"
    }
  }
  ```

---

## Ransack Integration Guide

The backend uses the **Ransack** gem for advanced searching. 

### Example Search API Call
`GET /api/v1/unit_of_measurements?q[name_cont]=gram`

### Example Sort API Call
`GET /api/v1/unit_of_measurements?q[s]=name+asc`

---

## Configuration Notes
- All requests include `ngrok-skip-browser-warning` to bypass intermediate HTML pages.
- Local constants are managed via the `.env` file.
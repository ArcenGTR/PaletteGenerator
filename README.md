<p align="center">
<img src="https://img.shields.io/badge/Java-ED8B00?style=for-the-badge&logo=openjdk&logoColor=white" alt="Java"/>
<img src="https://img.shields.io/badge/Angular-DD0031?style=for-the-badge&logo=angular&logoColor=white" alt="Angular"/>
<img src="https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript"/>
</p>

An application designed for palette data processing using SOM, Hierarchical Clustering, and K-Means algorithms.

✨ Core Features

Advanced Clustering Algorithms: Implements and integrates SOM, Hierarchical Clustering, and K-Means.

Reliable Backend API: Built with Spring Boot (Java) to provide a reliable and scalable API for data processing.

Reactive Frontend: User interface built with Angular (TypeScript), applying reactive programming principles for intuitive interaction.

Secure Authentication: Uses Keycloak for industry-standard Identity and Access Management (IAM).

User History: Allows users to view and interact with their past clustering results.

Containerized Environment: Fully containerized with Docker Compose for reproducible builds and simplified local development.

🏗️ Architecture & Deployment

This project follows a containerized architecture orchestrated by Docker Compose, with Nginx acting as the public gateway.

Nginx (Reverse Proxy): Configured as a single entry point that handles all incoming traffic, manages SSL (if configured), performs load balancing, and routes requests to the correct service (Angular frontend or Spring Boot backend).

Angular (Frontend): The reactive, client-side application that provides the user interface.

Spring Boot (Backend): The core API that handles business logic, data processing, and integration with clustering algorithms.

Keycloak: A dedicated service for managing user identities, authentication tokens, and access control.

Docker Compose: Used to define and run all services (Angular, Spring Boot, Keycloak, Nginx) in a unified environment, ensuring consistency from local testing to production.

AWS EC2 Deployment: The entire Docker-based stack is deployed on an AWS EC2 instance, making the application accessible and scalable.

🚀 Technology Stack

Backend: Java, Spring Boot

Frontend: Angular, TypeScript

Security: Keycloak

Infrastructure & Deployment: Docker, Docker Compose, Nginx, AWS (EC2)

Clustering Algorithms: SOM, Hierarchical Clustering, K-Means


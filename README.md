<div align="center">
	<code><img width="50" src="https://raw.githubusercontent.com/marwin1991/profile-technology-icons/refs/heads/main/icons/tailwind_css.png" alt="Tailwind CSS" title="Tailwind CSS"/></code>
	<code><img width="50" src="https://raw.githubusercontent.com/marwin1991/profile-technology-icons/refs/heads/main/icons/angular.png" alt="Angular" title="Angular"/></code>
	<code><img width="50" src="https://raw.githubusercontent.com/marwin1991/profile-technology-icons/refs/heads/main/icons/typescript.png" alt="TypeScript" title="TypeScript"/></code>
	<code><img width="50" src="https://raw.githubusercontent.com/marwin1991/profile-technology-icons/refs/heads/main/icons/java.png" alt="Java" title="Java"/></code>
	<code><img width="50" src="https://raw.githubusercontent.com/marwin1991/profile-technology-icons/refs/heads/main/icons/spring_boot.png" alt="Spring Boot" title="Spring Boot"/></code>
	<code><img width="50" src="https://raw.githubusercontent.com/marwin1991/profile-technology-icons/refs/heads/main/icons/mysql.png" alt="MySQL" title="MySQL"/></code>
	<code><img width="50" src="https://raw.githubusercontent.com/marwin1991/profile-technology-icons/refs/heads/main/icons/docker.png" alt="Docker" title="Docker"/></code>
</div>

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

![1761753146088](https://github.com/user-attachments/assets/0af86ab4-f031-4bb2-a6a6-436da4ade410)
![1761753164997](https://github.com/user-attachments/assets/2ca81ea4-0cbe-4170-8eb6-65acc95518ab)
![1761753278412](https://github.com/user-attachments/assets/3ed0c5f7-030d-445f-8be3-074303c7c5de)
![1761753216194](https://github.com/user-attachments/assets/14ffd53f-bb53-4a05-9d85-a477232add1c)
![1761753195979](https://github.com/user-attachments/assets/7ce82c64-d33f-4a8b-95d7-562634a8801a)


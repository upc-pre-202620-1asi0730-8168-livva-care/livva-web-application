# Livva Web Application

Frontend Web Application for Livva, a digital platform developed by Livva Care to facilitate access to, application for, and management of vehicle and life insurance.

Livva provides digital insurance intermediation and management capabilities. Insurance companies remain responsible for risk assessment, policy issuance, insurance conditions, and the resolution of claims and indemnity requests.

## Project documentation

The authoritative requirements, user stories, domain language, diagrams, and Product Backlog are maintained in the following repository:

- [Livva Project Report](https://github.com/upc-pre-202620-1asi0730-8168-livva-care/livva-project-report)

The frontend implementation must remain traceable to that documentation.

## Technology stack

- Vue 3
- Vite
- Vue Router
- Pinia
- Vue I18n
- PrimeVue
- PrimeFlex
- PrimeIcons
- Axios
- JSON Server

## Bounded contexts

The source code is organized according to the bounded contexts documented in the Livva Project Report:

- Identity & Profile Management
- Insurance Offering & Applications
- Policy Management
- Claims & Indemnities
- Subscription Management
- Shared

Each bounded context follows this structure:

```text
bounded-context/
├── application/
├── domain/
│   └── model/
├── infrastructure/
└── presentation/
    ├── components/
    └── views/
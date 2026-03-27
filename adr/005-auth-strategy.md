# ADR-005: NextAuth.js con Google OAuth + Credentials

**Estado:** Aceptado | **Fecha:** 2026-03-26

## Contexto
Se necesita una estrategia de autenticación que soporte Google OAuth y email/password, integrada con Next.js y sin overhead operativo de gestionar tokens custom.

## Decisión
**NextAuth.js (Auth.js v5)** con providers: Google OAuth 2.0 + CredentialsProvider.

## Razonamiento
NextAuth maneja el flujo OAuth completo, rotación de tokens, gestión de sesiones con cookies HttpOnly, y está bien integrado con Next.js App Router. Elimina la necesidad de implementar flujos de auth complejos desde cero. Alternativa gratuita a servicios como Auth0 o Clerk.

## Consecuencias
**Positivas:**
- Cero configuración de servidores de auth
- Google OAuth funciona out-of-the-box
- Cookies HttpOnly + Secure gestionadas automáticamente

**Negativas:**
- CredentialsProvider requiere gestionar hashing de contraseñas (bcrypt) manualmente
- Si se necesitan features avanzadas (MFA, magic links), requiere más configuración

## Alternativas Rechazadas
- **Clerk:** Excelente DX pero costo adicional ($25+/mes). Para MVP con budget limitado, NextAuth es suficiente.
- **Supabase Auth:** Buena opción si se usa Supabase como DB, pero añade dependencia extra.
- **JWT custom:** Demasiada responsabilidad de seguridad a gestionar manualmente.

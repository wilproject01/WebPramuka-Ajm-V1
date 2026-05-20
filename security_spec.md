# Security Specification - Pramuka Digital

## Data Invariants
- A registration must have a valid email and phone number.
- A member must be assigned to a valid division.
- Only admins can modify content and member data.
- Public can submit registrations but cannot read them.

## The "Dirty Dozen" Payloads (Deny Cases)
1. Submit registration with blank name.
2. Submit registration with 1MB bio string (Resource Poisoning).
3. Public user trying to list all registrations.
4. Unauthenticated user trying to delete a member.
5. Authenticated non-admin trying to update website vision statement.
6. Spoofing `ownerId` in registration.
7. Updating a member's `joinedAt` date after creation.
8. Injecting script tags in `bio`.
9. Admin trying to set `status` to an invalid enum value.
10. Rapid-fire registration submissions (Rate limiting via rules?).
11. Reading PII (phone/email) of other registered scouts.
12. Modifying the `division` of a member to a non-existent one.

## Implementation Plan
- Use `isValidId()` for all document IDs.
- Use `isValidRegistration()` and `isValidMember()` helpers.
- Implement `isAdmin()` check via a lookup in the `admins` collection.

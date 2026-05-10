# Security Specialization for LA28 Fan Quest

## 1. Data Invariants
- A user can only read and write their own profile.
- A user can only submit lineups with themselves as `userId`.
- Flames cannot be negative.
- Lineups are immutable after creation (status set by "system" or result logic).
- Stake amount must match the global constant (50).

## 2. The "Dirty Dozen" Payloads
1. User A tries to read User B's profile.
2. User A tries to update User B's flames balance.
3. User A tries to create a lineup for User B.
4. User A tries to update their own flames to 999,999 without earning them.
5. User A tries to submit a lineup with 0 stake.
6. User A tries to update a lineup's status to "won" manually.
7. User A tries to inject a massive string into a sport name.
8. User A tries to submit a lineup with 100 picks (exceeding limit of 6).
9. User A tries to read all lineups in the system.
10. User A tries to delete their own profile (not allowed in this app's logic).
11. User A tries to spoof their createdAt timestamp.
12. User A tries to add a badge they haven't paid for.

## 3. Rules Strategy
- `isValidId` for all path variables.
- `isValidUser` checking schema and auth matching.
- `isValidLineup` checking schema and identity.
- Action-based updates for User profile (BuyBadge, AwardPrize).

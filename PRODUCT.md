# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Stack

Delegated: the user left the choice to me. Recommendation: plain static HTML/CSS/JS with no build step, since this is a small single-user dashboard. Revisit only if multi-device sync or a backend becomes a requirement.

## Users

A single owner (the builder) managing their own vehicles. They open it to check where each vehicle stands: when insurance and PUC (pollution under control) certificates expire, what service has been done and what is due, which known issues are open, and the latest odometer readings.

## Product Purpose

A simple personal dashboard that displays all the vehicle data the owner tracks: insurance, PUC, service records, known issues, and odometer readings. Success is that the owner can see at a glance what needs attention and look up any record without hunting through papers or apps.

## Positioning

A personal, single-owner vehicle ledger rather than a fleet or marketplace tool. Its distinguishing quirk is the Formula 1 framing: the name "Pit Stop Dash" comes from the owner being an F1 fan, and a vehicle's upkeep is treated like a pit-wall view of the car.

## Operating Context

Used by one person, for their own vehicles, as a read-mostly dashboard. Records are things like insurance policies, PUC certificates, service history, issue notes, and odometer logs. Dates and mileage drive what is current, due, or overdue.

## Capabilities and Constraints

- Displays, per vehicle: insurance, PUC, service records, known issues, odometer readings.
- Described by the user as "just a simple dashboard"; keep scope small and avoid feature creep.
- Open decision: whether the number of vehicles is one or several (the wording "my vehicles" implies several; confirm).
- Open decision: how data is entered and stored (hand-edited data file, in-browser entry, or other). Not yet confirmed.
- Open decision: whether it should send or show reminders for upcoming expiries and service dues.
- Open decision: units and locale (PUC suggests India; assumed km and INR, unconfirmed).

## Brand Commitments

The name "Pit Stop Dash" is fixed. The F1 connection is the reason for the name; how far it extends into voice or terminology is not yet decided.

## Evidence on Hand

None. The repository contains only a README with the project name. No real vehicle data, documents, or assets exist yet, so future work must not fabricate vehicles, policy numbers, or records beyond clearly marked sample data.

## Product Principles

- Glanceable first: what is expiring, overdue, or open must be visible without digging.
- One owner, small scope: serve the listed data types well rather than adding features.
- Dates and odometer drive status: expiry, due and overdue states come from the records.
- The F1 quirk is a flavor of the product's identity, not a barrier to reading plain facts.

## Accessibility & Inclusion

No product-specific requirement established.

// ============================================================
// Droplet Vault — On-chain escrow for pending transfers
// ============================================================
//
// Simplified MVP: tracks deposits and claims via events.
// Actual coin transfers handled by frontend PTBs.
//
// Flow:
//   1. Sender calls deposit() → emits DepositEvent, returns entry ID
//   2. Recipient calls claim() → emits ClaimEvent, marks claimed
//   3. If unclaimed after deadline, sender calls refund() → emits RefundEvent
//
module droplet_vault::vault;

use std::string::{Self, String};
use sui::clock::{Self, Clock};
use sui::event;
use sui::object::{Self, UID, ID};
use sui::tx_context::{Self, TxContext};

// ============================================================
// Constants
// ============================================================

/// Default expiry: 7 days in milliseconds
const DEFAULT_EXPIRY_MS: u64 = 604_800_000;

// ============================================================
// Errors
// ============================================================

const E_NOT_SENDER: u64 = 0;
const E_NOT_RECIPIENT: u64 = 1;
const E_ALREADY_CLAIMED: u64 = 2;
const E_EXPIRED: u64 = 3;
const E_NOT_EXPIRED: u64 = 4;
const E_INVALID_AMOUNT: u64 = 5;

// ============================================================
// Structs
// ============================================================

/// A pending transfer held in escrow.
public struct VaultEntry has key, store {
    id: UID,
    sender: address,
    recipient: address,
    amount: u64,
    coin_type: String,
    created_at: u64,
    expires_at: u64,
    claimed: bool,
    note: String,
}

// ============================================================
// Events
// ============================================================

public struct DepositEvent has copy, drop {
    entry_id: ID,
    sender: address,
    recipient: address,
    amount: u64,
    coin_type: String,
    timestamp: u64,
}

public struct ClaimEvent has copy, drop {
    entry_id: ID,
    sender: address,
    recipient: address,
    amount: u64,
    timestamp: u64,
}

public struct RefundEvent has copy, drop {
    entry_id: ID,
    sender: address,
    amount: u64,
    timestamp: u64,
}

// ============================================================
// Entry Functions
// ============================================================

/// Deposit funds into escrow for a recipient.
/// Returns the entry ID for tracking.
public fun deposit(
    recipient: address,
    amount: u64,
    note: String,
    clock: &Clock,
    ctx: &mut TxContext,
): ID {
    assert!(amount > 0, E_INVALID_AMOUNT);

    let sender = tx_context::sender(ctx);
    let now = clock::timestamp_ms(clock);

    let entry = VaultEntry {
        id: object::new(ctx),
        sender,
        recipient,
        amount,
        coin_type: string::utf8(b"0x2::sui::SUI"),
        created_at: now,
        expires_at: now + DEFAULT_EXPIRY_MS,
        claimed: false,
        note,
    };

    let entry_id = object::id(&entry);

    event::emit(DepositEvent {
        entry_id,
        sender,
        recipient,
        amount,
        coin_type: string::utf8(b"0x2::sui::SUI"),
        timestamp: now,
    });

    transfer::share_object(entry);
    entry_id
}

/// Claim funds from a pending transfer.
public fun claim(
    entry: &mut VaultEntry,
    clock: &Clock,
    ctx: &mut TxContext,
) {
    let caller = tx_context::sender(ctx);

    assert!(caller == entry.recipient, E_NOT_RECIPIENT);
    assert!(!entry.claimed, E_ALREADY_CLAIMED);
    assert!(clock::timestamp_ms(clock) < entry.expires_at, E_EXPIRED);

    entry.claimed = true;

    event::emit(ClaimEvent {
        entry_id: object::id(entry),
        sender: entry.sender,
        recipient: entry.recipient,
        amount: entry.amount,
        timestamp: clock::timestamp_ms(clock),
    });
}

/// Refund expired funds to the sender.
public fun refund(
    entry: &mut VaultEntry,
    clock: &Clock,
    ctx: &mut TxContext,
) {
    let caller = tx_context::sender(ctx);

    assert!(caller == entry.sender, E_NOT_SENDER);
    assert!(clock::timestamp_ms(clock) >= entry.expires_at, E_NOT_EXPIRED);
    assert!(!entry.claimed, E_ALREADY_CLAIMED);

    entry.claimed = true;

    event::emit(RefundEvent {
        entry_id: object::id(entry),
        sender: entry.sender,
        amount: entry.amount,
        timestamp: clock::timestamp_ms(clock),
    });
}

// ============================================================
// View Functions
// ============================================================

public fun is_claimable(entry: &VaultEntry, clock: &Clock): bool {
    !entry.claimed && clock::timestamp_ms(clock) < entry.expires_at
}

public fun is_refundable(entry: &VaultEntry, clock: &Clock): bool {
    !entry.claimed && clock::timestamp_ms(clock) >= entry.expires_at
}

public fun entry_sender(entry: &VaultEntry): address {
    entry.sender
}

public fun entry_recipient(entry: &VaultEntry): address {
    entry.recipient
}

public fun entry_amount(entry: &VaultEntry): u64 {
    entry.amount
}

public fun entry_claimed(entry: &VaultEntry): bool {
    entry.claimed
}

public fun entry_note(entry: &VaultEntry): String {
    entry.note
}

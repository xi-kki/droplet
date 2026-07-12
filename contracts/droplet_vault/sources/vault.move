// ============================================================
// Droplet Vault — On-chain escrow for pending transfers
// ============================================================
//
// Flow:
//   1. Sender calls deposit() → funds move to shared VaultEntry
//   2. Recipient calls claim() → funds transfer to recipient
//   3. If unclaimed after deadline, sender calls refund()
//
// Security:
//   - Only deposit creator can refund
//   - Only designated recipient can claim
//   - VaultEntry is shared but access-controlled via abilities
//
module droplet_vault::vault;

use std::option::{Self, Option};
use sui::clock::{Self, Clock};
use sui::coin::{Self, Coin};
use sui::event;
use sui::object::{Self, UID, ID};
use sui::transfer;
use sui::tx_context::{Self, TxContext};

// ============================================================
// Constants
// ============================================================

/// Default expiry: 7 days in milliseconds
const DEFAULT_EXPIRY_MS: u64 = 604_800_000;

/// Maximum expiry: 90 days in milliseconds
const MAX_EXPIRY_MS: u64 = 7_776_000_000;

// ============================================================
// Errors
// ============================================================

const E_NOT_SENDER: u64 = 0;
const E_NOT_RECIPIENT: u64 = 1;
const E_ALREADY_CLAIMED: u64 = 2;
const E_NOT_EXPIRED: u64 = 3;
const E_EXPIRED: u64 = 4;
const E_INVALID_AMOUNT: u64 = 5;

// ============================================================
// Structs
// ============================================================

/// A pending transfer held in escrow.
/// Created by sender, claimable by recipient, refundable by sender after expiry.
public struct VaultEntry has key, store {
    id: UID,
    /// Who deposited the funds
    sender: address,
    /// Who can claim (Sui address derived from .sui/email/phone)
    recipient: address,
    /// Amount in MIST (smallest unit)
    amount: u64,
    /// Coin type string (e.g., "0x2::sui::SUI")
    coin_type: vector<u8>,
    /// When the entry was created (timestamp ms)
    created_at: u64,
    /// When the entry expires (timestamp ms)
    expires_at: u64,
    /// Whether funds have been claimed
    claimed: bool,
    /// Optional note from sender
    note: vector<u8>,
}

/// One-time witness for module initialization
public struct VAULT has drop {}

// ============================================================
// Events
// ============================================================

public struct DepositEvent has copy, drop {
    entry_id: ID,
    sender: address,
    recipient: address,
    amount: u64,
    coin_type: vector<u8>,
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
///
/// The funds are held in a shared VaultEntry object.
/// The recipient can claim after the entry is created.
/// The sender can refund after expiry.
///
/// @param recipient - The Sui address that can claim
/// @param amount - Amount in MIST to deposit
/// @param clock - Sui Clock object (for timestamps)
/// @param coin - The coin to deposit (will be split)
/// @param note - Optional note (empty vector for none)
public fun deposit<T>(
    recipient: address,
    amount: u64,
    note: vector<u8>,
    coin: Coin<T>,
    clock: &Clock,
    ctx: &mut TxContext,
): ID {
    assert!(amount > 0, E_INVALID_AMOUNT);

    let sender = tx_context::sender(ctx);
    let now = clock::timestamp_ms(clock);

    // Split the coin
    let payment = coin::split(&mut coin, amount, ctx);

    // Create the vault entry
    let entry = VaultEntry {
        id: object::new(ctx),
        sender,
        recipient,
        amount,
        coin_type: coin::type_name_to_string<T>(),
        created_at: now,
        expires_at: now + DEFAULT_EXPIRY_MS,
        claimed: false,
        note,
    };

    let entry_id = object::id(&entry);

    // Emit deposit event
    event::emit(DepositEvent {
        entry_id,
        sender,
        recipient,
        amount,
        coin_type: coin::type_name_to_string<T>(),
        timestamp: now,
    });

    // Share the entry (anyone can read, but functions check sender/recipient)
    transfer::share_object(entry);

    // Return remaining coin to sender
    transfer::public_transfer(coin, sender);

    entry_id
}

/// Claim funds from a pending transfer.
///
/// Only the designated recipient can call this.
/// Funds are transferred directly to the caller.
///
/// @param entry - The vault entry to claim from
/// @param clock - Sui Clock object (for expiry check)
public fun claim<T>(
    entry: &mut VaultEntry,
    clock: &Clock,
    ctx: &mut TxContext,
): Coin<T> {
    let caller = tx_context::sender(ctx);

    // Only recipient can claim
    assert!(caller == entry.recipient, E_NOT_RECIPIENT);
    // Must not be already claimed
    assert!(!entry.claimed, E_ALREADY_CLAIMED);
    // Must not be expired
    assert!(clock::timestamp_ms(clock) < entry.expires_at, E_EXPIRED);

    // Mark as claimed
    entry.claimed = true;

    // Emit claim event
    event::emit(ClaimEvent {
        entry_id: object::id(entry),
        sender: entry.sender,
        recipient: entry.recipient,
        amount: entry.amount,
        timestamp: clock::timestamp_ms(clock),
    });

    // NOTE: In production, you'd hold the Coin<T> inside VaultEntry
    // and transfer it out here. For MVP, we track off-chain and
    // the frontend handles the actual transfer via PTB.
    //
    // This is a simplified version — the real contract would use
    // dynamic fields to store the actual coin.

    // Placeholder — in real implementation, extract coin from entry
    coin::zero<T>(ctx)
}

/// Refund expired funds to the sender.
///
/// Can only be called after the entry has expired.
/// Only the original sender can call this.
///
/// @param entry - The vault entry to refund
/// @param clock - Sui Clock object (for expiry check)
public fun refund<T>(
    entry: &mut VaultEntry,
    clock: &Clock,
    ctx: &mut TxContext,
): Coin<T> {
    let caller = tx_context::sender(ctx);

    // Only sender can refund
    assert!(caller == entry.sender, E_NOT_SENDER);
    // Must be expired
    assert!(clock::timestamp_ms(clock) >= entry.expires_at, E_NOT_EXPIRED);
    // Must not be already claimed
    assert!(!entry.claimed, E_ALREADY_CLAIMED);

    // Mark as refunded (reusing claimed flag)
    entry.claimed = true;

    // Emit refund event
    event::emit(RefundEvent {
        entry_id: object::id(entry),
        sender: entry.sender,
        amount: entry.amount,
        timestamp: clock::timestamp_ms(clock),
    });

    // Placeholder — in real implementation, extract coin from entry
    coin::zero<T>(ctx)
}

// ============================================================
// View Functions
// ============================================================

/// Check if a vault entry is claimable by the given address.
public fun is_claimable(entry: &VaultEntry, clock: &Clock): bool {
    !entry.claimed && clock::timestamp_ms(clock) < entry.expires_at
}

/// Check if a vault entry is refundable (expired and unclaimed).
public fun is_refundable(entry: &VaultEntry, clock: &Clock): bool {
    !entry.claimed && clock::timestamp_ms(clock) >= entry.expires_at
}

/// Get entry details.
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

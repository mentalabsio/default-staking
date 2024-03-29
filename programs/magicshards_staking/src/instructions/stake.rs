use anchor_lang::prelude::*;
use anchor_spl::{
    associated_token::AssociatedToken,
    token::{Mint, Token, TokenAccount},
};

use crate::{error::*, state::*, utils::*};

#[derive(Accounts)]
pub struct Stake<'info> {
    #[account(mut)]
    pub farm: Account<'info, Farm>,

    #[account(
        mut,
        has_one = farm,
        has_one = owner,
        seeds = [
            Farmer::PREFIX,
            farm.key().as_ref(),
            owner.key().as_ref()
        ],
        bump,
    )]
    pub farmer: Account<'info, Farmer>,

    pub gem_mint: Account<'info, Mint>,

    pub whitelist_proof: Account<'info, WhitelistProof>,

    #[account(
        init_if_needed,
        payer = owner,
        associated_token::mint = gem_mint,
        associated_token::authority = farmer,
    )]
    pub farmer_vault: Box<Account<'info, TokenAccount>>,

    #[account(
        mut,
        associated_token::mint = gem_mint,
        associated_token::authority = owner,
    )]
    pub gem_owner_ata: Box<Account<'info, TokenAccount>>,

    #[account(
        init_if_needed,
        payer = owner,
        space = 8 + StakeReceipt::LEN,
        seeds = [
            StakeReceipt::PREFIX,
            farmer.key().as_ref(),
            gem_mint.key().as_ref(),
        ],
        bump,
    )]
    pub stake_receipt: Account<'info, StakeReceipt>,

    #[account(has_one = farm)]
    pub lock: Account<'info, Lock>,

    #[account(mut)]
    pub owner: Signer<'info>,

    pub rent: Sysvar<'info, Rent>,
    pub system_program: Program<'info, System>,
    pub token_program: Program<'info, Token>,
    pub associated_token_program: Program<'info, AssociatedToken>,
}

impl Stake<'_> {
    pub fn lock_gem(&self, amount: u64) -> Result<()> {
        if amount == 0 {
            return Ok(());
        }
        let cpi_ctx = transfer_spl_ctx(
            self.gem_owner_ata.to_account_info(),
            self.farmer_vault.to_account_info(),
            self.owner.to_account_info(),
            self.token_program.to_account_info(),
        );

        anchor_spl::token::transfer(cpi_ctx, amount)
    }
}

pub fn handler<'info>(ctx: Context<'_, '_, '_, 'info, Stake<'info>>, amount: u64) -> Result<()> {
    let whitelist_proof = &ctx.accounts.whitelist_proof;

    WhitelistProof::validate(
        whitelist_proof,
        &ctx.accounts.gem_mint,
        ctx.program_id,
        ctx.remaining_accounts,
    )?;

    // Lock the nft to the farmer account.
    ctx.accounts.lock_gem(amount)?;

    let now_ts = now_ts()?;
    let farm = &mut ctx.accounts.farm;

    let factor = ctx.accounts.lock.bonus_factor;
    let base_rate = amount * ctx.accounts.whitelist_proof.reward_rate;
    let reward_rate = calculate_reward_rate(base_rate, factor as u64)?;

    let stake_receipt = &mut ctx.accounts.stake_receipt;

    if stake_receipt.farmer != Pubkey::default() {
        // Receipt account is already initialized.
        // We're either trying to stake an NFT again, or just trying to stake more fungible tokens.

        require_keys_eq!(stake_receipt.farmer, ctx.accounts.farmer.key());
        require_keys_eq!(stake_receipt.mint, ctx.accounts.gem_mint.key());
        require!(!stake_receipt.is_running(), StakingError::GemStillStaked);

        if let Some(end_ts) = stake_receipt.end_ts {
            require_gte!(
                now_ts,
                end_ts + ctx.accounts.lock.cooldown,
                StakingError::CooldownIsNotOver
            );
        }
    }

    **stake_receipt = StakeReceipt::new(
        ctx.accounts.farmer.key(),
        ctx.accounts.gem_mint.key(),
        ctx.accounts.lock.key(),
        now_ts,
        amount,
        reward_rate,
    );

    let reserved_amount = reward_rate as u64 * ctx.accounts.lock.duration;

    farm.reward.try_reserve(reserved_amount)?;

    ctx.accounts
        .farmer
        .increase_reward_rate(reward_rate as u64)?;

    close_ata(
        ctx.accounts.gem_owner_ata.to_account_info(),
        ctx.accounts.owner.to_account_info(),
        ctx.accounts.owner.to_account_info(),
        ctx.accounts.token_program.to_account_info(),
        &[],
    )?;

    Ok(())
}

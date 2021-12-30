use anchor_lang::prelude::*;
use anchor_lang::solana_program::system_program;

declare_id!("7wcobSpj8qrNtHycFaop7BxEWzbf81SRQUd8rsc6kNS5");

#[program]
pub mod solana_twitter {
    use super::*;
    /* Using Context `SendTweet` to link the Instruction with the created Context */
    /* Any Argument that is not an Account can be provided like `topic` and `content` */
    pub fn send_tweet(ctx: Context<SendTweet>, topic: String, content: String) -> ProgramResult {
        /* Extract all the Accounts that are needed from the Context */
        /* `tweet` Account has already been initialised by means of to the `init account` Constraint of Anchor */
        /* Constraints are executed before the Instruction Function is being executed */
        /* The Prefix `&` allows to access the Account by Reference and `mut`allows to mutate Data from the Account */
        let tweet: &mut Account<Tweet> = &mut ctx.accounts.tweet;
        /* There is no Need for the Prefix `mut` because Anchor has already took care of the rent-exempt Payment */
        let author: &Signer = &ctx.accounts.author;
        /* System Variable to get the current Timestamp - it can only work if the System Program is provided as an Account */
        /* Function `unwrap()`is used because `Clock::get()` returns a Result which can be Ok or Error */
        /* Unwrapping a Result means either using the Value inside Ok or immediately returning the Error */
        let clock: Clock = Clock::get().unwrap();
        /* Check that the Argument `topic` is not more than 50 Characters long */
        /* Not using string.len() which returns the Length of the Vector and therefore gives it the Number of Bytes in the String */
        if topic.chars().count() > 50 {
            /* Return an Error to stop the Execution of the Instruction */
            /* The Function `into()` converts an ErrorCode Type into whatever Type is required by the Code like `ProgramError` */
            return Err(ErrorCode::TopicTooLong.into())
        }
        /* Check that the Argument `content` is not more than 280 Characters long */
        if content.chars().count() > 280 {
            /* Return an Error to stop the Execution of the Instruction */
            return Err(ErrorCode::ContentTooLong.into())
        }

        /* The Prefix `*` allows to dereference the reference of the Public Key */
        tweet.author = *author.key;
        /* Retrieve the current UNIX Timestamp */
        tweet.timestamp = clock.unix_timestamp;
        /* Store the Arguments `topic` and `content` in their respective Properties */
        tweet.topic = topic;
        tweet.content = content;
        /* Rust does not have the Concept of Exceptions */
        /* Instead it wraps the Return Value into a special Enum to tell the Program if the Execution was successful (Ok) or not (ProgramError) */
        /* The last Line of a Function is used as the Return Value without the need for a Keyword `return` */
        /* Returns a ProgramResult that can be either `Ok` or `ProgramError` */
        Ok(())
    }
}

/* Adding an Account on a Context means:
 - its Public Key should be provided when Sending the Instruction and
 - also require the Account to use its Private Key to sign the Instruction to interact with the Account
*/
/* Sending an Instruction to a Program requires Providing all the necessary Context for it to run successfully */
/* Contexts are implemented using a `struct` - that struct list all Accounts that are necessary for the Instruction to do its Tasks */
#[derive(Accounts)]
/* `<'info>` is a Rust Lifetime that is defined as a generic Type but it is not a Type. Its Purpose is to tell the Compiler how long a Variable will stay alive */
pub struct SendTweet<'info> {
    /* Creating a new Account in this Instruction that Rent-exempt Money (SOL) is paid by the Author and the Size of Storage comes from Constant `LENGTH` */
    #[account(init, payer = author, space = Tweet::LENGTH)]
    /* Account is an Account Type provided by Anchor */
    /* It wraps the AccountInfo in another Struct that parses the Data according to an Account Struct provided as a generic Type like `Tweet` */
    /* `Account<'info, Tweet>` means this is an Account of Type `Tweet` and the Data should be parsed accordingly */
    pub tweet: Account<'info, Tweet>,
    /* The Author should pay for the rent-exempt Money of the Tweet Account, therefore it is marked as mutable to mutate the Amount fo Money in its Account */
    #[account(mut)]
    /* `Signer` is the same as the `AccountInfo` Type except this Account should sign the Instruction */
    pub author: Signer<'info>,
    /* Constraint to ensure that it is the official System Program from Solana, therefore the Public Key of the Account has to match a provided Public Key */
    #[account(address = system_program::ID)]
    /* `AccountInfo` is a low-level Solana Structure that can represent any Account */
    /* When using AccountInfo, the Account's Data will be an unparsed Array of Bytes */
    pub system_program: AccountInfo<'info>
}

/* Custom Attribute that defines an Account provided by Anchor Framework */
/* It allows to parse the Account to and from an Array of Bytes */
#[account]
/* Struct that defines the Properties (and no Methods) of a Tweet */
pub struct Tweet {
    /* The Owner of an Account will be the Program that generated it, therefore the Field `author` is necessary */
    /* Tracks the User that published the Tweet by storing its Public Key */
    pub author: Pubkey,
    /* Tracks of the Time the Tweet was published by storing the current Timestamp */
    pub timestamp: i64,
    /* Tracks of an optional Topic that can be provided by the User */
    pub topic: String,
    /*  Tracks of the actual Content of the Tweet */
    pub content: String
}

/* A Discriminator of exactly 8 Bytes will be added to the very Beginning of the Data */
/* The Discriminator stores the Type of the Account */
const DISCRIMINATOR_LENGTH: usize = 8;
/* The `author` Property or any Public Key need 32 Bytes */
const PUBLIC_KEY_LENGTH: usize = 32;
/* The `timestamp` Property is an Integer of 64 Bits or 8 Bytes */
const TIMESTAMP_LENGTH: usize = 8;
/* The `topic` Property is a Vector containing Elements of 1 Byte */
/* A Vector is like an Array whose total Length is unknown, therefore is a maximum Size of 42 Characters set */
/* A UTF-8 Encoding Character can use from 1 to 4 Bytes: 42 Characters * 4 Bytes = 168 Bytes */
const MAX_TOPIC_LENGTH: usize = 42 * 4;
/* The `topic` Property is set to be a Maximum of 280 Characters */
const MAX_CONTENT_LENGTH: usize = 280 * 4;
/* A Vector contains a Prefix that indicates where the next Property is located on the Array of Bytes */
const STRING_LENGTH_PREFIX: usize = 4; // Stores the size of the string.

/* Implementation Block on the Tweet Struct allows to attach Methods, Constants and more to Structs */
impl Tweet {
    /* Access the Length of the Tweet Account in Bytes by running `Tweet::LENGTH` */
    const LENGTH: usize = DISCRIMINATOR_LENGTH
        /* Author */
        + PUBLIC_KEY_LENGTH
        /* Timestamp */
        + TIMESTAMP_LENGTH
        /* Topic */
        + STRING_LENGTH_PREFIX + MAX_TOPIC_LENGTH
        /* Content */
        + STRING_LENGTH_PREFIX + MAX_CONTENT_LENGTH;
}

/* Custom Implementation of ErrorCode */
#[error]
pub enum ErrorCode {
    #[msg("The provided Topic should be 50 Characters long Maximum")]
    TopicTooLong,
    #[msg("The provided Content should be 280 Characters long Maximum")]
    ContentTooLong
}

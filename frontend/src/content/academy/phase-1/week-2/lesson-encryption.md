### Encryption and Keys

**The ticket:** Sam Whitfield's laptop restarted for an update overnight. Now a blue screen says **BitLocker recovery** and asks for a 48-digit key. "Is my laptop broken?"

The first thing to tell Sam is that the laptop is fine, and saying so early will settle the rest of the call. BitLocker encrypts the whole drive and simply won't unlock it until it's given the right key, so nothing has been damaged or lost. To work the call well, though, you need to understand what encryption is doing here, and why the key matters more than the algorithm.

### What encryption does

Encryption uses a key to transform data so that it looks like random characters to anyone who doesn't hold that key. Supply the same key and the transformation reverses, giving you back the original byte for byte.

The key itself is a secret value, often derived from a passphrase such as `Tide-Lamp-42`, and notice how unforgiving the relationship is. Change even one character of the key and decryption doesn't return something close to the original. It fails outright, as the table shows.

| Encrypted note | Key tried | What comes out |
|---|---|---|
| `U2FsdGVkX1+q3…` | `Tide-Lamp-42` | Fee schedule v3 is approved. |
| `U2FsdGVkX1+q3…` | `Tide-Lamp-41` | Nothing. Decryption fails. |
| `U2FsdGVkX1+q3…` | No key | Nothing |

That table captures where encryption sits among this week's three methods. Anybody can reverse encoding and nobody can reverse a hash, but encryption reverses fully for whoever holds the key. It follows that encrypted data is only as safe as its key, which is why attackers almost always go after the key rather than the mathematics.

### Two kinds of keys

Keys come in two arrangements, and you'll meet both constantly. The first, **symmetric encryption**, uses one shared key to both lock and unlock.

- One key does both jobs, so it is fast.
- That makes it the right choice wherever there is a lot of data.
- **AES** is the standard, and what BitLocker, most VPNs and this week's lab use underneath.

The second, **asymmetric encryption**, uses a pair of keys instead.

- The public key can be given to anybody. The private key never leaves its owner.
- Anything locked with one of the pair opens only with the other.
- Pairs are much slower, so they are not used for bulk data. Their job is establishing trust between parties who have never met, and signing files to prove who published them.

HTTPS is a good example of the two working together. Your browser and the website use their key pairs to agree on a fresh shared key for the session, usually AES, and that shared key protects everything sent afterwards. In other words, the slow method solves the problem of agreeing on a secret in public, and then the fast method does the actual work.

```match
prompt: Match each kind of encryption to how it works.
Symmetric = One shared key both locks and unlocks, so it is fast
Asymmetric = A pair of keys, where anything locked with one opens only with the other
```

### Back to Sam: the recovery key call

With that background, Sam's screen makes sense. BitLocker keeps the drive's key inside the laptop's TPM, a security chip on the motherboard, and the TPM only releases that key when the machine's startup looks the same as it did last time. That fussiness is deliberate, because a changed startup could mean someone is trying to get at the drive in a way its owner never intended.

Sam's overnight firmware update changed the startup, so the TPM did its job and held the key back. BitLocker then fell back to asking for the 48-digit recovery key, which IT saved to the directory when the drive was first encrypted. Your task on this call is to get that key to the right person, and only to the right person.

1. **Verify the caller** with the approved method, such as a callback to the number on file. The recovery key unlocks every file on the drive.
2. **Match the Key ID** on Sam's screen to the recovery key stored for that laptop in Active Directory or Microsoft Entra ID.
3. **Read out the 48 digits** once both checks pass.
4. **Document** who called, how you verified them and the Key ID.

**Escalate** if the caller can't be verified or wants the key to a laptop that isn't theirs. Escalate as well if several laptops hit the recovery screen at once, because one machine in recovery is a firmware update, but a fleet of them is a change that went out badly or something worth investigating properly.

### Where encryption fails

As you saw earlier, attackers rarely break AES itself. They go after the key, or after mistakes in how the encryption was set up, so when encrypted data leaks, these are the mistakes to check for:

- **The key sits next to the data.** A key saved in a config file on the same server is stolen in the same breach, and the attacker decrypts everything.
- **The same input gives the same output.** Without a random value mixed in, users who share a password share an encrypted value.
- **Clues sit beside the encrypted value.** Password hints stored in plain text in the next column give away what the encryption was meant to hide.

Adobe's 2013 breach is a real example of the last two. About 150 million encrypted passwords were exposed, and because equal passwords had equal encrypted values and the hints were readable, attackers could work out the common passwords without ever having the key.

### Try it with OpenSSL

```
$ openssl enc -aes-256-cbc -pbkdf2 -a -in memo.txt -out memo.enc -pass pass:Tide-Lamp-42
$ openssl enc -d -aes-256-cbc -pbkdf2 -a -in memo.enc -pass pass:Tide-Lamp-41
bad decrypt
$ openssl enc -d -aes-256-cbc -pbkdf2 -a -in memo.enc -pass pass:Tide-Lamp-42
Fee schedule v3 is approved.
```

You can watch that unforgiving key behavior for yourself. The first command encrypts the memo, the second uses a key that's one character off and fails, and the third uses the right key and returns the memo exactly.

### What encryption does not cover

| Data is | Example | Protected by |
|---|---|---|
| At rest | A laptop's drive | BitLocker |
| In transit | Signing in to a web portal | HTTPS, VPN |
| In use | A file open in an app | Access control and endpoint security |

It's important to be clear about the limits, too. Once Sam signs in, the drive is unlocked, so any malware running as Sam can read files exactly the way Sam does. BitLocker protects a laptop that's lost or stolen, but it does nothing against malware on a laptop that's already unlocked.

### Admin commands

```
manage-bde -status C:
manage-bde -protectors -get C:
```

When you need to check BitLocker yourself, these two commands cover most cases. The first shows whether the drive is encrypted, and the second lists its key protectors, including the recovery password ID.

### Two patterns the SOC watches

Finally, encryption shows up on the attacking side too, in two patterns you'll learn to recognize:

- Ransomware uses the same encryption against its victims and sells the key back.
- Phishing emails often carry an encrypted ZIP with the password in the email body. Mail scanners cannot look inside the ZIP, and attackers rely on that.

```match
prompt: Where is the data, and what protects it?
At rest = A laptop's drive, protected by BitLocker
In transit = Signing in to a web portal, protected by HTTPS or a VPN
In use = A file open in an app, protected by access control and endpoint security
```

### Check yourself

Here's one to think through before the challenge. A caller says they're Morgan Lee, traveling and locked out by BitLocker, and they want the recovery key sent to a personal email address. What do you do?

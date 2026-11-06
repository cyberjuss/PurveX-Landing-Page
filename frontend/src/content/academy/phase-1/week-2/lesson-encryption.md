### Encryption and Keys

**The ticket:** Sam Whitfield's laptop restarted for an update overnight. Now a blue screen says **BitLocker recovery** and asks for a 48-digit key. "Is my laptop broken?"

Tell Sam first that the laptop is fine. BitLocker encrypts the whole drive and won't unlock it until it gets the right key. Nothing is damaged or lost.

### What encryption does

Encryption uses a key to turn data into what looks like random characters. The same key turns it back, byte for byte.

The key is a secret value, often derived from a passphrase such as `Tide-Lamp-42`. One wrong character and decryption fails outright.

| Encrypted note | Key tried | What comes out |
|---|---|---|
| `U2FsdGVkX1+q3…` | `Tide-Lamp-42` | Fee schedule v3 is approved. |
| `U2FsdGVkX1+q3…` | `Tide-Lamp-41` | Nothing. Decryption fails. |
| `U2FsdGVkX1+q3…` | No key | Nothing |

Anyone can reverse encoding, nobody can reverse a hash, and encryption reverses only for the key holder. So encrypted data is only as safe as its key, and attackers go after the key, not the mathematics.

### Two kinds of keys

**Symmetric encryption** uses one shared key to lock and unlock.

- One key does both jobs, so it is fast.
- That makes it the right choice wherever there is a lot of data.
- **AES** is the standard, and what BitLocker, most VPNs and this week's lab use underneath.

**Asymmetric encryption** uses a pair of keys.

- The public key can be given to anybody. The private key never leaves its owner.
- Anything locked with one of the pair opens only with the other.
- Pairs are much slower, so they are not used for bulk data. Their job is establishing trust between parties who have never met, and signing files to prove who published them.

HTTPS uses both. Your browser and the site use key pairs to agree on a fresh shared key, usually AES, and that shared key protects everything after. The slow method agrees the secret in public. The fast method does the work.

```match
prompt: Match each kind of encryption to how it works.
Symmetric = One shared key both locks and unlocks, so it is fast
Asymmetric = A pair of keys, where anything locked with one opens only with the other
```

### Back to Sam: the recovery key call

BitLocker keeps the drive's key in the laptop's TPM, a security chip on the motherboard. The TPM only releases the key when startup looks the same as last time, because a changed startup could mean someone is tampering with the drive.

Sam's firmware update changed the startup, so the TPM held the key back and BitLocker asked for the 48-digit recovery key. IT saved that key to the directory when the drive was encrypted. Your job is to get it to the right person, and only them.

1. **Verify the caller** with the approved method, such as a callback to the number on file. The recovery key unlocks every file on the drive.
2. **Match the Key ID** on Sam's screen to the recovery key stored for that laptop in Active Directory or Microsoft Entra ID.
3. **Read out the 48 digits** once both checks pass.
4. **Document** who called, how you verified them and the Key ID.

**Escalate** if the caller can't be verified, wants a key for a laptop that isn't theirs, or if several laptops hit recovery at once. One is a firmware update. A fleet is a bad change or something worse.

### Where encryption fails

Attackers rarely break AES. They go after the key or setup mistakes. When encrypted data leaks, check for these:

- **The key sits next to the data.** A key saved in a config file on the same server is stolen in the same breach, and the attacker decrypts everything.
- **The same input gives the same output.** Without a random value mixed in, users who share a password share an encrypted value.
- **Clues sit beside the encrypted value.** Password hints stored in plain text in the next column give away what the encryption was meant to hide.

Adobe's 2013 breach made the last two mistakes. About 150 million encrypted passwords leaked, equal passwords had equal values, and the hints were readable, so attackers guessed common passwords without the key.

### Try it with OpenSSL

```
$ openssl enc -aes-256-cbc -pbkdf2 -a -in memo.txt -out memo.enc -pass pass:Tide-Lamp-42
$ openssl enc -d -aes-256-cbc -pbkdf2 -a -in memo.enc -pass pass:Tide-Lamp-41
bad decrypt
$ openssl enc -d -aes-256-cbc -pbkdf2 -a -in memo.enc -pass pass:Tide-Lamp-42
Fee schedule v3 is approved.
```

The first command encrypts. The second, one character off, fails. The third returns the memo.

### What encryption does not cover

| Data is | Example | Protected by |
|---|---|---|
| At rest | A laptop's drive | BitLocker |
| In transit | Signing in to a web portal | HTTPS, VPN |
| In use | A file open in an app | Access control and endpoint security |

Once Sam signs in, the drive is unlocked and malware running as Sam can read everything Sam can. BitLocker protects a lost or stolen laptop, not an unlocked one.

### Admin commands

```
manage-bde -status C:
manage-bde -protectors -get C:
```

The first shows whether the drive is encrypted. The second lists its key protectors, including the recovery password ID.

### Two patterns the SOC watches

Attackers use encryption too:

- Ransomware uses the same encryption against its victims and sells the key back.
- Phishing emails often carry an encrypted ZIP with the password in the email body. Mail scanners cannot look inside the ZIP, and attackers rely on that.

```match
prompt: Where is the data, and what protects it?
At rest = A laptop's drive, protected by BitLocker
In transit = Signing in to a web portal, protected by HTTPS or a VPN
In use = A file open in an app, protected by access control and endpoint security
```

### Check yourself

A caller says they're Morgan Lee, traveling and locked out by BitLocker, and they want the recovery key sent to a personal email address. What do you do?

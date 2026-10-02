### Encryption and Keys

**The ticket:** Sam Whitfield's laptop restarted for an update overnight. Now a blue screen says **BitLocker recovery** and asks for a 48-digit key. "Is my laptop broken?"

The laptop is fine. BitLocker encrypts its whole drive, and this screen means BitLocker will not unlock the drive until it gets the right key. To handle the call, you need to know what encryption does and why the key matters most.

### What encryption does

Encryption scrambles data with a key, so it reads as random characters to anyone without that key. The same key turns it back into the original, exactly as it was.

A key is a secret value, often made from a passphrase such as `Tide-Lamp-42`. Change one character and decryption fails. Good modern tools refuse outright rather than return a garbled guess.

| Encrypted note | Key tried | What comes out |
|---|---|---|
| `U2FsdGVkX1+q3…` | `Tide-Lamp-42` | Fee schedule v3 is approved. |
| `U2FsdGVkX1+q3…` | `Tide-Lamp-41` | Nothing. Decryption fails. |
| `U2FsdGVkX1+q3…` | No key | Nothing |

That sets encryption apart from the other two methods this week. Anyone can reverse encoding, and nobody can reverse a hash. Encryption comes back, but only for whoever holds the key.

### Two kinds of keys

**Symmetric encryption** uses one shared key to lock and unlock. It is fast, so it protects large amounts of data. **AES** is the standard that BitLocker, VPNs and this week's lab all use.

**Asymmetric encryption** uses a key pair. Anyone can have the public key, and only the owner keeps the private key. Pairs are slower, so they are used to agree on a shared key and to sign files.

HTTPS uses both. Your browser and the website use key pairs to agree on a fresh session key, usually AES. That key protects everything sent afterward.

### Where encryption fails

Attackers rarely break AES itself. They go after the key, or after mistakes in how the encryption was set up. When encrypted data leaks, check for three mistakes:

- **The key sits next to the data.** A key saved in a config file on the same server is stolen in the same breach, and the attacker decrypts everything.
- **The same input gives the same output.** Good encryption mixes in a random value, so one password encrypted twice gives two different results. Without it, users who share a password share an encrypted value.
- **Clues sit beside the encrypted value.** Password hints stored in plain text in the next column give away what the encryption was meant to hide.

Adobe's 2013 breach exposed about 150 million encrypted passwords with the last two mistakes. Equal passwords had equal encrypted values, and the hints were readable. Attackers guessed common passwords without the key.

### Back to Sam: the recovery key call

BitLocker keeps the drive key inside the laptop's TPM, a security chip on the motherboard. The TPM releases that key only when startup looks the same as it did last time.

Sam's firmware update changed startup, so the TPM held the key back. BitLocker now needs the 48-digit recovery key, which was saved to the directory when IT first encrypted the drive.

1. **Verify the caller** with the approved method, such as a callback to the number on file. The recovery key unlocks every file on the drive.
2. **Match the Key ID** on Sam's screen to the recovery key stored for that laptop in Active Directory or Microsoft Entra ID.
3. **Read out the 48 digits** once both checks pass.
4. **Document** who called, how you verified them and the Key ID.

**Escalate** if the caller cannot be verified or asks for a laptop that is not theirs. Escalate too if many laptops hit recovery at once.

<details class="academy-deeper">
<summary>Go deeper: try it with OpenSSL, what encryption does not protect, and admin commands</summary>

#### Try it with OpenSSL

```
$ openssl enc -aes-256-cbc -pbkdf2 -a -in memo.txt -out memo.enc -pass pass:Tide-Lamp-42
$ openssl enc -d -aes-256-cbc -pbkdf2 -a -in memo.enc -pass pass:Tide-Lamp-41
bad decrypt
$ openssl enc -d -aes-256-cbc -pbkdf2 -a -in memo.enc -pass pass:Tide-Lamp-42
Fee schedule v3 is approved.
```

The first command encrypts the memo. The second uses a key one character off and fails. The third uses the right key and returns the memo exactly.

#### What encryption does not cover

| Data is | Example | Protected by |
|---|---|---|
| At rest | A laptop's drive | BitLocker |
| In transit | Signing in to a web portal | HTTPS, VPN |
| In use | A file open in an app | Access control and endpoint security |

Once Sam signs in the drive is unlocked, and malware running as Sam reads files the same way Sam does. BitLocker protects a lost or stolen laptop. It does nothing against malware on a laptop that is already unlocked.

#### Admin commands

```
manage-bde -status C:
manage-bde -protectors -get C:
```

The first shows whether the drive is encrypted. The second lists its key protectors, including the recovery password ID.

#### Two patterns the SOC watches

- Ransomware uses the same encryption against its victims and sells the key back.
- Phishing emails often carry an encrypted ZIP with the password in the email body. Mail scanners cannot look inside the ZIP, and attackers rely on that.

</details>

### Check yourself

A caller says they are Morgan Lee, travelling and locked out by BitLocker. They want the key sent to a personal email. What do you do?

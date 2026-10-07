### Encryption and Keys

**The ticket:** Sam Whitfield's laptop restarted for an update overnight. Now a blue screen says **BitLocker recovery** and asks for a 48-digit key. "Is my laptop broken?"

The laptop is fine, and saying so early will do a great deal for the person on the other end of the call. BitLocker encrypts the whole of the drive, and the screen Sam is looking at means only that BitLocker will not hand over the contents until it is given the right key. Nothing has been damaged and nothing has been lost. To work the call properly, though, you need to understand what encryption is doing here and why the key is the part that matters rather than the algorithm.

### What encryption does

Encryption transforms data using a key, so that it reads as random characters to anybody who does not hold that key. Supplying the same key reverses the transformation and returns the original exactly as it was, down to the byte. This is the property that makes encryption useful for things you need back, which is most things.

A key is a secret value, often derived from a passphrase such as `Tide-Lamp-42`. The relationship between the key and the data is unforgiving by design. Change a single character of the key and decryption does not degrade or return something close. It fails outright, and well built modern tools report that failure rather than handing back a garbled guess that somebody might mistake for real data.

| Encrypted note | Key tried | What comes out |
|---|---|---|
| `U2FsdGVkX1+q3…` | `Tide-Lamp-42` | Fee schedule v3 is approved. |
| `U2FsdGVkX1+q3…` | `Tide-Lamp-41` | Nothing. Decryption fails. |
| `U2FsdGVkX1+q3…` | No key | Nothing |

That table is the whole distinction between encryption and the other two methods in this week. Anybody can reverse encoding and nobody at all can reverse a hash. Encryption sits between them: the data comes back in full, but only for whoever holds the key. It follows that the security of anything encrypted is really the security of its key, and an attacker who wants your data will almost always go after the key rather than the mathematics.

### Two kinds of keys

**Symmetric encryption** uses a single shared key to both lock and unlock.

- One key does both jobs, so it is fast.
- That makes it the right choice wherever there is a lot of data.
- **AES** is the standard, and what BitLocker, most VPNs and this week's lab use underneath.

**Asymmetric encryption** uses a pair of keys instead.

- The public key can be given to anybody. The private key never leaves its owner.
- Anything locked with one of the pair opens only with the other.
- Pairs are much slower, so they are not used for bulk data. Their job is establishing trust between parties who have never met, and signing files to prove who published them.

HTTPS shows how the two work together rather than in competition. The browser and the website use their key pairs to agree on a fresh shared key for that one session, usually AES, and everything sent afterwards is protected by that shared key. The slow method solves the problem of agreeing on a secret in public, and the fast method does the actual work.

### Back to Sam: the recovery key call

With that in place, Sam's situation becomes straightforward to explain. BitLocker keeps the drive key inside the laptop's TPM, a dedicated security chip on the motherboard, and the TPM is deliberately fussy about when it hands that key over. It releases the key only when the machine's startup process looks the same as it did the last time, on the reasoning that a changed startup could mean somebody is trying to boot the drive in a way its owner never intended.

Sam's overnight firmware update changed exactly that, so the TPM did its job and held the key back. BitLocker therefore falls back to asking for the 48-digit recovery key, which was saved into the directory when IT first encrypted the drive. Your task on this call is to get that key to the right person and only to the right person.

1. **Verify the caller** with the approved method, such as a callback to the number on file. The recovery key unlocks every file on the drive.
2. **Match the Key ID** on Sam's screen to the recovery key stored for that laptop in Active Directory or Microsoft Entra ID.
3. **Read out the 48 digits** once both checks pass.
4. **Document** who called, how you verified them and the Key ID.

**Escalate** if the caller cannot be verified, or if they are asking for the key to a laptop that is not theirs. Escalate as well if a number of laptops hit the recovery screen at the same time, because one machine in recovery is a firmware update and a fleet of them is either a change that went out badly or something worth investigating properly.

<details class="academy-deeper">
<summary>Go deeper</summary>

#### Where encryption fails

Attackers rarely break AES itself. They go after the key, or after mistakes in how the encryption was set up. When encrypted data leaks, check for three mistakes:

- **The key sits next to the data.** A key saved in a config file on the same server is stolen in the same breach, and the attacker decrypts everything.
- **The same input gives the same output.** Good encryption mixes in a random value, so one password encrypted twice gives two different results. Without it, users who share a password share an encrypted value.
- **Clues sit beside the encrypted value.** Password hints stored in plain text in the next column give away what the encryption was meant to hide.

Adobe's 2013 breach exposed about 150 million encrypted passwords with the last two mistakes. Equal passwords had equal encrypted values, and the hints were readable. Attackers guessed common passwords without the key.

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

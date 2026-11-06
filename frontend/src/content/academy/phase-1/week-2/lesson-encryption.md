### Encryption and Keys

**The ticket:** Sam Whitfield's laptop restarted for an update overnight. Now a blue screen says **BitLocker recovery** and asks for a 48-digit key. "Is my laptop broken?"

The first thing to tell Sam is that the laptop is fine, and saying so early will reassure them for the rest of the call. BitLocker encrypts the entire drive, so the screen Sam is looking at simply means BitLocker won't hand over the drive's contents until it's given the right key. Nothing has been damaged, and nothing has been lost. To work the call properly, though, you need to understand what encryption is doing here, and why the key matters more than the algorithm.

### What encryption does

At its core, encryption transforms data using a key, so that the data looks like random characters to anyone who doesn't hold that key. Supply the same key, and the transformation reverses, giving you back the original exactly as it was, down to the last byte. That reversibility is what makes encryption so useful, because most data is something you'll need back eventually.

The key itself is a secret value, often derived from a passphrase such as `Tide-Lamp-42`. By design, the relationship between that key and the data is unforgiving. If you change even one character of the key, decryption doesn't return something close to the original. It fails outright, and well-built modern tools report that failure rather than handing back a garbled guess that someone might mistake for real data.

| Encrypted note | Key tried | What comes out |
|---|---|---|
| `U2FsdGVkX1+q3…` | `Tide-Lamp-42` | Fee schedule v3 is approved. |
| `U2FsdGVkX1+q3…` | `Tide-Lamp-41` | Nothing. Decryption fails. |
| `U2FsdGVkX1+q3…` | No key | Nothing |

That table captures the whole difference between encryption and the other two methods this week. Anybody can reverse encoding, and nobody at all can reverse a hash. Encryption sits between the two: the data comes back in full, but only for whoever holds the key. It follows that anything encrypted is really only as safe as its key, which is why an attacker who wants your data will almost always go after the key rather than the mathematics.

### Two kinds of keys

Keys come in two arrangements, and you'll meet both constantly. The first, **symmetric encryption**, uses a single shared key to both lock and unlock.

- One key does both jobs, so it is fast.
- That makes it the right choice wherever there is a lot of data.
- **AES** is the standard, and what BitLocker, most VPNs and this week's lab use underneath.

The second, **asymmetric encryption**, uses a pair of keys instead.

- The public key can be given to anybody. The private key never leaves its owner.
- Anything locked with one of the pair opens only with the other.
- Pairs are much slower, so they are not used for bulk data. Their job is establishing trust between parties who have never met, and signing files to prove who published them.

HTTPS is a good example of the two working together rather than competing. When you visit a site, your browser and the website use their key pairs to agree on a fresh shared key for that one session, usually AES, and everything sent afterwards is protected by that shared key. In other words, the slow method solves the problem of agreeing on a secret in public, and then the fast method does the actual work.

```match
prompt: Match each kind of encryption to how it works.
Symmetric = One shared key both locks and unlocks, so it is fast
Asymmetric = A pair of keys, where anything locked with one opens only with the other
```

### Back to Sam: the recovery key call

With that background in place, Sam's situation becomes straightforward to explain. BitLocker keeps the drive's key inside the laptop's TPM, a dedicated security chip on the motherboard. The TPM is deliberately fussy about when it hands that key over, and it only releases it when the machine's startup process looks the same as it did last time. That fussiness is the point, because a changed startup could mean someone is trying to boot the drive in a way its owner never intended.

Sam's overnight firmware update changed exactly that startup process, so the TPM did its job and held the key back. That's why BitLocker fell back to asking for the 48-digit recovery key, which was saved into the directory when IT first encrypted the drive. So your task on this call is to get that recovery key to the right person, and only to the right person.

1. **Verify the caller** with the approved method, such as a callback to the number on file. The recovery key unlocks every file on the drive.
2. **Match the Key ID** on Sam's screen to the recovery key stored for that laptop in Active Directory or Microsoft Entra ID.
3. **Read out the 48 digits** once both checks pass.
4. **Document** who called, how you verified them and the Key ID.

**Escalate** if the caller cannot be verified, or if they are asking for the key to a laptop that is not theirs. Escalate as well if several laptops hit the recovery screen at once. One machine in recovery is a firmware update, but a fleet of them is either a change that went out badly or something worth investigating properly.

### Where encryption fails

As you saw earlier, attackers rarely break AES itself. Instead, they go after the key, or after mistakes in how the encryption was set up. So when encrypted data leaks, check for these three mistakes:

- **The key sits next to the data.** A key saved in a config file on the same server is stolen in the same breach, and the attacker decrypts everything.
- **The same input gives the same output.** Good encryption mixes in a random value, so one password encrypted twice gives two different results. Without it, users who share a password share an encrypted value.
- **Clues sit beside the encrypted value.** Password hints stored in plain text in the next column give away what the encryption was meant to hide.

Adobe's 2013 breach is a real example of the last two mistakes. About 150 million encrypted passwords were exposed, and because equal passwords had equal encrypted values and the hints were readable, attackers could guess the common passwords without ever having the key.

### Try it with OpenSSL

```
$ openssl enc -aes-256-cbc -pbkdf2 -a -in memo.txt -out memo.enc -pass pass:Tide-Lamp-42
$ openssl enc -d -aes-256-cbc -pbkdf2 -a -in memo.enc -pass pass:Tide-Lamp-41
bad decrypt
$ openssl enc -d -aes-256-cbc -pbkdf2 -a -in memo.enc -pass pass:Tide-Lamp-42
Fee schedule v3 is approved.
```

You can watch that unforgiving key behavior for yourself. The first command encrypts the memo. The second uses a key that's one character off, and it fails. The third uses the right key, and it returns the memo exactly.

### What encryption does not cover

| Data is | Example | Protected by |
|---|---|---|
| At rest | A laptop's drive | BitLocker |
| In transit | Signing in to a web portal | HTTPS, VPN |
| In use | A file open in an app | Access control and endpoint security |

It's important to be clear about the limits here, too. Once Sam signs in, the drive is unlocked, so any malware running as Sam can read files exactly the way Sam does. In other words, BitLocker protects a laptop that's lost or stolen, but it does nothing against malware on a laptop that's already unlocked.

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

### Encryption and Keys

Sam Whitfield in Wealth Management calls first thing in the morning. The laptop restarted overnight for an update, and now a blue screen says **BitLocker recovery** and asks for a 48-digit key. Sam has never heard of BitLocker and wants to know if the laptop is broken.

It is not broken. It is doing exactly what encryption is for. To handle this ticket well, you need to know what the key protects and who should be allowed to have it.

<div class="academy-analogy">
<span class="academy-analogy__tag">Think of it like a lockbox</span>
<ul>
<li>Anything inside is useless to someone who steals the box.</li>
<li>Whoever holds the key opens it and gets back exactly what went in.</li>
<li>The box is only as safe as the place you keep the key.</li>
</ul>
</div>

### What encryption does

Encryption scrambles data with a key. The right key turns it back into the exact original. Any other key fails. You can see this with OpenSSL, which is free and open source:

```
$ openssl enc -aes-256-cbc -pbkdf2 -a -in memo.txt -out memo.enc -pass pass:Tide-Lamp-42
$ cat memo.enc
U2FsdGVkX19TMqIjcwB4IzejG7kVDrYRuFEKp9Aftq/csZMQos/7UFnlRSE6k3AU

$ openssl enc -d -aes-256-cbc -pbkdf2 -a -in memo.enc -pass pass:Tide-Lamp-41
bad decrypt

$ openssl enc -d -aes-256-cbc -pbkdf2 -a -in memo.enc -pass pass:Tide-Lamp-42
Fee schedule v3 is approved.
```

One wrong character in the key and nothing comes back. Run the first command again with the same file and the same key and you get a different scrambled result, because OpenSSL mixes in a random salt each time. That randomness matters, and you will see why when we get to Adobe.

### Two kinds of keys

**Symmetric encryption uses one key.** The same key locks and unlocks, like a lockbox where everyone who needs access holds a copy of the key. It is fast, so it protects large amounts of data. The standard is **AES**, usually with a 128-bit or 256-bit key. BitLocker, VPN tunnels and encrypted files all use it.

The hard part is sharing the key. If you email the key along with the data, you have handed both to anyone who reads that email.

**Asymmetric encryption uses a pair of keys.** A **public key** can be shared with anyone. A **private key** never leaves its owner. Data locked with the public key opens only with the private key. It is like a lockbox with a mail slot: anyone can drop something in, but only the owner can open it. RSA and elliptic curve (ECC) are the common kinds. They are slow, so they are used for small jobs such as agreeing on a key or signing something.

The pair also works the other way, as a **digital signature**. The owner signs with the private key, and anyone checks the signature with the public key. That is how Windows tells you who published an installer, which you saw in the Hashing section.

**Real systems use both.** When your browser opens an HTTPS site, the server proves who it is with a certificate that holds its public key. The asymmetric step agrees on a fresh shared key. AES, or a similar fast cipher, then protects the actual data. Week 3 shows this handshake in network traffic.

### Where the data is

| Where the data is | Example | What protects it |
|---|---|---|
| At rest, stored on a disk | A laptop's drive | BitLocker (AES) |
| In transit, moving across a network | Signing in to a web portal | TLS (HTTPS), VPN |
| In use, open in an app | A spreadsheet Sam is editing | Not encryption. Access control and endpoint security |

That last row matters. Once Sam signs in, BitLocker has already unlocked the drive. Malware running as Sam reads the files like Sam does. Encryption protects a lost or stolen laptop. It does not protect a laptop someone else is controlling.

### Where encryption fails: the key

Attackers rarely break AES. They go after the key, or around the encryption.

- **The key stored next to the data.** A database that encrypts passwords with a key kept in a config file on the same server loses both in one breach.
- **Encryption without randomness.** In 2013 Adobe lost about 150 million user records. The passwords were encrypted, but the same password always produced the same encrypted value, and users' password hints were stored in plain text next to them. Attackers never needed the key. They grouped accounts with identical values and read the hints.
- **Encryption used against you.** Ransomware encrypts a company's files and sells the key back. The math is the same as BitLocker's. Only the key holder changed.

### Back to Sam's ticket

**Why it happened.** BitLocker keeps the drive key sealed in the laptop's TPM chip. At startup the TPM checks that the boot process looks the same as last time. Firmware or BIOS updates, a changed boot order, Secure Boot being toggled, or moving the drive to another machine can all change that picture. The TPM then refuses to release the key, and BitLocker asks for the recovery key instead. That is by design. The same check stops a thief who pulls the drive.

**What you do:**

1. **Verify who is calling before anything else.** The recovery key unlocks every file on that drive. Use the company's approved identity check, such as a callback to the number on file. Do not accept a name and a sense of urgency.
2. **Match the key to the device.** The recovery screen shows a **Key ID**. Ask the user to read you the first 8 characters. Find the matching key in Active Directory (the computer object's **BitLocker Recovery** tab, once the BitLocker recovery viewer feature is installed) or in Microsoft Entra ID under the device.
3. **Read the 48 digits to the user**, in the groups of six the screen shows.
4. **Document it:** who called, how you verified them, the device, the Key ID, and the likely cause.

An administrator can check a machine's encryption status from an elevated prompt:

```
manage-bde -status C:
manage-bde -protectors -get C:
```

The first shows whether the drive is encrypted and protected. The second lists the key protectors, including the recovery password's ID.

**When to escalate:**

- The caller cannot pass verification, or asks for the key to a device that is not assigned to them. That is a social engineering attempt until proven otherwise.
- The same laptop asks for recovery again and again after the key was entered. The boot chain may have been tampered with.
- Many laptops hit recovery at once. That is a bad update or a wider problem, not one user's ticket.

### One more pattern the SOC watches

Phishing emails often arrive with an encrypted ZIP attachment and the password written in the email body. Email scanners cannot look inside an encrypted archive, which is the point. Encryption used to hide a file from your own defenses is a warning sign, not reassurance.

### Check yourself

A caller says they are Morgan Lee from Compliance, travelling, locked out by BitLocker, and in a hurry. They give you a Key ID but want the key sent to a personal email address. What do you do, and what do you write in the ticket?

### Encryption and Keys

**The ticket:** Sam Whitfield's laptop restarted for an update overnight. Now a blue screen says **BitLocker recovery** and asks for a 48-digit key. "Is my laptop broken?"

It is not. It is encryption doing its job.

<div class="academy-analogy">
<span class="academy-analogy__tag">Think of it like a lockbox</span>
<ul>
<li>Whatever is inside is useless to a thief.</li>
<li>The key gets back exactly what went in.</li>
<li>The box is only as safe as the place you keep the key.</li>
</ul>
</div>

### Two kinds of keys

- **One shared key (symmetric):** the same key locks and unlocks. Fast, so it protects big data. **AES** is the standard. BitLocker and VPNs use it.
- **A key pair (asymmetric):** a public key anyone can have and a private key only the owner keeps. Used to agree on keys and to sign things. HTTPS uses a key pair to set up the connection, then AES for the data.

### Where it fails: the key

Attackers rarely break AES. They go after the key.

- A key stored on the same server as the data is lost in the same breach.
- Adobe lost about 150 million user records in 2013. The same password always gave the same encrypted value, and password hints sat in plain text beside them. Attackers never needed the key.

### Back to Sam: the recovery key call

The laptop's TPM chip only releases the drive key if startup looks the same as last time. A firmware update changed that, so BitLocker asks for the recovery key instead.

1. **Verify the caller** with the approved method, such as a callback to the number on file. The key unlocks every file on the drive.
2. **Match the Key ID** shown on the screen to the key stored for that laptop in Active Directory or Microsoft Entra ID.
3. **Read out the 48 digits.**
4. **Document** who called, how you verified them, and the Key ID.

**Escalate** if the caller cannot be verified, asks for a laptop that is not theirs, or many laptops hit recovery at once.

<details class="academy-deeper">
<summary>Go deeper: try it with OpenSSL, what encryption does not protect, and admin commands</summary>

#### See it work

```
$ openssl enc -aes-256-cbc -pbkdf2 -a -in memo.txt -out memo.enc -pass pass:Tide-Lamp-42
$ openssl enc -d -aes-256-cbc -pbkdf2 -a -in memo.enc -pass pass:Tide-Lamp-41
bad decrypt
$ openssl enc -d -aes-256-cbc -pbkdf2 -a -in memo.enc -pass pass:Tide-Lamp-42
Fee schedule v3 is approved.
```

One wrong character in the key and nothing comes back.

#### What encryption does not cover

| Data is | Example | Protected by |
|---|---|---|
| At rest | A laptop's drive | BitLocker |
| In transit | Signing in to a web portal | HTTPS, VPN |
| In use | A file open in an app | Not encryption. Access control and endpoint security |

Once Sam signs in, the drive is unlocked. Malware running as Sam reads files like Sam does. BitLocker protects a lost laptop, not a hijacked one.

#### Admin commands

```
manage-bde -status C:
manage-bde -protectors -get C:
```

The first shows whether the drive is encrypted. The second lists its key protectors, including the recovery password ID.

#### Two patterns the SOC watches

- Ransomware uses the same encryption against you and sells the key back.
- Phishing emails often carry an encrypted ZIP with the password in the email body. Scanners cannot look inside, which is the point.

</details>

### Check yourself

A caller says they are Morgan Lee, travelling and locked out by BitLocker. They want the key sent to a personal email. What do you do?

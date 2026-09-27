### The Update Nobody Can Vouch For

It is 9:15 on Tuesday at PurveX Financial. Alex Rivera from IT released VPN update 2.4.1 this morning and published its SHA-256 hash on the IT portal. Three copies of the update are now going around the firm, and the help desk wants to know which ones are safe to install.

A file can look perfect and still be wrong. A hash is a fingerprint of every byte in a file. Change one character and the fingerprint changes completely, and nobody can turn a fingerprint back into the file. That makes hashing the tool for one job: proving a file is exactly what its source released.

Work it the way an analyst does:

- Hash every copy with a real tool. CyberChef works in any browser. PowerShell, certutil, shasum and sha256sum work from the command line.
- Compare each hash with the one IT published, and name the copy that does not match.
- Read the bad copy, find what changed, and decide what happens next.

The files are plain text. The planted address is defanged, so nothing in them can run.

**File:** `hidden_tear_final_snipped_pcap.pcapng`  
**Tool:** Wireshark (or tshark)  
**Level:** Threat Detection / Incident Response

<div class="academy-question">
<span class="academy-question__tag">Essential Question</span>
<p>When a live capture contains far more noise than signal, how do you find the handful of packets that actually matter in a ransomware incident?</p>
</div>

This capture is noisy on purpose. Most of it is ordinary Windows background traffic. Your job is to separate that from the handful of packets that matter in a ransomware case.

You are looking for key-exfiltration. That is the moment the malware sends data out. If you can name the C2 request fast in a live incident, that can be the difference between recoverable and unrecoverable files. Identifying what the malware is stealing from URL parameters alone, without decoding first, is part of that same skill.

Do not start by hunting attacks. Start by filtering out noise. That is the forensic habit.

### Step 1. Orient yourself

1. How many packets, and how long does the capture span?
2. Open **Statistics → Protocol Hierarchy**. What is present?
3. Open **Statistics → Conversations** (IPv4 tab). How many distinct external hosts does the internal machine talk to? List them.

> **Guiding question:** This capture has noticeably *more* distinct external hosts than the other labs we have done. Before assuming they are all suspicious, what is the first thing you should check about each one?

### Step 2. Triage the conversations, separate signal from noise

For **each** external IP/hostname in your list from Step 1:

4. Apply `http.request` filtered to that host and look at the URI and User-Agent. Is this traffic suspicious? Why or why not?
5. How many hosts are you left with that still look worth investigating?

> **Note:** Do not rule a host in or out based on a single glance. If something looks unfamiliar, look it up before deciding what to do with it. Search the hostname, the User-Agent string, or the URI pattern.

> **Guiding question:** Real investigations are mostly noise. What is the risk of skipping this triage step and jumping straight to the interesting-looking packets?

### Step 3. Focus on What Is Left

For the host(s) you could not rule out as ordinary Windows traffic:

6. What is the full URI being requested? Break down any parameters you see in the query string.
7. Does the request method matter here (GET vs POST)? Why might a GET request still be dangerous even without a POST body?
8. Look closely at any parameter named something like `info=`. Try to read it. Is it URL-encoded? What does it appear to contain?

### Step 4. Decode the exfil parameter

9. URL-decode the value of that parameter (Wireshark will often do this for you in the request line, or use an online URL decoder / Python).
10. What pieces of information can you identify inside the decoded string? (Hint: think about what a piece of malware would need to send back to its author for its attack to actually work.)
11. This request appears **twice** in the capture, at two different times. What is different about the parameter value between the two occurrences? What might that difference represent?

### Step 5. Build a timeline

12. What is the timestamp of each of the two suspicious requests?
13. Given what you found in Step 4, what do you think happened on the victim machine *between* those two timestamps?

### Step 6. Write it up

Produce an IOC table with at minimum:

* Victim host identifiers observed in traffic (hostname string, if present)
* C2 domain and full gate path
* Parameter name used for exfil
* What data is being exfiltrated

**Bonus:** Given everything you found, what family of malware is this, and what is the single most urgent piece of information a responder would want to extract from this traffic during a live incident?

# **Lab: Network Forensics — Analyzing a Hidden Tear Ransomware Infection**

**File:** `hidden_tear_final_snipped_pcap.pcapng` **Tool:** Wireshark (or tshark) **Level:** Threat Detection / Incident Response phase — CySA+ aligned

---

## **Learning Objectives**

By the end of this lab, students should be able to:

* Distinguish legitimate Windows background traffic from malicious activity in a noisy capture  
* Recognize ransomware key-exfiltration behavior (the single most critical IR moment in a ransomware case)  
* Identify what data a piece of malware is stealing/sending based on URL parameters alone, without decoding anything  
* Understand why identifying the C2 exfil request fast, in a live incident, can be the difference between recoverable and unrecoverable files  
* Practice filtering out noise as a core forensic skill, not just finding attacks

---

## **Part 1 — Student Handout (no answers below this line)**

### **Step 1: Orient yourself**

1. How many packets, and how long does the capture span?  
2. Open **Statistics → Protocol Hierarchy**. What's present?  
3. Open **Statistics → Conversations** (IPv4 tab). How many distinct external hosts does the internal machine talk to? List them.

> **Guiding question:** This capture has noticeably *more* distinct external hosts than the other labs we've done. Before assuming they're all suspicious — what's the first thing you should check about each one?

### **Step 2: Triage the conversations — separate signal from noise**

For **each** external IP/hostname in your list from Step 3: 4\. Apply `http.request` filtered to that host and look at the URI and User-Agent. Is this traffic suspicious? Why or why not? 5\. How many hosts are you left with that still look worth investigating?

> **Note:** Don't rule a host in or out based on a single glance. If something looks unfamiliar, spend the time to actually look it up (search the hostname, the User-Agent string, the URI pattern) before deciding it's safe to set aside — or before deciding it's worth chasing further.

> **Guiding question:** Real investigations are mostly noise. What's the risk of NOT doing this triage step before diving into "interesting-looking" packets?

### **Step 3: Focus on what's left**

For the host(s) you couldn't rule out as ordinary Windows traffic: 7\. What is the full URI being requested? Break down any parameters you see in the query string. 8\. Does the request method matter here (GET vs POST)? Why might a GET request still be dangerous even without a POST body? 9\. Look closely at any parameter named something like `info=`. Try to read it — is it URL-encoded? What does it look like it contains?

### **Step 4: Decode the exfil parameter**

10. URL-decode the value of that parameter (Wireshark will often do this for you in the request line, or use an online URL decoder / Python).  
11. What pieces of information can you identify inside the decoded string? (Hint: think about what a piece of malware would need to send back to its author for its attack to actually work.)  
12. This request appears **twice** in the capture, at two different times. What's different about the parameter value between the two occurrences? What might that difference represent?

### **Step 5: Build a timeline**

13. What is the timestamp of each of the two suspicious requests?  
14. Given what you found in Step 4, what do you think happened on the victim machine *between* those two timestamps?

### **Step 6: Write it up**

Produce an IOC table with at minimum:

* Victim host identifiers observed in traffic (hostname string, if present)  
* C2 domain and full gate path  
* Parameter name used for exfil  
* What data is being exfiltrated

**Bonus:** Given everything you found, what family of malware is this, and what is the single most urgent piece of information a responder would want to extract from this traffic during a live incident?

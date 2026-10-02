<div class="academy-question">
<span class="academy-question__tag">Essential Question</span>
<p>When a live capture contains far more noise than signal, how do you find the handful of packets that matter in a ransomware incident?</p>
</div>

**Situation:** Ransomware has hit a workstation, and responders captured its network traffic while it ran. Most of the capture is ordinary Windows background traffic, but somewhere inside it the malware sent data home to its command-and-control (C2) server.

**Your task:** Separate the noise from the attack and find the request that sends data to the C2 server. Decode what it carries, then write up the indicators of compromise (IOCs) in a short table. In a live incident, finding that request quickly can decide whether the encrypted files can be recovered.

**What you need:** Wireshark or tshark, and the capture file `hidden_tear_final_snipped_pcap.pcapng` from your instructor.

Work in the order below. Filtering out the noise before you hunt for the attack is the forensic habit this lab builds.

### Step 1. Orient yourself

1. How many packets does the capture hold, and how long does it span?
2. Open **Statistics → Protocol Hierarchy**. Which protocols are present?
3. Open **Statistics → Conversations** and select the IPv4 tab. How many distinct external hosts does the internal machine talk to? List them.

> **Guiding question:** The machine talks to many external hosts. Before you assume they are all suspicious, what is the first thing you should check about each one?

### Step 2. Triage the conversations

Work through each external host from your Step 1 list:

4. Filter to that host's web requests with `http.request && ip.addr == HOST-IP` and read the URI and User-Agent. Is this traffic suspicious, and why?
5. How many hosts still look worth investigating once the ordinary Windows traffic is ruled out?

> **Note:** Do not rule a host in or out at a glance. If something looks unfamiliar, search the hostname or the User-Agent string before you decide.

> **Guiding question:** Real investigations are mostly noise. What do you risk by skipping triage and jumping straight to the packets that look interesting?

### Step 3. Focus on what is left

For each host you could not rule out:

6. What is the full URI being requested? Break down the parameters in its query string.
7. Does the request method matter here? Explain why a GET request can still carry stolen data without a POST body.
8. Find the parameter named `info=` or something similar. Is it URL-encoded, and what does it appear to contain?

### Step 4. Decode the exfiltrated data

9. URL-decode the value of that parameter. Wireshark often decodes it in the request line, or you can use a URL decoder or Python.
10. What pieces of information can you identify in the decoded string? Think about what the malware would need to send its author for the attack to pay off.
11. The request appears twice, at two different times. What changes in the parameter value between the two, and what might that difference mean?

### Step 5. Build a timeline

12. Record the timestamp of each suspicious request.
13. Based on Step 4, what most likely happened on the victim machine between those two timestamps?

### Step 6. Write it up

Produce an IOC table that includes at least:

* Victim host identifiers seen in the traffic, such as a hostname string
* The C2 domain and the full gate path
* The parameter name used to send the data out
* What data is being sent out

**Bonus:** What is the single most urgent piece of information a responder would want from this traffic during a live incident, and why?

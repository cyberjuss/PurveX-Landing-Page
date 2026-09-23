<div class="academy-question">
<span class="academy-question__tag">Essential Question</span>
<p>How do analysts tell ordinary network traffic from something worth a second look?</p>
</div>

### Overview

Every capture you open is the same stack:

- An address
- A reliable connection
- A port
- A protocol
- Sometimes encryption on top

This week teaches those pieces one at a time:

- TCP/IP addressing
- the TCP three-way handshake
- common ports and protocols
- how TLS wraps a connection after TCP is already up

The labs then put you in Wireshark and make you tell ordinary traffic from traffic that does not belong.

Do not try to read the whole stack on day one. Learn what normal looks like at each layer. Then a packet that does not fit has somewhere to stand out.

Your job by the end of the week is to look at a conversation and say where it is going, which door it used, whether the handshake finished, and whether anyone watching the wire can read it.

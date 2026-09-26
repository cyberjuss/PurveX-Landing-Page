<div class="academy-question">
<span class="academy-question__tag">Essential Question</span>
<p>How do analysts tell ordinary network traffic from something worth a second look?</p>
</div>

### Overview

Every network capture you open is built from the same stack:

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

The labs then put you in Wireshark, where you separate ordinary traffic from traffic that does not belong.

Do not try to read the whole stack on day one. Learn what normal looks like at each layer, so a packet that does not fit has somewhere to stand out.

By the end of the week, you should be able to answer four questions about any conversation:

- Where is it going?
- Which port did it use?
- Did the handshake finish?
- Can anyone watching the wire read it?

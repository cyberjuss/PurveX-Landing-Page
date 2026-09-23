### TCP/IP: The Foundation

Every device on a network needs two things to talk at all:

- An address so others can find it
- A shared set of rules for how to talk once found

That is TCP/IP.

* **IP (Internet Protocol):** Gives every device an address (like a street address) so data knows where to go.
* **TCP (Transmission Control Protocol):** Makes sure data arrives complete and in order. Think of a phone call in which each side periodically confirms, "did you get that?"

IP gets the data *there*. TCP makes sure it arrives *correctly*. Keep that split. When a capture looks broken you need to know whether the packet never found the host or whether the host never confirmed it got the payload.

That distinction is what the rest of this week sits on.

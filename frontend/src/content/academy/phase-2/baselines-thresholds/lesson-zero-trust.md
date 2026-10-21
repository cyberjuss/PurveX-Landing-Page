### Zero Trust
<!-- art: door -->

Every lesson so far in this phase has assumed you can tell a baseline from an outlier. Zero Trust is the architecture that assumes you will sometimes be wrong, or that the attacker will get inside the baseline before you catch them, and designs the network so that one mistake does not hand over everything. The model comes from [NIST Special Publication 800-207](https://nvlpubs.nist.gov/nistpubs/specialpublications/NIST.SP.800-207.pdf), published in August 2020, and its core move is to stop treating "inside the network" as a trusted place at all. No user, device, or application is granted trust just because of where it sits on the network. Every request gets evaluated on its own, continuously, not once at login and then left alone.

That is a real break from how networks used to be built. A traditional network draws a hard perimeter, a firewall at the edge, and trusts almost everything once it is inside. The practical failure of that model is simple: once an attacker gets past the edge, by phishing one employee or compromising one account, they can often move freely, because nothing inside was built to check them again. Zero Trust assumes the edge will fail and removes the free movement that failure used to buy an attacker.

In practice, that means every access request is evaluated against policy in real time, considering who is asking, what device they are on, and what they are asking to reach, rather than whether they are already "inside." The access that request is granted is also kept as narrow as the task requires, which is the same least-privilege principle this course has used since Phase 1, applied continuously instead of once at onboarding.

Your own pod is a small, concrete example of one Zero Trust habit even though it predates this lesson. The security group around it does not ask whether a connection attempt is "inside the company network." It evaluates the connection on its own terms: is this traffic between the two machines that belong together, or not. Nothing about its past behavior earns it a pass.

```match
prompt: Match each idea to the model it belongs to.
Perimeter network = Trust what is inside the firewall, check hard at the edge
Zero Trust = Trust nothing by default, verify every request continuously
Lateral movement after one compromised account = What a perimeter model allows that Zero Trust is built to prevent
Least privilege, enforced on every request = The practical habit Zero Trust turns into policy
```

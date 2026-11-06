### Zero Trust
<!-- art: door -->

So far, every lesson in this phase has assumed you can tell a baseline from an outlier. Zero Trust starts from the opposite assumption. It expects that you'll sometimes be wrong, or that an attacker will blend into the baseline before you catch them. So it designs the network so one mistake doesn't hand over everything. The model comes from [NIST Special Publication 800-207](https://nvlpubs.nist.gov/nistpubs/specialpublications/NIST.SP.800-207.pdf), published in August 2020. Its central idea is to stop treating "inside the network" as a trusted place. No user, device or application earns trust just because of where it sits. Instead, every request is evaluated on its own, continuously, rather than once at login and then left alone.

That's a real break from how networks used to be built. A traditional network draws a hard perimeter, with a firewall at the edge, and trusts almost everything inside it. The weakness of that model is easy to see. Once an attacker gets past the edge, perhaps by phishing one employee, they can often move around freely. Nothing inside was built to check them again. Zero Trust assumes the edge will fail at some point, and it takes away the free movement that failure used to give an attacker.

In practice, this means each access request is checked against policy in real time, regardless of whether it's already "inside." The check considers:

- Who is asking
- What device they are on
- What they are asking to reach

Whatever access is granted is also kept as narrow as the task requires. You'll recognize that as the least-privilege principle you've used since Phase 1, only now it's applied continuously instead of once at onboarding.

Your own pod is a small, concrete example of one Zero Trust habit, even though it was built before this lesson. The security group around it never asks whether a connection is "inside the company network." It judges each connection on its own terms, asking only whether the traffic is between the two machines that belong together. Nothing a connection did in the past earns it a pass.

```match
prompt: Match each idea to the model it belongs to.
Perimeter network = Trust what is inside the firewall, check hard at the edge
Zero Trust = Trust nothing by default, verify every request continuously
Lateral movement after one compromised account = What a perimeter model allows that Zero Trust is built to prevent
Least privilege, enforced on every request = The practical habit Zero Trust turns into policy
```

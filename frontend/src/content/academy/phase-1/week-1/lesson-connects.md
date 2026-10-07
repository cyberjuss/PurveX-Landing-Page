### How It All Connects

The pieces from this week fit together in one direction. A vulnerability gives a threat a way in. If the threat succeeds, one or more parts of the CIA triad fail. Risk is the measure of how likely that chain is to complete and what it would cost, worked out before anything has actually happened. Everything this week has covered is either a link in that chain or a way of estimating it in advance.

Work through it in that order when something lands in front of you. Identify the vulnerability, then the threat that could use it, then the property of the triad that would fail, then the impact of that failure. Taking the steps in sequence stops you jumping to a conclusion from a single frightening detail, and it produces a description that somebody else can act on without having to repeat your work.

### Trade-offs

The three properties of the triad are not independent of one another, and in practice they compete. Strengthening confidentiality with additional multi-factor prompts or an air gap makes the data harder for the wrong person to reach, and it also makes the data harder for the right person to reach. Raising availability by leaving a file share open to everyone guarantees that people can always get to their work, and it removes the barrier that was keeping the wrong people out.

This is why there is no configuration that maximises all three at once, and why security work is a series of decisions rather than a checklist. The practical approach is to decide which property matters most for the particular data in front of you, then choose the control that protects it, knowing what you are giving up. Patient records and a public status page call for opposite answers, and both answers are correct for their own data.

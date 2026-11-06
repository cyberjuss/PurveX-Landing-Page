<div class="academy-question">
<span class="academy-question__tag">Essential Question</span>
<p>Taylor's title changed to Compliance. Is the transfer finished?</p>
</div>

### Editing a User's Profile

Once you've found an account, most day-to-day edits happen on its **Properties** dialog, such as:

- A new **Description** after a role change
- A new phone number
- A new title after a promotion

Keeping those fields up to date means the next technician can trust what the profile says.

You also add someone to a group from that same dialog:

- Open **Properties → Member Of**
- Click **Add**
- Type the group name
- Confirm

Say, for example, that Jamie Torres in Wealth Management needs to receive firm-wide announcements. You'd add her to the all-employees group in the same way you'd add anyone to `Wealth Management Users`.

After you click OK, read Member Of again. If the new group isn't on Jamie's list, the ticket isn't done yet.

### Moving a User to a Different OU

Bigger changes, like a transfer between departments, take more than an edit. When someone transfers, their account has to move with them, because department policies depend on which OU the account sits in.

To move an account, follow these steps:

- Right-click the account
- Choose **Move**
- Select the destination OU

Picture Taylor Osei transferring from Operations into Compliance. You'd choose **Move** on the account and select `OU=Users,OU=Compliance,OU=Departments`, then open that OU and confirm Taylor appears there.

A common mistake here is updating the job title without moving the account itself, which leaves the old department's policies in effect.

Even moving the account is only half of a transfer, though, because the OU sets location and policy, not access. Taylor also needs `Compliance Users` added and `Operations Users` removed in the same change, or the old department's access comes along for the ride. That answers this tab's question. The transfer is only finished when both the folders above the account and its Member Of match the new job, so confirm both before you close the ticket.

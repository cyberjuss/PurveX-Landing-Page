<div class="academy-question">
<span class="academy-question__tag">Essential Question</span>
<p>Taylor's title changed to Compliance. Is the transfer finished?</p>
</div>

### Editing a User's Profile

Most day-to-day edits happen on the account's **Properties** dialog:

- A new **Description** after a role change
- A new phone number
- A new title after a promotion

Keeping those fields current lets the next technician trust the profile.

You add someone to a group from the same dialog:

- Open **Properties → Member Of**
- Click **Add**
- Type the group name
- Confirm

Say Jamie Torres in Wealth Management needs firm-wide announcements. Add her to the all-employees group the same way you would add anyone to `Wealth Management Users`.

After you click OK, read Member Of again. If the new group is not on Jamie's list, the ticket is not done.

### Moving a User to a Different OU

When someone transfers, their account has to move with them. Department policies depend on which OU the account sits in.

To move an account:

- Right-click the account
- Choose **Move**
- Select the destination OU

Picture Taylor Osei transferring from Operations into Compliance. Choose **Move** on the account and select `OU=Users,OU=Compliance,OU=Departments`. Then open that OU and confirm Taylor appears there.

A common mistake is updating the job title without moving the AD object. The old department's policies then stay in effect.

Moving the account is only half of a transfer, because the OU sets location and policy, not access. Taylor also needs `Compliance Users` added and `Operations Users` removed in the same change, or the old department's access rides along. The transfer is finished when the folders above the account and its Member Of both match the new job, so confirm both before you close the ticket.

<div class="academy-question">
<span class="academy-question__tag">Essential Question</span>
<p>Taylor's title changed to Compliance. Is the transfer finished?</p>
</div>

### Editing a User's Profile

Once you've found an account, most day-to-day edits happen in its **Properties** dialog, such as:

- A new **Description** after a role change
- A new phone number
- A new title after a promotion

Keeping those fields current means the next technician can trust what the profile says. You also add someone to a group from the same dialog:

- Open **Properties → Member Of**
- Click **Add**
- Type the group name
- Confirm

After you click OK, read Member Of again. If the new group isn't on the list, the ticket isn't done yet.

### Moving a User to a Different OU

Bigger changes, like a transfer between departments, take more than an edit. The account has to move with the person, because department policies depend on which OU the account sits in. To move it:

- Right-click the account
- Choose **Move**
- Select the destination OU

Picture Taylor Osei transferring from Operations to Compliance. You'd move the account to `OU=Users,OU=Compliance,OU=Departments`, then open that OU and confirm Taylor is there. A common mistake is updating the job title without moving the account, which leaves the old department's policies in effect.

Even moving the account is only half of a transfer, though, because the OU sets location and policy, not access. Taylor also needs `Compliance Users` added and `Operations Users` removed in the same change, or the old department's access comes along for the ride. That answers this tab's question: the transfer is only finished when both the folder and Member Of match the new job.

```order
prompt: Taylor Osei is moving from Operations to Compliance. Put the transfer in order.
level: 3
Move the account into OU=Users,OU=Compliance,OU=Departments
Add Taylor to Compliance Users
Remove Taylor from Operations Users
Read the folder and Member Of to confirm both match the new job
```

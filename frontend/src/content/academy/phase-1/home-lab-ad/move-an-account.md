<div class="academy-question">
<span class="academy-question__tag">Essential Question</span>
<p>Taylor's title changed to Compliance. Is the transfer finished?</p>
</div>

### Editing a User's Profile

Day-to-day edits happen in **Properties**:

- A new **Description** after a role change
- A new phone number
- A new title after a promotion

To add someone to a group:

- Open **Properties → Member Of**
- Click **Add**
- Type the group name
- Confirm

Then read Member Of again to confirm the group is there.

### Moving a User to a Different OU

When someone transfers, the account moves too, because department policy follows the OU:

- Right-click the account
- Choose **Move**
- Select the destination OU

For Taylor Osei moving from Operations to Compliance, move the account to `OU=Users,OU=Compliance,OU=Departments`. Changing the title alone leaves the old policies in place.

Moving is only half of it, because the OU sets policy, not access. Add `Compliance Users` and remove `Operations Users` in the same change. The transfer is done when both the folder and Member Of match the new job.

<div class="academy-question">
<span class="academy-question__tag">Essential Question</span>
<p>Alex and Priya live in the same folder. Why can Alex do more?</p>
</div>

### Containers

A **Container** looks like an OU in the console and uses the same folder icon. It is a different kind of object, and the icon will fool you if you stop at appearance.

| | Organizational Unit | Container |
| ----- | ----- | ----- |
| Can a GPO link to it? | Yes | No |
| Can you delegate permissions on it? | Yes | No |
| Can you create your own? | Yes, anywhere | No, fixed set built by Windows |
| Examples in this domain | `OU=IT`, `OU=Compliance` | `CN=Users`, `CN=Computers` |

The default `Users` and `Computers` folders are Containers, not OUs. Windows creates those two folders, and they stay where they are.

You cannot do any of these with a Container:

- Create your own
- Delegate control
- Link a GPO

That is why the build script puts every account in a real OU. Group Policy can never target an account left in a Container.

If you find someone in a default folder, that account is not where it belongs. Never treat the default folders as a department.

### Security Groups

A **Security Group** is a list of accounts. You use it to grant permissions or apply Group Policy to exactly the people who need them, whatever OU they live in.

A group can cross departments. A folder cannot.

**A group is not a place an account lives. It is a list an account is added to.** An account has exactly one OU but can sit in any number of groups.

Every department has a standard access group:

- `IT Users`
- `Compliance Users`
- `Wealth Management Users`
- `Operations Users`
- `Finance Accounting Users`

IT also has a second, more privileged group called `IT Admins`. That extra group is how two people in the same folder end up with different access.

To read access, open the object, read the folder, then read every group on Member Of. Compare these two:

<div class="ad-og" aria-label="Alex Rivera and Priya Nair with their groups">
  <article class="ad-og__card">
    <header>
      <span class="ad-og__kind">User</span>
      <strong>Alex Rivera</strong>
      <em>alex.rivera</em>
    </header>
    <div class="ad-og__row">
      <span>Lives in</span>
      <code>OU=Users,OU=IT</code>
    </div>
    <div class="ad-og__row">
      <span>Member Of</span>
      <div class="ad-og__groups">
        <b>IT Users</b>
        <b class="ad-og__groups--admin">IT Admins</b>
      </div>
    </div>
  </article>
  <article class="ad-og__card">
    <header>
      <span class="ad-og__kind">User</span>
      <strong>Priya Nair</strong>
      <em>priya.nair</em>
    </header>
    <div class="ad-og__row">
      <span>Lives in</span>
      <code>OU=Users,OU=IT</code>
    </div>
    <div class="ad-og__row">
      <span>Member Of</span>
      <div class="ad-og__groups">
        <b>IT Users</b>
      </div>
    </div>
  </article>
</div>

Alex and Priya both live under IT, but only Alex is in IT Admins. The folder alone never tells you what someone can do.

The OU tells you where an account lives. The groups tell you what it can do. Check both, and confirm both match what this environment says they should be.

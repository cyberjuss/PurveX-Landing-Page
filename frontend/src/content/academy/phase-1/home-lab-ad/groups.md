<div class="academy-question">
<span class="academy-question__tag">Essential Question</span>
<p>Alex and Priya live in the same folder. Why can Alex do more?</p>
</div>

### Containers

Before we get to groups, there's one look-alike to watch for. In the console, a **Container** looks just like an OU, because both use a folder icon. But a Container is a different kind of object, and the icon will fool you if you judge by appearance.

| | Organizational Unit | Container |
| ----- | ----- | ----- |
| Can a GPO link to it? | Yes | No |
| Can you hold sub-OUs in it? | Yes | No |
| Can you create your own in the console? | Yes, anywhere | No, Windows builds the default set |
| Examples in this domain | `OU=IT`, `OU=Compliance` | `CN=Users`, `CN=Computers` |

The two you'll meet most are the default `Users` and `Computers` folders, which Windows creates as Containers. Since no GPO can link to a Container, an account left there misses every policy linked to an OU. That's why the build script puts every account in a real OU. So if you find someone in a default folder, that account isn't where it belongs.

```sort
prompt: Organizational Unit or Container?
level: 2
Organizational Unit: A GPO can link to it | It can hold sub-OUs | OU=Compliance
Container: Windows builds it and you cannot make your own | CN=Computers | CN=Users
```

### Security Groups

Now for groups themselves. A **Security Group** is a list of accounts that you use to grant permissions or apply Group Policy to the people who need them, whatever OU they live in. That's the big difference from a folder: while an account has exactly one OU, it can sit in any number of groups.

At PurveX, every department has a standard access group:

- `IT Users`
- `Compliance Users`
- `Wealth Management Users`
- `Operations Users`
- `Finance Accounting Users`

IT also has a second, more privileged group called `IT Admins`, and that extra group is how two people in the same folder can end up with different access. Compare these two:

<div class="ad-og" aria-label="Alex Rivera and Priya Nair with their groups">
  <article class="ad-og__card">
    <header>
      <span class="ad-og__kind">User</span>
      <strong>Alex Rivera</strong>
      <em>alex.rivera</em>
    </header>
    <div class="ad-og__row">
      <span>Lives in</span>
      <code>OU=Users,OU=IT,OU=Departments</code>
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
      <code>OU=Users,OU=IT,OU=Departments</code>
    </div>
    <div class="ad-og__row">
      <span>Member Of</span>
      <div class="ad-og__groups">
        <b>IT Users</b>
      </div>
    </div>
  </article>
</div>

Alex and Priya both live under IT, but only Alex is in IT Admins, which answers this tab's question. The OU tells you where an account lives, and its groups tell you what it can do, so always check both.

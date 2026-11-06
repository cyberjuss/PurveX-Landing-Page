<div class="academy-question">
<span class="academy-question__tag">Essential Question</span>
<p>Alex and Priya live in the same folder. Why can Alex do more?</p>
</div>

### Containers

In the console, a **Container** looks like an OU. Both use a folder icon, but they're different objects.

| | Organizational Unit | Container |
| ----- | ----- | ----- |
| Can a GPO link to it? | Yes | No |
| Can you hold sub-OUs in it? | Yes | No |
| Can you create your own in the console? | Yes, anywhere | No, Windows builds the default set |
| Examples in this domain | `OU=IT`, `OU=Compliance` | `CN=Users`, `CN=Computers` |

The default `Users` and `Computers` folders are Containers. No GPO can link to them, so an account left there misses every policy linked to an OU. Anyone you find there isn't where they belong.

```sort
prompt: Organizational Unit or Container?
Organizational Unit: A GPO can link to it | It can hold sub-OUs | OU=Compliance
Container: Windows builds it and you cannot make your own | CN=Computers | CN=Users
```

### Security Groups

A **Security Group** is a list of accounts used to grant permissions or filter Group Policy. Unlike an OU, groups cross departments: an account has one OU but any number of groups.

Each department has a standard group:

- `IT Users`
- `Compliance Users`
- `Wealth Management Users`
- `Operations Users`
- `Finance Accounting Users`

IT also has `IT Admins`. Compare these two:

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

Same folder, different access. The OU tells you where an account lives. Its groups tell you what it can do.

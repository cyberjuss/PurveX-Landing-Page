<div class="academy-question">
<span class="academy-question__tag">Essential Question</span>
<p>If Alex Rivera lives in the IT folder, does that folder decide what they can access?</p>
</div>

### Organizational Units (OUs)

An **OU**, or organizational unit, is the folder an account lives in. It's more than a folder, though, because permissions and Group Policy attach to it directly. The domain uses it both to record which department something belongs to and to apply that department's rules.

At PurveX Financial, each of the five departments is its own OU, with a `Users` sub-OU one level below it. IT also has a `Workstations` sub-OU, so the lab's one client machine sits under IT rather than next to the people.

<div class="ad-tree" aria-label="purvexfinancial.local directory">
  <div class="ad-tree__root">
    <span class="ad-tree__kind ad-tree__kind--domain">Domain</span>
    <strong>purvexfinancial.local</strong>
  </div>
  <div class="ad-tree__fork" aria-hidden="true"></div>
  <div class="ad-tree__map">
    <section class="ad-tree__pane">
      <header class="ad-tree__ou">
        <span class="ad-tree__kind">OU</span>
        <span class="ad-tree__name">Departments</span>
      </header>
      <div class="ad-tree__depts">
        <article class="ad-tree__dept">
          <h4>IT</h4>
          <div class="ad-tree__slot">
            <span>Users</span>
            <div class="ad-tree__chips">
              <span>Alex Rivera</span>
              <span>Priya Nair</span>
            </div>
          </div>
          <div class="ad-tree__slot">
            <span>Workstations</span>
            <div class="ad-tree__chips">
              <span>IT-WKS01</span>
            </div>
          </div>
        </article>
        <article class="ad-tree__dept">
          <h4>Compliance</h4>
          <div class="ad-tree__slot">
            <span>Users</span>
            <div class="ad-tree__chips">
              <span>Devon Brooks</span>
              <span>Morgan Lee</span>
            </div>
          </div>
        </article>
        <article class="ad-tree__dept">
          <h4>WealthManagement</h4>
          <div class="ad-tree__slot">
            <span>Users</span>
            <div class="ad-tree__chips">
              <span>Sam Whitfield</span>
              <span>Jamie Torres</span>
            </div>
          </div>
        </article>
        <article class="ad-tree__dept">
          <h4>Operations</h4>
          <div class="ad-tree__slot">
            <span>Users</span>
            <div class="ad-tree__chips">
              <span>Taylor Osei</span>
              <span>Riley Kwan</span>
            </div>
          </div>
        </article>
        <article class="ad-tree__dept">
          <h4>FinanceAccounting</h4>
          <div class="ad-tree__slot">
            <span>Users</span>
            <div class="ad-tree__chips">
              <span>Jordan Ellis</span>
            </div>
          </div>
        </article>
      </div>
    </section>
    <section class="ad-tree__pane ad-tree__pane--access">
      <header class="ad-tree__ou">
        <span class="ad-tree__kind">OU</span>
        <span class="ad-tree__name">AccessLevels</span>
      </header>
      <div class="ad-tree__groups">
        <div class="ad-tree__group">
          <span class="ad-tree__kind ad-tree__kind--group">Group</span>
          <strong>Server Admins</strong>
          <em>Level 2</em>
        </div>
        <div class="ad-tree__group">
          <span class="ad-tree__kind ad-tree__kind--group">Group</span>
          <strong>Helpdesk</strong>
          <em>Level 3</em>
        </div>
      </div>
    </section>
  </div>
</div>

Every account lives in exactly one OU, and here's the part to hold on to: the OU records where an account lives, not what it can access. That's why `AccessLevels` sits outside `Departments` on purpose. `Server Admins` and `Helpdesk` grant access across the whole domain, which is a different thing from belonging to a department. Keeping them in a folder of their own stops you from mistaking a list of privileges for a team.

OUs also let you hand out control in small pieces. For example, Helpdesk could be allowed to reset passwords only for accounts inside `OU=Users,OU=IT,OU=Departments`, leaving the rest of the domain untouched.

```sort
prompt: Does the account's OU decide this, or its groups?
level: 1
The OU decides: Which Group Policy settings reach the account | Which department folder the account lives in | Whose passwords Helpdesk can reset, when control is delegated there
Its groups decide: Which file shares the account can open | Whether the account holds admin rights
```

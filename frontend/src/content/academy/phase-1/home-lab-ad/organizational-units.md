<div class="academy-question">
<span class="academy-question__tag">Essential Question</span>
<p>If Alex Rivera lives in the IT folder, does that folder decide what he can access?</p>
</div>

### Organizational Units (OUs)

An **OU** is the folder an account lives in. It is also a boundary you can attach work to, because permissions and Group Policy link to it directly.

That makes the folder more than decoration. It is how this domain records a department and how that department is governed.

Each of PurveX Financial's five departments is its own OU, with a `Users` sub-OU one level deeper. IT also has a `Workstations` sub-OU, so the lab's one client machine sits under IT instead of next to people.

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

Every account lives in exactly one OU, and that OU is its department. The OU records location, not access.

`AccessLevels` sits outside `Departments` on purpose. `Server Admins` (Level 2) and `Helpdesk` (Level 3) grant domain-wide access, not department membership.

Keeping those groups in their own folder stops you from confusing a privilege list with a department.

You can also delegate control over a single OU. For example, Helpdesk could reset passwords only for accounts inside `OU=Users,OU=IT` and leave the rest of the domain untouched.

When a ticket names a person, find the folder first. If Alex is not under IT, the org chart and the directory already disagree.

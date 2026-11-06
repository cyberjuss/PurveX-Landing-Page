<div class="academy-question">
<span class="academy-question__tag">Essential Question</span>
<p>If Alex Rivera lives in the IT folder, does that folder decide what he can access?</p>
</div>

### Organizational Units (OUs)

An **OU** (organizational unit) is the folder an account lives in. It's also where permissions and Group Policy attach, so it records the department and applies that department's rules.

Each department is an OU with a `Users` sub-OU. IT also has `Workstations`, which holds the lab's one client machine.

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

Every account lives in exactly one OU. The OU records where it lives, not what it can access. That's why `AccessLevels` sits outside `Departments`: `Server Admins` and `Helpdesk` grant access across the domain, which isn't a department.

You can also delegate control over one OU. For example, Helpdesk could reset passwords only inside `OU=Users,OU=IT,OU=Departments`.
